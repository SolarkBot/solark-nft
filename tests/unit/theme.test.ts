import { getSystemThemeMode, observeSystemTheme } from "@/lib/utils/theme";

function createMatchMediaController(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<() => void>();

  const matchMedia = vi.fn((query: string) => {
    const mediaQuery = {
      media: query,
      addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
      addListener: (listener: () => void) => listeners.add(listener),
      removeListener: (listener: () => void) => listeners.delete(listener),
    };

    Object.defineProperty(mediaQuery, "matches", {
      get() {
        return query === "(prefers-color-scheme: dark)" ? dark : false;
      },
    });

    return mediaQuery;
  });

  return {
    matchMedia,
    setDark(nextDark: boolean) {
      dark = nextDark;
    },
    notify() {
      listeners.forEach((listener) => listener());
    },
  };
}

describe("theme utilities", () => {
  it("detects the current system theme", () => {
    const controller = createMatchMediaController(true);
    const mockWindow = { matchMedia: controller.matchMedia } as unknown as Window;

    expect(getSystemThemeMode(mockWindow)).toBe("dark");

    controller.setDark(false);
    expect(getSystemThemeMode(mockWindow)).toBe("light");
  });

  it("observes live theme changes", () => {
    const controller = createMatchMediaController(false);
    const mockWindow = { matchMedia: controller.matchMedia } as unknown as Window;
    const callback = vi.fn();

    const stop = observeSystemTheme(callback, mockWindow);
    expect(callback).toHaveBeenLastCalledWith("light");

    controller.setDark(true);
    controller.notify();
    expect(callback).toHaveBeenLastCalledWith("dark");

    stop();
  });
});
