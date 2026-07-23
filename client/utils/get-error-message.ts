import { isAxiosError } from 'axios';

/** Shown when we can't extract anything more specific — never a blank error state. */
const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

/**
 * The single place that turns any thrown value into a user-facing string. Prefers the backend's
 * `ErrorResponse.message` envelope, then the error's own message, then a friendly fallback — so
 * every data view surfaces errors consistently instead of swallowing them.
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const { message } = data as { message: unknown };
      if (typeof message === 'string' && message.length > 0) {
        return message;
      }
    }
    return error.message || FALLBACK_MESSAGE;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return FALLBACK_MESSAGE;
}
