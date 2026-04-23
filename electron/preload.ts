import { contextBridge, ipcRenderer } from "electron";

type DesktopCaptureStatus = "idle" | "starting" | "recording" | "stopping" | "error";

interface DesktopCaptureOptions {
  captureMicrophone: boolean;
  captureSystemAudio: boolean;
  language?: string;
}

interface DesktopCaptureState {
  status: DesktopCaptureStatus;
  error: string | null;
  captureMicrophone: boolean;
  captureSystemAudio: boolean;
  desktopSupported: boolean;
  systemAudioSupported: boolean;
}

interface CaptureSpoolSessionMetadata {
  sessionId: string;
  spoolPath: string | null;
  spoolFilename: string | null;
  mimeType: string | null;
  size: number;
  spooled: boolean;
  language?: string | null;
}

interface DesktopCaptureStopResult {
  blob: null;
  mimeType: string | null;
  size: number;
  spooled: boolean;
  spoolPath: string | null;
  spoolFilename: string | null;
  sessionId?: string | null;
}

interface FinalizedCaptureSpoolItem {
  id: string;
  spoolFilename: string;
  spoolPath: string | null;
  mimeType: string | null;
  size: number;
  language?: string | null;
  createdAt: string;
  finalizedAt: string;
  status: "finalized";
  uploadStatus: "ready" | "uploading" | "uploaded" | "failed";
  uploadAttempts: number;
  lastUploadError: string | null;
  claimedAt: string | null;
  uploadedAt: string | null;
}

interface DeleteFinalizedCaptureSpoolResult {
  id: string;
  deleted: boolean;
}

interface PruneFinalizedCaptureSpoolsResult {
  deletedCount: number;
  deletedIds: string[];
}

interface MarkUploadQueueItemUploadedResult {
  item: FinalizedCaptureSpoolItem | null;
  tempFileDeleted: boolean;
  tempFileMissing: boolean;
  tempFileDeleteError: string | null;
}

interface ReleaseStaleUploadingQueueItemsResult {
  releasedCount: number;
  releasedIds: string[];
}

interface ForegroundUploadAuthContext {
  accessToken: string;
  userId: string;
}

interface ForegroundUploadCredentials extends ForegroundUploadAuthContext {
  language?: string;
  meetingTitle?: string;
  source?: string;
}

interface RunNextForegroundUploadResult {
  itemId: string | null;
  outcome: "uploaded" | "failed" | "no_ready_item" | "uploaded_processing_not_started";
  spoolFilename: string | null;
  error: string | null;
  processingStarted: boolean;
  processStartError: string | null;
  tempFileDeleted: boolean;
  tempFileMissing: boolean;
  tempFileDeleteError: string | null;
  reusedUploadPath: string | null;
  meetingId: string | null;
  sessionId: string | null;
}

interface RunNextForegroundUploadOptions {
  language?: string;
  meetingTitle?: string;
  source?: string;
}

interface BackendRuntimeStatus {
  state: "starting" | "ready" | "unavailable";
  source: "owned" | "external" | "none";
  backendUrl: string | null;
  healthUrl: string | null;
  command: string | null;
  message: string | null;
}

const SYSTEM_AUDIO_SUPPORTED = process.platform === "win32";
const CAPTURE_CHUNK_TIMESLICE_MS = 1000;
let micStream: MediaStream | null = null;
let displayStream: MediaStream | null = null;
let mixedStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let audioDestination: MediaStreamAudioDestinationNode | null = null;
let micSource: MediaStreamAudioSourceNode | null = null;
let systemSource: MediaStreamAudioSourceNode | null = null;
let recorder: MediaRecorder | null = null;
let activeSpoolSession: CaptureSpoolSessionMetadata | null = null;
let appendQueue: Promise<void> = Promise.resolve();
let appendError: string | null = null;
let captureFailureInProgress = false;

const captureStateListeners = new Set<(state: DesktopCaptureState) => void>();

function isDesktopCaptureSupported() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!navigator.mediaDevices?.getDisplayMedia &&
    typeof MediaRecorder !== "undefined" &&
    typeof AudioContext !== "undefined"
  );
}

