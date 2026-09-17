import type { AddressObject } from "mailparser";

const DMARC_FROM_PATTERNS = [
  /dmarc/i,
  /noreply-dmarc-support@google\.com/i,
  /dmarc@microsoft\.com/i,
  /postmaster@/i,
  /reports@/i,
];

const DMARC_SUBJECT_PATTERNS = [
  /report domain/i,
  /\bdmarc\b/i,
  /aggregate report/i,
];

function addressText(from: AddressObject | undefined): string {
  if (!from) return "";
  if (from.text) return from.text;
  return from.value.map((v) => v.address ?? "").join(" ");
}

export function isDmarcReportSubject(subject: string | undefined): boolean {
  const s = subject ?? "";
  return DMARC_SUBJECT_PATTERNS.some((re) => re.test(s));
}

export function isDmarcReportFrom(from: AddressObject | undefined): boolean {
  const text = addressText(from);
  return DMARC_FROM_PATTERNS.some((re) => re.test(text));
}

export function isLikelyDmarcReportMessage(input: {
  subject?: string;
  from?: AddressObject;
  attachmentNames: string[];
}): boolean {
  const hasReportAttachment = input.attachmentNames.some((name) =>
    /\.(?:xml(?:\.gz|\.zip)?|gz|zip)$/i.test(name),
  );

  const subjectHit = isDmarcReportSubject(input.subject);
  const fromHit = isDmarcReportFrom(input.from);

  if (hasReportAttachment && (subjectHit || fromHit)) return true;
  if (subjectHit && fromHit) return true;
  if (hasReportAttachment && subjectHit) return true;

  return false;
}
