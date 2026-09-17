import { describe, expect, it } from "vitest";
import { parseCliOptions } from "./process-dmarc-reports.js";

describe("parseCliOptions", () => {
  it("defaults to dry-run unless --apply is passed", () => {
    expect(parseCliOptions([]).dryRun).toBe(true);
    expect(parseCliOptions(["--apply"]).dryRun).toBe(false);
    expect(parseCliOptions(["--dry-run", "--apply"]).dryRun).toBe(true);
  });

  it("requires explicit --delete to enable deletion", () => {
    expect(parseCliOptions(["--apply"]).deleteMessages).toBe(false);
    expect(parseCliOptions(["--apply", "--delete"]).deleteMessages).toBe(true);
  });
});
