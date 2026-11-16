import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { legacyHashTarget } from "@/components/ui/LegacyHashRedirect";

describe("legacyHashTarget", () => {
  it.each([
    ["#team", "", "/about#team"],
    ["#about", "", "/about#mission"],
    ["#team", "?utm_source=card", "/about?utm_source=card#team"],
    ["#about", "?x=1", "/about?x=1#mission"],
  ])("maps %s with search %j to %s", (hash, search, target) => {
    expect(legacyHashTarget(hash, search)).toBe(target);
  });

  it.each([
    "",
    "#",
    "#teams",
    "#Team",
    "#mission",
    "#team-x",
    "#constructor",
    "#__proto__",
  ])("returns null for %j", (hash) => {
    expect(legacyHashTarget(hash, "")).toBeNull();
  });
});

describe("internal links", () => {
  it("no src file outside the hop component links to /#team or /#about", () => {
    const dir = path.join(process.cwd(), "src");
    const files = readdirSync(dir, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
      .filter(
        (f) =>
          !f.startsWith("__tests__") && !f.endsWith("LegacyHashRedirect.tsx"),
      );
    const hits = files.filter((f) =>
      /["'`]\/#(team|about)\b/.test(readFileSync(path.join(dir, f), "utf8")),
    );
    expect(files.length).toBeGreaterThanOrEqual(10);
    expect(hits).toEqual([]);
  });
});
