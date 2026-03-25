import { getServerEnv } from "@/lib/utils/env";
import type { AspectRatio, GenerateImageInput, NvidiaGenerationOutput } from "@/types";

const SUPPORTED_RESOLUTIONS: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "9:16": { width: 768, height: 1344 },
  "16:9": { width: 1344, height: 768 },
  "3:2": { width: 1216, height: 832 },
};

export function mapAspectRatioToResolution(aspectRatio: AspectRatio) {
  return SUPPORTED_RESOLUTIONS[aspectRatio];
}

function decodeImageResponse(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const typed = payload as {
    image?: string;
    b64_json?: string;
    data?: Array<{ b64_json?: string }>;
    artifacts?: Array<{ base64?: string }>;
  };

  return (
    typed.image ??
    typed.b64_json ??
    typed.data?.[0]?.b64_json ??
    typed.artifacts?.[0]?.base64 ??
    null
  );
}

async function invokeNvidia(payload: Record<string, unknown>, signal: AbortSignal) {
  const env = getServerEnv();

  // NVIDIA's hosted Build/API docs currently show this hosted pattern:
  // POST https://ai.api.nvidia.com/v1/genai/<publisher>/<model>
  // If NVIDIA updates the path or request schema, adjust this provider file only.
  const response = await fetch(env.NVIDIA_API_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text();
    if (
      response.status === 404 &&
      env.NVIDIA_API_BASE_URL.includes("ai.api.nvidia.com") &&
      env.NVIDIA_IMAGE_MODEL.includes("stable-diffusion-3.5-large")
    ) {
      throw new Error(
        "NVIDIA hosted visual-model routes currently do not expose stable-diffusion-3.5-large at this URL. Use the hosted stable-diffusion-3-medium route for Build API keys, or point NVIDIA_API_BASE_URL at a self-hosted Visual GenAI NIM 3.5 Large endpoint.",
      );
    }

    throw new Error(`NVIDIA image generation failed (${response.status}): ${detail}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.startsWith("image/")) {
    const arrayBuffer = await response.arrayBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType: contentType,
    };
  }

  const body = await response.json();
  const imageBase64 = decodeImageResponse(body);

  if (!imageBase64) {
    throw new Error("NVIDIA response did not include image bytes in an expected field.");
  }

  return {
    buffer: Buffer.from(imageBase64, "base64"),
    mimeType: "image/jpeg",
  };
}

export async function generateImageWithNvidia(
  input: GenerateImageInput,
): Promise<NvidiaGenerationOutput> {
  const env = getServerEnv();
  const aspectRatio = input.aspectRatio ?? "1:1";
  const resolution = mapAspectRatioToResolution(aspectRatio);
  const payload = {
    prompt: input.prompt,
    negative_prompt: input.negativePrompt || undefined,
    aspect_ratio: aspectRatio,
    cfg_scale: 5,
    mode: "text-to-image",
    model: "sd3",
    output_format: "jpeg",
    seed: 0,
    steps: 50,
  };

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const output = await invokeNvidia(payload, controller.signal);
      clearTimeout(timeout);

      return {
        ...output,
        width: resolution.width,
        height: resolution.height,
        providerMeta: {
          model: env.NVIDIA_IMAGE_MODEL,
          endpoint: env.NVIDIA_API_BASE_URL,
        },
      };
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1_000));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("NVIDIA image generation failed after retry.");
}
