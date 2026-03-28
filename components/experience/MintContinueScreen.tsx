"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PhantomWalletName } from "@solana/wallet-adapter-phantom";
import { useWallet } from "@solana/wallet-adapter-react";

import { StudioButton } from "@/components/ui/StudioButton";
import { getSolanaEndpoint, getSolanaNetworkLabel } from "@/lib/solana/config";
import { mintNftOnSolana } from "@/lib/solana/mintNft";
import { hasPhantomProvider, openPhantomInAppBrowser, shouldUsePhantomHandoff } from "@/lib/solana/phantom";
import { useStudioStore } from "@/store/studio-store";
import type { ArtworkSourceType, MintResult, MintStatus, SolanaNetwork } from "@/types";

interface MintContinueScreenProps {
  imageUrl: string;
  metadataUri: string;
  name: string;
  network: SolanaNetwork;
  sourceType: ArtworkSourceType;
}

export function MintContinueScreen({
  imageUrl,
  metadataUri,
  name,
  network,
  sourceType,
}: MintContinueScreenProps) {
  const { wallet, connected, connect, select } = useWallet();
  const router = useRouter();
  const [mintStatus, setMintStatus] = useState<MintStatus>("idle");
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const endpoint = getSolanaEndpoint(network);
  const canResumeMint = Boolean(metadataUri && name);
  const requiresPhantomHandoff = shouldUsePhantomHandoff();
  const networkLabel = getSolanaNetworkLabel(network);

  useEffect(() => {
    if (!wallet) {
      select(PhantomWalletName);
    }
  }, [select, wallet]);

  function handleStartAgain() {
    if (sourceType === "uploaded") {
      useStudioStore.getState().startUploadAnother();
    } else {
      useStudioStore.getState().startAnother();
    }

    router.push("/");
  }

  function handleBackToStudio() {
    useStudioStore.getState().resetToStudio();
    router.push("/");
  }

  const heading = mintResult
    ? "Mint completed."
    : canResumeMint
      ? "Complete your mint in Phantom."
      : "Artwork not ready for minting.";

  async function handleConnect() {
    setMintError(null);

    if (requiresPhantomHandoff) {
      openPhantomInAppBrowser(window.location.href, window.location.origin);
      return;
    }

    if (!hasPhantomProvider()) {
      setMintError("Phantom was not detected in this browser. Install Phantom or open this page in the Phantom app.");
      window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
      return;
    }

    try {
      await connect();
      setMintError(null);
    } catch (error) {
      setMintError(error instanceof Error ? error.message : "Unable to connect to Phantom.");
    }
  }

  async function handleMint() {
    if (!wallet?.adapter || !canResumeMint) {
      return;
    }

    setMintError(null);

    try {
      const minted = await mintNftOnSolana({
        walletAdapter: wallet.adapter,
        endpoint,
        network,
        name,
        metadataUri,
        onStatusChange: setMintStatus,
      });

      setMintResult(minted);
      setMintStatus("minted");
    } catch (error) {
      setMintStatus("error");
      setMintError(error instanceof Error ? error.message : "Unable to mint this artwork.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-6 text-[var(--color-ivory)] md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col justify-center rounded-[32px] border border-[var(--color-glass-border)] bg-[var(--color-reveal-panel)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl md:p-8">
        <p className="font-body text-[0.72rem] uppercase tracking-[0.28em] text-[var(--color-gold)]/80">
          SolarkBot Artist
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.8rem,7vw,4.6rem)] leading-none text-[var(--color-ivory)]">
          {heading}
        </h1>

        {imageUrl ? (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--color-glass-border)] bg-[var(--color-reveal-image-shell)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={name} className="h-auto w-full object-contain" />
          </div>
        ) : null}

        {mintResult ? (
          <div className="mt-6 space-y-3 rounded-[24px] border border-[var(--color-glass-border)] bg-[var(--color-notebook-surface)]/70 p-4">
            <p className="font-body text-sm leading-6 text-[var(--color-muted)]">
              {`Your NFT is now minted on Solana ${networkLabel}.`}
            </p>
            <a
              href={mintResult.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-medium tracking-[0.08em] text-[var(--color-ivory)] underline underline-offset-4"
            >
              View on Solscan
            </a>
          </div>
        ) : (
          <div className="mt-6 space-y-3 rounded-[24px] border border-[var(--color-glass-border)] bg-[var(--color-notebook-surface)]/70 p-4">
            <p className="font-body text-sm leading-6 text-[var(--color-muted)]">
              {canResumeMint
                ? requiresPhantomHandoff
                  ? "Tap below to reopen this mint inside Phantom and confirm it there."
                  : connected
                    ? `Your artwork is uploaded. Confirm the ${networkLabel} mint with Phantom.`
                    : `Connect Phantom, then mint your artwork on ${networkLabel}.`
                : "This link is missing the prepared NFT metadata. Start from the reveal screen and choose Mint as NFT."}
            </p>
            {mintError ? (
              <p className="font-body text-sm leading-6 text-[var(--color-muted)]">{mintError}</p>
            ) : null}
            {canResumeMint ? (
              connected ? (
                <StudioButton
                  type="button"
                  onClick={() => {
                    void handleMint();
                  }}
                  disabled={mintStatus === "awaiting-wallet" || mintStatus === "minting" || mintStatus === "minted"}
                >
                  {mintStatus === "awaiting-wallet"
                    ? "Waiting for wallet"
                    : mintStatus === "minting"
                      ? `Minting on ${networkLabel}`
                      : "Mint as NFT"}
                </StudioButton>
              ) : (
                <StudioButton
                  type="button"
                  onClick={() => {
                    void handleConnect();
                  }}
                >
                  {requiresPhantomHandoff ? "Open in Phantom" : "Connect Phantom"}
                </StudioButton>
              )
            ) : null}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {mintResult ? (
            <StudioButton type="button" variant="ghost" onClick={handleStartAgain}>
              {sourceType === "uploaded" ? "Upload another" : "Create another"}
            </StudioButton>
          ) : null}
          <StudioButton type="button" variant="ghost" onClick={handleBackToStudio}>
            Back to studio
          </StudioButton>
        </div>
      </div>
    </main>
  );
}
