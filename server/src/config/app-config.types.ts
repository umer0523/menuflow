import { SquareEnvironment } from './square-environment.enum';

/** Square-specific configuration, namespaced under `square` in the config tree. */
export interface SquareConfig {
  accessToken: string;
  environment: SquareEnvironment;
  baseUrl: string;
}

/** Top-level typed configuration consumed via `ConfigService<AppConfig, true>`. */
export interface AppConfig {
  port: number;
  clientOrigin: string;
  square: SquareConfig;
}
