"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useState } from "react";

import { AnimatePresence } from "framer-motion";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";
import { useWallet } from "@solana/wallet-adapter-react";

import { CreationStatus } from "@/components/experience/CreationStatus";
import { DialogueCaption } from "@/components/experience/DialogueCaption";
import { PromptNotebook } from "@/components/experience/PromptNotebook";
import { RevealStage } from "@/components/experience/RevealStage";
import { getPublicSolanaNetwork, getSolanaEndpoint } from "@/lib/solana/config";
import { mintNftOnSolana } from "@/lib/solana/mintNft";
import {
  hasPhantomProvider,
  isMobileBrowser,
  openPhantomInAppBrowser,
  shouldUsePhantomHandoff,
} from "@/lib/solana/phantom";
import { StudioButton } from "@/components/ui/StudioButton";
import { downloadArtwork } from "@/lib/utils/artwork";
import { getStageRail, wait } from "@/lib/utils/experience";
import { detectPerformanceTier } from "@/lib/utils/performance";
import { getSystemThemeMode, observeSystemTheme } from "@/lib/utils/theme";
import { useStudioStore } from "@/store/studio-store";
import type { GenerationResult, MintPreparation, MintResult, MintStatus } from "@/types";

const StudioCanvas = dynamic(
  () => import("@/components/3d/StudioCanvas").then((module) => module.StudioCanvas),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[var(--color-bg)]" />,
  },
);

function NotebookIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4.75h8.5A2.75 2.75 0 0 1 19.25 7.5v11.75H8.75A2.75 2.75 0 0 0 6 22V7.5A2.75 2.75 0 0 1 8.75 4.75Z" />
      <path d="M8 4.75H6.75A2.75 2.75 0 0 0 4 7.5v10A2.5 2.5 0 0 0 6.5 20H19.25" />
      <path d="M10.5 9.25h5.5" />
      <path d="M10.5 12.5h5.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

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

async function prepareMint(payload: GenerationResult) {
  const response = await fetch("/api/mint-nft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.detail ?? body.error ?? "Unable to prepare this artwork for minting.");
  }

  return body as MintPreparation;
}

function buildMintResumeUrl(preparation: MintPreparation) {
  if (typeof window === "undefined") {
    return "/";
  }

  const url = new URL("/mint/continue", window.location.origin);
  url.searchParams.set("metadataUri", preparation.metadataUri);
  url.searchParams.set("image", preparation.gatewayImageUrl);
  url.searchParams.set("name", preparation.metadata.name);
  url.searchParams.set("network", preparation.network);
  return url.toString();
}

