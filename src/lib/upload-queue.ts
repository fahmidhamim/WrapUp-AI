import { supabase } from "@/integrations/supabase/client";
import { startSessionProcessing } from "@/lib/session-processing";

export interface UploadQueueItem {
  id: string;
  spoolFilename: string;
  spoolPath: string | null;
  mimeType: string | null;
  size: number;
  createdAt: string;
  finalizedAt: string;
  status: "finalized";
  uploadStatus: "ready" | "uploading" | "uploaded" | "failed";
  uploadAttempts: number;
  lastUploadError: string | null;
  claimedAt: string | null;
  uploadedAt: string | null;
}

export interface MarkUploadQueueItemUploadedResult {
  item: UploadQueueItem | null;
  tempFileDeleted: boolean;
  tempFileMissing: boolean;
  tempFileDeleteError: string | null;
}

export interface RunNextForegroundUploadResult {
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

export interface RunNextForegroundUploadOptions {
  language?: string;
  meetingTitle?: string;
  source?: string;
}

export interface ReleaseStaleUploadingQueueItemsResult {
  releasedCount: number;
  releasedIds: string[];
}

function getUploadQueueApi() {
  return window.electronApp;
}

export async function listUploadQueueItems(): Promise<UploadQueueItem[]> {
  return getUploadQueueApi()?.listUploadQueueItems?.() ?? [];
}

export async function claimNextUploadQueueItem(): Promise<UploadQueueItem | null> {
  return getUploadQueueApi()?.claimNextUploadQueueItem?.() ?? null;
}

export async function runNextForegroundUpload(
  options?: RunNextForegroundUploadOptions,
): Promise<RunNextForegroundUploadResult> {
  const uploadResult = await (getUploadQueueApi()?.runNextForegroundUpload?.(options) ?? Promise.resolve({
    itemId: null,
    outcome: "failed" as const,
    spoolFilename: null,
    error: "Foreground upload is only available in the Electron app.",
    processingStarted: false,
    processStartError: "Foreground upload is only available in the Electron app.",
    tempFileDeleted: false,
    tempFileMissing: false,
    tempFileDeleteError: null,
    reusedUploadPath: null,
    meetingId: null,
    sessionId: null,
  }));

  if (
    uploadResult.outcome !== "uploaded" ||
    !uploadResult.sessionId ||
    !uploadResult.meetingId
  ) {
    return uploadResult;
  }

  try {
    const { data: authData } = await supabase.auth.getSession();
    const accessToken = authData.session?.access_token;

    if (!accessToken) {
      throw new Error("Authentication session missing. Please log in again.");
    }

    await startSessionProcessing(uploadResult.sessionId, accessToken);

    return {
      ...uploadResult,
      processingStarted: true,
      processStartError: null,
    };
  } catch (error) {
    const processStartError =
      error instanceof Error && error.message
        ? error.message
        : "Failed to start processing.";

    return {
      ...uploadResult,
      outcome: "uploaded_processing_not_started",
      error: "Audio uploaded successfully, but automatic processing did not start.",
      processingStarted: false,
      processStartError,
    };
  }
}

export async function markUploadQueueItemUploaded(
  id: string,
  deleteTempFile = false,
): Promise<MarkUploadQueueItemUploadedResult> {
  const uploadQueueApi = getUploadQueueApi();

  if (!uploadQueueApi?.markUploadQueueItemUploaded) {
    return {
      item: null,
      tempFileDeleted: false,
      tempFileMissing: false,
      tempFileDeleteError: null,
    };
  }

  return uploadQueueApi.markUploadQueueItemUploaded({ id, deleteTempFile });
}

export async function markUploadQueueItemFailed(id: string, error: string): Promise<UploadQueueItem | null> {
  return getUploadQueueApi()?.markUploadQueueItemFailed?.({ id, error }) ?? null;
}

export async function retryUploadQueueItem(id: string): Promise<UploadQueueItem | null> {
  return getUploadQueueApi()?.retryUploadQueueItem?.({ id }) ?? null;
}

export async function releaseStaleUploadingQueueItems(
  olderThanMs: number,
): Promise<ReleaseStaleUploadingQueueItemsResult> {
  const uploadQueueApi = getUploadQueueApi();

  if (!uploadQueueApi?.releaseStaleUploadingQueueItems) {
    return {
      releasedCount: 0,
      releasedIds: [],
    };
  }

  return uploadQueueApi.releaseStaleUploadingQueueItems({ olderThanMs });
}
