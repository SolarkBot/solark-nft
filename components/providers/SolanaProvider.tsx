"use client";

import type { ReactNode } from "react";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";

import { getPublicSolanaNetwork, getSolanaEndpoint } from "@/lib/solana/config";

const network = getPublicSolanaNetwork();
const endpoint = getSolanaEndpoint(network);
const wallets = [new PhantomWalletAdapter()];

export function SolanaProvider({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>{children}</WalletProvider>
    </ConnectionProvider>
  );
}
