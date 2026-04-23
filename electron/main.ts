import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { app, BrowserWindow, desktopCapturer, ipcMain, session, shell } from "electron";
import { join, resolve } from "node:path";
import { BackendManager } from "./backend-manager";

const APP_PROTOCOL = "wrapup";
const AUTH_CALLBACK_HOST = "auth";
const AUTH_CALLBACK_PATH = "/callback";

type CaptureSpoolStatus = "open" | "finalized" | "aborted";
type FinalizedCaptureSpoolStatus = "finalized";
type UploadQueueStatus = "ready" | "uploading" | "uploaded" | "failed";

interface CaptureSpoolSession {
  sessionId: string;
  spoolPath: string;
  spoolFilename: string;
  mimeType: string | null;
  language: string | null;
  bytesWritten: number;
  createdAt: string;
  status: CaptureSpoolStatus;
  fileHandle: FileHandle;
  pendingWrite: Promise<void>;
  lastError: string | null;
}

interface FinalizedCaptureSpoolItem {
  id: string;
  spoolFilename: string;
  spoolPath: string;
  mimeType: string | null;
  size: number;
  language: string | null;
  createdAt: string;
  finalizedAt: string;
  status: FinalizedCaptureSpoolStatus;
  uploadStatus: UploadQueueStatus;
  uploadAttempts: number;
  lastUploadError: string | null;
  claimedAt: string | null;
  uploadedAt: string | null;
}

interface CaptureSpoolManifest {
  items: FinalizedCaptureSpoolItem[];
}

interface ForegroundUploadCredentials {
  accessToken: string;
  userId: string;
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

interface MarkUploadQueueItemUploadedResult {
  item: FinalizedCaptureSpoolItem | null;
  tempFileDeleted: boolean;
  tempFileMissing: boolean;
  tempFileDeleteError: string | null;
}

const captureSpoolSessions = new Map<string, CaptureSpoolSession>();
let captureSpoolManifestQueue: Promise<void> = Promise.resolve();
let cachedAppEnvironment: Record<string, string> | null = null;

let mainWindow: BrowserWindow | null = null;
let pendingAuthCallbackUrl: string | null = extractAuthCallbackUrl(process.argv);
let backendShutdownInProgress = false;
let backendManager: BackendManager | null = null;

app.commandLine.appendSwitch(
  "disable-features",
  "WebRtcAllowInputVolumeAdjustment,HardwareMediaKeyHandling",
);

const hasSingleInstanceLock = app.requestSingleInstanceLock();
const WEB_UPLOAD_PATH_REFERENCE =
  'src/pages/dashboard/UploadPage.tsx -> supabase.storage.from("meeting-files").upload(...) -> supabase.from("sessions").insert(...) -> POST /sessions/{id}/process';

function resolveDesktopProjectRoot() {
  const candidateRoots = [
    resolve(__dirname, ".."),
    process.cwd(),
    app.getAppPath(),
  ];

  for (const candidateRoot of candidateRoots) {
    const hasBackendSources = existsSync(join(candidateRoot, "backend", "main.py"));
    const hasRequirements = existsSync(join(candidateRoot, "requirements.txt"));

    if (hasBackendSources && hasRequirements) {
      return candidateRoot;
    }
  }

  return resolve(__dirname, "..");
}

function getBackendManager() {
  if (!backendManager) {
    backendManager = new BackendManager({
      appName: app.getName(),
      projectRoot: resolveDesktopProjectRoot(),
      tempRoot: app.getPath("temp"),
      getEnvironment: getAppEnvironment,
    });
  }

  return backendManager;
}

function stripWrappedQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseEnvironmentFile(content: string) {
  const parsedEnvironment: Record<string, string> = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = stripWrappedQuotes(trimmedLine.slice(separatorIndex + 1).trim());
    parsedEnvironment[key] = value;
  }

  return parsedEnvironment;
}

async function getAppEnvironment() {
  if (cachedAppEnvironment) {
    return cachedAppEnvironment;
  }

  const environmentPaths = [
    join(app.getAppPath(), ".env"),
    join(process.cwd(), ".env"),
  ];

  for (const environmentPath of environmentPaths) {
    try {
      const environmentContent = await readFile(environmentPath, "utf8");
      cachedAppEnvironment = parseEnvironmentFile(environmentContent);
      return cachedAppEnvironment;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new Error("Failed to read the desktop upload environment configuration.");
      }
    }
  }

  cachedAppEnvironment = {};
  return cachedAppEnvironment;
}

async function getForegroundUploadConfig() {
  const environment = await getAppEnvironment();

  const supabaseUrl =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    environment.SUPABASE_URL ??
    environment.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    environment.SUPABASE_ANON_KEY ??
    environment.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Desktop upload configuration is incomplete. Missing Supabase URL or anon key.");
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/+$/, ""),
    supabaseAnonKey,
  };
}

function getUploadErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const rawMessage = String((error as { message: unknown }).message ?? "");
    if (rawMessage.toLowerCase().includes("failed to fetch")) {
      return "File may be uploaded, but backend is unreachable for processing. Start backend on port 8002 and try again.";
    }
    if (rawMessage.toLowerCase().includes("maximum allowed size")) {
      return "Upload rejected by storage size limit. Increase the 'meeting-files' bucket file size limit or your Supabase project storage plan limit.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getMeetingTitleFromFilename(spoolFilename: string) {
  const title = spoolFilename.replace(/\.[^.]+$/, "").trim();
  return title || "Desktop Capture";
}

function encodeStorageObjectPath(objectPath: string) {
  return objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function getResponseErrorBody(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    const parsedBody = JSON.parse(responseText) as Record<string, unknown>;
    const structuredMessage =
      typeof parsedBody.message === "string"
        ? parsedBody.message
        : typeof parsedBody.error === "string"
          ? parsedBody.error
          : typeof parsedBody.msg === "string"
            ? parsedBody.msg
            : null;

    return structuredMessage ?? responseText;
  } catch {
    return responseText;
  }
}

async function createMeetingForForegroundUpload(
  credentials: ForegroundUploadCredentials,
  spoolFilename: string,
) {
  const { supabaseUrl, supabaseAnonKey } = await getForegroundUploadConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/meetings?select=id,title`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${credentials.accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      title: credentials.meetingTitle?.trim() || getMeetingTitleFromFilename(spoolFilename),
      owner_id: credentials.userId,
      ...(credentials.source ? { source: credentials.source } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await getResponseErrorBody(response);
    throw new Error(errorBody ?? `Meeting creation failed with ${response.status}.`);
  }

  const createdMeetings = await response.json() as Array<{ id?: string }>;
  const meetingId = createdMeetings[0]?.id;

  if (!meetingId) {
    throw new Error("Meeting creation succeeded, but no meeting id was returned.");
  }

  return meetingId;
}

async function uploadForegroundCaptureToStorage(
  credentials: ForegroundUploadCredentials,
  queueItem: FinalizedCaptureSpoolItem,
  fileBytes: Buffer,
  meetingId: string,
) {
  const { supabaseUrl, supabaseAnonKey } = await getForegroundUploadConfig();
  const filePath = `${credentials.userId}/${meetingId}/${Date.now()}-${queueItem.spoolFilename}`;
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/meeting-files/${encodeStorageObjectPath(filePath)}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${credentials.accessToken}`,
        "Content-Type": queueItem.mimeType ?? "application/octet-stream",
        "x-upsert": "false",
      },
      body: fileBytes,
    },
  );

  if (!response.ok) {
    const errorBody = await getResponseErrorBody(response);
    throw new Error(
      getUploadErrorMessage(
        new Error(errorBody ?? `Storage upload failed with ${response.status}.`),
        "Upload failed.",
      ),
    );
  }

  return `meeting-files/${filePath}`;
}

