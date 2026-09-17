import { XMLParser } from "fast-xml-parser";

export type DmarcAuthResult = {
  domain: string;
  result: string;
};

export type DmarcRecord = {
  sourceIp: string;
  count: number;
  disposition: string;
  dkimEval: string;
  spfEval: string;
  headerFrom: string;
  dkimResults: DmarcAuthResult[];
  spfResults: DmarcAuthResult[];
};

export type DmarcPolicyPublished = {
  domain: string;
  p: string;
  sp?: string;
  pct?: string;
  adkim?: string;
  aspf?: string;
  rua?: string;
};

export type DmarcReport = {
  orgName: string;
  orgEmail: string;
  reportId: string;
  dateRange: { begin: Date; end: Date };
  policyPublished: DmarcPolicyPublished;
  records: DmarcRecord[];
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object" && value !== null && "#text" in value) {
    return text((value as { "#text": unknown })["#text"]);
  }
  return String(value);
}

function parseAuthResults(
  block: unknown,
  tag: "dkim" | "spf",
): DmarcAuthResult[] {
  if (!block || typeof block !== "object") return [];
  const node = block as Record<string, unknown>;
  return asArray(node[tag]).map((entry) => ({
    domain: text((entry as Record<string, unknown>).domain),
    result: text((entry as Record<string, unknown>).result),
  }));
}

export function parseDmarcAggregateXml(xml: string): DmarcReport {
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    trimValues: true,
  });

  const doc = parser.parse(xml) as {
    feedback?: Record<string, unknown>;
  };

  const feedback = doc.feedback;
  if (!feedback) {
    throw new Error("Invalid DMARC aggregate XML: missing feedback root");
  }

  const meta = feedback.report_metadata as Record<string, unknown> | undefined;
  if (!meta) {
    throw new Error("Invalid DMARC aggregate XML: missing report_metadata");
  }

  const range = meta.date_range as Record<string, unknown> | undefined;
  const beginSec = Number(text(range?.begin));
  const endSec = Number(text(range?.end));

  const policy = feedback.policy_published as
    | Record<string, unknown>
    | undefined;

  const records: DmarcRecord[] = asArray(
    feedback.record as Record<string, unknown> | Record<string, unknown>[],
  ).map((record) => {
    const row = record.row as Record<string, unknown> | undefined;
    const evaluated = row?.policy_evaluated as
      | Record<string, unknown>
      | undefined;
    const identifiers = record.identifiers as
      | Record<string, unknown>
      | undefined;
    const authResults = record.auth_results;

    return {
      sourceIp: text(row?.source_ip),
      count: Number(text(row?.count)) || 0,
      disposition: text(evaluated?.disposition),
      dkimEval: text(evaluated?.dkim),
      spfEval: text(evaluated?.spf),
      headerFrom: text(identifiers?.header_from),
      dkimResults: parseAuthResults(authResults, "dkim"),
      spfResults: parseAuthResults(authResults, "spf"),
    };
  });

  return {
    orgName: text(meta.org_name),
    orgEmail: text(meta.email),
    reportId: text(meta.report_id),
    dateRange: {
      begin: new Date(beginSec * 1000),
      end: new Date(endSec * 1000),
    },
    policyPublished: {
      domain: text(policy?.domain),
      p: text(policy?.p),
      sp: text(policy?.sp) || undefined,
      pct: text(policy?.pct) || undefined,
      adkim: text(policy?.adkim) || undefined,
      aspf: text(policy?.aspf) || undefined,
      rua: text(policy?.rua) || undefined,
    },
    records,
  };
}

export function recordIsPass(record: DmarcRecord): boolean {
  return record.disposition === "none";
}

export function recordFailureReason(record: DmarcRecord): string {
  const parts: string[] = [];
  if (record.dkimEval === "fail") parts.push("DKIM");
  if (record.spfEval === "fail") parts.push("SPF");
  if (parts.length === 0 && record.disposition !== "none") {
    parts.push("alignment");
  }
  return parts.length > 0 ? parts.join("+") : "none";
}
