import { createHash } from "node:crypto";
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, type WriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8002";
const REPO_BACKEND_DEV_COMMAND = "./.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8002";
const HEALTH_POLL_INTERVAL_MS = 1000;
const HEALTH_REQUEST_TIMEOUT_MS = 2000;
const BACKEND_START_TIMEOUT_MS = 60000;
const MANAGED_REQUIREMENTS_HASH_FILE = ".requirements.sha1";
const SIGTERM_GRACE_MS = 3000;
const MAX_STARTUP_ATTEMPTS = 5;
const STARTUP_RETRY_DELAY_MS = 2000;
const HEALTH_FAILURE_THRESHOLD = 3;
const HEALTH_PROBE_TIMEOUT_MS = 4000;

export type BackendRuntimeState = "starting" | "ready" | "unavailable";
export type BackendRuntimeSource = "owned" | "external" | "none";

export interface BackendRuntimeStatus {
  state: BackendRuntimeState;
  source: BackendRuntimeSource;
  backendUrl: string | null;
  healthUrl: string | null;
  command: string | null;
  message: string | null;
}

interface BackendManagerOptions {
  appName: string;
  projectRoot: string;
  tempRoot: string;
  getEnvironment: () => Promise<Record<string, string>>;
}

interface BackendRuntimeConfig {
  backendUrl: string;
  healthUrl: string;
  port: string;
}

interface ResolvedBackendCommand {
  file: string;
  args: string[];
  command: string;
}

interface HostPythonCommand {
  file: string;
  args: string[];
  command: string;
}

function sanitizeAppName(value: string) {
  return value.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "wrapup";
}

function sleep(timeoutMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs);
  });
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

export class BackendManager {
  private readonly options: BackendManagerOptions;
  private status: BackendRuntimeStatus = {
    state: "starting",
    source: "none",
    backendUrl: null,
    healthUrl: null,
    command: null,
    message: "Checking local backend runtime...",
  };
  private startupPromise: Promise<BackendRuntimeStatus> | null = null;
  private ownedBackendProcess: ChildProcessWithoutNullStreams | null = null;
  private backendStartupEpoch = 0;
  private shutdownPromise: Promise<void> | null = null;
  private lastLogs: string[] = [];
  private backendLogStream: WriteStream | null = null;
  private backendLogStreamFailed = false;
  private consecutiveHealthFailures = 0;

  constructor(options: BackendManagerOptions) {
    this.options = options;
  }

  async ensureBackendRunning(forceRetry = false): Promise<BackendRuntimeStatus> {
    if (!forceRetry && this.startupPromise) {
      return this.startupPromise;
    }

    if (forceRetry) {
      this.startupPromise = null;
    }

    const startupPromise = this.startBackend(forceRetry).finally(() => {
      if (this.startupPromise === startupPromise) {
        this.startupPromise = null;
      }
    });

    this.startupPromise = startupPromise;
    return startupPromise;
  }

  async getRuntimeStatus(): Promise<BackendRuntimeStatus> {
    const config = await this.getRuntimeConfig();
    this.patchStatus({
      backendUrl: config.backendUrl,
      healthUrl: config.healthUrl,
    });

    if (this.status.state === "ready") {
      const healthy = await this.isBackendHealthy(config.healthUrl, HEALTH_PROBE_TIMEOUT_MS);

      if (healthy) {
        this.consecutiveHealthFailures = 0;
      } else {
        this.consecutiveHealthFailures += 1;

        if (this.consecutiveHealthFailures >= HEALTH_FAILURE_THRESHOLD) {
          this.patchStatus({
            state: this.ownedBackendProcess ? "starting" : "unavailable",
            source: this.ownedBackendProcess ? "owned" : "none",
            message: this.ownedBackendProcess
              ? "Local backend is starting..."
              : "Local backend is unavailable.",
          });
          this.consecutiveHealthFailures = 0;
        }
      }
    }

    return this.cloneStatus();
  }

  hasOwnedBackendProcess() {
    return this.ownedBackendProcess !== null;
  }

  async stopOwnedBackend() {
    if (this.shutdownPromise) {
      return this.shutdownPromise;
    }

    this.consecutiveHealthFailures = 0;

    const activeProcess = this.ownedBackendProcess;

    if (!activeProcess) {
      return;
    }

    this.shutdownPromise = this.stopProcess(activeProcess).finally(() => {
      if (this.ownedBackendProcess?.pid === activeProcess.pid) {
        this.ownedBackendProcess = null;
      }

      this.patchStatus({
        state: "unavailable",
        source: "none",
        message: "Local backend stopped.",
        command: null,
      });
      this.closeBackendLogStream();
      this.shutdownPromise = null;
    });

    return this.shutdownPromise;
  }

