import type { DmarcReport, DmarcRecord } from "./parse.js";
import { recordFailureReason, recordIsPass } from "./parse.js";

export type ReporterStats = {
  orgName: string;
  reportCount: number;
  messageCount: number;
};

export type SourceFailureStats = {
  sourceIp: string;
  count: number;
  reasons: string[];
  headerFrom: string;
};

export type DmarcAggregateSummary = {
  reportsParsed: number;
  messagesProcessed: number;
  reportsByReporter: ReporterStats[];
  totalMessagesInReports: number;
  passCount: number;
  failCount: number;
  passPercent: number;
  failPercent: number;
  topFailingSources: SourceFailureStats[];
  policyDomain: string;
  dateRange: { earliest: string; latest: string };
};

function mergeReasons(existing: string[], next: string): string[] {
  if (next === "none") return existing;
  const set = new Set(existing);
  for (const part of next.split("+")) {
    if (part) set.add(part);
  }
  return [...set];
}

export function summarizeDmarcReports(
  reports: DmarcReport[],
  options?: { messagesProcessed?: number },
): DmarcAggregateSummary {
  const reporterMap = new Map<string, ReporterStats>();
  const failureMap = new Map<string, SourceFailureStats>();

  let totalMessagesInReports = 0;
  let passCount = 0;
  let failCount = 0;
  let earliest = Infinity;
  let latest = 0;
  let policyDomain = "";

  for (const report of reports) {
    const key = report.orgName || report.orgEmail || "unknown";
    const reportMessages = report.records.reduce((sum, r) => sum + r.count, 0);
    const prev = reporterMap.get(key) ?? {
      orgName: key,
      reportCount: 0,
      messageCount: 0,
    };
    prev.reportCount += 1;
    prev.messageCount += reportMessages;
    reporterMap.set(key, prev);

    policyDomain = report.policyPublished.domain || policyDomain;
    earliest = Math.min(earliest, report.dateRange.begin.getTime());
    latest = Math.max(latest, report.dateRange.end.getTime());

    for (const record of report.records) {
      totalMessagesInReports += record.count;
      if (recordIsPass(record)) {
        passCount += record.count;
      } else {
        failCount += record.count;
        accumulateFailure(failureMap, record);
      }
    }
  }

  const total = passCount + failCount;
  const passPercent = total > 0 ? Math.round((passCount / total) * 1000) / 10 : 0;
  const failPercent =
    total > 0 ? Math.round((failCount / total) * 1000) / 10 : 0;

  const topFailingSources = [...failureMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const reportsByReporter = [...reporterMap.values()].sort(
    (a, b) => b.reportCount - a.reportCount,
  );

  return {
    reportsParsed: reports.length,
    messagesProcessed: options?.messagesProcessed ?? reports.length,
    reportsByReporter,
    totalMessagesInReports,
    passCount,
    failCount,
    passPercent,
    failPercent,
    topFailingSources,
    policyDomain,
    dateRange: {
      earliest:
        earliest === Infinity
          ? ""
          : new Date(earliest).toISOString().slice(0, 10),
      latest: latest === 0 ? "" : new Date(latest).toISOString().slice(0, 10),
    },
  };
}

function accumulateFailure(
  map: Map<string, SourceFailureStats>,
  record: DmarcRecord,
): void {
  const reason = recordFailureReason(record);
  const prev = map.get(record.sourceIp) ?? {
    sourceIp: record.sourceIp,
    count: 0,
    reasons: [],
    headerFrom: record.headerFrom,
  };
  prev.count += record.count;
  prev.reasons = mergeReasons(prev.reasons, reason);
  prev.headerFrom = record.headerFrom || prev.headerFrom;
  map.set(record.sourceIp, prev);
}

export function formatSummaryMarkdown(summary: DmarcAggregateSummary): string {
  const lines: string[] = [
    "# DMARC aggregate report summary",
    "",
    `Messages scanned: **${summary.messagesProcessed}**`,
    `Reports parsed: **${summary.reportsParsed}**`,
    `Policy domain: **${summary.policyDomain || "(unknown)"}**`,
    `Report date range: **${summary.dateRange.earliest}** – **${summary.dateRange.latest}**`,
    "",
    "## Authentication volume (from report rows)",
    "",
    `- Pass (aligned): **${summary.passCount}** (${summary.passPercent}%)`,
    `- Fail / quarantine: **${summary.failCount}** (${summary.failPercent}%)`,
    `- Total message count in reports: **${summary.totalMessagesInReports}**`,
    "",
    "## Reports by reporter",
    "",
  ];

  if (summary.reportsByReporter.length === 0) {
    lines.push("_No reports parsed._");
  } else {
    for (const row of summary.reportsByReporter) {
      lines.push(
        `- **${row.orgName}**: ${row.reportCount} report(s), ${row.messageCount} message(s) in rows`,
      );
    }
  }

  lines.push("", "## Top failing sources (by volume)", "");
  if (summary.topFailingSources.length === 0) {
    lines.push("_No failing sources in parsed reports._");
  } else {
    for (const row of summary.topFailingSources) {
      lines.push(
        `- **${row.sourceIp}** (${row.headerFrom}): ${row.count} — ${row.reasons.join(", ")}`,
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}

export function formatSummaryText(summary: DmarcAggregateSummary): string {
  const parts = [
    `DMARC summary: ${summary.messagesProcessed} message(s) scanned, ${summary.reportsParsed} report(s) parsed`,
    `Policy domain: ${summary.policyDomain || "unknown"}`,
    `Pass ${summary.passPercent}% / Fail ${summary.failPercent}% (${summary.passCount} pass, ${summary.failCount} fail rows)`,
  ];

  if (summary.reportsByReporter.length > 0) {
    parts.push(
      "Reporters: " +
        summary.reportsByReporter
          .map((r) => `${r.orgName} (${r.reportCount})`)
          .join(", "),
    );
  }

  if (summary.topFailingSources.length > 0) {
    const top = summary.topFailingSources[0];
    parts.push(
      `Top failing source: ${top.sourceIp} (${top.count}, ${top.reasons.join("+")})`,
    );
  }

  return parts.join("\n");
}
