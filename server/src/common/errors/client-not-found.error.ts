import { HttpException, HttpStatus } from '@nestjs/common';

/** Expected client error for a missing resource. Rendered as 404 by the global filter. */
export class ClientNotFoundError extends HttpException {
  constructor(message = 'Not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}
