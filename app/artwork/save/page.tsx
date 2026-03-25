import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ArtworkSavePage({
  searchParams,
}: {
  searchParams: Promise<{
    image?: string;
  }>;
}) {
  const { image } = await searchParams;

  if (!image) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ivory)]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-8 sm:px-6">
        <div className="space-y-3 text-center">
          <p className="font-body text-[0.72rem] uppercase tracking-[0.32em] text-[var(--color-gold)]/80">
            SolarkBot Artist
          </p>
          <h1 className="font-display text-5xl leading-none text-[var(--color-ivory)] sm:text-6xl">
            Save your artwork
          </h1>
          <p className="mx-auto max-w-xl font-body text-base leading-7 text-[var(--color-muted)]">
            Tap and hold the artwork to save it. If your browser supports it, you can also open
            the image directly and use the browser&apos;s save action.
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[var(--color-glass-border)] bg-[var(--color-reveal-panel)] p-3 shadow-[0_40px_120px_rgba(0,0,0,0.18)]">
          <div className="relative aspect-square w-full overflow-hidden rounded-[24px]">
            <Image
              src={image}
              alt="Generated SolarkBot artwork"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={image}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[var(--color-button-primary-bg)] px-5 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-button-primary-text)] shadow-[0_18px_40px_rgba(98,75,36,0.14)] transition duration-300 hover:brightness-[1.04]"
          >
            Open image only
          </a>
          <Link
            href="/"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-ivory)] transition duration-300 hover:bg-[var(--color-button-ghost-hover)]"
          >
            Back to studio
          </Link>
        </div>
      </div>
    </main>
  );
}
