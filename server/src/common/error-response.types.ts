/** Consistent error envelope returned for every unhandled/thrown error. */
export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}
