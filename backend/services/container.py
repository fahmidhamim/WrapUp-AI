from __future__ import annotations

from dataclasses import dataclass

from backend.analytics.engine import AnalyticsEngine
from backend.core.config import Settings
from backend.db.supabase import SupabaseClient
from backend.diarization.pyannote_client import PyannoteDiarizationService
from backend.rag.embeddings import EmbeddingService
from backend.rag.faiss_store import FaissStore
from backend.rag.service import RagService
from backend.services.chat_service import LiveChatService
from backend.services.groq_client import GroqClient
from backend.services.meeting_service import MeetingService
from backend.services.r2_storage import R2StorageService
from backend.services.session_processing import SessionProcessingService
from backend.stripe.service import StripeService
from backend.summarization.service import SummaryService
from backend.transcription.deepgram_client import DeepgramTranscriptionService
from backend.transcription.whisper_client import WhisperTranscriptionService
from backend.workers.queue import JobQueue
from backend.workers.session_worker import SessionWorker


@dataclass(slots=True)
class ServiceContainer:
    settings: Settings
    db: SupabaseClient
    groq: GroqClient
    transcription: DeepgramTranscriptionService
    summarization: SummaryService
    analytics: AnalyticsEngine
    rag: RagService
    processor: SessionProcessingService
    meetings: MeetingService
    live_chat: LiveChatService
    stripe: StripeService
    jobs: JobQueue
    r2: R2StorageService

    @classmethod
    def build(cls, settings: Settings) -> "ServiceContainer":
        data_root = settings.data_dir
        data_root.mkdir(parents=True, exist_ok=True)
        faiss_root = data_root / settings.faiss_dir_name
        faiss_root.mkdir(parents=True, exist_ok=True)

        db = SupabaseClient(settings)
        groq = GroqClient(settings)
        transcription = DeepgramTranscriptionService(settings)
        summarization = SummaryService(settings, groq_client=groq)
        analytics = AnalyticsEngine()
        embedding_service = EmbeddingService(settings)
        faiss_store = FaissStore(faiss_root)
        rag = RagService(settings, embedding_service=embedding_service, faiss_store=faiss_store, groq_client=groq)

        import structlog as _structlog
        _log = _structlog.get_logger(__name__)

        diarization = PyannoteDiarizationService(settings)
        if settings.diarization_enabled and diarization.is_available():
            _log.info("hybrid_diarization_enabled", backend="pyannote")
        else:
            _log.info(
                "hybrid_diarization_disabled",
                reason="pyannote not available or PYANNOTE_AUTH_TOKEN not set — using Deepgram diarization",
            )

        whisper = WhisperTranscriptionService(settings)
        if settings.whisper_fallback_enabled and whisper.is_available():
            _log.info(
                "local_whisper_fallback_available",
                model=settings.whisper_model,
                threshold=settings.whisper_confidence_threshold,
            )
        else:
            _log.info(
                "local_whisper_fallback_disabled",
                reason="faster-whisper not installed or WHISPER_FALLBACK_ENABLED=false",
            )

        # Groq Whisper (primary fallback — fast cloud transcription).
        # Gated only on the API key, independent of `whisper_fallback_enabled`
        # which controls local faster-whisper (heavy ML deps, server-side).
        if settings.groq_api_key:
            _log.info(
                "groq_whisper_fallback_enabled",
                model=settings.groq_whisper_model,
                threshold=settings.whisper_confidence_threshold,
                max_parallel=settings.groq_whisper_max_parallel,
            )

        # Video → Audio extraction
        from backend.transcription.audio_utils import is_ffmpeg_available
        if settings.video_audio_extraction_enabled and is_ffmpeg_available():
            _log.info(
                "video_audio_extraction_enabled",
                codec=settings.video_audio_codec,
                bitrate=settings.video_audio_bitrate,
            )
        else:
            _log.info(
                "video_audio_extraction_disabled",
                reason="ffmpeg not available or VIDEO_AUDIO_EXTRACTION_ENABLED=false",
            )

        r2 = R2StorageService(settings=settings)
        if r2.is_available():
            _log.info("r2_storage_enabled", bucket=settings.r2_bucket_name)
        else:
            _log.info("r2_storage_disabled", reason="R2 credentials not configured — audio stays in Supabase Storage")

        processor = SessionProcessingService(
            db=db,
            transcription_service=transcription,
            summary_service=summarization,
            rag_service=rag,
            analytics_engine=analytics,
            diarization_service=diarization,
            whisper_service=whisper,
            groq_client=groq,
            r2_storage=r2,
        )
        meetings = MeetingService(settings=settings, groq_client=groq)
        live_chat = LiveChatService(settings, groq_client=groq)
        stripe = StripeService(settings=settings, db=db)

        worker = SessionWorker(processor=processor)

        async def process_job(job, progress_update):
            await worker.run(job, progress_update)

        jobs = JobQueue(settings=settings, db=db, process_fn=process_job)

        return cls(
            settings=settings,
            db=db,
            groq=groq,
            transcription=transcription,
            summarization=summarization,
            analytics=analytics,
            rag=rag,
            processor=processor,
            meetings=meetings,
            live_chat=live_chat,
            stripe=stripe,
            jobs=jobs,
            r2=r2,
        )
