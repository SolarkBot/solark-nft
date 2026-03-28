import { getSolanaEndpoint, getSolanaNetworkLabel } from "@/lib/solana/config";

describe("solana config", () => {
  const originalRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

  afterEach(() => {
    if (originalRpcUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    } else {
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL = originalRpcUrl;
    }
  });

  it("prefers the configured public RPC URL when present", () => {
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL = "https://rpc.testnet.example.com";

    expect(getSolanaEndpoint("testnet")).toBe("https://rpc.testnet.example.com");
  });

  it("falls back to the cluster RPC when the public value is invalid", () => {
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL = "not-a-url";

    expect(getSolanaEndpoint("testnet")).toContain("api.testnet.solana.com");
  });

  it("returns a stable public-facing network label", () => {
    expect(getSolanaNetworkLabel("mainnet-beta")).toBe("mainnet");
    expect(getSolanaNetworkLabel("testnet")).toBe("testnet");
  });
});
