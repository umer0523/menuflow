import { defineConfig } from 'orval';

/**
 * Generates typed React Query hooks from the backend's OpenAPI spec into
 * lib/api/generated (git-ignored, regenerated). All requests flow through the
 * single Axios mutator. Run `pnpm api:generate` after the server spec changes.
 */
export default defineConfig({
  menuflow: {
    input: '../server/openapi.json',
    output: {
      mode: 'tags-split',
      target: './lib/api/generated',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './lib/api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
