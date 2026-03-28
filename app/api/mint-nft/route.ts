import { NextResponse } from "next/server";

import { uploadFileToPinata, uploadJsonToPinata } from "@/lib/ipfs/pinata";
import { getMintServerEnv, getPublicEnv } from "@/lib/utils/env";
import { prepareMintRequestSchema } from "@/lib/utils/validation";
import type { MintMetadata, PrepareMintRequest } from "@/types";

export const runtime = "nodejs";

function getImagePayload(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    const [header, payload] = imageUrl.split(",", 2);

    if (!header || payload === undefined) {
      throw new Error("Generated image payload is invalid.");
    }

    const contentType = header.match(/^data:([^;]+)/)?.[1] ?? "image/png";
    const encoding = header.includes(";base64") ? "base64" : "utf8";
    return {
      buffer: Buffer.from(payload, encoding),
      contentType,
    };
  }

  throw new Error("Only inline generated artwork can be minted right now.");
}

function buildMetadata(input: {
  sourceType: PrepareMintRequest["sourceType"];
  artifactId: string;
  prompt?: string;
  aspectRatio: string;
  provider?: string;
  model?: string;
  width: number;
  height: number;
  image: string;
  contentType: string;
  fileName?: string;
}): MintMetadata & Record<string, unknown> {
  const env = getMintServerEnv();
  const { appUrl } = getPublicEnv();
  const createdAt = new Date().toISOString();
  const suffix = input.artifactId.slice(0, 8).toUpperCase();
  const name = `${env.collectionName} #${suffix}`;
  const promptText =
    input.sourceType === "generated"
      ? input.prompt ?? "Created with the SolarkBot Artist"
      : `Uploaded via SolarkBot Atelier${input.fileName ? `: ${input.fileName}` : ""}`;
  const description =
    input.sourceType === "generated"
      ? `A SolarkBot Artist original minted from the prompt: ${promptText}`
      : "A user-uploaded artwork curated and minted through the SolarkBot Atelier.";
  const attributes: MintMetadata["attributes"] = [
    { trait_type: "Source", value: input.sourceType === "generated" ? "Generated" : "Uploaded" },
    { trait_type: "Aspect Ratio", value: input.aspectRatio },
    { trait_type: "Dimensions", value: `${input.width}x${input.height}` },
  ];

  if (input.provider) {
    attributes.push({ trait_type: "Provider", value: input.provider });
  }

  if (input.model) {
    attributes.push({ trait_type: "Model", value: input.model });
  }

  if (input.fileName) {
    attributes.push({ trait_type: "Original File", value: input.fileName });
  }

  return {
    name,
    description,
    image: input.image,
    prompt: promptText,
    createdBy: "SolarkBot Artist",
    createdAt,
    external_url: appUrl,
    attributes,
    properties: {
      category: "image",
      files: [
        {
          uri: input.image,
          type: input.contentType,
        },
      ],
    },
  };
}

export async function POST(request: Request) {
  try {
    const env = getMintServerEnv();
    const json = await request.json();
    const payload = prepareMintRequestSchema.parse(json);
    const { buffer, contentType } = getImagePayload(payload.imageUrl);
    const extension = contentType === "image/jpeg" ? "jpg" : "png";

    const imageUpload = await uploadFileToPinata({
      buffer,
      contentType,
      fileName: `${payload.artifactId}.${extension}`,
    });

    const metadata = buildMetadata({
      sourceType: payload.sourceType,
      artifactId: payload.artifactId,
      prompt: payload.prompt,
      aspectRatio: payload.aspectRatio,
      provider: payload.provider,
      model: payload.model,
      width: payload.width,
      height: payload.height,
      image: imageUpload.ipfsUri,
      contentType,
      fileName: payload.fileName,
    });

    const metadataUpload = await uploadJsonToPinata({
      content: metadata,
      name: `${payload.artifactId}.json`,
    });

    return NextResponse.json({
      imageUri: imageUpload.ipfsUri,
      metadataUri: metadataUpload.ipfsUri,
      gatewayImageUrl: imageUpload.gatewayUrl,
      gatewayMetadataUrl: metadataUpload.gatewayUrl,
      metadata,
      network: env.network,
    });
  } catch (error) {
    if (error instanceof Error) {
      const isValidationError = error.name === "ZodError";
      return NextResponse.json(
        {
          error: isValidationError ? "Invalid mint payload." : "Mint preparation failed.",
          detail: error.message,
        },
        { status: isValidationError ? 422 : 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Mint preparation failed.",
        detail: "Unknown error",
      },
      { status: 500 },
    );
  }
}
