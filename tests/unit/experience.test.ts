import { getStageRail } from "@/lib/utils/experience";

describe("getStageRail", () => {
  it("keeps the full cinematic pace by default", () => {
    const stages = getStageRail(false);

    expect(stages.map((item) => item.stage)).toEqual([
      "thinking",
      "sketching",
      "adding-color",
      "finalizing",
    ]);
    expect(stages.reduce((total, item) => total + item.durationMs, 0)).toBe(6000);
  });

  it("shortens the rail for reduced motion", () => {
    const stages = getStageRail(true);
    expect(stages.every((item) => item.durationMs < 600)).toBe(true);
  });
});
