# DMARC aggregate reports (European Resolve)

European Resolve publishes a DMARC TXT record at `_dmarc.european-resolve.org`. Receivers that see mail claiming our domain send **aggregate reports** (`rua=mailto:…`) as automated messages, usually with gzip-compressed XML attachments. Those messages are expected; they are not phishing.

This runbook covers one-time ingest of existing report mail and the DNS change to stop new reports.

## Current DNS (verified)

```text
_dmarc.european-resolve.org TXT
"v=DMARC1;p=quarantine;rua=mailto:serhiy.onyshchenko@european-resolve.org"
```

- **`p=quarantine`**: enforcement policy (keep unless the org explicitly changes it).
- **`rua=mailto:…`**: address that receives aggregate XML reports (source of inbox noise).

SPF for the domain is unchanged by this work (`v=spf1 include:mailbox.org ~all`).

## Ingest existing report mail

Operator tool: `backend/` package `@european-resolve/email-ops`.

1. Copy `.env.example` to `.env` and set **IMAP** credentials (mailbox.org **app-specific password**, mail scope). You can reuse the same app password as SMTP if it includes IMAP/mail access.
2. From `backend/`:

```bash
npm run process-dmarc-reports:live -- --dry-run
```

Optional flags:

| Flag | Effect |
|------|--------|
| `--dry-run` | Parse and summarize only; no mailbox changes (default unless `--apply`) |
| `--apply` | Allow mailbox updates after parse |
| `--archive` | With `--apply`, move processed messages to `DMARC_ARCHIVE_FOLDER` (creates folder if needed) |
| (no `--archive`) | With `--apply`, mark messages `\Seen` only |
| `--delete` | With `--apply`, **delete** processed messages (off by default) |
| `--since-days N` | Only scan messages since N days ago |
| `--no-write` | Skip writing `output/dmarc-summary.{json,md}` |

Outputs (gitignored `output/`):

- `dmarc-summary.json` — structured stats
- `dmarc-summary.md` — human-readable summary

Example: archive processed reports after review:

```bash
npm run process-dmarc-reports:live -- --apply --archive
```

Set `DMARC_ARCHIVE_FOLDER` in `.env` if you want a folder other than `DMARC-Reports`.

## Stop future aggregate reports (Cloudflare / GoDaddy)

**Do not automate this from the repo.** Edit the TXT record manually in Cloudflare (or GoDaddy if DNS is hosted there).

**Recommended** (keep quarantine, stop aggregate mail):

```text
v=DMARC1; p=quarantine; adkim=r; aspf=r
```

**Minimal** (also stops reports):

```text
v=DMARC1; p=quarantine
```

Remove the `rua=mailto:…` tag entirely. There is no `ruf=` forensic tag today.

After the change:

- New aggregate mail stops once DNS propagates and TTLs expire (often hours; up to 48h).
- Messages already in the mailbox remain until you archive or mark them processed (see ingest steps above).

**Trade-off:** without `rua`, you lose free aggregate visibility until you add `rua` again or use a third-party DMARC reporting service.

## Security

- Never commit `.env`, app passwords, or raw production DMARC XML exports.
- The script runs locally with the same trust model as `send-deployment-update:live`.
- No HTTP endpoints are added.
