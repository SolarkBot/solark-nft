import { z } from "zod";

const serverEnvSchema = z.object({
  NVIDIA_API_KEY: z.string().min(1, "NVIDIA_API_KEY is required."),
  NVIDIA_IMAGE_MODEL: z.string().min(1).default("stabilityai/stable-diffusion-3.5-large"),
  NVIDIA_API_BASE_URL: z
    .string()
    .url()
    .default("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large"),
});

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  cachedServerEnv = serverEnvSchema.parse(process.env);
  return cachedServerEnv;
}

export function getPublicEnv() {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}
