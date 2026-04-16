# WrapUp AI Backend

Production FastAPI backend for AI processing, RAG chat, analytics, and Stripe subscription sync.

## Endpoints
- `POST /sessions/{id}/process`
- `GET /sessions/{id}/status`
- `POST /sessions/{id}/ask`
- `POST /meetings/suggest-times`
- `POST /stripe/webhook`
- `POST /stripe/create-checkout-session`
- `GET /stripe/check-subscription`
- `POST /stripe/customer-portal`
- `POST /chat/live` (server replacement for edge `live-chat`)
- `GET /healthz`

All routes except Stripe webhook and health require a Supabase bearer JWT.

## Environment Variables
- `APP_ENV`, `APP_HOST`, `APP_PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPGRAM_API_KEY`
- `DEEPGRAM_MODEL` (default: `nova-3`)
- `GROQ_API_KEY`
- `GROQ_MODEL_SUMMARY` (default: `llama-3.3-70b-versatile`)
- `GROQ_MODEL_CHAT` (default: `llama-3.1-8b-instant`)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PLUS`
- `STRIPE_PRICE_BUSINESS`
- `EMBEDDING_MODEL` (default: `intfloat/multilingual-e5-base`)
- `ENABLE_TRANSFORMER_EMBEDDINGS` (default `true`)
- `LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD` (default `0.85`)
- `LANGUAGE_DOMINANCE_THRESHOLD` (default `0.80`)
- `LANGUAGE_VALIDATION_MAX_RETRIES` (default `2`)
- `WORKER_CONCURRENCY`
- `MAX_JOB_RETRIES`

## Local Run
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Railway Deploy
1. Set root to repo root.
2. Add all environment variables above.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Configure Stripe webhook URL: `https://<railway-domain>/stripe/webhook`

## Supabase Migrations
Apply migrations before production rollout:

```bash
supabase db push
```

Latest backend migration adds:
- `sessions.analytics_data` and processing status columns
- optional enrichment columns on `action_items`
- `stripe_webhook_events` table for webhook idempotency

## Processing Flow
1. Queue job with `POST /sessions/{id}/process`
2. Worker resolves a signed Supabase Storage URL for media (audio/video)
3. Deepgram fetches/transcribes media from URL (video audio is handled automatically)
4. Deepgram auto-detects language (`sessions.language_detected`, `sessions.language_confidence`)
5. Transcript dominant language is validated/cleaned and `sessions.language_locked` is set
6. Groq summary and RAG chat enforce the locked language with retry-on-mismatch
7. Action items inserted into `action_items`
8. Transcript chunked, embedded, and stored in per-session FAISS index
9. Analytics JSON generated and stored in `sessions.analytics_data`
10. Status progress persisted and queryable via `GET /sessions/{id}/status`
