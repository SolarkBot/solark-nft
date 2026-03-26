import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import type { WalletAdapter } from "@solana/wallet-adapter-base";

import { buildSolscanTokenUrl } from "@/lib/solana/config";
import type { MintResult, MintStatus, SolanaNetwork } from "@/types";

export async function mintNftOnSolana(input: {
  walletAdapter: WalletAdapter;
  endpoint: string;
  network: SolanaNetwork;
  metadataUri: string;
  name: string;
  onStatusChange?: (status: MintStatus) => void;
}) {
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
}
