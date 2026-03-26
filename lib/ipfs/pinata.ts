import { getMintServerEnv } from "@/lib/utils/env";

interface PinataPinResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

interface PinataUploadResult {
  cid: string;
  ipfsUri: string;
  gatewayUrl: string;
}

function normalizeGatewayUrl(gateway: string) {
  if (gateway.startsWith("http://") || gateway.startsWith("https://")) {
    return gateway.replace(/\/$/, "");
  }

  return `https://${gateway.replace(/\/$/, "")}`;
}

async function parsePinataResponse(response: Response) {
  const text = await response.text();
  let json: Record<string, unknown> | null = null;

  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const detail =
      (json?.error as { details?: string; reason?: string } | undefined)?.details ??
      (json?.error as { details?: string; reason?: string } | undefined)?.reason ??
      text;

    throw new Error(`Pinata upload failed: ${detail || response.statusText}`);
  }

  const payload = (json ?? {}) as Record<string, unknown>;

  if (
    typeof payload.IpfsHash !== "string" ||
    typeof payload.PinSize !== "number" ||
    typeof payload.Timestamp !== "string"
  ) {
    throw new Error("Pinata upload failed: malformed response.");
  }

  return payload as unknown as PinataPinResponse;
}

function toUploadResult(cid: string) {
  const gateway = normalizeGatewayUrl(getMintServerEnv().pinataGatewayUrl);

  return {
    cid,
    ipfsUri: `ipfs://${cid}`,
    gatewayUrl: `${gateway}/ipfs/${cid}`,
  } satisfies PinataUploadResult;
}

export async function uploadFileToPinata(input: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}) {
  const env = getMintServerEnv();
  const formData = new FormData();
  const bytes = new Uint8Array(input.buffer);
  formData.append("file", new Blob([bytes], { type: input.contentType }), input.fileName);
  formData.append("pinataMetadata", JSON.stringify({ name: input.fileName }));

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.pinataJwt}`,
    },
    body: formData,
  });
  const json = await parsePinataResponse(response);

  return toUploadResult(json.IpfsHash);
}

export async function uploadJsonToPinata(input: {
  content: Record<string, unknown>;
  name: string;
}) {
  const env = getMintServerEnv();
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.pinataJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataMetadata: {
        name: input.name,
      },
      pinataContent: input.content,
    }),
  });
  const json = await parsePinataResponse(response);

  return toUploadResult(json.IpfsHash);
}
