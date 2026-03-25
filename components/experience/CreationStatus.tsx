"use client";

import { motion } from "framer-motion";

import { getStageRail } from "@/lib/utils/experience";
import type { CreationStage } from "@/types";

export function CreationStatus({
  stage,
  reducedMotion,
}: {
  stage: CreationStage;
  reducedMotion: boolean;
}) {
  const stages = getStageRail(reducedMotion);
  const activeIndex = stages.findIndex((item) => item.stage === stage);

  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-5 left-5 z-20 w-[min(25rem,calc(100vw-2.5rem))] rounded-[28px] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg-strong)] p-5 backdrop-blur-xl md:bottom-10 md:left-10"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-[0.7rem] uppercase tracking-[0.28em] text-[var(--color-gold)]/80">
          Studio process
        </p>
        <div className="h-2 w-2 rounded-full bg-[var(--color-gold)] shadow-[0_0_18px_rgba(198,168,109,0.8)]" />
      </div>
      <div className="mt-4 space-y-3">
        {stages.map((item, index) => (
          <div key={item.stage} className="grid grid-cols-[auto_1fr] gap-3">
            <div
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                index <= activeIndex ? "bg-[var(--color-ivory)]" : "bg-[var(--color-soft)]"
              }`}
            />
            <div>
              <p className="font-display text-2xl leading-none text-[var(--color-ivory)]">
                {item.label}
              </p>
              <p className="mt-1 font-body text-sm text-[var(--color-muted)]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}
