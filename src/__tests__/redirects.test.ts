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

  it("has a /team/<slug> rule for every member", () => {
    for (const m of members) {
      expect(lines).toContain(`/team/${m.slug} /about/team/${m.slug} 301`);
    }
  });

  it("sends /team and /team/ to /about#team", () => {
    expect(lines).toContain("/team /about#team 301");
    expect(lines).toContain("/team/ /about#team 301");
  });

  it("keeps the /r4u short link", () => {
    expect(lines).toContain(
      "/r4u/:slug /events/2026-run-for-ukraine/fundraise/:slug 301",
    );
  });
});
