import { afterEach, describe, expect, it, vi } from 'vitest';

import { readStorage, writeStorage } from './safe-local-storage';

const KEY = 'menuflow.test-key';

describe('safe-local-storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('round-trips a value through the real store', () => {
    expect(readStorage(KEY)).toBeNull();
    writeStorage(KEY, 'value');
    expect(readStorage(KEY)).toBe('value');
  });

  it('returns null instead of throwing when reads fail', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(readStorage(KEY)).toBeNull();
  });

  it('swallows write failures (best-effort persistence)', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(() => writeStorage(KEY, 'value')).not.toThrow();
  });
});
