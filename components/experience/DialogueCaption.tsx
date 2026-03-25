"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { StudioPhase } from "@/types";

const COPY: Record<StudioPhase, { label: string; line: string }> = {
  arrival: {
    label: "Studio lights",
    line: "The atelier settles before the first idea arrives.",
  },
  invitation: {
    label: "Artist",
    line: "What should I draw for you?",
  },
  prompting: {
    label: "Notebook",
    line: "Write a short, vivid direction. I will take it from there.",
  },
  creating: {
    label: "In progress",
    line: "Let the room hold the suspense while the image comes alive.",
  },
  reveal: {
    label: "Artist",
    line: "Here's what I made for you.",
  },
};

export function DialogueCaption({ phase }: { phase: StudioPhase }) {
  const copy = COPY[phase];

  return (
    <div className="pointer-events-none absolute left-5 top-5 z-20 max-w-lg md:left-10 md:top-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[28px] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-5 py-4 backdrop-blur-md"
        >
          <p className="font-body text-[0.7rem] uppercase tracking-[0.28em] text-[var(--color-gold)]/75">
            {copy.label}
          </p>
          <p className="mt-2 font-display text-3xl leading-none text-[var(--color-ivory)] md:text-[2.75rem]">
            {copy.line}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