let captureState: DesktopCaptureState = {
  status: "idle",
  error: null,
  captureMicrophone: false,
  captureSystemAudio: false,
  desktopSupported: isDesktopCaptureSupported(),
  systemAudioSupported: SYSTEM_AUDIO_SUPPORTED,
};

function cloneCaptureState(): DesktopCaptureState {
  return { ...captureState };
}

function emitCaptureState(nextState?: Partial<DesktopCaptureState>) {
  captureState = {
    ...captureState,
    ...nextState,
    desktopSupported: isDesktopCaptureSupported(),
    systemAudioSupported: SYSTEM_AUDIO_SUPPORTED,
  };

  const snapshot = cloneCaptureState();
  captureStateListeners.forEach((listener) => listener(snapshot));
}

function getCaptureErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const rawName = "name" in error ? String((error as { name?: unknown }).name ?? "") : "";
    const rawMessage = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
    const normalized = `${rawName} ${rawMessage}`.toLowerCase();

    if (
      normalized.includes("notallowederror") ||
      normalized.includes("permission denied") ||
      normalized.includes("permission dismissed")
    ) {
      if (process.platform === "darwin") {
        return "Microphone permission is blocked in macOS. Open System Settings > Privacy & Security > Microphone and allow Electron (and Terminal if running a dev build), then relaunch the app.";
      }

      return "Microphone permission is blocked. Allow microphone access for the app, then relaunch and try again.";
    }

    if (
      normalized.includes("notfounderror") ||
      normalized.includes("requested device not found") ||
      normalized.includes("could not start audio source")
    ) {
      return "No microphone device is available. Connect/select a microphone and try again.";
    }

    if (normalized.includes("notreadableerror") || normalized.includes("trackstarterror")) {
      return "Microphone is busy in another app. Close other recording apps and try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getCurrentSupabaseAuthContext(): ForegroundUploadAuthContext | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key || !key.includes("-auth-token")) {
      continue;
    }

    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      continue;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;
      const candidateSessions = [
        parsedValue,
        typeof parsedValue.currentSession === "object" && parsedValue.currentSession ? parsedValue.currentSession as Record<string, unknown> : null,
        typeof parsedValue.session === "object" && parsedValue.session ? parsedValue.session as Record<string, unknown> : null,
      ].filter(Boolean) as Array<Record<string, unknown>>;

      for (const candidateSession of candidateSessions) {
        const candidateUser =
          typeof candidateSession.user === "object" && candidateSession.user
            ? candidateSession.user as Record<string, unknown>
            : null;
        const accessToken = typeof candidateSession.access_token === "string"
          ? candidateSession.access_token
          : null;
        const userId = candidateUser && typeof candidateUser.id === "string"
          ? candidateUser.id
          : null;

        if (accessToken && userId) {
          return {
            accessToken,
            userId,
          };
        }
      }
    } catch {
      // Ignore malformed auth cache entries and keep searching.
    }
  }

  return null;
}

function clearStreamTrackHandlers(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    track.onended = null;
  });
}

function clearRecorderHandlers(activeRecorder: MediaRecorder | null) {
  if (!activeRecorder) return;
  activeRecorder.ondataavailable = null;
  activeRecorder.onerror = null;
  activeRecorder.onstop = null;
}

function resetSpoolSessionState() {
  activeSpoolSession = null;
  appendQueue = Promise.resolve();
  appendError = null;
}

async function releaseCaptureResources() {
  clearStreamTrackHandlers(displayStream);
  clearRecorderHandlers(recorder);
  micStream?.getTracks().forEach((track) => track.stop());
  displayStream?.getTracks().forEach((track) => track.stop());
  mixedStream?.getTracks().forEach((track) => track.stop());

  micSource?.disconnect();
  systemSource?.disconnect();

  if (audioContext && audioContext.state !== "closed") {
    await audioContext.close();
  }

  micStream = null;
  displayStream = null;
  mixedStream = null;
  audioContext = null;
  audioDestination = null;
  micSource = null;
  systemSource = null;
  recorder = null;
}

async function abortActiveSpoolSession() {
  const captureSpoolSession = activeSpoolSession;

  if (!captureSpoolSession) {
    resetSpoolSessionState();
    return;
  }

  try {
    await appendQueue;
  } catch {
    // The queue tracks append errors separately so cleanup can still continue.
  }

  try {
    await ipcRenderer.invoke("electron:abort-capture-spool-session", {
      sessionId: captureSpoolSession.sessionId,
    });
  } catch {
    // Ignore cleanup errors so the capture state can still unwind cleanly.
  }

  resetSpoolSessionState();
}

