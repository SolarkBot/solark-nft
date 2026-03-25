export const ASPECT_RATIO_OPTIONS = ["1:1", "9:16", "16:9", "3:2"] as const;

export type AspectRatio = (typeof ASPECT_RATIO_OPTIONS)[number];

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
