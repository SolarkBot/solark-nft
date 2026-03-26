import { MintContinueScreen } from "@/components/experience/MintContinueScreen";
import type { SolanaNetwork } from "@/types";

function pickValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseNetwork(value: string): SolanaNetwork {
  if (value === "mainnet-beta") {
    return "mainnet-beta";
  }

  if (value === "testnet") {
    return "testnet";
  }

  return "devnet";
}

export default async function MintContinuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;

  return (
    <MintContinueScreen
      imageUrl={pickValue(resolved.image)}
      metadataUri={pickValue(resolved.metadataUri)}
      name={pickValue(resolved.name)}
      network={parseNetwork(pickValue(resolved.network))}
    />
  );
}
