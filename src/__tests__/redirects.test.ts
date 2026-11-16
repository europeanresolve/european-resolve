import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { members } from "@/data/members";

const rules = readFileSync(
  path.join(process.cwd(), "public/_redirects"),
  "utf8",
)
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split(/\s+/));
// Normalised "from to code" strings, so failures print on one line.
const lines = rules.map((r) => r.join(" "));

describe("_redirects", () => {
  it("parses at least 10 rules", () => {
    expect(rules.length).toBeGreaterThanOrEqual(10);
  });

  it("has /team/<slug> and /team/<slug>/ rules for every member", () => {
    for (const m of members) {
      expect(lines).toContain(`/team/${m.slug} /about/team/${m.slug} 301`);
      // The trailing-slash form 404ed in production without its own rule.
      expect(lines).toContain(`/team/${m.slug}/ /about/team/${m.slug} 301`);
    }
  });

  it("sends /team and /team/ to /about#team", () => {
    expect(lines).toContain("/team /about#team 301");
    expect(lines).toContain("/team/ /about#team 301");
  });

  it("every rule is `from to 301` (no code means Cloudflare ships a 302)", () => {
    for (const r of rules) {
      expect(r.length, r.join(" ")).toBe(3);
      expect(r[2], r.join(" ")).toBe("301");
    }
  });

  it("has no /team splat, placeholder or .png source (photos must not redirect)", () => {
    for (const [from] of rules) {
      expect(from.startsWith("/team/") && /[*:]/.test(from), from).toBe(false);
      expect(from.endsWith(".png"), from).toBe(false);
    }
  });

  it("no rule redirects to itself", () => {
    for (const [from, to] of rules) {
      expect(to.split("#")[0], from).not.toBe(from);
    }
  });

  it("every destination is a same-origin path", () => {
    for (const [, to] of rules) {
      // "//host" is protocol-relative, i.e. external.
      expect(/^\/(?!\/)/.test(to), to).toBe(true);
    }
  });

  it("no two rules share a source (top-most wins would shadow one)", () => {
    expect(new Set(rules.map(([from]) => from)).size).toBe(rules.length);
  });

  it("keeps the /r4u short link", () => {
    expect(lines).toContain(
      "/r4u/:slug /events/2026-run-for-ukraine/fundraise/:slug 301",
    );
  });
});
