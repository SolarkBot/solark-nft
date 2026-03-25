import {
  buildDownloadFilename,
  buildMobileSaveViewUrl,
  downloadArtwork,
} from "@/lib/utils/artwork";

afterEach(() => {
  vi.restoreAllMocks();

  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: undefined,
  });

  Object.defineProperty(navigator, "canShare", {
    configurable: true,
    value: undefined,
  });
});

describe("buildDownloadFilename", () => {
  it("formats the SolarkBot filename", () => {
    expect(buildDownloadFilename(new Date(2026, 2, 25, 8, 9, 10))).toBe(
      "solarkbot-art-20260325-080910.png",
    );
  });
});

describe("buildMobileSaveViewUrl", () => {
  it("encodes the image data in the save-view URL", () => {
    expect(
      buildMobileSaveViewUrl(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sWwaP8AAAAASUVORK5CYII=",
      ),
    ).toContain("/artwork/save?image=data%3Aimage%2Fpng%3Bbase64%2C");
  });
});

describe("downloadArtwork", () => {
  it("downloads inline data images without fetching them", async () => {
    const createObjectUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:solarkbot-art");
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(HTMLElement.prototype, "remove").mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const timeoutSpy = vi.spyOn(window, "setTimeout");

    await downloadArtwork(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sWwaP8AAAAASUVORK5CYII=",
      new Date(2026, 2, 25, 8, 9, 10),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(timeoutSpy).toHaveBeenCalled();
    expect(revokeObjectUrl).not.toHaveBeenCalled();
  });

  it("uses the native share sheet when files are supported", async () => {
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    const canShareSpy = vi.fn().mockReturnValue(true);
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: shareSpy,
    });

    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: canShareSpy,
    });

    await downloadArtwork(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sWwaP8AAAAASUVORK5CYII=",
      new Date(2026, 2, 25, 8, 9, 10),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(canShareSpy).toHaveBeenCalledTimes(1);
    expect(shareSpy).toHaveBeenCalledTimes(1);
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it("falls back to the mobile save screen when sharing is unavailable", async () => {
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const location = window.location;
    const assignSpy = vi.fn();

    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Mobile Safari/537.36",
    });

    delete (window as typeof window & { location?: Location }).location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...location,
        assign: assignSpy,
      },
    });

    await downloadArtwork(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sWwaP8AAAAASUVORK5CYII=",
      new Date(2026, 2, 25, 8, 9, 10),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(createObjectUrl).not.toHaveBeenCalled();
    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(assignSpy.mock.calls[0]?.[0]).toContain("/artwork/save?image=data%3Aimage%2Fpng%3Bbase64%2C");
  });
});