  private async startBackend(forceRetry: boolean) {
    const config = await this.getRuntimeConfig();

    if (!this.hasLocalBackendSources()) {
      this.patchStatus({
        state: "unavailable",
        source: "none",
        backendUrl: config.backendUrl,
        healthUrl: config.healthUrl,
        command: null,
        message: "Backend auto-start is available only when backend sources and requirements.txt are present locally.",
      });
      return this.cloneStatus();
    }

    if (!forceRetry && await this.isBackendHealthy(config.healthUrl)) {
      this.patchStatus({
        state: "ready",
        source: this.ownedBackendProcess ? "owned" : "external",
        backendUrl: config.backendUrl,
        healthUrl: config.healthUrl,
        message: this.ownedBackendProcess
          ? "Local backend is ready."
          : "Local backend is already running.",
      });
      this.consecutiveHealthFailures = 0;
      return this.cloneStatus();
    }

    if (this.ownedBackendProcess) {
      await this.waitForHealth(config.healthUrl, this.ownedBackendProcess);
      this.patchStatus({
        state: "ready",
        source: "owned",
        backendUrl: config.backendUrl,
        healthUrl: config.healthUrl,
        message: "Local backend is ready.",
      });
      this.consecutiveHealthFailures = 0;
      return this.cloneStatus();
    }

    this.patchStatus({
      state: "starting",
      source: "none",
      backendUrl: config.backendUrl,
      healthUrl: config.healthUrl,
      message: "Checking local backend runtime...",
    });

    const command = await this.resolveBackendCommand(config.port);
    const startupEpoch = ++this.backendStartupEpoch;

    this.patchStatus({
      state: "starting",
      source: "owned",
      backendUrl: config.backendUrl,
      healthUrl: config.healthUrl,
      command: command.command,
      message: "Starting local backend...",
    });

    let lastError: unknown = null;

    for (let attempt = 1; attempt <= MAX_STARTUP_ATTEMPTS; attempt++) {
      if (startupEpoch !== this.backendStartupEpoch) {
        return this.cloneStatus();
      }

      const child = spawn(command.file, command.args, {
        cwd: this.options.projectRoot,
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      });

      this.ownedBackendProcess = child;
      this.attachProcessLogging(child);
      this.attachProcessLifecycle(child, startupEpoch);

      try {
        await this.waitForHealth(config.healthUrl, child);
        this.patchStatus({
          state: "ready",
          source: "owned",
          backendUrl: config.backendUrl,
          healthUrl: config.healthUrl,
          command: command.command,
          message: "Local backend is ready.",
        });
        this.consecutiveHealthFailures = 0;
        return this.cloneStatus();
      } catch (error) {
        lastError = error;

        if (this.ownedBackendProcess?.pid === child.pid) {
          await this.stopProcess(child);
          this.ownedBackendProcess = null;
        }

        if (startupEpoch !== this.backendStartupEpoch) {
          return this.cloneStatus();
        }

        if (attempt < MAX_STARTUP_ATTEMPTS) {
          this.patchStatus({
            state: "starting",
            source: "owned",
            backendUrl: config.backendUrl,
            healthUrl: config.healthUrl,
            command: command.command,
            message: `Restarting local backend (attempt ${attempt + 1}/${MAX_STARTUP_ATTEMPTS})…`,
          });
          await sleep(STARTUP_RETRY_DELAY_MS);
        }
      }
    }

    const message = lastError instanceof Error ? lastError.message : "Local backend failed to start.";

    this.patchStatus({
      state: "unavailable",
      source: "none",
      backendUrl: config.backendUrl,
      healthUrl: config.healthUrl,
      command: command.command,
      message,
    });
    this.closeBackendLogStream();

    return this.cloneStatus();
  }

  private async getRuntimeConfig(): Promise<BackendRuntimeConfig> {
    const environment = await this.options.getEnvironment();
    const backendUrl = (
      process.env.VITE_BACKEND_URL ??
      environment.VITE_BACKEND_URL ??
      DEFAULT_BACKEND_URL
    ).replace(/\/+$/, "");
    const parsedBackendUrl = new URL(backendUrl);
    const port =
      parsedBackendUrl.port ||
      (parsedBackendUrl.protocol === "https:" ? "443" : "80");

    return {
      backendUrl,
      healthUrl: new URL("healthz", ensureTrailingSlash(backendUrl)).toString(),
      port,
    };
  }

  private cloneStatus(): BackendRuntimeStatus {
    return { ...this.status };
  }

  private patchStatus(nextStatus: Partial<BackendRuntimeStatus>) {
    this.status = {
      ...this.status,
      ...nextStatus,
    };
  }

  private hasLocalBackendSources() {
    return (
      existsSync(join(this.options.projectRoot, "backend", "main.py")) &&
      existsSync(join(this.options.projectRoot, "requirements.txt"))
    );
  }

