"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect } from "react";

import { AnimatePresence } from "framer-motion";

import { CreationStatus } from "@/components/experience/CreationStatus";
import { DialogueCaption } from "@/components/experience/DialogueCaption";
import { PromptNotebook } from "@/components/experience/PromptNotebook";
import { RevealStage } from "@/components/experience/RevealStage";
import { StudioButton } from "@/components/ui/StudioButton";
import { downloadArtwork } from "@/lib/utils/artwork";
import { getStageRail, wait } from "@/lib/utils/experience";
import { detectPerformanceTier } from "@/lib/utils/performance";
import { getSystemThemeMode, observeSystemTheme } from "@/lib/utils/theme";
import { useStudioStore } from "@/store/studio-store";
import type { GenerationResult } from "@/types";

const StudioCanvas = dynamic(
  () => import("@/components/3d/StudioCanvas").then((module) => module.StudioCanvas),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[var(--color-bg)]" />,
  },
);

async function createArtwork(payload: {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
}) {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.detail ?? body.error ?? "The artist could not complete the request.");
  }

  return body as GenerationResult;
}

export function StudioExperience() {
  const {
    phase,
    creationStage,
    performanceTier,
    themeMode,
    reducedMotion,
    isMobileLayout,
    prompt,
    negativePrompt,
    aspectRatio,
    hoveredNotebook,
    generation,
    errorMessage,
    isGenerating,
    configurePerformance,
    setThemeMode,
    togglePrompt,
    closePrompt,
    beginCreation,
    setPhase,
    setCreationStage,
    setGeneration,
    setPrompt,
    setNegativePrompt,
    setAspectRatio,
    setHoveredNotebook,
    setErrorMessage,
    startAnother,
    resetToStudio,
  } = useStudioStore();

  useEffect(() => {
    const configuration = detectPerformanceTier();
    const stopThemeObservation = observeSystemTheme(setThemeMode);

    configurePerformance({
      performanceTier: configuration.tier,
      reducedMotion: configuration.reducedMotion,
      isMobileLayout: configuration.isMobileLayout,
    });

    setThemeMode(getSystemThemeMode());

    const invitationTimer = window.setTimeout(() => {
      setPhase("invitation");
    }, configuration.reducedMotion ? 120 : 900);

    return () => {
      window.clearTimeout(invitationTimer);
      stopThemeObservation();
    };
  }, [configurePerformance, setPhase, setThemeMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
  }, [themeMode]);

  async function handlePromptSubmit() {
    beginCreation();

    try {
      const generationPromise = createArtwork({
        prompt,
        negativePrompt,
        aspectRatio,
      });

      for (const rail of getStageRail(reducedMotion)) {
        setCreationStage(rail.stage);

        if (rail.stage === "finalizing") {
          const [generated] = await Promise.all([generationPromise, wait(rail.durationMs)]);
          setGeneration(generated);
          return;
        }

        await wait(rail.durationMs);
      }
    } catch (error) {
      setCreationStage("idle");
      setErrorMessage(error instanceof Error ? error.message : "Unable to complete the artwork.");
      setPhase("prompting");
    }
  }

  const scenePromptVisible = false;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-ivory)]">
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--color-main-overlay)]" />
      <div className="absolute inset-0 bg-[image:var(--color-sheen-overlay)]" />

      <StudioCanvas
        phase={phase}
        creationStage={creationStage}
        performanceTier={performanceTier}
        themeMode={themeMode}
        reducedMotion={reducedMotion}
        generation={generation}
        showPromptInScene={scenePromptVisible}
        prompt={prompt}
        negativePrompt={negativePrompt}
        aspectRatio={aspectRatio}
        hoveredNotebook={hoveredNotebook}
        onTogglePrompt={togglePrompt}
        onClosePrompt={closePrompt}
        onHoverNotebook={setHoveredNotebook}
        onPromptChange={setPrompt}
        onNegativePromptChange={setNegativePrompt}
        onAspectRatioChange={setAspectRatio}
        onSubmitPrompt={handlePromptSubmit}
        errorMessage={errorMessage}
        isGenerating={isGenerating}
      />

      <div className="pointer-events-none absolute right-5 top-5 z-20 md:right-10 md:top-10">
        <div className="rounded-full border border-[var(--color-brand-chip-border)] bg-[var(--color-brand-chip)] px-4 py-2 backdrop-blur-md">
          <p className="font-body text-[0.72rem] uppercase tracking-[0.32em] text-[var(--color-muted)]">
            nft.solarkbot.xyz
          </p>
        </div>
      </div>

      <DialogueCaption phase={phase} />

      {phase === "creating" ? (
        <CreationStatus stage={creationStage} reducedMotion={reducedMotion} />
      ) : null}

      {(phase === "invitation" || phase === "prompting") && !generation ? (
        <div className="absolute bottom-5 right-5 z-20 md:bottom-10 md:right-10">
          <StudioButton
            type="button"
            variant="secondary"
            onClick={togglePrompt}
            aria-label={phase === "prompting" ? "Close notebook" : "Open notebook"}
            className="min-w-14 px-0 text-xl tracking-normal"
          >
            <span aria-hidden="true">{phase === "prompting" ? "✕" : "📓"}</span>
          </StudioButton>
        </div>
      ) : null}

      {phase === "prompting" && !isMobileLayout ? (
        <div className="absolute bottom-5 left-5 z-30 md:bottom-10 md:left-10">
          <PromptNotebook
            prompt={prompt}
            negativePrompt={negativePrompt}
            aspectRatio={aspectRatio}
            disabled={isGenerating}
            errorMessage={errorMessage}
            onPromptChange={setPrompt}
            onNegativePromptChange={setNegativePrompt}
            onAspectRatioChange={setAspectRatio}
            onClose={closePrompt}
            onSubmit={handlePromptSubmit}
          />
        </div>
      ) : null}

      {phase === "prompting" && isMobileLayout ? (
        <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4">
          <PromptNotebook
            compact
            prompt={prompt}
            negativePrompt={negativePrompt}
            aspectRatio={aspectRatio}
            disabled={isGenerating}
            errorMessage={errorMessage}
            onPromptChange={setPrompt}
            onNegativePromptChange={setNegativePrompt}
            onAspectRatioChange={setAspectRatio}
            onClose={closePrompt}
            onSubmit={handlePromptSubmit}
          />
        </div>
      ) : null}

      <AnimatePresence>
        {generation ? (
          <RevealStage
            generation={generation}
            themeMode={themeMode}
            onDownload={() => {
              void downloadArtwork(generation.imageUrl);
            }}
            onCreateAnother={() => {
              startTransition(() => {
                startAnother();
              });
            }}
            onBackToStudio={() => {
              startTransition(() => {
                resetToStudio();
              });
            }}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
