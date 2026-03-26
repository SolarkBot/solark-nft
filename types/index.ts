export const ASPECT_RATIO_OPTIONS = ["1:1", "9:16", "16:9", "3:2"] as const;
export const SOLANA_NETWORK_OPTIONS = ["devnet", "testnet", "mainnet-beta"] as const;

export type AspectRatio = (typeof ASPECT_RATIO_OPTIONS)[number];
export type SolanaNetwork = (typeof SOLANA_NETWORK_OPTIONS)[number];

export type StudioPhase =
  | "arrival"
  | "invitation"
  | "prompting"
  | "creating"
  | "reveal";

export type CreationStage =
  | "idle"
  | "thinking"
  | "sketching"
  | "adding-color"
  | "finalizing";

export type PerformanceTier = "high" | "balanced" | "low";

export type ThemeMode = "light" | "dark";

export type MintStatus =
  | "idle"
  | "wallet-required"
  | "preparing"
  | "uploading"
  | "awaiting-wallet"
  | "minting"
  | "minted"
  | "error";

export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: AspectRatio;
}

export interface GenerationResult {
  artifactId: string;
  imageUrl: string;
  width: number;
  height: number;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  provider: string;
  model: string;
}

export interface PrepareMintRequest {
  artifactId: string;
  imageUrl: string;
  width: number;
  height: number;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  provider: string;
  model: string;
}

export interface MintMetadata {
  name: string;
  description: string;
  image: string;
  prompt: string;
  createdBy: "SolarkBot Artist";
  createdAt: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface MintPreparation {
  imageUri: string;
  metadataUri: string;
  gatewayImageUrl: string;
  gatewayMetadataUrl: string;
  metadata: MintMetadata;
  network: SolanaNetwork;
}

export interface MintResult {
  mintAddress: string;
  explorerUrl: string;
  signature?: string;
}

export interface StageRailItem {
  stage: CreationStage;
  label: string;
  description: string;
  durationMs: number;
}

export interface NvidiaGenerationOutput {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  providerMeta: {
    model: string;
    endpoint: string;
  };
}
