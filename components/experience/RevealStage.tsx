"use client";

import { motion } from "framer-motion";

import { StudioButton } from "@/components/ui/StudioButton";
import type { GenerationResult, ThemeMode } from "@/types";

export function RevealStage({
  generation,
  themeMode,
  onDownload,
  onCreateAnother,
  onBackToStudio,
}: {
  generation: GenerationResult;
  themeMode: ThemeMode;
  onDownload: () => void;
  onCreateAnother: () => void;
  onBackToStudio: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 overflow-hidden bg-[image:var(--color-reveal-overlay)]"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.95%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.08%22/%3E%3C/svg%3E')] opacity-40" />
      <div className="relative flex h-full items-center justify-center p-5 md:p-10">
        <div className="flex h-full w-full max-w-4xl flex-col gap-5 rounded-[32px] border border-[var(--color-glass-border)] bg-[var(--color-reveal-panel)] p-5 backdrop-blur-xl md:gap-6 md:p-8">
          <div>
            <p className="font-body text-[0.7rem] uppercase tracking-[0.28em] text-[var(--color-gold)]/80">
              SolarkBot Artist
            </p>
            <h2 className="mt-2 font-display text-[clamp(3rem,8vw,5rem)] leading-none text-[var(--color-ivory)]">
              Here&apos;s what I made for you.
            </h2>
          </div>

          <div className="relative flex min-h-[42vh] flex-1 items-center justify-center overflow-hidden rounded-[32px] border border-[var(--color-glass-border)] bg-[var(--color-reveal-image-shell)]">
            <div
              className={`absolute inset-0 ${
                themeMode === "dark"
                  ? "bg-[radial-gradient(circle,rgba(240,230,206,0.14),transparent_56%)]"
                  : "bg-[radial-gradient(circle,rgba(255,255,255,0.42),transparent_54%)]"
              }`}
            />
            <motion.img
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              src={generation.imageUrl}
              alt={generation.prompt}
              className="relative z-10 max-h-full w-auto rounded-[24px] object-contain shadow-[0_40px_120px_rgba(0,0,0,0.38)]"
            />
          </div>

          <div className="grid gap-3">
            <StudioButton type="button" onClick={onDownload}>
              Download
            </StudioButton>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <StudioButton type="button" variant="ghost" onClick={onBackToStudio}>
              Back to studio
            </StudioButton>
            <StudioButton type="button" variant="ghost" onClick={onCreateAnother}>
              Create another
            </StudioButton>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
