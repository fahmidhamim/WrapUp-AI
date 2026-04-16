const DEFAULT_PUBLIC_APP_URL = "https://app.wrapup.ai";
const EXTERNAL_URL_PATTERN = /^(https?:\/\/|mailto:|tel:|sms:|fb-messenger:)/i;

function normalizeHttpBaseUrl(value?: string | null): string | null {
  const nextValue = value?.trim();
  if (!nextValue) return null;

  try {
    const url = new URL(nextValue);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
    return `${url.origin}${pathname}`;
  } catch {
    return null;
  }
}

function normalizeAbsoluteExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return EXTERNAL_URL_PATTERN.test(url.toString()) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  return window.electronApp?.isDesktop === true || window.location.protocol === "file:";
}

export function isExternalHref(href: string): boolean {
  return EXTERNAL_URL_PATTERN.test(href);
}

export function hasConfiguredPublicAppUrl(): boolean {
  return Boolean(normalizeHttpBaseUrl(import.meta.env.VITE_PUBLIC_APP_URL));
}

export function getPublicAppBaseUrl(): string {
  const envBaseUrl = normalizeHttpBaseUrl(import.meta.env.VITE_PUBLIC_APP_URL);
  if (envBaseUrl) return envBaseUrl;

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin === "null" || window.location.protocol === "file:") return DEFAULT_PUBLIC_APP_URL;

    // Replace "localhost" with "127.0.0.1" so Chrome doesn't force-upgrade to HTTPS
    const safeOrigin = origin.replace(/^(https?:\/\/)localhost(:\d+)?/, (_, proto, port) => `${proto}127.0.0.1${port ?? ""}`);
    const normalized = normalizeHttpBaseUrl(safeOrigin);
    if (normalized) return normalized;
  }

  return DEFAULT_PUBLIC_APP_URL;
}

export function buildPublicAppUrl(pathOrUrl = "/"): string {
  const absoluteUrl = normalizeAbsoluteExternalUrl(pathOrUrl);
  if (absoluteUrl) return absoluteUrl;

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl.slice(1) : pathOrUrl;
  return new URL(normalizedPath, `${getPublicAppBaseUrl()}/`).toString();
}

export async function openExternalUrl(url: string): Promise<void> {
  if (typeof window === "undefined") return;

  const externalUrl = normalizeAbsoluteExternalUrl(url) ?? url;

  if (window.electronApp?.openExternal) {
    await window.electronApp.openExternal(externalUrl);
    return;
  }

  if (/^https?:\/\//i.test(externalUrl)) {
    window.open(externalUrl, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.href = externalUrl;
}
