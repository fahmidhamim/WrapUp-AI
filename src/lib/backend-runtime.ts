export interface BackendRuntimeStatus {
  state: "starting" | "ready" | "unavailable";
  source: "owned" | "external" | "none";
  backendUrl: string | null;
  healthUrl: string | null;
  command: string | null;
  message: string | null;
}

const UNSUPPORTED_STATUS: BackendRuntimeStatus = {
  state: "unavailable",
  source: "none",
  backendUrl: null,
  healthUrl: null,
  command: null,
  message: "Backend auto-start is only available in the Electron app.",
};

function getBackendRuntimeApi() {
  return window.electronApp;
}

export function isBackendRuntimeAvailable() {
  return Boolean(getBackendRuntimeApi()?.getBackendRuntimeStatus);
}

export async function getBackendRuntimeStatus(): Promise<BackendRuntimeStatus> {
  return getBackendRuntimeApi()?.getBackendRuntimeStatus?.() ?? UNSUPPORTED_STATUS;
}

export async function retryBackendStartup(): Promise<BackendRuntimeStatus> {
  return getBackendRuntimeApi()?.retryBackendStartup?.() ?? UNSUPPORTED_STATUS;
}
