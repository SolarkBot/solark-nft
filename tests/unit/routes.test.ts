import { POST as generateImageRoute } from "@/app/api/generate-image/route";

vi.mock("@/lib/nvidia/generateImage", () => ({
  generateImageWithNvidia: vi.fn(async () => ({
    buffer: Buffer.from("image-bytes"),
    mimeType: "image/jpeg",
    width: 1024,
    height: 1024,
    providerMeta: {
      model: "stabilityai/stable-diffusion-3-medium",
      endpoint: "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium",
    },
  })),
}));

describe("generate image route", () => {
  beforeEach(() => {
    process.env.NVIDIA_API_KEY = "nvidia";
    process.env.NVIDIA_IMAGE_MODEL = "stabilityai/stable-diffusion-3-medium";
    process.env.NVIDIA_API_BASE_URL =
      "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium";
  });

  it("returns a generation payload", async () => {
    const response = await generateImageRoute(
      new Request("http://localhost/api/generate-image", {
        method: "POST",
        body: JSON.stringify({
          prompt: "A museum-grade portrait of a brass koi under moonlight",
          aspectRatio: "1:1",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.imageUrl).toContain("data:image/jpeg;base64,");
    expect(body.provider).toBe("nvidia-build");
  });
});