function queueCaptureChunkWrite(chunk: Blob) {
  const captureSpoolSession = activeSpoolSession;

  if (!captureSpoolSession) {
    return Promise.reject(new Error("Capture spool session is not available."));
  }

  const sessionId = captureSpoolSession.sessionId;

  const appendOperation = appendQueue.then(async () => {
    if (!activeSpoolSession || activeSpoolSession.sessionId !== sessionId) {
      throw new Error("Capture spool session is no longer available.");
    }

    const chunkBuffer = new Uint8Array(await chunk.arrayBuffer());

    if (chunkBuffer.byteLength === 0) {
      return;
    }

    const result = await ipcRenderer.invoke("electron:append-capture-chunk", {
      sessionId,
      chunk: chunkBuffer,
    }) as {
      sessionId: string;
      size: number;
    };

    if (activeSpoolSession && activeSpoolSession.sessionId === result.sessionId) {
      activeSpoolSession = {
        ...activeSpoolSession,
        size: result.size,
      };
    }
  });

  appendQueue = appendOperation.then(
    () => undefined,
    (error) => {
      appendError = getCaptureErrorMessage(error, "Failed to write a recording chunk to temporary storage.");
    },
  );

  return appendOperation;
}

async function failCapture(message: string) {
  if (captureFailureInProgress) {
    return;
  }

  captureFailureInProgress = true;

  try {
    if (recorder && recorder.state !== "inactive") {
      clearRecorderHandlers(recorder);
      recorder.stop();
    }
  } catch {
    // Ignore recorder teardown errors while transitioning to the error state.
  }

  try {
    await abortActiveSpoolSession();
    await releaseCaptureResources();
    emitCaptureState({
      status: "error",
      error: message,
      captureMicrophone: false,
      captureSystemAudio: false,
    });
  } finally {
    captureFailureInProgress = false;
  }
}

function setMicMuted(muted: boolean): { applied: boolean; muted: boolean } {
  if (!micStream) {
    return { applied: false, muted };
  }

  const audioTracks = micStream.getAudioTracks();
  if (audioTracks.length === 0) {
    return { applied: false, muted };
  }

  for (const track of audioTracks) {
    track.enabled = !muted;
  }

  return { applied: true, muted };
}

async function startCapture(options: DesktopCaptureOptions): Promise<DesktopCaptureState> {
  if (captureState.status === "starting" || captureState.status === "recording") {
    throw new Error("Capture is already in progress.");
  }

  if (!options.captureMicrophone && !options.captureSystemAudio) {
    throw new Error("Select microphone and/or system audio before starting capture.");
  }

  if (!isDesktopCaptureSupported()) {
    const message = "Desktop capture is not supported in this environment.";
    emitCaptureState({
      status: "error",
      error: message,
      captureMicrophone: false,
      captureSystemAudio: false,
    });
    throw new Error(message);
  }

  emitCaptureState({
    status: "starting",
    error: null,
    captureMicrophone: options.captureMicrophone,
    captureSystemAudio: options.captureSystemAudio,
  });

  try {
    captureFailureInProgress = false;

    if (options.captureMicrophone) {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    }

    if (options.captureSystemAudio) {
      if (!SYSTEM_AUDIO_SUPPORTED) {
        throw new Error("System audio capture is currently supported on Windows only in this Electron foundation.");
      }

      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const systemAudioTrack = displayStream.getAudioTracks()[0];
      if (!systemAudioTrack) {
        throw new Error("No system audio track was shared. Try again and make sure desktop audio is allowed.");
      }

      const handleDisplayEnded = () => {
        if (captureState.status === "recording") {
          void failCapture("Desktop sharing ended before capture was stopped.");
        }
      };

      systemAudioTrack.onended = handleDisplayEnded;
      displayStream.getVideoTracks().forEach((track) => {
        track.onended = handleDisplayEnded;
      });
    }

    audioContext = new AudioContext();
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    audioDestination = audioContext.createMediaStreamDestination();

    if (micStream) {
      micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(audioDestination);
    }

    if (displayStream?.getAudioTracks().length) {
      systemSource = audioContext.createMediaStreamSource(
        new MediaStream([displayStream.getAudioTracks()[0]]),
      );
      systemSource.connect(audioDestination);
    }

    mixedStream = audioDestination.stream;

    if (mixedStream.getAudioTracks().length === 0) {
      throw new Error("No audio tracks are available to record.");
    }

    recorder = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? new MediaRecorder(mixedStream, { mimeType: "audio/webm;codecs=opus" })
      : new MediaRecorder(mixedStream);

    activeSpoolSession = await ipcRenderer.invoke("electron:create-capture-spool-session", {
      mimeType: recorder.mimeType || "audio/webm",
      language: options.language,
    }) as CaptureSpoolSessionMetadata;
    appendQueue = Promise.resolve();
    appendError = null;

    recorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) {
        return;
      }

      void queueCaptureChunkWrite(event.data).catch((error) => {
        const message = getCaptureErrorMessage(error, "Failed to write a recording chunk to temporary storage.");

        if (captureState.status === "starting" || captureState.status === "recording") {
          void failCapture(message);
        }
      });
    };

    recorder.onerror = () => {
      void failCapture("Recording failed while the capture session was running.");
    };

    recorder.start(CAPTURE_CHUNK_TIMESLICE_MS);

    emitCaptureState({
      status: "recording",
      error: null,
    });

    return cloneCaptureState();
  } catch (error) {
    const message = getCaptureErrorMessage(error, "Failed to start desktop capture.");
    await abortActiveSpoolSession();
    await releaseCaptureResources();
    emitCaptureState({
      status: "error",
      error: message,
      captureMicrophone: false,
      captureSystemAudio: false,
    });
    throw new Error(message);
  }
}