export function StudioExperience() {
  const { connected, wallet, connect, select, connecting } = useWallet();
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
  const [mintStatus, setMintStatus] = useState<MintStatus>("idle");
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const solanaNetwork = getPublicSolanaNetwork();
  const solanaEndpoint = getSolanaEndpoint(solanaNetwork);
  const mobileBrowser = isMobileBrowser();
  const needsPhantomHandoff = shouldUsePhantomHandoff();

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

  useEffect(() => {
    if (!wallet) {
      select(PhantomWalletName);
    }
  }, [select, wallet]);

  async function handlePromptSubmit() {
    setMintStatus("idle");
    setMintError(null);
    setMintResult(null);
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

  async function handleMint() {
    if (!generation) {
      return;
    }

    setMintError(null);

    if (needsPhantomHandoff) {
      try {
        setMintStatus("preparing");
        setMintStatus("uploading");
        const preparation = await prepareMint(generation);
        openPhantomInAppBrowser(buildMintResumeUrl(preparation), window.location.origin);
      } catch (error) {
        setMintStatus("error");
        setMintError(
          error instanceof Error ? error.message : "Unable to prepare this artwork for Phantom.",
        );
      }
      return;
    }

    if (!connected || !wallet?.adapter) {
      setMintStatus("wallet-required");
      setMintError(
        hasPhantomProvider()
          ? "Connect Phantom to continue on devnet."
          : "Phantom was not detected. Install the Phantom extension or use the Phantom mobile app.",
      );
      return;
    }

    try {
      setMintStatus("preparing");
      setMintStatus("uploading");
      const preparation = await prepareMint(generation);

      const minted = await mintNftOnSolana({
        walletAdapter: wallet.adapter,
        endpoint: solanaEndpoint,
        network: preparation.network ?? solanaNetwork,
        metadataUri: preparation.metadataUri,
        name: preparation.metadata.name,
        onStatusChange: setMintStatus,
      });

      setMintResult(minted);
      setMintStatus("minted");
    } catch (error) {
      setMintStatus("error");
      setMintError(error instanceof Error ? error.message : "Unable to mint this artwork.");
    }
  }

  async function handleConnectWallet() {
    setMintError(null);

    if (needsPhantomHandoff) {
      if (!generation) {
        return;
      }

      try {
        setMintStatus("preparing");
        setMintStatus("uploading");
        const preparation = await prepareMint(generation);
        openPhantomInAppBrowser(buildMintResumeUrl(preparation), window.location.origin);
      } catch (error) {
        setMintStatus("error");
        setMintError(
          error instanceof Error ? error.message : "Unable to prepare this artwork for Phantom.",
        );
      }
      return;
    }

    if (!hasPhantomProvider()) {
      setMintStatus("wallet-required");
      setMintError("Phantom was not detected. Install the Phantom extension or use the Phantom mobile app.");
      window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
      return;
    }

    try {
      setMintStatus("wallet-required");
      await connect();
      setMintStatus("idle");
      setMintError(null);
    } catch (error) {
      setMintStatus("wallet-required");
      setMintError(error instanceof Error ? error.message : "Unable to connect to Phantom.");
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
        <div
          className="absolute right-4 z-20 md:right-10 md:bottom-10"
          style={{ bottom: "max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))" }}
        >
          <StudioButton
            type="button"
            variant="secondary"
            onClick={togglePrompt}
            aria-label={phase === "prompting" ? "Close notebook" : "Open notebook"}
            className="min-h-14 min-w-14 px-0 text-[var(--color-ivory)] shadow-[0_16px_36px_rgba(0,0,0,0.18)] md:min-h-11 md:min-w-11"
          >
            {phase === "prompting" ? <CloseIcon /> : <NotebookIcon />}
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
            network={solanaNetwork}
            mintStatus={mintStatus}
            mintError={mintError}
            mintResult={mintResult}
            walletConnected={connected}
            walletConnecting={connecting}
            walletActionLabel={
              needsPhantomHandoff
                ? "Open in Phantom"
                : connected
                  ? "Mint as NFT"
                  : "Connect Phantom"
            }
            walletHelpText={
              needsPhantomHandoff
                ? `Open Phantom to continue your ${solanaNetwork === "mainnet-beta" ? "mainnet" : solanaNetwork} mint there.`
                : connected
                  ? `Mint your artwork on Solana ${solanaNetwork === "mainnet-beta" ? "mainnet" : solanaNetwork}.`
                  : mobileBrowser
                    ? "Connect Phantom or continue in the Phantom app."
                    : `Connect Phantom to mint this artwork on ${solanaNetwork === "mainnet-beta" ? "mainnet" : solanaNetwork}.`
            }
            onDownload={() => {
              void downloadArtwork(generation.imageUrl);
            }}
            onMint={() => {
              void handleMint();
            }}
            onConnectWallet={() => {
              void handleConnectWallet();
            }}
            onCreateAnother={() => {
              setMintStatus("idle");
              setMintError(null);
              setMintResult(null);
              startTransition(() => {
                startAnother();
              });
            }}
            onBackToStudio={() => {
              setMintStatus("idle");
              setMintError(null);
              setMintResult(null);
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
