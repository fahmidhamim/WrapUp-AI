/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_APP_URL?: string;
}

interface Window {
  electronApp?: {
    isDesktop: boolean;
    openExternal: (url: string) => Promise<void>;
    getBackendRuntimeStatus: () => Promise<import("./lib/backend-runtime").BackendRuntimeStatus>;
    retryBackendStartup: () => Promise<import("./lib/backend-runtime").BackendRuntimeStatus>;
    startCapture: (
      options: import("./lib/desktop-capture").DesktopCaptureOptions,
    ) => Promise<import("./lib/desktop-capture").DesktopCaptureState>;
    stopCapture: () => Promise<import("./lib/desktop-capture").DesktopCaptureStopResult>;
    setCaptureMicMuted: (muted: boolean) => { applied: boolean; muted: boolean };
    listFinalizedCaptureSpools: () => Promise<import("./lib/finalized-capture-spools").FinalizedCaptureSpoolItem[]>;
    listUploadQueueItems: () => Promise<import("./lib/upload-queue").UploadQueueItem[]>;
    claimNextUploadQueueItem: () => Promise<import("./lib/upload-queue").UploadQueueItem | null>;
    runNextForegroundUpload: (
      options?: import("./lib/upload-queue").RunNextForegroundUploadOptions,
    ) => Promise<import("./lib/upload-queue").RunNextForegroundUploadResult>;
    markUploadQueueItemUploaded: (
      payload: { id: string; deleteTempFile?: boolean },
    ) => Promise<import("./lib/upload-queue").MarkUploadQueueItemUploadedResult>;
    markUploadQueueItemFailed: (
      payload: { id: string; error: string },
    ) => Promise<import("./lib/upload-queue").UploadQueueItem | null>;
    retryUploadQueueItem: (
      payload: { id: string },
    ) => Promise<import("./lib/upload-queue").UploadQueueItem | null>;
    releaseStaleUploadingQueueItems: (
      payload: { olderThanMs: number },
    ) => Promise<import("./lib/upload-queue").ReleaseStaleUploadingQueueItemsResult>;
    deleteFinalizedCaptureSpool: (
      payload: { id: string },
    ) => Promise<import("./lib/finalized-capture-spools").DeleteFinalizedCaptureSpoolResult>;
    pruneFinalizedCaptureSpools: (
      payload: { olderThanMs: number },
    ) => Promise<import("./lib/finalized-capture-spools").PruneFinalizedCaptureSpoolsResult>;
    getCaptureState: () => import("./lib/desktop-capture").DesktopCaptureState;
    onCaptureStateChanged: (
      listener: (state: import("./lib/desktop-capture").DesktopCaptureState) => void,
    ) => () => void;
    onAuthCallback: (listener: (url: string) => void) => () => void;
    consumePendingAuthCallback: () => Promise<string | null>;
  };
}