  private attachProcessLogging(child: ChildProcessWithoutNullStreams) {
    child.stdout.on("data", (chunk: Buffer | string) => {
      this.captureLogChunk("stdout", chunk);
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      this.captureLogChunk("stderr", chunk);
    });
  }

  private attachProcessLifecycle(child: ChildProcessWithoutNullStreams, startupEpoch: number) {
    child.on("error", (error) => {
      if (this.ownedBackendProcess?.pid === child.pid) {
        this.ownedBackendProcess = null;
      }

      if (startupEpoch !== this.backendStartupEpoch) {
        return;
      }

      this.patchStatus({
        state: "unavailable",
        source: "none",
        message: error.message || "Local backend process failed to start.",
      });
    });

    child.on("exit", (code, signal) => {
      if (this.ownedBackendProcess?.pid === child.pid) {
        this.ownedBackendProcess = null;
      }

      if (startupEpoch !== this.backendStartupEpoch) {
        return;
      }

      const applyUnavailable = () => {
        if (startupEpoch !== this.backendStartupEpoch) return;
        if (this.ownedBackendProcess) return;
        if (this.status.state !== "ready" && this.status.state !== "starting") return;

        const terminationReason =
          signal
            ? `signal ${signal}`
            : typeof code === "number"
              ? `exit code ${code}`
              : "unexpected shutdown";
        this.patchStatus({
          state: "unavailable",
          source: "none",
          message: `Local backend exited with ${terminationReason}.`,
        });
      };

      // A SIGTERM may be a graceful restart; give the supervisor a window
      // to spawn a replacement child before we flip the UI to offline.
      if (signal === "SIGTERM") {
        setTimeout(applyUnavailable, SIGTERM_GRACE_MS);
      } else {
        applyUnavailable();
      }
    });
  }

  private captureLogChunk(stream: "stdout" | "stderr", chunk: Buffer | string) {
    const text = chunk.toString();
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    const logStream = stream === "stderr" ? this.ensureBackendLogStream() : null;

    for (const line of lines) {
      const taggedLine = `[backend:${stream}] ${line}`;
      this.lastLogs.push(taggedLine);

      if (this.lastLogs.length > 50) {
        this.lastLogs.shift();
      }

      if (stream === "stderr") {
        console.error(taggedLine);
      } else {
        console.log(taggedLine);
      }

      if (logStream) {
        try {
          logStream.write(`[${new Date().toISOString()}] ${line}\n`);
        } catch {
          // Stream is already failing; the "error" listener below will null it out.
        }
      }
    }
  }

  private ensureBackendLogStream(): WriteStream | null {
    if (process.platform !== "darwin") return null;
    if (this.backendLogStreamFailed) return null;
    if (this.backendLogStream) return this.backendLogStream;

    try {
      const logDir = join(homedir(), "Library", "Logs", "WrapUp");
      mkdirSync(logDir, { recursive: true });
      const stream = createWriteStream(join(logDir, "backend.log"), { flags: "a" });
      stream.on("error", () => {
        this.backendLogStreamFailed = true;
        this.backendLogStream = null;
      });
      this.backendLogStream = stream;
      return stream;
    } catch {
      this.backendLogStreamFailed = true;
      this.backendLogStream = null;
      return null;
    }
  }

  private closeBackendLogStream() {
    const stream = this.backendLogStream;
    this.backendLogStream = null;
    if (stream) {
      try {
        stream.end();
      } catch {
        // ignore
      }
    }
  }

  private async isBackendHealthy(
    healthUrl: string,
    timeoutMs: number = HEALTH_REQUEST_TIMEOUT_MS,
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(healthUrl, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          return false;
        }

        return true;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch {
      return false;
    }
  }

  private async waitForHealth(
    healthUrl: string,
    child: ChildProcessWithoutNullStreams,
  ) {
    const deadline = Date.now() + BACKEND_START_TIMEOUT_MS;

    while (Date.now() < deadline) {
      if (await this.isBackendHealthy(healthUrl)) {
        return;
      }

      if (child.exitCode !== null) {
        break;
      }

      await sleep(HEALTH_POLL_INTERVAL_MS);
    }

    const tailLogs = this.lastLogs.slice(-6).join(" ");
    throw new Error(
      tailLogs
        ? `Local backend did not become healthy in time. ${tailLogs}`
        : "Local backend did not become healthy in time.",
    );
  }

