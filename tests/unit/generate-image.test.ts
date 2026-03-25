import { mapAspectRatioToResolution } from "@/lib/nvidia/generateImage";

describe("mapAspectRatioToResolution", () => {
  it("returns the supported NVIDIA SD 3.5 resolutions", () => {
    expect(mapAspectRatioToResolution("1:1")).toEqual({ width: 1024, height: 1024 });
    expect(mapAspectRatioToResolution("9:16")).toEqual({ width: 768, height: 1344 });
    expect(mapAspectRatioToResolution("16:9")).toEqual({ width: 1344, height: 768 });
    expect(mapAspectRatioToResolution("3:2")).toEqual({ width: 1216, height: 832 });
  });
});
