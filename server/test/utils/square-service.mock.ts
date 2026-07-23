/**
 * A mock `SquareService` for backend e2e — inject it via
 * `Test.createTestingModule(...).overrideProvider(SquareService).useValue(createSquareServiceMock())`
 * so the app boots against deterministic data and **never** touches the live sandbox.
 * Unit tests can use the same jest fns directly.
 *
 * Method names are provisional (architecture doc §5–6): M2 defines the real
 * `SquareService` contract, at which point this factory's return type is tightened to
 * `jest.Mocked<SquareService>`. Kept minimal and honest until then — no `any`.
 */

export interface SquareServiceMock {
  /** Raw/normalized Locations feed backing `GET /locations`. */
  getLocations: jest.Mock;
  /** Raw/normalized Catalog feed backing `/catalog`, `/categories`, `/items`. */
  getCatalog: jest.Mock;
}

export function createSquareServiceMock(
  overrides: Partial<SquareServiceMock> = {},
): SquareServiceMock {
  return {
    getLocations: jest.fn(),
    getCatalog: jest.fn(),
    ...overrides,
  };
}
