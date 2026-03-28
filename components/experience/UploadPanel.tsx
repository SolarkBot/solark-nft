"use client";

import { useRef, useState } from "react";

import { motion } from "framer-motion";

import { StudioButton } from "@/components/ui/StudioButton";
import { cn } from "@/lib/utils/cn";
import { UPLOAD_ACCEPT } from "@/lib/utils/upload";

export function UploadPanel({
  previewUrl,
  fileName,
  disabled,
  errorMessage,
  compact = false,
  onChooseFile,
  onClose,
  onContinue,
}: {
  previewUrl: string | null;
  fileName: string | null;
  disabled: boolean;
  errorMessage: string | null;
  compact?: boolean;
  onChooseFile: (file: File) => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pickFirstFile(files: FileList | null) {
    const file = files?.[0];

    if (file) {
      onChooseFile(file);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        "studio-card flex flex-col gap-4 rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(239,228,206,0.94))] p-5 text-[var(--color-ink)] shadow-[0_22px_60px_rgba(22,16,11,0.28)]",
        compact ? "w-full max-w-xl" : "w-[min(30rem,82vw)]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-body text-[0.65rem] uppercase tracking-[0.32em] text-black/45">
            Upload
          </p>
          <h2 className="font-display text-3xl leading-none text-[var(--color-ink)]">
            Bring your own piece.
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close upload panel"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/55 text-sm font-semibold uppercase tracking-[0.2em] text-black/70 transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        className="sr-only"
        onChange={(event) => pickFirstFile(event.target.files)}
      />

      <button
        type="button"
        className={cn(
          "group flex min-h-[13rem] flex-col items-center justify-center rounded-[28px] border border-dashed px-5 py-6 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
          dragging
            ? "border-black/35 bg-white/75"
            : "border-black/12 bg-white/52 hover:bg-white/68",
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pickFirstFile(event.dataTransfer.files);
        }}
      >
        {previewUrl ? (
          <div className="flex w-full flex-col gap-4">
            <div className="overflow-hidden rounded-[22px] border border-black/8 bg-white/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt={fileName ?? "Uploaded artwork preview"} className="max-h-64 w-full object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4 text-left">
              <div>
                <p className="font-body text-[0.68rem] uppercase tracking-[0.26em] text-black/40">
                  Ready
                </p>
                <p className="mt-1 font-body text-sm text-[var(--color-ink)]">{fileName ?? "Selected image"}</p>
              </div>
              <span className="font-body text-xs uppercase tracking-[0.22em] text-black/42">
                Change
              </span>
            </div>
          </div>
        ) : (
          <>
            <p className="font-body text-[0.72rem] uppercase tracking-[0.28em] text-black/44">
              Drag, drop, or browse
            </p>
            <h3 className="mt-2 font-display text-[2rem] leading-none text-[var(--color-ink)]">
              Upload your image
            </h3>
            <p className="mt-3 max-w-sm font-body text-sm leading-6 text-black/56">
              PNG, JPG, or WEBP up to 10 MB. We&apos;ll carry it into the same reveal and mint ritual.
            </p>
          </>
        )}
      </button>

      <div className="flex items-center justify-between gap-4">
        <p className="max-w-xs font-body text-sm text-black/55">
          Your upload slips straight into the atelier. No prompt needed.
        </p>
        <StudioButton type="button" disabled={!previewUrl || disabled} onClick={onContinue}>
          Continue
        </StudioButton>
      </div>

      {errorMessage ? (
        <p className="font-body text-sm text-[#7b271a]">{errorMessage}</p>
      ) : null}
    </motion.div>
  );
}
