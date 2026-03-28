import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import type { WalletAdapter } from "@solana/wallet-adapter-base";

import { buildSolscanTokenUrl, getSolanaNetworkLabel } from "@/lib/solana/config";
import type { MintResult, MintStatus, SolanaNetwork } from "@/types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown wallet error.";
}

export function normalizeMintError(error: unknown, input: { network: SolanaNetwork; endpoint: string }) {
  const rawMessage = getErrorMessage(error);
  const message = rawMessage.toLowerCase();
  const networkLabel = getSolanaNetworkLabel(input.network);

  if (
    message.includes("rejected") ||
    message.includes("declined") ||
    message.includes("cancelled") ||
    message.includes("canceled") ||
    message.includes("user rejected")
  ) {
    return new Error("Mint cancelled in Phantom.");
  }

  if (
    message.includes("insufficient") ||
    message.includes("attempt to debit") ||
    message.includes("0 lamports") ||
    message.includes("fee payer")
  ) {
    return new Error(
      `Not enough SOL in Phantom to pay ${networkLabel} fees. Fund your wallet on ${networkLabel} and try again.`,
    );
  }

  if (
    message.includes("blockhash not found") ||
    message.includes("failed to get latest blockhash") ||
    message.includes("network request failed") ||
    message.includes("fetch failed") ||
    message.includes("rpc") ||
    message.includes("node is unhealthy") ||
    message.includes("cluster")
  ) {
    return new Error(
      `Unable to reach the configured ${networkLabel} RPC. Confirm Phantom is on ${networkLabel} and the RPC endpoint is reachable: ${input.endpoint}`,
    );
  }

  if (rawMessage.trim().length > 0) {
    return new Error(rawMessage);
  }

  return new Error(`Mint failed on ${networkLabel}.`);
}

export async function mintNftOnSolana(input: {
  walletAdapter: WalletAdapter;
  endpoint: string;
  network: SolanaNetwork;
  metadataUri: string;
  name: string;
  onStatusChange?: (status: MintStatus) => void;
}) {
  try {
    const umi = createUmi(input.endpoint);
    umi.use(mplTokenMetadata());
    umi.use(walletAdapterIdentity(input.walletAdapter));

    const mint = generateSigner(umi);
    const builder = createNft(umi, {
      mint,
      name: input.name.slice(0, 32),
      uri: input.metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      symbol: "SLRK",
    });

    input.onStatusChange?.("awaiting-wallet");
    const signature = await builder.send(umi);
    input.onStatusChange?.("minting");
    await builder.confirm(umi, signature);

    return {
      mintAddress: mint.publicKey,
      explorerUrl: buildSolscanTokenUrl(mint.publicKey, input.network),
    } satisfies MintResult;
  } catch (error) {
    throw normalizeMintError(error, {
      network: input.network,
      endpoint: input.endpoint,
    });
  }
}
