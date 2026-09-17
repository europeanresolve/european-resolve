import { gunzipSync } from "node:zlib";
import { unzipSync } from "fflate";

const DMARC_ATTACHMENT_RE =
  /\.(?:xml(?:\.gz|\.zip)?|gz|zip)$/i;

export function isDmarcAttachmentFilename(filename: string): boolean {
  const base = filename.split("/").pop() ?? filename;
  return (
    DMARC_ATTACHMENT_RE.test(base) ||
    base.toLowerCase().includes("dmarc") ||
    base.toLowerCase().endsWith(".xml")
  );
}

/** Decode report bytes from .xml, .gz, .xml.gz, or .zip (first .xml entry). */
export function decodeDmarcAttachment(
  filename: string,
  content: Buffer,
): string | null {
  const base = (filename.split("/").pop() ?? filename).toLowerCase();

  if (base.endsWith(".xml") && !base.endsWith(".xml.gz")) {
    return content.toString("utf8");
  }

  if (base.endsWith(".gz") || base.endsWith(".xml.gz")) {
    try {
      return gunzipSync(content).toString("utf8");
    } catch {
      return null;
    }
  }

  if (base.endsWith(".zip")) {
    try {
      const entries = unzipSync(new Uint8Array(content));
      for (const [name, data] of Object.entries(entries)) {
        if (name.toLowerCase().endsWith(".xml")) {
          return Buffer.from(data).toString("utf8");
        }
      }
    } catch {
      return null;
    }
  }

  const asText = content.toString("utf8").trim();
  if (asText.startsWith("<?xml") || asText.includes("<feedback")) {
    return asText;
  }

  return null;
}
