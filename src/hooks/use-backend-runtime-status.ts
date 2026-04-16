import { useCallback, useEffect, useState } from "react";
import {
  getBackendRuntimeStatus as loadBackendRuntimeStatus,
  isBackendRuntimeAvailable,
  retryBackendStartup,
  type BackendRuntimeStatus,
} from "@/lib/backend-runtime";
import { isDesktopApp } from "@/lib/app-shell";

interface UseBackendRuntimeStatusOptions {
  pollIntervalMs?: number;
}

export function useBackendRuntimeStatus(
  options: UseBackendRuntimeStatusOptions = {},
) {
  const { pollIntervalMs = 3000 } = options;
  const supported = isDesktopApp() && isBackendRuntimeAvailable();
  const [status, setStatus] = useState<BackendRuntimeStatus | null>(null);

  const refresh = useCallback(async () => {
    if (!supported) {
      setStatus(null);
      return null;
    }

    try {
      const nextStatus = await loadBackendRuntimeStatus();
      setStatus(nextStatus);
      return nextStatus;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load local backend status.";
      const fallbackStatus: BackendRuntimeStatus = {
        state: "unavailable",
        source: "none",
        backendUrl: null,
        healthUrl: null,
        command: null,
        message,
      };
      setStatus(fallbackStatus);
      return fallbackStatus;
    }
  }, [supported]);

  const retry = useCallback(async () => {
    if (!supported) {
      return null;
    }

    const nextStatus = await retryBackendStartup();
    setStatus(nextStatus);
    return nextStatus;
  }, [supported]);

  useEffect(() => {
    if (!supported) {
      setStatus(null);
      return;
    }

    void refresh();

    const intervalId = window.setInterval(() => {
      void refresh();
    }, pollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pollIntervalMs, refresh, supported]);

  return {
    status,
    supported,
    refresh,
    retry,
  };
}
