export type DesktopCaptureStatus = "idle" | "starting" | "recording" | "stopping" | "error";

export interface DesktopCaptureOptions {
  captureMicrophone: boolean;
  captureSystemAudio: boolean;
}

export interface DesktopCaptureState {
  status: DesktopCaptureStatus;
  error: string | null;
  captureMicrophone: boolean;
  captureSystemAudio: boolean;
  desktopSupported: boolean;
  systemAudioSupported: boolean;
}

export interface DesktopCaptureStopResult {
  blob: null;
  mimeType: string | null;
  size: number;
  spooled: boolean;
  spoolPath: string | null;
  spoolFilename: string | null;
  sessionId?: string | null;
}

function getUnsupportedState(): DesktopCaptureState {
  return {
    status: "idle",
    error: null,
    captureMicrophone: false,
    captureSystemAudio: false,
    desktopSupported: false,
    systemAudioSupported: false,
  };
}

function getCaptureApi() {
  return window.electronApp;
}

export function isDesktopCaptureAvailable() {
  return Boolean(getCaptureApi()?.startCapture);
}

export function getDesktopCaptureState(): DesktopCaptureState {
  return getCaptureApi()?.getCaptureState() ?? getUnsupportedState();
}

export async function startDesktopCapture(options: DesktopCaptureOptions) {
  const captureApi = getCaptureApi();
  if (!captureApi?.startCapture) {
    throw new Error("Desktop capture is only available in the Electron app.");
  }

  return captureApi.startCapture(options);
}

export async function stopDesktopCapture(): Promise<DesktopCaptureStopResult> {
  const captureApi = getCaptureApi();
  if (!captureApi?.stopCapture) {
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

  return captureApi.stopCapture();
}

export function subscribeToDesktopCaptureState(listener: (state: DesktopCaptureState) => void) {
  const captureApi = getCaptureApi();
  if (!captureApi?.onCaptureStateChanged) {
    listener(getUnsupportedState());
    return () => undefined;
  }

  return captureApi.onCaptureStateChanged(listener);
}
