import { z } from "zod";

import { ASPECT_RATIO_OPTIONS } from "@/types";

export const generateImageRequestSchema = z.object({
  prompt: z.string().trim().min(8, "Give the artist a little more direction.").max(600),
  negativePrompt: z.string().trim().max(600).optional(),
  aspectRatio: z.enum(ASPECT_RATIO_OPTIONS).default("1:1"),
});

const imageUrlSchema = z.union([
  z.string().startsWith("data:image/", "Generated artwork must be an inline image."),
  z.string().url(),
]);

const prepareMintSharedSchema = z.object({
  artifactId: z.string().min(1),
  imageUrl: imageUrlSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  aspectRatio: z.enum(ASPECT_RATIO_OPTIONS),
  fileName: z.string().trim().max(260).optional(),
});

export const prepareMintRequestSchema = z.discriminatedUnion("sourceType", [
  prepareMintSharedSchema.extend({
    sourceType: z.literal("generated"),
    prompt: z.string().trim().min(8).max(600),
    negativePrompt: z.string().trim().max(600).optional(),
    provider: z.string().trim().min(1).max(200),
    model: z.string().trim().min(1).max(200),
  }),
  prepareMintSharedSchema.extend({
    sourceType: z.literal("uploaded"),
    prompt: z.string().trim().max(600).optional(),
    negativePrompt: z.string().trim().max(600).optional(),
    provider: z.string().trim().max(200).optional(),
    model: z.string().trim().max(200).optional(),
  }),
]);
