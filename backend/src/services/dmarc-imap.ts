import { ImapFlow } from "imapflow";
import { simpleParser, type ParsedMail } from "mailparser";
import { config } from "../config.js";
import {
  decodeDmarcAttachment,
  isDmarcAttachmentFilename,
} from "../lib/dmarc/attachments.js";
import { isLikelyDmarcReportMessage } from "../lib/dmarc/detect.js";
import { parseDmarcAggregateXml, type DmarcReport } from "../lib/dmarc/parse.js";

export type ProcessedMailboxMessage = {
  uid: number;
  subject: string;
  reports: DmarcReport[];
};

export type FetchDmarcOptions = {
  mailbox: string;
  sinceDays?: number;
  limit?: number;
};

function sinceDate(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function attachmentBuffers(parsed: ParsedMail): { filename: string; content: Buffer }[] {
  const out: { filename: string; content: Buffer }[] = [];
  for (const attachment of parsed.attachments ?? []) {
    if (!attachment.content || attachment.content.length === 0) continue;
    const filename = attachment.filename ?? "attachment.bin";
    out.push({ filename, content: attachment.content });
  }
  return out;
}

function parseReportsFromMail(parsed: ParsedMail): DmarcReport[] {
  const names = attachmentBuffers(parsed).map((a) => a.filename);
  if (!isLikelyDmarcReportMessage({ subject: parsed.subject, from: parsed.from, attachmentNames: names })) {
    return [];
  }

  const reports: DmarcReport[] = [];

  for (const attachment of attachmentBuffers(parsed)) {
    if (!isDmarcAttachmentFilename(attachment.filename)) continue;
    const xml = decodeDmarcAttachment(attachment.filename, attachment.content);
    if (!xml) continue;
    try {
      reports.push(parseDmarcAggregateXml(xml));
    } catch {
      // Skip malformed attachments; operator sees parse count vs message count.
    }
  }

  return reports;
}

/** imapflow: maintained IMAP client with TLS and UID operations (move/mark seen). */
export function createImapClient(): ImapFlow {
  const { host, port, user, pass } = config.imap;
  if (!user || !pass) {
    throw new Error("IMAP_USER and IMAP_PASS must be set (mailbox.org app password)");
  }

  return new ImapFlow({
    host,
    port,
    secure: port === 993,
    auth: { user, pass },
    logger: false,
  });
}

export async function fetchDmarcReportsFromMailbox(
  options: FetchDmarcOptions,
): Promise<ProcessedMailboxMessage[]> {
  const client = createImapClient();
  await client.connect();

  const processed: ProcessedMailboxMessage[] = [];

  try {
    const mailbox = await client.mailboxOpen(options.mailbox);
    const searchQuery =
      options.sinceDays && options.sinceDays > 0
        ? { since: sinceDate(options.sinceDays) }
        : { all: true };

    const uids = await client.search(searchQuery, { uid: true });
    const uidList = Array.isArray(uids) ? uids : [];
    const limited =
      options.limit && options.limit > 0
        ? uidList.slice(-options.limit)
        : uidList;

    for (const uid of limited) {
      const fetched = await client.fetchOne(
        uid,
        { source: true, envelope: true },
        { uid: true },
      );
      if (!fetched || !("source" in fetched) || !fetched.source) {
        continue;
      }

      const parsed = await simpleParser(fetched.source);
      const reports = parseReportsFromMail(parsed);
      if (reports.length === 0) continue;

      processed.push({
        uid,
        subject:
          parsed.subject ??
          ("envelope" in fetched ? fetched.envelope?.subject : undefined) ??
          "(no subject)",
        reports,
      });
    }

    void mailbox;
  } finally {
    await client.logout();
  }

  return processed;
}

export async function applyMailboxPostProcessing(input: {
  mailbox: string;
  archiveFolder?: string;
  uids: number[];
  dryRun: boolean;
  deleteMessages: boolean;
}): Promise<void> {
  if (input.uids.length === 0) return;
  if (input.dryRun) return;

  const client = createImapClient();
  await client.connect();

  try {
    await client.mailboxOpen(input.mailbox);

    if (input.deleteMessages) {
      await client.messageDelete(input.uids, { uid: true });
      return;
    }

    if (input.archiveFolder) {
      await client.mailboxCreate(input.archiveFolder);
      await client.messageMove(input.uids, input.archiveFolder, { uid: true });
      return;
    }

    await client.messageFlagsAdd(input.uids, ["\\Seen"], { uid: true });
  } finally {
    await client.logout();
  }
}
