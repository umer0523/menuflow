import type { SquareService } from '../../src/square/square.service';

/**
 * A mock `SquareService` for backend e2e — inject via
 * `Test.createTestingModule(...).overrideProvider(SquareService).useValue(createSquareServiceMock())`
 * so the app boots against deterministic data and **never** touches the live sandbox. Unit tests
 * can use the same jest fns directly. Typed against the real contract (M2), so it drifts if the
 * service surface changes.
 */
export type SquareServiceMock = jest.Mocked<Pick<SquareService, 'getLocations' | 'getCatalog'>>;

export function createSquareServiceMock(
  overrides: Partial<SquareServiceMock> = {},
): SquareServiceMock {
  return {
    getLocations: jest.fn(),
    getCatalog: jest.fn(),
    ...overrides,
  };
}
