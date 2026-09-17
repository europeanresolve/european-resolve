/**
 * Ingest DMARC aggregate reports from IMAP (mailbox.org), summarize, optionally archive.
 *
 * Uses imapflow (TLS IMAP) + mailparser (MIME attachments) + fast-xml-parser.
 *
 * Usage:
 *   npm run process-dmarc-reports -- --dry-run
 *   npm run process-dmarc-reports -- --dry-run --since-days 30
 *   npm run process-dmarc-reports -- --archive
 *   npm run process-dmarc-reports -- --delete   # explicit; default is never delete
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";
import {
  formatSummaryMarkdown,
  formatSummaryText,
  summarizeDmarcReports,
} from "./lib/dmarc/summary.js";
import {
  applyMailboxPostProcessing,
  fetchDmarcReportsFromMailbox,
} from "./services/dmarc-imap.js";

const OUTPUT_DIR = join(process.cwd(), "output");

export type CliOptions = {
  dryRun: boolean;
  archive: boolean;
  deleteMessages: boolean;
  sinceDays: number;
  limit?: number;
  mailbox: string;
  archiveFolder: string;
  writeFiles: boolean;
};

export function parseCliOptions(argv: string[]): CliOptions {
  const dryRun =
    argv.includes("--dry-run") ||
    config.dmarc.dryRunDefault ||
    !argv.includes("--apply");

  return {
    dryRun,
    archive: argv.includes("--archive"),
    deleteMessages: argv.includes("--delete"),
    sinceDays: getNumericFlag(argv, "--since-days") ?? config.dmarc.sinceDays,
    limit: getNumericFlag(argv, "--limit"),
    mailbox: getStringFlag(argv, "--mailbox") ?? config.dmarc.mailboxFolder,
    archiveFolder:
      getStringFlag(argv, "--archive-folder") ?? config.dmarc.archiveFolder,
    writeFiles: !argv.includes("--no-write"),
  };
}

function getNumericFlag(argv: string[], flag: string): number | undefined {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = Number(argv[index + 1]);
  return Number.isFinite(value) ? value : undefined;
}

function getStringFlag(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  return argv[index + 1];
}

export async function runProcessDmarcReports(argv: string[]): Promise<void> {
  const options = parseCliOptions(argv);

  if (options.deleteMessages && options.dryRun) {
    throw new Error("--delete cannot be used with --dry-run");
  }

  console.log(
    options.dryRun
      ? "Dry run: parse and summarize only (no mailbox changes)"
      : "Live run: mailbox may be updated",
  );
  console.log(`Mailbox: ${options.mailbox}`);
  if (options.sinceDays > 0) {
    console.log(`Since: last ${options.sinceDays} day(s)`);
  }
  console.log();

  const messages = await fetchDmarcReportsFromMailbox({
    mailbox: options.mailbox,
    sinceDays: options.sinceDays,
    limit: options.limit,
  });

  const reports = messages.flatMap((message) => message.reports);
  const summary = summarizeDmarcReports(reports, {
    messagesProcessed: messages.length,
  });

  console.log(formatSummaryText(summary));
  console.log();

  if (options.writeFiles) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(
      join(OUTPUT_DIR, "dmarc-summary.json"),
      JSON.stringify(summary, null, 2),
      "utf8",
    );
    writeFileSync(
      join(OUTPUT_DIR, "dmarc-summary.md"),
      formatSummaryMarkdown(summary),
      "utf8",
    );
    console.log(`Wrote ${join(OUTPUT_DIR, "dmarc-summary.json")}`);
    console.log(`Wrote ${join(OUTPUT_DIR, "dmarc-summary.md")}`);
    console.log();
  }

  const uids = messages.map((m) => m.uid);
  if (uids.length === 0) {
    console.log("No DMARC report messages matched.");
    return;
  }

  if (options.dryRun) {
    console.log(
      `Would post-process ${uids.length} message(s). Use --apply --archive to move, or --apply to mark \\Seen only.`,
    );
    return;
  }

  if (options.deleteMessages) {
    console.log(`Deleting ${uids.length} message(s)…`);
  } else if (options.archive && options.archiveFolder) {
    console.log(
      `Moving ${uids.length} message(s) to ${options.archiveFolder}…`,
    );
  } else if (options.archive) {
    console.log(
      `DMARC_ARCHIVE_FOLDER not set; marking ${uids.length} message(s) as \\Seen…`,
    );
  } else {
    console.log(`Marking ${uids.length} message(s) as \\Seen…`);
  }

  await applyMailboxPostProcessing({
    mailbox: options.mailbox,
    archiveFolder: options.archive ? options.archiveFolder : undefined,
    uids,
    dryRun: false,
    deleteMessages: options.deleteMessages,
  });

  console.log("Done.");
}

async function main() {
  await runProcessDmarcReports(process.argv.slice(2));
}

const isMain =
  process.argv[1]?.endsWith("process-dmarc-reports.ts") ||
  process.argv[1]?.endsWith("process-dmarc-reports.js");

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
