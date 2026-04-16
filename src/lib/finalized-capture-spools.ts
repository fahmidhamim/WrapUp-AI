export interface FinalizedCaptureSpoolItem {
  id: string;
  spoolFilename: string;
  spoolPath: string | null;
  mimeType: string | null;
  size: number;
  createdAt: string;
  finalizedAt: string;
  status: "finalized";
}

export interface DeleteFinalizedCaptureSpoolResult {
  id: string;
  deleted: boolean;
}

export interface PruneFinalizedCaptureSpoolsResult {
  deletedCount: number;
  deletedIds: string[];
}

function getCaptureSpoolApi() {
  return window.electronApp;
}

export async function listFinalizedCaptureSpools(): Promise<FinalizedCaptureSpoolItem[]> {
  return getCaptureSpoolApi()?.listFinalizedCaptureSpools?.() ?? [];
}

export async function deleteFinalizedCaptureSpool(id: string): Promise<DeleteFinalizedCaptureSpoolResult> {
  const captureSpoolApi = getCaptureSpoolApi();

  if (!captureSpoolApi?.deleteFinalizedCaptureSpool) {
    return {
      id,
      deleted: false,
    };
  }

  return captureSpoolApi.deleteFinalizedCaptureSpool({ id });
}

export async function pruneFinalizedCaptureSpools(olderThanMs: number): Promise<PruneFinalizedCaptureSpoolsResult> {
  const captureSpoolApi = getCaptureSpoolApi();

  if (!captureSpoolApi?.pruneFinalizedCaptureSpools) {
    return {
      deletedCount: 0,
      deletedIds: [],
    };
  }

  return captureSpoolApi.pruneFinalizedCaptureSpools({ olderThanMs });
}
