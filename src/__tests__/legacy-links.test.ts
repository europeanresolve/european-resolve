import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

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