async function stopCapture(): Promise<DesktopCaptureStopResult> {
  const activeRecorder = recorder;
  const captureSpoolSession = activeSpoolSession;

  if (!activeRecorder || !captureSpoolSession) {
    emitCaptureState({
      status: "idle",
      error: null,
      captureMicrophone: false,
      captureSystemAudio: false,
    });
    return {
      blob: null,
      mimeType: null,
      size: 0,
      spooled: false,
      spoolPath: null,
      spoolFilename: null,
      sessionId: null,
    };
  }

  emitCaptureState({
    status: "stopping",
    error: null,
  });

  try {
    if (activeRecorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        const handleStop = () => {
          activeRecorder.removeEventListener("error", handleError);
          resolve();
        };
        const handleError = () => {
          activeRecorder.removeEventListener("stop", handleStop);
          resolve();
        };

        activeRecorder.addEventListener("stop", handleStop, { once: true });
        activeRecorder.addEventListener("error", handleError, { once: true });

        if (activeRecorder.state === "recording") {
          activeRecorder.requestData();
        }

        activeRecorder.stop();
      });
    }

    await appendQueue;

    if (appendError) {
      throw new Error(appendError);
    }

    const spoolResult = await ipcRenderer.invoke("electron:finalize-capture-spool-session", {
      sessionId: captureSpoolSession.sessionId,
    }) as {
      sessionId: string;
      mimeType: string | null;
      size: number;
      spooled: boolean;
      spoolPath: string | null;
      spoolFilename: string | null;
    };

    resetSpoolSessionState();
    await releaseCaptureResources();
    emitCaptureState({
      status: "idle",
      error: null,
      captureMicrophone: false,
      captureSystemAudio: false,
    });

    return {
      blob: null,
      mimeType: spoolResult.mimeType ?? (activeRecorder.mimeType || null),
      size: spoolResult.size,
      spooled: spoolResult.spooled,
      spoolPath: spoolResult.spoolPath,
      spoolFilename: spoolResult.spoolFilename,
      sessionId: spoolResult.sessionId,
    };
  } catch (error) {
    const message = getCaptureErrorMessage(error, "Failed to stop desktop capture cleanly.");
    await abortActiveSpoolSession();
    await releaseCaptureResources();
    emitCaptureState({
      status: "error",
      error: message,
      captureMicrophone: false,
      captureSystemAudio: false,
    });
    throw new Error(message);
  }
}

