/**
 * Backend base URL for all API calls. Points at the NestJS server that proxies Square;
 * the client never talks to Square directly. Override via NEXT_PUBLIC_API_URL.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
