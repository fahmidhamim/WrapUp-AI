const DEFAULT_BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8002";

export function getProcessStartErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const rawMessage = String((error as { message: unknown }).message ?? "");
    const normalizedMessage = rawMessage.toLowerCase();

    if (
      normalizedMessage.includes("failed to fetch") ||
      normalizedMessage.includes("fetch failed")
    ) {
      return "Backend is unreachable. Start backend on port 8002 and try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getBackendCandidates(baseUrl: string): string[] {
  const normalized = baseUrl.replace(/\/+$/, "");
  const variants = new Set<string>([normalized]);
  variants.add(normalized.replace("127.0.0.1", "localhost"));
  variants.add(normalized.replace("localhost", "127.0.0.1"));
  variants.add(normalized.replace(":8000", ":8002"));
  variants.add(normalized.replace(":8002", ":8000"));
  return Array.from(variants);
}

export async function startSessionProcessing(
  sessionId: string,
  accessToken: string,
  backendUrl = DEFAULT_BACKEND_URL,
): Promise<void> {
  let lastError = "Failed to start processing";

  for (const candidate of getBackendCandidates(backendUrl)) {
    try {
      const processResponse = await fetch(`${candidate}/sessions/${sessionId}/process`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!processResponse.ok) {
        const body = await processResponse.text();
        lastError = body || `Backend ${candidate} responded with ${processResponse.status}`;
        continue;
      }

      return;
    } catch (error) {
      lastError = getProcessStartErrorMessage(error, `Could not reach backend at ${candidate}`);
    }
  }

  throw new Error(lastError);
}
