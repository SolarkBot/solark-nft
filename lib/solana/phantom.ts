const PHANTOM_BROWSE_BASE_URL = "https://phantom.app/ul/browse/";

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
      };
    };
    solana?: {
      isPhantom?: boolean;
    };
  }
}

export function isMobileBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function hasPhantomProvider() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.phantom?.solana?.isPhantom || window.solana?.isPhantom);
}

export function shouldUsePhantomHandoff() {
  return isMobileBrowser() && !hasPhantomProvider();
}

export function buildPhantomBrowseUrl(targetUrl: string, refUrl: string) {
  return `${PHANTOM_BROWSE_BASE_URL}${encodeURIComponent(targetUrl)}?ref=${encodeURIComponent(refUrl)}`;
}

export function openPhantomInAppBrowser(targetUrl: string, refUrl: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(buildPhantomBrowseUrl(targetUrl, refUrl));
}
