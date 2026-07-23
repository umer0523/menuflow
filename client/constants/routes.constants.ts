/** App routes in one place — no hardcoded path strings scattered across components. */
export const ROUTES = {
  HOME: '/',
  item: (id: string): string => `/items/${id}`,
} as const;
