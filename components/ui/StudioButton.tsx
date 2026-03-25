"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function StudioButton({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium tracking-[0.18em] uppercase transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" &&
          "bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] shadow-[0_18px_40px_rgba(98,75,36,0.14)] hover:brightness-[1.04]",
        variant === "secondary" &&
          "border border-[var(--color-button-secondary-border)] bg-[var(--color-button-secondary-bg)] text-[var(--color-ivory)] hover:brightness-[1.03]",
        variant === "ghost" &&
          "text-[var(--color-ivory)] hover:bg-[var(--color-button-ghost-hover)]",
        className,
      )}
      {...props}
    />
  );
}
