import type { ThemeMode } from "@/types";

const THEME_QUERY = "(prefers-color-scheme: dark)";

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
};

export function getSystemThemeMode(win: Window | undefined = typeof window === "undefined" ? undefined : window): ThemeMode {
  if (!win) {
    return "dark";
  }

  return win.matchMedia(THEME_QUERY).matches ? "dark" : "light";
}

export function observeSystemTheme(
  callback: (mode: ThemeMode) => void,
  win: Window | undefined = typeof window === "undefined" ? undefined : window,
) {
  if (!win) {
    return () => undefined;
  }

  const mediaQuery = win.matchMedia(THEME_QUERY) as LegacyMediaQueryList;
  const handleChange = () => callback(mediaQuery.matches ? "dark" : "light");

  handleChange();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }

  mediaQuery.addListener?.(handleChange);
  return () => mediaQuery.removeListener?.(handleChange);
}
