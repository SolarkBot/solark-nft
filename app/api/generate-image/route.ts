import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { generateImageWithNvidia } from "@/lib/nvidia/generateImage";
import { getServerEnv } from "@/lib/utils/env";
import { generateImageRequestSchema } from "@/lib/utils/validation";

export async function POST(request: Request) {
  try {
    getServerEnv();
    const json = await request.json();
    const payload = generateImageRequestSchema.parse(json);
    const generated = await generateImageWithNvidia(payload);
    const imageUrl = `data:${generated.mimeType};base64,${generated.buffer.toString("base64")}`;

    return NextResponse.json({
      artifactId: crypto.randomUUID(),
      imageUrl,
      width: generated.width,
      height: generated.height,
      prompt: payload.prompt,
      negativePrompt: payload.negativePrompt,
      aspectRatio: payload.aspectRatio,
      provider: "nvidia-build",
      model: generated.providerMeta.model,
    });
  } catch (error) {
    if (error instanceof Error) {
      const isValidationError = error.name === "ZodError";
      return NextResponse.json(
        {
          error: isValidationError ? "Invalid request payload." : "Image generation failed.",
          detail: error.message,
        },
        { status: isValidationError ? 422 : 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Image generation failed.",
        detail: "Unknown error",
      },
      { status: 500 },
    );
  }
}
