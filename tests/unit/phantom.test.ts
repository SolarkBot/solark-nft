import {
  buildPhantomBrowseUrl,
  hasPhantomProvider,
  shouldUsePhantomHandoff,
} from "@/lib/solana/phantom";

describe("phantom helpers", () => {
  afterEach(() => {
    delete window.phantom;
    delete window.solana;
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0 Safari/537.36",
    });
  });

  it("builds the Phantom browse handoff URL", () => {
    expect(
      buildPhantomBrowseUrl("https://nft.solarkbot.xyz/mint/continue?foo=bar", "https://nft.solarkbot.xyz"),
    ).toContain("https://phantom.app/ul/browse/");
  });

  it("detects a Phantom provider", () => {
    window.phantom = {
      solana: {
        isPhantom: true,
      },
    };

    expect(hasPhantomProvider()).toBe(true);
    expect(shouldUsePhantomHandoff()).toBe(false);
  });

  it("uses handoff in mobile browsers without Phantom injection", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Mobile Safari/537.36",
    });

    expect(shouldUsePhantomHandoff()).toBe(true);
  });
});
