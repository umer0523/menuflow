import { Controller, Get } from '@nestjs/common';

/** Liveness probe — lets `pnpm dev` and infra confirm the API is up without touching Square. */
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
