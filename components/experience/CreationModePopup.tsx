"use client";

import { motion } from "framer-motion";

import { StudioButton } from "@/components/ui/StudioButton";

export function CreationModePopup({
  onChooseGenerate,
  onChooseUpload,
}: {
  onChooseGenerate: () => void;
  onChooseUpload: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="studio-card w-[min(24rem,calc(100vw-2rem))] rounded-[28px] border border-[var(--color-glass-border)] bg-[linear-gradient(180deg,rgba(255,252,245,0.96),rgba(232,220,198,0.9))] p-5 text-[var(--color-ink)] shadow-[0_24px_70px_rgba(17,14,11,0.24)] backdrop-blur-xl"
    >
      <p className="font-body text-[0.68rem] uppercase tracking-[0.28em] text-black/42">
        SolarkBot Artist
      </p>
      <h3 className="mt-2 font-display text-[2rem] leading-none text-[var(--color-ink)]">
        What would you like to make?
      </h3>
      <p className="mt-3 font-body text-sm leading-6 text-black/54">
        Choose the artist’s path, or bring a piece of your own into the atelier.
      </p>
      <div className="mt-5 grid gap-3">
        <StudioButton type="button" onClick={onChooseGenerate}>
          Generate
        </StudioButton>
        <StudioButton
          type="button"
          variant="secondary"
          className="text-[var(--color-ink)]"
          onClick={onChooseUpload}
        >
          Upload
        </StudioButton>
      </div>
    </motion.div>
  );
}
