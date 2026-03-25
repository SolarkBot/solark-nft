"use client";

import { create } from "zustand";

import type {
  AspectRatio,
  CreationStage,
  GenerationResult,
  PerformanceTier,
  StudioPhase,
  ThemeMode,
} from "@/types";

interface StudioState {
  phase: StudioPhase;
  creationStage: CreationStage;
  performanceTier: PerformanceTier;
  themeMode: ThemeMode;
  reducedMotion: boolean;
  isMobileLayout: boolean;
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  selectedExample: string;
  hoveredNotebook: boolean;
  isGenerating: boolean;
  generation: GenerationResult | null;
  errorMessage: string | null;
  lastPrompt: string;
  setThemeMode: (value: ThemeMode) => void;
  setPrompt: (value: string) => void;
  setNegativePrompt: (value: string) => void;
  setAspectRatio: (value: AspectRatio) => void;
  setSelectedExample: (value: string) => void;
  setHoveredNotebook: (value: boolean) => void;
  configurePerformance: (config: {
    performanceTier: PerformanceTier;
    reducedMotion: boolean;
    isMobileLayout: boolean;
  }) => void;
  togglePrompt: () => void;
  closePrompt: () => void;
  beginCreation: () => void;
  setPhase: (value: StudioPhase) => void;
  setCreationStage: (value: CreationStage) => void;
  setGeneration: (value: GenerationResult | null) => void;
  setErrorMessage: (message: string | null) => void;
  resetToStudio: () => void;
  startAnother: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  phase: "arrival",
  creationStage: "idle",
  performanceTier: "balanced",
  themeMode: "dark",
  reducedMotion: false,
  isMobileLayout: false,
  prompt: "",
  negativePrompt: "",
  aspectRatio: "1:1",
  selectedExample: "A lunar koi painted in brass ink",
  hoveredNotebook: false,
  isGenerating: false,
  generation: null,
  errorMessage: null,
  lastPrompt: "",
  setThemeMode: (themeMode) => set({ themeMode }),
  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setSelectedExample: (selectedExample) => set({ selectedExample }),
  setHoveredNotebook: (hoveredNotebook) => set({ hoveredNotebook }),
  configurePerformance: ({ performanceTier, reducedMotion, isMobileLayout }) =>
    set({ performanceTier, reducedMotion, isMobileLayout }),
  togglePrompt: () =>
    set((state) => {
      if (state.phase === "creating" || state.phase === "reveal") {
        return state;
      }

      return {
        phase: state.phase === "prompting" ? "invitation" : "prompting",
        errorMessage: null,
      };
    }),
  closePrompt: () =>
    set((state) => {
      if (state.phase !== "prompting") {
        return state;
      }

      return {
        phase: "invitation",
        errorMessage: null,
      };
    }),
  beginCreation: () =>
    set((state) => ({
      phase: "creating",
      creationStage: "thinking",
      isGenerating: true,
      generation: null,
      errorMessage: null,
      lastPrompt: state.prompt,
    })),
  setPhase: (phase) => set({ phase }),
  setCreationStage: (creationStage) => set({ creationStage }),
  setGeneration: (generation) =>
    set({
      generation,
      isGenerating: false,
      phase: generation ? "reveal" : "prompting",
    }),
  setErrorMessage: (errorMessage) =>
    set({
      errorMessage,
      isGenerating: false,
    }),
  resetToStudio: () =>
    set((state) => ({
      phase: "invitation",
      creationStage: "idle",
      generation: null,
      errorMessage: null,
      prompt: state.lastPrompt || state.prompt,
      hoveredNotebook: false,
      isGenerating: false,
    })),
  startAnother: () =>
    set({
      phase: "prompting",
      creationStage: "idle",
      generation: null,
      errorMessage: null,
      prompt: "",
      negativePrompt: "",
      hoveredNotebook: false,
      isGenerating: false,
    }),
}));
