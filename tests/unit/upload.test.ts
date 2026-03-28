import { inferAspectRatio, validateUploadFile } from "@/lib/utils/upload";

describe("upload helpers", () => {
  it("accepts supported image types within the size limit", () => {
    const file = new File(["image"], "piece.png", { type: "image/png" });

    expect(validateUploadFile(file)).toBeNull();
  });

  it("rejects unsupported file types", () => {
    const file = new File(["text"], "notes.txt", { type: "text/plain" });

    expect(validateUploadFile(file)).toBe("That file doesn’t look right. Try PNG, JPG, or WEBP.");
  });

  it("rejects oversized images", () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.png", {
      type: "image/png",
    });

    expect(validateUploadFile(file)).toBe("This image is too large. Try a smaller one.");
  });

  it("maps dimensions to the nearest supported aspect ratio", () => {
    expect(inferAspectRatio(1200, 1200)).toBe("1:1");
    expect(inferAspectRatio(900, 1600)).toBe("9:16");
    expect(inferAspectRatio(1600, 900)).toBe("16:9");
  });
});
