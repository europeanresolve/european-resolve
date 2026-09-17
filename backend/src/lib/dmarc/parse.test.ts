import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  decodeDmarcAttachment,
  isDmarcAttachmentFilename,
} from "./attachments.js";
import { isLikelyDmarcReportMessage } from "./detect.js";
import {
  parseDmarcAggregateXml,
  recordFailureReason,
  recordIsPass,
} from "./parse.js";
import {
  formatSummaryText,
  summarizeDmarcReports,
} from "./summary.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "../../fixtures/dmarc");

function loadFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), "utf8");
}

describe("parseDmarcAggregateXml", () => {
  it("parses Google-style aggregate XML", () => {
    const report = parseDmarcAggregateXml(loadFixture("google-minimal.xml"));

    expect(report.orgName).toBe("google.com");
    expect(report.policyPublished.domain).toBe("european-resolve.org");
    expect(report.policyPublished.p).toBe("quarantine");
    expect(report.records).toHaveLength(2);
    expect(report.records[0].sourceIp).toBe("192.0.2.10");
    expect(report.records[0].count).toBe(42);
  });

  it("parses Microsoft-style aggregate XML", () => {
    const report = parseDmarcAggregateXml(
      loadFixture("microsoft-minimal.xml"),
    );

    expect(report.orgEmail).toBe("dmarc@microsoft.com");
    expect(report.records[0].spfEval).toBe("pass");
  });
});

describe("summarizeDmarcReports", () => {
  it("aggregates pass/fail and reporters", () => {
    const reports = [
      parseDmarcAggregateXml(loadFixture("google-minimal.xml")),
      parseDmarcAggregateXml(loadFixture("microsoft-minimal.xml")),
    ];

    const summary = summarizeDmarcReports(reports, { messagesProcessed: 3 });

    expect(summary.reportsParsed).toBe(2);
    expect(summary.messagesProcessed).toBe(3);
    expect(summary.passCount).toBe(52);
    expect(summary.failCount).toBe(5);
    expect(summary.reportsByReporter.map((r) => r.orgName)).toEqual([
      "google.com",
      "Microsoft Corporation",
    ]);
    expect(summary.topFailingSources[0].sourceIp).toBe("192.0.2.99");
    expect(formatSummaryText(summary)).toContain("52 pass");
  });
});

describe("record helpers", () => {
  it("classifies pass vs fail rows", () => {
    const report = parseDmarcAggregateXml(loadFixture("google-minimal.xml"));
    expect(recordIsPass(report.records[0])).toBe(true);
    expect(recordIsPass(report.records[1])).toBe(false);
    expect(recordFailureReason(report.records[1])).toBe("DKIM+SPF");
  });
});

describe("decodeDmarcAttachment", () => {
  it("gunzips xml.gz payloads", () => {
    const xml = loadFixture("google-minimal.xml");
    const gz = gzipSync(Buffer.from(xml, "utf8"));
    const decoded = decodeDmarcAttachment("report.xml.gz", gz);
    expect(decoded).toContain("<feedback>");
  });

  it("recognizes dmarc attachment filenames", () => {
    expect(isDmarcAttachmentFilename("google.com!european-resolve.org!1735689600.xml.gz")).toBe(
      true,
    );
  });
});

describe("isLikelyDmarcReportMessage", () => {
  it("matches subject and attachment heuristics", () => {
    expect(
      isLikelyDmarcReportMessage({
        subject: "Report domain: european-resolve.org",
        attachmentNames: ["report.xml.gz"],
      }),
    ).toBe(true);

    expect(
      isLikelyDmarcReportMessage({
        subject: "Newsletter",
        attachmentNames: [],
      }),
    ).toBe(false);
  });
});
