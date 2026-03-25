"use client";

import { useEffect } from "react";

const COOKIE = "fittrack-tz";
const ONE_YEAR_S = 60 * 60 * 24 * 365;

/** Persists the browser IANA zone so server actions can align weeks with the user. */
export function TimezoneSync() {
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;
      document.cookie = `${COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=${ONE_YEAR_S}; samesite=lax`;
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
