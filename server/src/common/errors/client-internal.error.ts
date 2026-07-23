import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Unexpected/infrastructure failure (e.g. a Square upstream error or exhausted retries).
 * Rendered as 500 by the global filter, which logs it and never leaks internal detail.
 */
export class ClientInternalError extends HttpException {
  constructor(message = 'Internal server error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