  private async resolveBackendCommand(port: string): Promise<ResolvedBackendCommand> {
    const repoVenvWindowsPython = join(this.options.projectRoot, ".venv", "Scripts", "python.exe");
    const repoVenvUnixUvicorn = join(this.options.projectRoot, ".venv", "bin", "uvicorn");
    const repoVenvUnixPython = join(this.options.projectRoot, ".venv", "bin", "python");

    if (process.platform === "win32" && existsSync(repoVenvWindowsPython)) {
      return {
        file: repoVenvWindowsPython,
        args: ["-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", port],
        command: `.venv\\Scripts\\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port ${port}`,
      };
    }

    if (process.platform !== "win32" && existsSync(repoVenvUnixUvicorn)) {
      return {
        file: repoVenvUnixUvicorn,
        args: ["backend.main:app", "--host", "0.0.0.0", "--port", port],
        command: REPO_BACKEND_DEV_COMMAND.replace("8002", port),
      };
    }

    if (process.platform !== "win32" && existsSync(repoVenvUnixPython)) {
      return {
        file: repoVenvUnixPython,
        args: ["-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", port],
        command: `.venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port ${port}`,
      };
    }

    return this.resolveManagedVenvCommand(port);
  }

  private async resolveManagedVenvCommand(port: string): Promise<ResolvedBackendCommand> {
    const managedRoot = join(
      this.options.tempRoot,
      sanitizeAppName(this.options.appName),
      "backend-runtime",
    );
    const managedVenvDir = join(managedRoot, "venv");
    const requirementsPath = join(this.options.projectRoot, "requirements.txt");
    const managedPythonPath = process.platform === "win32"
      ? join(managedVenvDir, "Scripts", "python.exe")
      : join(managedVenvDir, "bin", "python");
    const requirementsHash = createHash("sha1")
      .update(await readFile(requirementsPath))
      .digest("hex");
    const requirementsHashPath = join(managedRoot, MANAGED_REQUIREMENTS_HASH_FILE);

    await mkdir(managedRoot, { recursive: true });

    if (!existsSync(managedPythonPath)) {
      this.patchStatus({
        message: "Preparing backend Python environment...",
      });

      const hostPython = this.resolveHostPython();
      await this.runCommandOrThrow(
        hostPython.file,
        [...hostPython.args, "-m", "venv", managedVenvDir],
        hostPython.command,
      );
    }

    let installedRequirementsHash: string | null = null;

    try {
      installedRequirementsHash = (await readFile(requirementsHashPath, "utf8")).trim();
    } catch {
      installedRequirementsHash = null;
    }

    if (installedRequirementsHash !== requirementsHash) {
      this.patchStatus({
        message: "Installing backend dependencies for local desktop development...",
      });

      await this.runCommandOrThrow(
        managedPythonPath,
        ["-m", "pip", "install", "-r", requirementsPath],
        `${managedPythonPath} -m pip install -r requirements.txt`,
      );
      await writeFile(requirementsHashPath, requirementsHash, "utf8");
    }

    return {
      file: managedPythonPath,
      args: ["-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", port],
      command: `${managedPythonPath} -m uvicorn backend.main:app --host 0.0.0.0 --port ${port}`,
    };
  }

  private resolveHostPython(): HostPythonCommand {
    const candidates: HostPythonCommand[] = process.platform === "win32"
      ? [
          { file: "py", args: ["-3"], command: "py -3" },
          { file: "python", args: [], command: "python" },
        ]
      : [
          { file: "python3", args: [], command: "python3" },
          { file: "python", args: [], command: "python" },
        ];

    for (const candidate of candidates) {
      const probe = spawnSync(candidate.file, [...candidate.args, "--version"], {
        cwd: this.options.projectRoot,
        windowsHide: true,
        stdio: "ignore",
      });

      if (probe.status === 0) {
        return candidate;
      }
    }

    throw new Error("No usable Python executable was found for backend auto-start.");
  }

  private async runCommandOrThrow(file: string, args: string[], commandLabel: string) {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(file, args, {
        cwd: this.options.projectRoot,
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });

      let stderr = "";

      child.stdout.on("data", (chunk: Buffer | string) => {
        this.captureLogChunk("stdout", chunk);
      });

      child.stderr.on("data", (chunk: Buffer | string) => {
        stderr += chunk.toString();
        this.captureLogChunk("stderr", chunk);
      });

      child.on("error", (error) => {
        reject(error);
      });

      child.on("exit", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        const trimmedError = stderr.trim();
        reject(new Error(trimmedError || `${commandLabel} exited with code ${code}.`));
      });
    });
  }

  private async stopProcess(child: ChildProcessWithoutNullStreams) {
    if (child.exitCode !== null) {
      return;
    }

    if (process.platform === "win32") {
      await new Promise<void>((resolve) => {
        const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
          windowsHide: true,
          stdio: "ignore",
        });

        killer.on("exit", () => resolve());
        killer.on("error", () => resolve());
      });
      return;
    }

    child.kill("SIGTERM");

    await Promise.race([
      new Promise<void>((resolve) => {
        child.once("exit", () => resolve());
      }),
      sleep(5000).then(() => {
        if (child.exitCode === null) {
          child.kill("SIGKILL");
        }
      }),
    ]);
  }
}
