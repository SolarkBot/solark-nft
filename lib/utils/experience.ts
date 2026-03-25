import type { StageRailItem } from "@/types";

export function getStageRail(reducedMotion: boolean): StageRailItem[] {
  if (reducedMotion) {
    return [
      {
        stage: "thinking",
        label: "Thinking",
        description: "The artist studies the page before the first mark lands.",
        durationMs: 400,
      },
      {
        stage: "sketching",
        label: "Sketching",
        description: "Structure settles in with clean graphite lines.",
        durationMs: 450,
      },
      {
        stage: "adding-color",
        label: "Adding color",
        description: "Tone and atmosphere wash across the canvas.",
        durationMs: 500,
      },
      {
        stage: "finalizing",
        label: "Finalizing",
        description: "Edges sharpen and the reveal readies itself.",
        durationMs: 400,
      },
    ];
  }

  return [
    {
      stage: "thinking",
      label: "Thinking",
      description: "The artist studies the page before the first mark lands.",
      durationMs: 1200,
    },
    {
      stage: "sketching",
      label: "Sketching",
      description: "Structure settles in with clean graphite lines.",
      durationMs: 1700,
    },
    {
      stage: "adding-color",
      label: "Adding color",
      description: "Tone and atmosphere wash across the canvas.",
      durationMs: 1700,
    },
    {
      stage: "finalizing",
      label: "Finalizing",
      description: "Edges sharpen and the reveal readies itself.",
      durationMs: 1400,
    },
  ];
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
