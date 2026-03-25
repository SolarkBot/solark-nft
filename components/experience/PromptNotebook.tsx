"use client";

import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { StudioButton } from "@/components/ui/StudioButton";
import { cn } from "@/lib/utils/cn";
import type { AspectRatio } from "@/types";

const EXAMPLES = [
  "A lunar koi painted in brass ink",
  "A windswept desert observatory at blue hour",
  "A velvet botanical study with cybernetic orchids",
  "A bronze mask floating above tidal glass",
];

export function PromptNotebook({
  prompt,
  negativePrompt,
  aspectRatio,
  disabled,
  errorMessage,
  compact = false,
  onPromptChange,
  onNegativePromptChange,
  onAspectRatioChange,
  onClose,
  onSubmit,
}: {
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  disabled: boolean;
  errorMessage: string | null;
  compact?: boolean;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
  onAspectRatioChange: (value: AspectRatio) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const placeholder = useMemo(() => EXAMPLES[exampleIndex], [exampleIndex]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setExampleIndex((current) => (current + 1) % EXAMPLES.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "studio-card flex flex-col gap-4 rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(239,228,206,0.94))] p-5 text-[var(--color-ink)] shadow-[0_22px_60px_rgba(22,16,11,0.28)]",
        compact ? "w-full max-w-xl" : "w-[min(32rem,80vw)]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-body text-[0.65rem] uppercase tracking-[0.32em] text-black/45">
            Notebook
          </p>
          <h2 className="font-display text-3xl leading-none">
            What should I draw for you?
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-black/10 bg-black/4 p-1">
            {(["1:1", "9:16", "16:9", "3:2"] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                className={cn(
                  "rounded-full px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.18em] uppercase transition",
                  aspectRatio === ratio
                    ? "bg-[var(--color-ink)] text-[var(--color-ivory)]"
                    : "text-black/48 hover:text-black",
                )}
                onClick={() => onAspectRatioChange(ratio)}
              >
                {ratio}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Close notebook"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/55 text-sm font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="font-body text-xs uppercase tracking-[0.2em] text-black/45">
          Prompt
        </span>
        <textarea
          aria-label="Prompt"
          value={prompt}
          disabled={disabled}
          rows={compact ? 4 : 5}
          placeholder={placeholder}
          className="min-h-32 rounded-[24px] border border-black/10 bg-white/65 px-4 py-4 font-body text-base leading-7 text-[var(--color-ink)] outline-none placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/10 disabled:bg-black/5"
          onChange={(event) => onPromptChange(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-body text-xs uppercase tracking-[0.2em] text-black/45">
          Keep out
        </span>
        <input
          aria-label="Keep out"
          value={negativePrompt}
          disabled={disabled}
          placeholder="low detail, clutter, text"
          className="rounded-full border border-black/10 bg-white/65 px-4 py-3 font-body text-sm text-[var(--color-ink)] outline-none placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/10 disabled:bg-black/5"
          onChange={(event) => onNegativePromptChange(event.target.value)}
        />
      </label>

      <div className="flex items-center justify-between gap-4">
        <p className="max-w-xs font-body text-sm text-black/55">
          Prompts rotate gently for inspiration. The best results come from a clear subject,
          mood, and material palette.
        </p>
        <StudioButton type="button" disabled={disabled || prompt.trim().length < 8} onClick={onSubmit}>
          Give to artist
        </StudioButton>
      </div>

      {errorMessage ? (
        <p className="font-body text-sm text-[#7b271a]">{errorMessage}</p>
      ) : null}
    </motion.div>
  );
}
