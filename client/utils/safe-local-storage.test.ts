import { afterEach, describe, expect, it, vi } from 'vitest';

import { readStorage, removeStorage, writeStorage } from './safe-local-storage';

const KEY = 'menuflow.test-key';

describe('safe-local-storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('round-trips a value through the real store', () => {
    writeStorage(KEY, 'value');
    expect(readStorage(KEY)).toBe('value');

    removeStorage(KEY);
    expect(readStorage(KEY)).toBeNull();
  });

  it('returns null instead of throwing when reads fail', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(readStorage(KEY)).toBeNull();
  });

  it('swallows write/remove failures (best-effort persistence)', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(() => writeStorage(KEY, 'value')).not.toThrow();
    expect(() => removeStorage(KEY)).not.toThrow();
  });
});
