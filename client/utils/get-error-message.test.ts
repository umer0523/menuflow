import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { getErrorMessage } from './get-error-message';

function axiosErrorWith(data: unknown): AxiosError {
  const error = new AxiosError('Request failed with status code 500');
  error.response = {
    data,
    status: 500,
    statusText: 'Internal Server Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('getErrorMessage', () => {
  it("prefers the backend envelope's message", () => {
    expect(getErrorMessage(axiosErrorWith({ message: 'Failed to reach Square' }))).toBe(
      'Failed to reach Square',
    );
  });

  it('falls back to the axios error message when the envelope has none', () => {
    expect(getErrorMessage(axiosErrorWith({}))).toBe('Request failed with status code 500');
  });

  it('uses a plain Error message', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns the fallback for unknown values', () => {
    expect(getErrorMessage('nope')).toBe('Something went wrong. Please try again.');
    expect(getErrorMessage(null)).toBe('Something went wrong. Please try again.');
  });
});
