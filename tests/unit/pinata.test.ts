import { uploadFileToPinata, uploadJsonToPinata } from "@/lib/ipfs/pinata";

describe("pinata uploads", () => {
  beforeEach(() => {
    process.env.PINATA_JWT = "pinata";
    process.env.PINATA_GATEWAY_URL = "https://gateway.pinata.cloud";
    process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
    process.env.SOLANA_NETWORK = "devnet";
    process.env.NFT_COLLECTION_NAME = "SolarkBot Creations";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes file uploads into IPFS URIs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          IpfsHash: "bafyfilecid",
          PinSize: 128,
          Timestamp: "2026-03-26T00:00:00.000Z",
        }),
        { status: 200 },
      ),
    );

    const result = await uploadFileToPinata({
      buffer: Buffer.from("hello"),
      fileName: "art.png",
      contentType: "image/png",
    });

    expect(result.ipfsUri).toBe("ipfs://bafyfilecid");
    expect(result.gatewayUrl).toBe("https://gateway.pinata.cloud/ipfs/bafyfilecid");
  });

  it("surfaces Pinata scope errors clearly", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            reason: "NO_SCOPES_FOUND",
            details: "This key does not have the required scopes associated with it",
          },
        }),
        { status: 403 },
      ),
    );

    await expect(
      uploadJsonToPinata({
        content: { hello: "world" },
        name: "metadata.json",
      }),
    ).rejects.toThrow(/NO_SCOPES_FOUND|required scopes/i);
  });
});
