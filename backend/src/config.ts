export const config = Object.freeze({
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from:
      process.env.SMTP_FROM ??
      '"Run for Ukraine 2026" <noreply@european-resolve.org>',
    replyTo: process.env.SMTP_REPLY_TO ?? "info@european-resolve.org",
  },
  imap: {
    host: process.env.IMAP_HOST ?? "imap.mailbox.org",
    port: Number(process.env.IMAP_PORT) || 993,
    user: process.env.IMAP_USER ?? "",
    pass: process.env.IMAP_PASS ?? "",
  },
  dmarc: {
    mailboxFolder: process.env.DMARC_MAILBOX_FOLDER ?? "INBOX",
    archiveFolder: process.env.DMARC_ARCHIVE_FOLDER ?? "DMARC-Reports",
    sinceDays: Number(process.env.DMARC_SINCE_DAYS) || 0,
    dryRunDefault: process.env.DMARC_DRY_RUN === "true",
  },
});
