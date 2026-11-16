import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const realCss = readFileSync(
  path.join(process.cwd(), "src/components/layout/Nav.module.css"),
  "utf8",
);

const MEDIA = "@media (max-width: 22.5rem) {";

// Text between the opening brace of `header` and its matching closing brace.
const blockAfter = (css: string, header: string): string => {
  const start = css.indexOf(header);
  if (start === -1) return "";
  const open = start + header.length;
  let depth = 1;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open, i);
  }
  return "";
};

const navCssProblems = (css: string): string[] => {
  const problems: string[] = [];
  if (!blockAfter(css, ".links a {").includes("white-space: nowrap")) {
    problems.push("`.links a` lacks white-space: nowrap");
  }
  const media = blockAfter(css, MEDIA);
  if (!media) {
    problems.push(`missing ${MEDIA} block (22.5rem)`);
  } else {
    if (!blockAfter(media, ".links {").includes("gap: 1rem")) {
      problems.push("media .links lacks gap: 1rem");
    }
    if (!blockAfter(media, ".wordmark {").includes("font-size: 1rem;")) {
      problems.push(
        "media .wordmark lacks font-size: 1rem (1.125rem measured 90.6px tall at 320px)",
      );
    }
  }
  const base = media ? css.replace(MEDIA + media + "}", "") : css;
  if (!blockAfter(base, ".links {").includes("gap: 2rem")) {
    problems.push("base .links gap is no longer 2rem");
  }
  if (!blockAfter(base, ".wordmark {").includes("font-size: 1.25rem")) {
    problems.push("base .wordmark font-size is no longer 1.25rem");
  }
  return problems;
};

describe("Nav.module.css 320px backstop", () => {
  it("the real stylesheet has no problems", () => {
    expect(navCssProblems(realCss)).toEqual([]);
  });

  it("flags a pre-fix stylesheet", () => {
    const preFix = `.wordmark { font-size: 1.25rem; }
.links { gap: 2rem; }
.links a { font-size: 0.875rem; }`;
    const text = navCssProblems(preFix).join("\n");
    expect(text).toContain("white-space: nowrap");
    expect(text).toContain("22.5rem");
  });

  it("flags a 1.125rem wordmark in the media block", () => {
    const wide = `.wordmark { font-size: 1.25rem; }
.links { gap: 2rem; }
.links a { white-space: nowrap; }
${MEDIA}
  .links { gap: 1rem; }
  .wordmark { font-size: 1.125rem; }
}`;
    expect(navCssProblems(wide).join("\n")).toContain("font-size: 1rem");
  });
});
