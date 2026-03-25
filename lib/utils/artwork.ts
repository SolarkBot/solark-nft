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

export async function downloadArtwork(imageUrl: string, date = new Date()) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("Unable to download artwork.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = buildDownloadFilename(date);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
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
