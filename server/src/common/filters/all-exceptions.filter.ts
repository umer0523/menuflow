import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import type { ErrorResponse } from '../error-response.types';

/**
 * Global filter that renders a consistent {@link ErrorResponse} envelope for
 * every error. Expected client errors (4xx) are returned quietly; unexpected
 * failures (5xx — e.g. Square/infra) are logged with structured context.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponse = {
      statusCode: status,
      error: HttpStatus[status] ?? 'ERROR',
      message: this.resolveMessage(exception, status),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { path: request.url, method: request.method, status },
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private resolveMessage(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        return payload;
      }
      if (payload && typeof payload === 'object' && 'message' in payload) {
        const { message } = payload as { message: unknown };
        return Array.isArray(message) ? message.join(', ') : String(message);
      }
    }
    // Never leak internal error detail to clients on unexpected failures.
    return status >= HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : 'Request failed';
  }
}
