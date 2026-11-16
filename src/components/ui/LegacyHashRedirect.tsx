"use client";

import { useEffect } from "react";

const LEGACY_ANCHORS = new Map([
  ["#team", "team"],
  ["#about", "mission"],
]);

export function legacyHashTarget(hash: string, search: string): string | null {
  // The hash is only a lookup key, never copied into the target, so the target is always a same-origin /about path.
  const anchor = LEGACY_ANCHORS.get(hash);
  return anchor ? `/about${search}#${anchor}` : null;
}

export function LegacyHashRedirect() {
  useEffect(() => {
    const target = legacyHashTarget(window.location.hash, window.location.search);
    if (target) window.location.replace(target);
  }, []);

  return null;
}
