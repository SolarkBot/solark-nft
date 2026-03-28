"use client";

import type { AspectRatio, GenerationResult } from "@/types";

export const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const UPLOAD_ACCEPT = ".png,.jpg,.jpeg,.webp";

const ASPECT_RATIO_TARGETS: Record<AspectRatio, number> = {
  "1:1": 1,
  "9:16": 9 / 16,
  "16:9": 16 / 9,
  "3:2": 3 / 2,
};

export function validateUploadFile(file: File) {
  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number])) {
    return "That file doesn’t look right. Try PNG, JPG, or WEBP.";
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    return "This image is too large. Try a smaller one.";
  }

  return null;
}

export function inferAspectRatio(width: number, height: number): AspectRatio {
  const ratio = width / height;
  const closest = Object.entries(ASPECT_RATIO_TARGETS).reduce(
    (best, [label, target]) => {
      const distance = Math.abs(ratio - target);
      return distance < best.distance
        ? { label: label as AspectRatio, distance }
        : best;
    },
    { label: "1:1" as AspectRatio, distance: Number.POSITIVE_INFINITY },
  );

  return closest.label;
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("We couldn’t load that image."));
    };

    reader.onerror = () => reject(new Error("We couldn’t load that image."));
    reader.readAsDataURL(file);
  });
}

function measureImage(dataUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };

    image.onerror = () => reject(new Error("We couldn’t prepare your piece right now."));
    image.src = dataUrl;
  });
}

function buildArtifactId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `upload-${Date.now()}`;
}

export async function buildUploadedArtwork(file: File): Promise<GenerationResult> {
  const validationError = validateUploadFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const imageUrl = await readAsDataUrl(file);
  const { width, height } = await measureImage(imageUrl);

  return {
    artifactId: buildArtifactId(),
    sourceType: "uploaded",
    imageUrl,
    width,
    height,
    aspectRatio: inferAspectRatio(width, height),
    fileName: file.name,
  };
}
