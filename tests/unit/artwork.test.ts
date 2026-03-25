import { buildDownloadFilename } from "@/lib/utils/artwork";

describe("buildDownloadFilename", () => {
  it("formats the SolarkBot filename", () => {
    expect(buildDownloadFilename(new Date(2026, 2, 25, 8, 9, 10))).toBe(
      "solarkbot-art-20260325-080910.png",
    );
  });
});