async function createForegroundUploadSession(
  credentials: ForegroundUploadCredentials,
  meetingId: string,
  audioStorageRef: string,
) {
  const selectedLanguage = normalizeCaptureLanguage(credentials.language);
  const { supabaseUrl, supabaseAnonKey } = await getForegroundUploadConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/sessions?select=id`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${credentials.accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      meeting_id: meetingId,
      audio_file_url: audioStorageRef,
      language_detected: selectedLanguage,
    }),
  });

  if (!response.ok) {
    const errorBody = await getResponseErrorBody(response);
    throw new Error(errorBody ?? `Session creation failed with ${response.status}.`);
  }

  const createdSessions = await response.json() as Array<{ id?: string }>;
  const sessionId = createdSessions[0]?.id;

  if (!sessionId) {
    throw new Error("Session creation succeeded, but no session id was returned.");
  }

  return sessionId;
}

function isAuthCallbackUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === `${APP_PROTOCOL}:` &&
      url.hostname === AUTH_CALLBACK_HOST &&
      url.pathname === AUTH_CALLBACK_PATH
    );
  } catch {
    return false;
  }
}

function extractAuthCallbackUrl(values: string[]): string | null {
  return values.find((value) => isAuthCallbackUrl(value)) ?? null;
}

function deliverAuthCallbackUrl(callbackUrl: string) {
  pendingAuthCallbackUrl = callbackUrl;

  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isLoading()) {
    mainWindow.webContents.send("electron:auth-callback", callbackUrl);
  }
}

function registerAppProtocol() {
  if (process.defaultApp && process.argv[1]) {
    app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [resolve(process.argv[1])]);
    return;
  }

  app.setAsDefaultProtocolClient(APP_PROTOCOL);
}

function isTrustedAppUrl(value: string | null | undefined): boolean {
  if (!value || value === "null") {
    return false;
  }

  if (value.startsWith("file://")) {
    return true;
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    if (["127.0.0.1", "localhost"].includes(url.hostname) && url.port === "5173") {
      return true;
    }

    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
      return new URL(devServerUrl).origin === url.origin;
    }
  } catch {
    return false;
  }

  return false;
}

function isTrustedCaptureRequest(...urls: Array<string | null | undefined>) {
  return urls.some((url) => isTrustedAppUrl(url));
}

function assertTrustedIpcSender(event: Electron.IpcMainInvokeEvent) {
  const senderUrl = event.senderFrame?.url ?? event.sender.getURL();

  if (!isTrustedCaptureRequest(senderUrl)) {
    throw new Error("Unauthorized IPC sender.");
  }
}

function sanitizeAppName(value: string) {
  return value.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "wrapup";
}

function getCaptureSpoolDirectory() {
  return join(app.getPath("temp"), sanitizeAppName(app.getName()), "captures");
}

function getCaptureSpoolManifestPath() {
  return join(getCaptureSpoolDirectory(), "manifest.json");
}

function getCaptureExtension(mimeType: string | null | undefined) {
  const normalizedMimeType = mimeType?.toLowerCase() ?? "";

  if (normalizedMimeType.includes("audio/webm")) return ".webm";
  if (normalizedMimeType.includes("audio/ogg")) return ".ogg";
  if (
    normalizedMimeType.includes("audio/wav") ||
    normalizedMimeType.includes("audio/wave") ||
    normalizedMimeType.includes("audio/x-wav")
  ) {
    return ".wav";
  }
  if (normalizedMimeType.includes("audio/mp4") || normalizedMimeType.includes("audio/m4a")) {
    return ".m4a";
  }

  return ".webm";
}

function createCaptureFilename(mimeType: string | null | undefined) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `capture-${timestamp}-${randomUUID()}${getCaptureExtension(mimeType)}`;
}

function normalizeCaptureLanguage(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function sortFinalizedCaptureSpoolItems(items: FinalizedCaptureSpoolItem[]) {
  return [...items].sort((left, right) => {
    const finalizedTimeDifference =
      new Date(right.finalizedAt).getTime() - new Date(left.finalizedAt).getTime();

    if (finalizedTimeDifference !== 0) {
      return finalizedTimeDifference;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

function queueCaptureSpoolManifestOperation<T>(operation: () => Promise<T>) {
  const result = captureSpoolManifestQueue.then(operation, operation);
  captureSpoolManifestQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function parseFinalizedCaptureSpoolItem(value: unknown): FinalizedCaptureSpoolItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.spoolFilename !== "string" ||
    typeof candidate.spoolPath !== "string" ||
    typeof candidate.size !== "number" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.finalizedAt !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    spoolFilename: candidate.spoolFilename,
    spoolPath: candidate.spoolPath,
    mimeType: typeof candidate.mimeType === "string" ? candidate.mimeType : null,
    size: candidate.size,
    language: normalizeCaptureLanguage(typeof candidate.language === "string" ? candidate.language : null),
    createdAt: candidate.createdAt,
    finalizedAt: candidate.finalizedAt,
    status: "finalized",
    uploadStatus:
      candidate.uploadStatus === "uploading" ||
      candidate.uploadStatus === "uploaded" ||
      candidate.uploadStatus === "failed"
        ? candidate.uploadStatus
        : "ready",
    uploadAttempts: typeof candidate.uploadAttempts === "number" ? candidate.uploadAttempts : 0,
    lastUploadError: typeof candidate.lastUploadError === "string" ? candidate.lastUploadError : null,
    claimedAt: typeof candidate.claimedAt === "string" ? candidate.claimedAt : null,
    uploadedAt: typeof candidate.uploadedAt === "string" ? candidate.uploadedAt : null,
  };
}

async function readCaptureSpoolManifestFile(): Promise<CaptureSpoolManifest> {
  const manifestPath = getCaptureSpoolManifestPath();

  await mkdir(getCaptureSpoolDirectory(), { recursive: true });

  try {
    const manifestContent = await readFile(manifestPath, "utf8");
    const parsedManifest = JSON.parse(manifestContent) as { items?: unknown };
    const items = Array.isArray(parsedManifest?.items)
      ? parsedManifest.items.map(parseFinalizedCaptureSpoolItem).filter(Boolean) as FinalizedCaptureSpoolItem[]
      : [];

    return {
      items: sortFinalizedCaptureSpoolItems(items),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { items: [] };
    }

    throw new Error("Failed to read the finalized capture spool manifest.");
  }
}

async function writeCaptureSpoolManifestFile(manifest: CaptureSpoolManifest) {
  const manifestPath = getCaptureSpoolManifestPath();
  const temporaryManifestPath = `${manifestPath}.tmp`;
  const normalizedManifest: CaptureSpoolManifest = {
    items: sortFinalizedCaptureSpoolItems(manifest.items),
  };

  await mkdir(getCaptureSpoolDirectory(), { recursive: true });
  await writeFile(temporaryManifestPath, JSON.stringify(normalizedManifest, null, 2), "utf8");
  await rm(manifestPath, { force: true });
  await rename(temporaryManifestPath, manifestPath);
}

async function selfHealCaptureSpoolManifest(manifest: CaptureSpoolManifest) {
  const healthyItems: FinalizedCaptureSpoolItem[] = [];
  let manifestChanged = false;

  for (const item of manifest.items) {
    try {
      const spoolStats = await stat(item.spoolPath);

      if (!spoolStats.isFile()) {
        manifestChanged = true;
        continue;
      }

      healthyItems.push(item);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        if (item.uploadStatus === "uploaded") {
          healthyItems.push(item);
          continue;
        }

        healthyItems.push({
          ...item,
          uploadStatus: "failed",
          lastUploadError: "Temp capture file is missing from disk.",
          claimedAt: null,
        });
        manifestChanged = true;
        continue;
      }

      throw new Error("Failed to validate finalized capture spool files.");
    }
  }

  const normalizedManifest: CaptureSpoolManifest = {
    items: sortFinalizedCaptureSpoolItems(healthyItems),
  };

  if (manifestChanged) {
    await writeCaptureSpoolManifestFile(normalizedManifest);
  }

  return normalizedManifest;
}

async function readFinalizedCaptureSpoolManifest() {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await readCaptureSpoolManifestFile();
    return selfHealCaptureSpoolManifest(manifest);
  });
}

async function registerFinalizedCaptureSpoolItem(item: FinalizedCaptureSpoolItem) {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const nextManifest: CaptureSpoolManifest = {
      items: sortFinalizedCaptureSpoolItems([
        item,
        ...manifest.items.filter((existingItem) => existingItem.id !== item.id),
      ]),
    };

    await writeCaptureSpoolManifestFile(nextManifest);
    return item;
  });
}

function isActiveCaptureSpoolPath(spoolPath: string) {
  return Array.from(captureSpoolSessions.values()).some((captureSpoolSession) => {
    return captureSpoolSession.status === "open" && captureSpoolSession.spoolPath === spoolPath;
  });
}

function sortUploadQueueClaimCandidates(items: FinalizedCaptureSpoolItem[]) {
  return [...items].sort((left, right) => {
    const finalizedTimeDifference =
      new Date(right.finalizedAt).getTime() - new Date(left.finalizedAt).getTime();

    if (finalizedTimeDifference !== 0) {
      return finalizedTimeDifference;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

async function listFinalizedCaptureSpools() {
  const manifest = await readFinalizedCaptureSpoolManifest();
  return manifest.items;
}

async function deleteFinalizedCaptureSpoolById(id: string) {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const spoolItem = manifest.items.find((item) => item.id === id);

    if (!spoolItem) {
      return { id, deleted: false };
    }

    if (isActiveCaptureSpoolPath(spoolItem.spoolPath)) {
      throw new Error("Cannot delete a finalized capture spool while it is still active.");
    }

    if (spoolItem.uploadStatus === "uploading") {
      throw new Error("Cannot delete a finalized capture spool while it is marked uploading.");
    }

    await rm(spoolItem.spoolPath, { force: true });

    const nextManifest: CaptureSpoolManifest = {
      items: manifest.items.filter((item) => item.id !== id),
    };

    await writeCaptureSpoolManifestFile(nextManifest);

    return {
      id,
      deleted: true,
    };
  });
}

async function pruneFinalizedCaptureSpoolsByAge(olderThanMs: number) {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const pruneCutoff = Date.now() - Math.max(0, olderThanMs);
    const deletedIds: string[] = [];
    const retainedItems: FinalizedCaptureSpoolItem[] = [];

    for (const item of manifest.items) {
      if (new Date(item.finalizedAt).getTime() >= pruneCutoff) {
        retainedItems.push(item);
        continue;
      }

      if (isActiveCaptureSpoolPath(item.spoolPath)) {
        retainedItems.push(item);
        continue;
      }

      if (item.uploadStatus === "uploading") {
        retainedItems.push(item);
        continue;
      }

      await rm(item.spoolPath, { force: true });
      deletedIds.push(item.id);
    }

    if (deletedIds.length > 0) {
      await writeCaptureSpoolManifestFile({
        items: retainedItems,
      });
    }

    return {
      deletedCount: deletedIds.length,
      deletedIds,
    };
  });
}

function getCaptureSpoolSession(sessionId: string) {
  const captureSpoolSession = captureSpoolSessions.get(sessionId);

  if (!captureSpoolSession) {
    throw new Error("Capture spool session was not found.");
  }

  return captureSpoolSession;
}

async function createCaptureSpoolSession(
  mimeType: string | null | undefined,
  language: string | null | undefined,
) {
  await retireReadyUploadQueueItemsBeforeNewCapture();

  const spoolDirectory = getCaptureSpoolDirectory();
  const spoolFilename = createCaptureFilename(mimeType);
  const spoolPath = join(spoolDirectory, spoolFilename);

  await mkdir(spoolDirectory, { recursive: true });

  const captureSpoolSession: CaptureSpoolSession = {
    sessionId: randomUUID(),
    spoolPath,
    spoolFilename,
    mimeType: mimeType ?? null,
    language: normalizeCaptureLanguage(language),
    bytesWritten: 0,
    createdAt: new Date().toISOString(),
    status: "open",
    fileHandle: await open(spoolPath, "a"),
    pendingWrite: Promise.resolve(),
    lastError: null,
  };

  captureSpoolSessions.set(captureSpoolSession.sessionId, captureSpoolSession);
  return captureSpoolSession;
}

async function appendCaptureChunkToSession(captureSpoolSession: CaptureSpoolSession, chunk: Uint8Array) {
  const chunkBuffer = Buffer.from(chunk);

  const writeOperation = captureSpoolSession.pendingWrite.then(async () => {
    if (captureSpoolSession.status !== "open") {
      throw new Error("Capture spool session is not open.");
    }

    await captureSpoolSession.fileHandle.appendFile(chunkBuffer);
    captureSpoolSession.bytesWritten += chunkBuffer.byteLength;
  });

  captureSpoolSession.pendingWrite = writeOperation.then(
    () => undefined,
    (error) => {
      captureSpoolSession.lastError =
        error instanceof Error ? error.message : "Failed to append recording chunk.";
    },
  );

  await writeOperation;
}

async function finalizeCaptureSpoolSession(sessionId: string) {
  const captureSpoolSession = getCaptureSpoolSession(sessionId);

  await captureSpoolSession.pendingWrite;

  if (captureSpoolSession.lastError) {
    await abortCaptureSpoolSession(sessionId);
    throw new Error(captureSpoolSession.lastError);
  }

  if (captureSpoolSession.status !== "open") {
    throw new Error("Capture spool session is not open.");
  }

  await captureSpoolSession.fileHandle.close();
  captureSpoolSession.status = "finalized";
  captureSpoolSessions.delete(sessionId);

  const finalizedCaptureSpoolItem = await registerFinalizedCaptureSpoolItem({
    id: captureSpoolSession.sessionId,
    spoolFilename: captureSpoolSession.spoolFilename,
    spoolPath: captureSpoolSession.spoolPath,
    mimeType: captureSpoolSession.mimeType,
    size: captureSpoolSession.bytesWritten,
    language: captureSpoolSession.language,
    createdAt: captureSpoolSession.createdAt,
    finalizedAt: new Date().toISOString(),
    status: "finalized",
    uploadStatus: "ready",
    uploadAttempts: 0,
    lastUploadError: null,
    claimedAt: null,
    uploadedAt: null,
  });

  return {
    sessionId: finalizedCaptureSpoolItem.id,
    mimeType: finalizedCaptureSpoolItem.mimeType,
    size: finalizedCaptureSpoolItem.size,
    spooled: true,
    spoolPath: finalizedCaptureSpoolItem.spoolPath,
    spoolFilename: finalizedCaptureSpoolItem.spoolFilename,
  };
}

async function abortCaptureSpoolSession(sessionId: string) {
  const captureSpoolSession = captureSpoolSessions.get(sessionId);

  if (!captureSpoolSession) {
    return { sessionId, aborted: false };
  }

  captureSpoolSession.status = "aborted";
  captureSpoolSessions.delete(sessionId);

  await captureSpoolSession.pendingWrite;
  await captureSpoolSession.fileHandle.close();
  await rm(captureSpoolSession.spoolPath, { force: true });

  return { sessionId, aborted: true };
}

async function listUploadQueueItems() {
  return listFinalizedCaptureSpools();
}

async function claimNextUploadQueueItem() {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const sortedCandidates = sortUploadQueueClaimCandidates(
      manifest.items.filter((item) => item.uploadStatus === "ready"),
    );

    let nextClaimableItem: FinalizedCaptureSpoolItem | null = null;
    let manifestChanged = false;

    for (const candidate of sortedCandidates) {
      try {
        const spoolStats = await stat(candidate.spoolPath);
        if (!spoolStats.isFile()) {
          throw new Error("Temp capture file is missing from disk.");
        }
      } catch (error) {
        const message =
          (error as NodeJS.ErrnoException).code === "ENOENT"
            ? "Temp capture file is missing from disk."
            : "Temp capture file could not be prepared for upload.";

        manifest.items = manifest.items.map((item) => {
          if (item.id !== candidate.id) {
            return item;
          }

          return {
            ...item,
            uploadStatus: "failed",
            lastUploadError: message,
            claimedAt: null,
          };
        });
        manifestChanged = true;
        continue;
      }

      nextClaimableItem = {
        ...candidate,
        uploadStatus: "uploading",
        claimedAt: new Date().toISOString(),
        lastUploadError: null,
      };

      manifest.items = manifest.items.map((item) => {
        return item.id === candidate.id ? nextClaimableItem! : item;
      });
      manifestChanged = true;
      break;
    }

    if (manifestChanged) {
      await writeCaptureSpoolManifestFile(manifest);
    }

    return nextClaimableItem;
  });
}

async function markUploadQueueItemUploaded(id: string, deleteTempFile: boolean) {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const queueItem = manifest.items.find((item) => item.id === id);

    if (!queueItem) {
      return {
        item: null,
        tempFileDeleted: false,
        tempFileMissing: false,
        tempFileDeleteError: null,
      };
    }

    const updatedQueueItem: FinalizedCaptureSpoolItem = {
      ...queueItem,
      uploadStatus: "uploaded",
      lastUploadError: null,
      claimedAt: null,
      uploadedAt: new Date().toISOString(),
    };

    let tempFileDeleted = false;
    let tempFileMissing = false;
    let tempFileDeleteError: string | null = null;

    if (deleteTempFile) {
      if (isActiveCaptureSpoolPath(queueItem.spoolPath)) {
        throw new Error("Cannot delete the temp capture file while it is still active.");
      }

      try {
        await stat(queueItem.spoolPath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          tempFileMissing = true;
        } else {
          tempFileDeleteError = "Failed to inspect the temp capture file after upload.";
        }
      }

      if (!tempFileMissing && !tempFileDeleteError) {
        try {
          await rm(queueItem.spoolPath, { force: true });
          tempFileDeleted = true;
        } catch {
          tempFileDeleteError = "Upload succeeded, but deleting the temp capture file failed.";
        }
      }
    }

    manifest.items = manifest.items.map((item) => {
      return item.id === id ? updatedQueueItem : item;
    });
    await writeCaptureSpoolManifestFile(manifest);

    return {
      item: updatedQueueItem,
      tempFileDeleted,
      tempFileMissing,
      tempFileDeleteError,
    };
  });
}

async function markUploadQueueItemFailed(id: string, errorMessage: string) {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const queueItem = manifest.items.find((item) => item.id === id);

    if (!queueItem) {
      return null;
    }

    if (queueItem.uploadStatus === "uploaded") {
      throw new Error("Cannot mark an uploaded queue item as failed.");
    }

    const updatedQueueItem: FinalizedCaptureSpoolItem = {
      ...queueItem,
      uploadStatus: "failed",
      uploadAttempts: queueItem.uploadAttempts + 1,
      lastUploadError: errorMessage,
      claimedAt: null,
      uploadedAt: null,
    };

    manifest.items = manifest.items.map((item) => {
      return item.id === id ? updatedQueueItem : item;
    });
    await writeCaptureSpoolManifestFile(manifest);

    return updatedQueueItem;
  });
}

async function retryUploadQueueItem(id: string) {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const queueItem = manifest.items.find((item) => item.id === id);

    if (!queueItem) {
      return null;
    }

    if (queueItem.uploadStatus !== "failed") {
      throw new Error("Only failed queue items can be retried.");
    }

    const updatedQueueItem: FinalizedCaptureSpoolItem = {
      ...queueItem,
      uploadStatus: "ready",
      lastUploadError: null,
      claimedAt: null,
      uploadedAt: null,
    };

    manifest.items = manifest.items.map((item) => {
      return item.id === id ? updatedQueueItem : item;
    });
    await writeCaptureSpoolManifestFile(manifest);

    return updatedQueueItem;
  });
}

async function retireReadyUploadQueueItemsBeforeNewCapture() {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const retiredSpoolPaths: string[] = [];

    manifest.items = manifest.items.map((item) => {
      if (item.uploadStatus !== "ready") {
        return item;
      }

      retiredSpoolPaths.push(item.spoolPath);
      return {
        ...item,
        uploadStatus: "failed",
        lastUploadError:
          "Retired before a newer capture started to avoid uploading stale audio.",
      };
    });

    if (retiredSpoolPaths.length > 0) {
      await writeCaptureSpoolManifestFile(manifest);
      await Promise.all(
        retiredSpoolPaths.map((spoolPath) => rm(spoolPath, { force: true }).catch(() => undefined)),
      );
    }

    return { retiredCount: retiredSpoolPaths.length };
  });
}

async function releaseStaleUploadingQueueItems(olderThanMs: number) {
  return queueCaptureSpoolManifestOperation(async () => {
    const manifest = await selfHealCaptureSpoolManifest(await readCaptureSpoolManifestFile());
    const staleCutoff = Date.now() - Math.max(0, olderThanMs);
    const releasedIds: string[] = [];

    manifest.items = manifest.items.map((item) => {
      if (
        item.uploadStatus !== "uploading" ||
        !item.claimedAt ||
        new Date(item.claimedAt).getTime() >= staleCutoff
      ) {
        return item;
      }

      releasedIds.push(item.id);
      return {
        ...item,
        uploadStatus: "ready",
        claimedAt: null,
        lastUploadError: null,
      };
    });

    if (releasedIds.length > 0) {
      await writeCaptureSpoolManifestFile(manifest);
    }

    return {
      releasedCount: releasedIds.length,
      releasedIds,
    };
  });
}

async function runNextForegroundUpload(
  credentials: ForegroundUploadCredentials,
): Promise<RunNextForegroundUploadResult> {
  const queueItem = await claimNextUploadQueueItem();

  if (!queueItem) {
    return {
      itemId: null,
      outcome: "no_ready_item",
      spoolFilename: null,
      error: null,
      processingStarted: false,
      processStartError: null,
      tempFileDeleted: false,
      tempFileMissing: false,
      tempFileDeleteError: null,
      reusedUploadPath: WEB_UPLOAD_PATH_REFERENCE,
      meetingId: null,
      sessionId: null,
    };
  }

  try {
    const spoolBytes = await readFile(queueItem.spoolPath);
    const selectedLanguage = normalizeCaptureLanguage(credentials.language) ?? queueItem.language;
    const meetingId = await createMeetingForForegroundUpload(credentials, queueItem.spoolFilename);
    const audioStorageRef = await uploadForegroundCaptureToStorage(
      credentials,
      queueItem,
      spoolBytes,
      meetingId,
    );
    const sessionId = await createForegroundUploadSession(
      {
        ...credentials,
        language: selectedLanguage ?? undefined,
      },
      meetingId,
      audioStorageRef,
    );
    const uploadResult = await markUploadQueueItemUploaded(queueItem.id, true);

    return {
      itemId: queueItem.id,
      outcome: "uploaded",
      spoolFilename: queueItem.spoolFilename,
      error: null,
      processingStarted: false,
      processStartError: null,
      tempFileDeleted: uploadResult.tempFileDeleted,
      tempFileMissing: uploadResult.tempFileMissing,
      tempFileDeleteError: uploadResult.tempFileDeleteError,
      reusedUploadPath: WEB_UPLOAD_PATH_REFERENCE,
      meetingId,
      sessionId,
    };
  } catch (error) {
    const errorMessage = getUploadErrorMessage(error, "Foreground upload failed.");
    await markUploadQueueItemFailed(queueItem.id, errorMessage);

    return {
      itemId: queueItem.id,
      outcome: "failed",
      spoolFilename: queueItem.spoolFilename,
      error: errorMessage,
      processingStarted: false,
      processStartError: errorMessage,
      tempFileDeleted: false,
      tempFileMissing: false,
      tempFileDeleteError: null,
      reusedUploadPath: WEB_UPLOAD_PATH_REFERENCE,
      meetingId: null,
      sessionId: null,
    };
  }
}

function configureDesktopCaptureSession() {
  const defaultSession = session.defaultSession;

  defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    const trustedRequest = isTrustedCaptureRequest(
      requestingOrigin,
      webContents?.getURL(),
      "requestingUrl" in details ? details.requestingUrl : undefined,
    );

    if (!trustedRequest) {
      return false;
    }

    if (permission === "media") {
      return details.mediaType !== "video";
    }

    return false;
  });

  defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const trustedRequest = isTrustedCaptureRequest(
      webContents.getURL(),
      "securityOrigin" in details ? details.securityOrigin : undefined,
      "requestingUrl" in details ? details.requestingUrl : undefined,
    );

    if (!trustedRequest) {
      callback(false);
      return;
    }

    if (permission === "display-capture") {
      callback(true);
      return;
    }

    if (permission === "media") {
      const requestedMediaTypes = "mediaTypes" in details ? details.mediaTypes : undefined;
      callback((requestedMediaTypes ?? ["audio"]).every((mediaType) => mediaType === "audio"));
      return;
    }

    callback(false);
  });

  defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    const trustedRequest = isTrustedCaptureRequest(request.securityOrigin, request.frame?.url);

    if (!trustedRequest || !request.userGesture || !request.videoRequested) {
      callback({});
      return;
    }

    void desktopCapturer
      .getSources({
        types: ["screen"],
        thumbnailSize: { width: 0, height: 0 },
      })
      .then((sources) => {
        const source = sources[0];

        if (!source) {
          callback({});
          return;
        }

        callback({
          video: source,
          ...(request.audioRequested && process.platform === "win32" ? { audio: "loopback" } : {}),
        });
      })
      .catch(() => {
        callback({});
      });
  });
}

const createMainWindow = () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow;
  }

  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow = window;

  window.on("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });

  window.webContents.on("did-finish-load", () => {
    if (pendingAuthCallbackUrl) {
      window.webContents.send("electron:auth-callback", pendingAuthCallbackUrl);
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    void window.loadURL(devServerUrl);
    window.webContents.openDevTools({ mode: "detach" });
    return window;
  }

  void window.loadFile(join(__dirname, "..", "dist", "index.html"));
  return window;
};

function focusMainWindow() {
  const window = createMainWindow();

  if (window.isMinimized()) {
    window.restore();
  }

  window.show();
  window.focus();
}

ipcMain.handle("electron:consume-auth-callback", () => {
  const callbackUrl = pendingAuthCallbackUrl;
  pendingAuthCallbackUrl = null;
  return callbackUrl;
});

ipcMain.handle("electron:open-external", (_event, url: string) => {
  return shell.openExternal(url);
});

ipcMain.handle("electron:get-backend-runtime-status", async (event) => {
  assertTrustedIpcSender(event);
  return getBackendManager().getRuntimeStatus();
});

ipcMain.handle("electron:retry-backend-startup", async (event) => {
  assertTrustedIpcSender(event);
  return getBackendManager().ensureBackendRunning(true);
});

ipcMain.handle(
  "electron:create-capture-spool-session",
  async (
    event,
    payload: {
      mimeType: string | null;
      language?: string;
    },
  ) => {
    assertTrustedIpcSender(event);

    const captureSpoolSession = await createCaptureSpoolSession(payload.mimeType, payload.language);

    return {
      sessionId: captureSpoolSession.sessionId,
      spoolPath: captureSpoolSession.spoolPath,
      spoolFilename: captureSpoolSession.spoolFilename,
      mimeType: captureSpoolSession.mimeType,
      size: captureSpoolSession.bytesWritten,
      language: captureSpoolSession.language,
      spooled: false,
    };
  },
);

ipcMain.handle(
  "electron:append-capture-chunk",
  async (
    event,
    payload: {
      sessionId: string;
      chunk: Uint8Array;
    },
  ) => {
    assertTrustedIpcSender(event);

    const captureSpoolSession = getCaptureSpoolSession(payload.sessionId);
    await appendCaptureChunkToSession(captureSpoolSession, payload.chunk);

    return {
      sessionId: captureSpoolSession.sessionId,
      size: captureSpoolSession.bytesWritten,
    };
  },
);

ipcMain.handle(
  "electron:finalize-capture-spool-session",
  async (
    event,
    payload: {
      sessionId: string;
    },
  ) => {
    assertTrustedIpcSender(event);
    return finalizeCaptureSpoolSession(payload.sessionId);
  },
);

ipcMain.handle(
  "electron:abort-capture-spool-session",
  async (
    event,
    payload: {
      sessionId: string;
    },
  ) => {
    assertTrustedIpcSender(event);
    return abortCaptureSpoolSession(payload.sessionId);
  },
);

ipcMain.handle("electron:list-finalized-capture-spools", async (event) => {
  assertTrustedIpcSender(event);
  return listFinalizedCaptureSpools();
});

ipcMain.handle("electron:list-upload-queue-items", async (event) => {
  assertTrustedIpcSender(event);
  return listUploadQueueItems();
});

ipcMain.handle("electron:claim-next-upload-queue-item", async (event) => {
  assertTrustedIpcSender(event);
  return claimNextUploadQueueItem();
});

ipcMain.handle(
  "electron:run-next-foreground-upload",
  async (
    event,
    payload: ForegroundUploadCredentials,
  ) => {
    assertTrustedIpcSender(event);
    return runNextForegroundUpload(payload);
  },
);

ipcMain.handle(
  "electron:mark-upload-queue-item-uploaded",
  async (
    event,
    payload: {
      id: string;
      deleteTempFile?: boolean;
    },
  ) => {
    assertTrustedIpcSender(event);
    return markUploadQueueItemUploaded(payload.id, payload.deleteTempFile === true);
  },
);

ipcMain.handle(
  "electron:mark-upload-queue-item-failed",
  async (
    event,
    payload: {
      id: string;
      error: string;
    },
  ) => {
    assertTrustedIpcSender(event);
    return markUploadQueueItemFailed(payload.id, payload.error);
  },
);

ipcMain.handle(
  "electron:retry-upload-queue-item",
  async (
    event,
    payload: {
      id: string;
    },
  ) => {
    assertTrustedIpcSender(event);
    return retryUploadQueueItem(payload.id);
  },
);

ipcMain.handle(
  "electron:release-stale-uploading-queue-items",
  async (
    event,
    payload: {
      olderThanMs: number;
    },
  ) => {
    assertTrustedIpcSender(event);
    return releaseStaleUploadingQueueItems(payload.olderThanMs);
  },
);

ipcMain.handle(
  "electron:delete-finalized-capture-spool",
  async (
    event,
    payload: {
      id: string;
    },
  ) => {
    assertTrustedIpcSender(event);
    return deleteFinalizedCaptureSpoolById(payload.id);
  },
);

ipcMain.handle(
  "electron:prune-finalized-capture-spools",
  async (
    event,
    payload: {
      olderThanMs: number;
    },
  ) => {
    assertTrustedIpcSender(event);
    return pruneFinalizedCaptureSpoolsByAge(payload.olderThanMs);
  },
);

app.on("open-url", (event, url) => {
  event.preventDefault();

  if (!isAuthCallbackUrl(url)) {
    return;
  }

  deliverAuthCallbackUrl(url);

  if (app.isReady()) {
    focusMainWindow();
  }
});

if (!hasSingleInstanceLock) {
  app.quit();
}

if (hasSingleInstanceLock) {
  app.on("second-instance", (_event, commandLine) => {
    const callbackUrl = extractAuthCallbackUrl(commandLine);

    if (callbackUrl) {
      deliverAuthCallbackUrl(callbackUrl);
    }

    focusMainWindow();
  });

  app.whenReady().then(() => {
    registerAppProtocol();
    configureDesktopCaptureSession();
    void getBackendManager().ensureBackendRunning().catch((error) => {
      console.error("Failed to auto-start the local backend.", error);
    });
    void readFinalizedCaptureSpoolManifest().catch((error) => {
      console.error("Failed to prepare the capture spool manifest.", error);
    });
    createMainWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });
}

app.on("before-quit", (event) => {
  if (backendShutdownInProgress || !getBackendManager().hasOwnedBackendProcess()) {
    return;
  }

  event.preventDefault();
  backendShutdownInProgress = true;

  void getBackendManager()
    .stopOwnedBackend()
    .catch((error) => {
      console.error("Failed to stop the local backend cleanly.", error);
    })
    .finally(() => {
      app.quit();
    });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
