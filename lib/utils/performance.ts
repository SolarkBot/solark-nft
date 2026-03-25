import type { PerformanceTier } from "@/types";

export function detectPerformanceTier(): {
  tier: PerformanceTier;
  reducedMotion: boolean;
  isMobileLayout: boolean;
} {
  if (typeof window === "undefined") {
    return {
      tier: "balanced",
      reducedMotion: false,
      isMobileLayout: false,
    };
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isMobileLayout = window.matchMedia("(max-width: 900px)").matches;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 6;
  const shortViewport = window.innerHeight < 820 || window.innerWidth < 1100;

  if (
    reducedMotion ||
    coarsePointer ||
    isMobileLayout ||
    deviceMemory <= 4 ||
    hardwareConcurrency <= 4 ||
    shortViewport
  ) {
    return {
      tier:
        reducedMotion || deviceMemory <= 2 || hardwareConcurrency <= 2 ? "low" : "balanced",
      reducedMotion,
      isMobileLayout,
    };
  }

  return {
    tier: "high",
    reducedMotion,
    isMobileLayout,
  };
}
