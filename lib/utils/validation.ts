import { z } from "zod";

import { ASPECT_RATIO_OPTIONS } from "@/types";

export const generateImageRequestSchema = z.object({
  prompt: z.string().trim().min(8, "Give the artist a little more direction.").max(600),
  negativePrompt: z.string().trim().max(600).optional(),
  aspectRatio: z.enum(ASPECT_RATIO_OPTIONS).default("1:1"),
});