contextBridge.exposeInMainWorld("electronApp", {
  isDesktop: true,
  openExternal: (url: string) =>
    ipcRenderer.invoke("electron:open-external", url) as Promise<void>,
  getBackendRuntimeStatus: () =>
    ipcRenderer.invoke("electron:get-backend-runtime-status") as Promise<BackendRuntimeStatus>,
  retryBackendStartup: () =>
    ipcRenderer.invoke("electron:retry-backend-startup") as Promise<BackendRuntimeStatus>,
  startCapture: (options: DesktopCaptureOptions) => startCapture(options),
  stopCapture: () => stopCapture(),
  setCaptureMicMuted: (muted: boolean) => setMicMuted(muted),
  listFinalizedCaptureSpools: () =>
    ipcRenderer.invoke("electron:list-finalized-capture-spools") as Promise<FinalizedCaptureSpoolItem[]>,
  listUploadQueueItems: () =>
    ipcRenderer.invoke("electron:list-upload-queue-items") as Promise<FinalizedCaptureSpoolItem[]>,
  claimNextUploadQueueItem: () =>
    ipcRenderer.invoke("electron:claim-next-upload-queue-item") as Promise<FinalizedCaptureSpoolItem | null>,
  runNextForegroundUpload: async (options?: RunNextForegroundUploadOptions) => {
    const authContext = getCurrentSupabaseAuthContext();

    if (!authContext) {
      return {
        itemId: null,
        outcome: "failed",
        spoolFilename: null,
        error: "Authentication session missing. Please log in again.",
        processingStarted: false,
        processStartError: "Authentication session missing. Please log in again.",
        tempFileDeleted: false,
        tempFileMissing: false,
        tempFileDeleteError: null,
        reusedUploadPath: null,
        meetingId: null,
        sessionId: null,
      } satisfies RunNextForegroundUploadResult;
    }

    return ipcRenderer.invoke(
      "electron:run-next-foreground-upload",
      {
        ...authContext,
        language: options?.language,
        meetingTitle: options?.meetingTitle,
        source: options?.source,
      } satisfies ForegroundUploadCredentials,
    ) as Promise<RunNextForegroundUploadResult>;
  },
  markUploadQueueItemUploaded: (payload: { id: string; deleteTempFile?: boolean }) =>
    ipcRenderer.invoke("electron:mark-upload-queue-item-uploaded", payload) as Promise<MarkUploadQueueItemUploadedResult>,
  markUploadQueueItemFailed: (payload: { id: string; error: string }) =>
    ipcRenderer.invoke("electron:mark-upload-queue-item-failed", payload) as Promise<FinalizedCaptureSpoolItem | null>,
  retryUploadQueueItem: (payload: { id: string }) =>
    ipcRenderer.invoke("electron:retry-upload-queue-item", payload) as Promise<FinalizedCaptureSpoolItem | null>,
  releaseStaleUploadingQueueItems: (payload: { olderThanMs: number }) =>
    ipcRenderer.invoke("electron:release-stale-uploading-queue-items", payload) as Promise<ReleaseStaleUploadingQueueItemsResult>,
  deleteFinalizedCaptureSpool: (payload: { id: string }) =>
    ipcRenderer.invoke("electron:delete-finalized-capture-spool", payload) as Promise<DeleteFinalizedCaptureSpoolResult>,
  pruneFinalizedCaptureSpools: (payload: { olderThanMs: number }) =>
    ipcRenderer.invoke("electron:prune-finalized-capture-spools", payload) as Promise<PruneFinalizedCaptureSpoolsResult>,
  getCaptureState: () => cloneCaptureState(),
  onCaptureStateChanged: (listener: (state: DesktopCaptureState) => void) => {
    captureStateListeners.add(listener);
    listener(cloneCaptureState());

    return () => {
      captureStateListeners.delete(listener);
    };
  },
  onAuthCallback: (listener: (url: string) => void) => {
    const handleAuthCallback = (_event: Electron.IpcRendererEvent, callbackUrl: string) => {
      listener(callbackUrl);
    };

    ipcRenderer.on("electron:auth-callback", handleAuthCallback);

    return () => {
      ipcRenderer.removeListener("electron:auth-callback", handleAuthCallback);
    };
  },
  consumePendingAuthCallback: () =>
    ipcRenderer.invoke("electron:consume-auth-callback") as Promise<string | null>,
});
