/**
 * Exception-safe `localStorage` access.
 *
 * `localStorage` throws in several real conditions — Safari private mode, disabled storage, a full
 * quota, or a `SecurityError` in sandboxed frames — and a throw here would crash React render/mount.
 * These wrappers degrade gracefully instead (read → `null`, writes → no-op).
 *
 * Security note: `localStorage` is readable by any same-origin script and cannot be meaningfully
 * encrypted client-side, so we **never** store secrets in it — only non-sensitive UI ids (the Square
 * access token lives server-side only). The real safeguard is that every caller **validates the
 * value on read** before trusting it (e.g. the location provider checks a restored id against the
 * loaded locations and falls back), so a tampered or stale value can't put the UI in a bad state.
 */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Best-effort persistence; a failure just means the choice won't survive a reload.
  }
}
