"use client";

import { create } from "zustand";

import type {
  AspectRatio,
  ArtworkSourceType,
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
  creationMode: ArtworkSourceType | null;
  isChoicePopupOpen: boolean;
  isUploadPanelOpen: boolean;
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  selectedExample: string;
  hoveredNotebook: boolean;
  isGenerating: boolean;
  generation: GenerationResult | null;
  uploadedArtworkDraft: GenerationResult | null;
  errorMessage: string | null;
  lastPrompt: string;
  setThemeMode: (value: ThemeMode) => void;
  setPrompt: (value: string) => void;
  setNegativePrompt: (value: string) => void;
  setAspectRatio: (value: AspectRatio) => void;
  setSelectedExample: (value: string) => void;
  setHoveredNotebook: (value: boolean) => void;
  openCreationChoice: () => void;
  closeCreationChoice: () => void;
  chooseGenerationMode: () => void;
  chooseUploadMode: () => void;
  closeUploadPanel: () => void;
  setUploadedArtworkDraft: (value: GenerationResult | null) => void;
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
  startUploadAnother: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  phase: "arrival",
  creationStage: "idle",
  performanceTier: "balanced",
  themeMode: "dark",
  reducedMotion: false,
  isMobileLayout: false,
  creationMode: null,
  isChoicePopupOpen: false,
  isUploadPanelOpen: false,
  prompt: "",
  negativePrompt: "",
  aspectRatio: "1:1",
  selectedExample: "A lunar koi painted in brass ink",
  hoveredNotebook: false,
  isGenerating: false,
  generation: null,
  uploadedArtworkDraft: null,
  errorMessage: null,
  lastPrompt: "",
  setThemeMode: (themeMode) => set({ themeMode }),
  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setSelectedExample: (selectedExample) => set({ selectedExample }),
  setHoveredNotebook: (hoveredNotebook) => set({ hoveredNotebook }),
  openCreationChoice: () =>
    set((state) => {
      if (state.phase === "creating" || state.phase === "reveal") {
        return state;
      }

      return {
        isChoicePopupOpen: true,
        isUploadPanelOpen: false,
        phase: state.phase === "prompting" ? "invitation" : state.phase,
        errorMessage: null,
      };
    }),
  closeCreationChoice: () => set({ isChoicePopupOpen: false, errorMessage: null }),
  chooseGenerationMode: () =>
    set({
      creationMode: "generated",
      phase: "prompting",
      isChoicePopupOpen: false,
      isUploadPanelOpen: false,
      errorMessage: null,
      uploadedArtworkDraft: null,
    }),
  chooseUploadMode: () =>
    set({
      creationMode: "uploaded",
      phase: "invitation",
      isChoicePopupOpen: false,
      isUploadPanelOpen: true,
      errorMessage: null,
      uploadedArtworkDraft: null,
    }),
  closeUploadPanel: () =>
    set({
      isUploadPanelOpen: false,
      errorMessage: null,
    }),
  setUploadedArtworkDraft: (uploadedArtworkDraft) => set({ uploadedArtworkDraft }),
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
      creationMode: "generated",
      isChoicePopupOpen: false,
      isUploadPanelOpen: false,
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
      creationMode: generation?.sourceType ?? null,
      isChoicePopupOpen: false,
      isUploadPanelOpen: false,
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
      creationMode: null,
      isChoicePopupOpen: false,
      isUploadPanelOpen: false,
      generation: null,
      uploadedArtworkDraft: null,
      errorMessage: null,
      prompt: state.lastPrompt || state.prompt,
      hoveredNotebook: false,
      isGenerating: false,
    })),
  startAnother: () =>
    set({
      phase: "prompting",
      creationStage: "idle",
      creationMode: "generated",
      isChoicePopupOpen: false,
      isUploadPanelOpen: false,
      generation: null,
      uploadedArtworkDraft: null,
      errorMessage: null,
      prompt: "",
      negativePrompt: "",
      hoveredNotebook: false,
      isGenerating: false,
    }),
  startUploadAnother: () =>
    set({
      phase: "invitation",
      creationMode: "uploaded",
      creationStage: "idle",
      isChoicePopupOpen: false,
      isUploadPanelOpen: true,
      generation: null,
      uploadedArtworkDraft: null,
      errorMessage: null,
      hoveredNotebook: false,
      isGenerating: false,
    }),
}));
