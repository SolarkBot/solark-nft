import { POST as generateImageRoute } from "@/app/api/generate-image/route";
import { POST as mintNftRoute } from "@/app/api/mint-nft/route";

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

vi.mock("@/lib/ipfs/pinata", () => ({
  uploadFileToPinata: vi.fn(async () => ({
    cid: "bafyimagecid",
    ipfsUri: "ipfs://bafyimagecid",
    gatewayUrl: "https://gateway.pinata.cloud/ipfs/bafyimagecid",
  })),
  uploadJsonToPinata: vi.fn(async () => ({
    cid: "bafymetadatacid",
    ipfsUri: "ipfs://bafymetadatacid",
    gatewayUrl: "https://gateway.pinata.cloud/ipfs/bafymetadatacid",
  })),
}));

describe("generate image route", () => {
  beforeEach(() => {
    process.env.NVIDIA_API_KEY = "nvidia";
    process.env.NVIDIA_IMAGE_MODEL = "stabilityai/stable-diffusion-3-medium";
    process.env.NVIDIA_API_BASE_URL =
      "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium";
    process.env.PINATA_JWT = "pinata";
    process.env.PINATA_GATEWAY_URL = "https://gateway.pinata.cloud";
    process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
    process.env.SOLANA_NETWORK = "devnet";
    process.env.NFT_COLLECTION_NAME = "SolarkBot Creations";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_SOLANA_NETWORK = "devnet";
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

  it("returns a mint preparation payload", async () => {
    const response = await mintNftRoute(
      new Request("http://localhost/api/mint-nft", {
        method: "POST",
        body: JSON.stringify({
          artifactId: "c5d9f5a4-5f79-4811-82d8-f5a2f1d2111b",
          sourceType: "generated",
          imageUrl: "data:image/png;base64,aGVsbG8=",
          width: 1024,
          height: 1024,
          prompt: "A museum-grade portrait of a brass koi under moonlight",
          aspectRatio: "1:1",
          provider: "nvidia-build",
          model: "stabilityai/stable-diffusion-3-medium",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.imageUri).toBe("ipfs://bafyimagecid");
    expect(body.metadataUri).toBe("ipfs://bafymetadatacid");
    expect(body.metadata.createdBy).toBe("SolarkBot Artist");
    expect(body.network).toBe("devnet");
  });

  it("returns a mint preparation payload for uploaded artwork", async () => {
    const response = await mintNftRoute(
      new Request("http://localhost/api/mint-nft", {
        method: "POST",
        body: JSON.stringify({
          artifactId: "upload-81d9f5a4",
          sourceType: "uploaded",
          imageUrl: "data:image/webp;base64,aGVsbG8=",
          width: 1200,
          height: 900,
          aspectRatio: "16:9",
          fileName: "atelier-piece.webp",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.metadata.description).toContain("user-uploaded artwork");
    expect(body.metadata.prompt).toContain("Uploaded via SolarkBot Atelier");
    expect(body.metadata.attributes.some((item: { trait_type: string; value: string }) => item.trait_type === "Source" && item.value === "Uploaded")).toBe(true);
  });
});
