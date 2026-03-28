import { z } from "zod";

import { SOLANA_NETWORK_OPTIONS } from "@/types";

const serverEnvSchema = z.object({
  NVIDIA_API_KEY: z.string().min(1, "NVIDIA_API_KEY is required."),
  NVIDIA_IMAGE_MODEL: z.string().min(1).default("stabilityai/stable-diffusion-3.5-large"),
  NVIDIA_API_BASE_URL: z
    .string()
    .url()
    .default("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large"),
});

const mintServerEnvSchema = z.object({
  PINATA_JWT: z.string().min(1, "PINATA_JWT is required."),
  PINATA_GATEWAY_URL: z
    .string()
    .min(1)
    .default("https://gateway.pinata.cloud"),
  SOLANA_RPC_URL: z.string().url().default("https://api.devnet.solana.com"),
  SOLANA_NETWORK: z.enum(SOLANA_NETWORK_OPTIONS).default("devnet"),
  NFT_COLLECTION_NAME: z.string().min(1).default("SolarkBot Creations"),
});

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;
let cachedMintServerEnv: {
  pinataJwt: string;
  pinataGatewayUrl: string;
  rpcUrl: string;
  network: (typeof SOLANA_NETWORK_OPTIONS)[number];
  collectionName: string;
} | null = null;

export function getServerEnv() {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  cachedServerEnv = serverEnvSchema.parse(process.env);
  return cachedServerEnv;
}

export function getMintServerEnv() {
  if (cachedMintServerEnv) {
    return cachedMintServerEnv;
  }

  const parsed = mintServerEnvSchema.parse(process.env);
  cachedMintServerEnv = {
    pinataJwt: parsed.PINATA_JWT,
    pinataGatewayUrl: parsed.PINATA_GATEWAY_URL,
    rpcUrl: parsed.SOLANA_RPC_URL,
    network: parsed.SOLANA_NETWORK,
    collectionName: parsed.NFT_COLLECTION_NAME,
  };

  return cachedMintServerEnv;
}

export function getPublicEnv() {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    solanaRpcUrl:
      typeof process.env.NEXT_PUBLIC_SOLANA_RPC_URL === "string" &&
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL.length > 0
        ? process.env.NEXT_PUBLIC_SOLANA_RPC_URL
        : undefined,
    solanaNetwork:
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
        ? "mainnet-beta"
        : process.env.NEXT_PUBLIC_SOLANA_NETWORK === "testnet"
          ? "testnet"
          : "devnet",
  };
}
