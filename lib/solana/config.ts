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

function isValidUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function getSolanaNetworkLabel(network: SolanaNetwork) {
  return network === "mainnet-beta" ? "mainnet" : network;
}

export function getSolanaEndpoint(network: SolanaNetwork): string {
  const configuredRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

  if (configuredRpcUrl && isValidUrl(configuredRpcUrl)) {
    return configuredRpcUrl;
  }

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
