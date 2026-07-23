import { HttpException, HttpStatus } from '@nestjs/common';

/** Expected client error for malformed/invalid input. Rendered as 400 by the global filter. */
export class ClientBadRequestError extends HttpException {
  constructor(message = 'Bad request') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
