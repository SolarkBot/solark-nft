import type { AspectRatio } from "@/types";

export function buildDownloadFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");

  return `solarkbot-art-${year}${month}${day}-${hours}${minutes}${seconds}.png`;
}

function dataUrlToBlob(dataUrl: string) {
  const [header, payload] = dataUrl.split(",", 2);

  if (!header || payload === undefined) {
    throw new Error("Unable to download artwork.");
  }

  const mimeType = header.match(/^data:([^;]+)/)?.[1] ?? "image/png";

  if (header.includes(";base64")) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mimeType });
  }

  return new Blob([decodeURIComponent(payload)], { type: mimeType });
}

async function resolveArtworkBlob(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    return dataUrlToBlob(imageUrl);
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("Unable to download artwork.");
  }

  return response.blob();
}

export function buildMobileSaveViewUrl(imageUrl: string) {
  if (typeof window === "undefined") {
    return `/artwork/save?image=${encodeURIComponent(imageUrl)}`;
  }

  const saveUrl = new URL("/artwork/save", window.location.origin);
  saveUrl.searchParams.set("image", imageUrl);
  return saveUrl.toString();
}

function openMobileSaveView(imageUrl: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(buildMobileSaveViewUrl(imageUrl));
}

function isMobileEnvironment() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export async function downloadArtwork(imageUrl: string, date = new Date()) {
  const filename = buildDownloadFilename(date);
  const blob = await resolveArtworkBlob(imageUrl);

  const share = navigator.share?.bind(navigator);
  const canShare = navigator.canShare?.bind(navigator);

  if (share && typeof File !== "undefined") {
    const file = new File([blob], filename, {
      type: blob.type || "image/png",
      lastModified: date.getTime(),
    });

    if (!canShare || canShare({ files: [file] })) {
      try {
        await share({
          title: "SolarkBot artwork",
          files: [file],
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (isMobileEnvironment()) {
          openMobileSaveView(imageUrl);
          return;
        }
      }
    }
  }

  if (isMobileEnvironment()) {
    openMobileSaveView(imageUrl);
    return;
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1_000);
}

export function describeAspectRatio(aspectRatio: AspectRatio) {
  const labels: Record<AspectRatio, string> = {
    "1:1": "Square study",
    "9:16": "Portrait poster",
    "16:9": "Cinematic wide",
    "3:2": "Gallery print",
  };

  return labels[aspectRatio];
}
