import type { WalletAdapter } from "@solana/wallet-adapter-base";

import { mintNftOnSolana, normalizeMintError } from "@/lib/solana/mintNft";

const { sendSpy, confirmSpy, createUmiSpy } = vi.hoisted(() => ({
  sendSpy: vi.fn(async () => new Uint8Array([1, 2, 3])),
  confirmSpy: vi.fn(async () => ({ value: { err: null } })),
  createUmiSpy: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("@metaplex-foundation/umi-bundle-defaults", () => ({
  createUmi: createUmiSpy,
}));

vi.mock("@metaplex-foundation/mpl-token-metadata", () => ({
  mplTokenMetadata: vi.fn(() => ({ install() {} })),
  createNft: vi.fn(() => ({
    send: sendSpy,
    confirm: confirmSpy,
  })),
}));

vi.mock("@metaplex-foundation/umi", () => ({
  generateSigner: vi.fn(() => ({
    publicKey: "Mint111111111111111111111111111111111111111",
  })),
  percentAmount: vi.fn(() => ({ basisPoints: 0 })),
}));

vi.mock("@metaplex-foundation/umi-signer-wallet-adapters", () => ({
  walletAdapterIdentity: vi.fn(() => ({ install() {} })),
}));

describe("mintNftOnSolana", () => {
  afterEach(() => {
    vi.clearAllMocks();
    sendSpy.mockImplementation(async () => new Uint8Array([1, 2, 3]));
    confirmSpy.mockImplementation(async () => ({ value: { err: null } }));
  });

  it("reports wallet and chain mint statuses", async () => {
    const statuses: string[] = [];
    const result = await mintNftOnSolana({
      walletAdapter: {} as WalletAdapter,
      endpoint: "https://api.devnet.solana.com",
      network: "devnet",
      metadataUri: "ipfs://metadata",
      name: "SolarkBot Creations #C5D9F5A4",
      onStatusChange: (status) => {
        statuses.push(status);
      },
    });

    expect(statuses).toEqual(["awaiting-wallet", "minting"]);
    expect(result.mintAddress).toBe("Mint111111111111111111111111111111111111111");
    expect(result.explorerUrl).toContain("solscan.io/token/Mint111111111111111111111111111111111111111");
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(createUmiSpy).toHaveBeenCalledWith("https://api.devnet.solana.com");
  });

  it("normalizes wallet rejection errors", async () => {
    sendSpy.mockRejectedValueOnce(new Error("User rejected the request."));

    await expect(
      mintNftOnSolana({
        walletAdapter: {} as WalletAdapter,
        endpoint: "https://api.testnet.solana.com",
        network: "testnet",
        metadataUri: "ipfs://metadata",
        name: "SolarkBot Creations #C5D9F5A4",
      }),
    ).rejects.toThrow("Mint cancelled in Phantom.");
  });

  it("normalizes insufficient balance errors", () => {
    expect(
      normalizeMintError(new Error("Attempt to debit an account but found no record of a prior credit."), {
        network: "testnet",
        endpoint: "https://rpc.testnet.example.com",
      }).message,
    ).toContain("Not enough SOL in Phantom to pay testnet fees");
  });

  it("normalizes RPC mismatch errors", () => {
    expect(
      normalizeMintError(new Error("Blockhash not found"), {
        network: "testnet",
        endpoint: "https://rpc.testnet.example.com",
      }).message,
    ).toBe(
      "Unable to reach the configured testnet RPC. Confirm Phantom is on testnet and the RPC endpoint is reachable: https://rpc.testnet.example.com",
    );
  });
});
