import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

import type { SolanaNetwork } from "@/types";

export function getPublicSolanaNetwork(): SolanaNetwork {
  if (process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta") {
    return "mainnet-beta";
  }

  if (process.env.NEXT_PUBLIC_SOLANA_NETWORK === "testnet") {
    return "testnet";
  }

  return "devnet";
}

export function getSolanaEndpoint(network: SolanaNetwork) {
  if (network === "mainnet-beta") {
    return clusterApiUrl("mainnet-beta");
  }

  if (network === "testnet") {
    return clusterApiUrl("testnet");
  }

  return clusterApiUrl("devnet");
}

export function toWalletAdapterNetwork(network: SolanaNetwork) {
  if (network === "mainnet-beta") {
    return WalletAdapterNetwork.Mainnet;
  }

  if (network === "testnet") {
    return WalletAdapterNetwork.Testnet;
  }

  return WalletAdapterNetwork.Devnet;
}

export function buildSolscanTokenUrl(address: string, network: SolanaNetwork) {
  if (network === "devnet") {
    return `https://solscan.io/token/${address}?cluster=devnet`;
  }

  if (network === "testnet") {
    return `https://solscan.io/token/${address}?cluster=testnet`;
  }

  return `https://solscan.io/token/${address}`;
}
