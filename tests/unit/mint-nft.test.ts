import type { WalletAdapter } from "@solana/wallet-adapter-base";

import { mintNftOnSolana } from "@/lib/solana/mintNft";

const sendSpy = vi.fn(async () => new Uint8Array([1, 2, 3]));
const confirmSpy = vi.fn(async () => ({ value: { err: null } }));

vi.mock("@metaplex-foundation/umi-bundle-defaults", () => ({
  createUmi: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
  })),
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
  });
});
