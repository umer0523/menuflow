import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

import { SquareEnvironment } from './square-environment.enum';

/**
 * Shape of the process environment MenuFlow requires. Validated once at startup;
 * a missing or malformed value fails fast before the app accepts traffic.
 */
class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  SQUARE_ACCESS_TOKEN!: string;

  @IsEnum(SquareEnvironment)
  SQUARE_ENV!: SquareEnvironment;

  // require_tld is disabled so localhost-style sandbox overrides remain valid in dev.
  @IsUrl({ require_tld: false })
  SQUARE_BASE_URL!: string;

  @IsInt()
  @Min(1)
  @Max(65_535)
  PORT!: number;

  @IsUrl({ require_tld: false })
  CLIENT_ORIGIN!: string;
}

/**
 * `@nestjs/config` validate hook — throws (fail-fast) on any invalid env var,
 * with every violation reported at once rather than one at a time.
 */
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return validated;
}
