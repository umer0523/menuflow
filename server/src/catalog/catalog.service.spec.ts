import type { SquareService } from '../square/square.service';
import { CatalogService } from './catalog.service';
import {
  createSquareServiceMock,
  type SquareServiceMock,
} from '../../test/utils/square-service.mock';
import {
  AIRPORT_LOCATION_ID,
  CATALOG_SNAPSHOT,
  COFFEE_CATEGORY_ID,
  CROISSANT_PRICE,
  DOWNTOWN_LOCATION_ID,
  LATTE_PRICE,
  PASTRY_CATEGORY_ID,
} from '../../test/utils/catalog-snapshot.fixture';

describe('CatalogService', () => {
  let square: SquareServiceMock;
  let service: CatalogService;

  beforeEach(() => {
    square = createSquareServiceMock();
    square.getCatalog.mockResolvedValue(CATALOG_SNAPSHOT);
    // Typed to the real contract via the mock; the cast bridges the Pick<> surface to the class.
    service = new CatalogService(square as unknown as SquareService);
  });

  describe('getCatalog (grouped menu)', () => {
    it('groups every visible item under its category at downtown', async () => {
      const menu = await service.getCatalog(DOWNTOWN_LOCATION_ID);

      expect(menu.map((group) => group.name)).toEqual(['Coffee', 'Pastry']);
      const coffee = menu.find((group) => group.id === COFFEE_CATEGORY_ID);
      const pastry = menu.find((group) => group.id === PASTRY_CATEGORY_ID);
      expect(coffee?.items.map((item) => item.name)).toEqual(['Latte', 'Drip Coffee']);
      // The single-location croissant is visible at downtown.
      expect(pastry?.items.map((item) => item.name)).toEqual(['Croissant']);
    });

    it('applies the availability rule and hides categories left empty at the airport', async () => {
      const menu = await service.getCatalog(AIRPORT_LOCATION_ID);

      // Drip is absent-at-airport, croissant is downtown-only → Pastry becomes empty and is hidden.
      expect(menu.map((group) => group.name)).toEqual(['Coffee']);
      const coffee = menu.find((group) => group.id === COFFEE_CATEGORY_ID);
      expect(coffee?.items.map((item) => item.name)).toEqual(['Latte']);
    });

    it('resolves the item "from" price from its variations', async () => {
      const menu = await service.getCatalog(DOWNTOWN_LOCATION_ID);
      const items = menu.flatMap((group) => group.items);
      const latte = items.find((item) => item.name === 'Latte');
      const croissant = items.find((item) => item.name === 'Croissant');

      expect(latte?.price).toEqual({ amount: LATTE_PRICE, currency: 'USD' });
      expect(croissant?.price).toEqual({ amount: CROISSANT_PRICE, currency: 'USD' });
    });
  });

  describe('getCategories', () => {
    it('returns only non-empty category headers for the location', async () => {
      expect(await service.getCategories(AIRPORT_LOCATION_ID)).toEqual([
        { id: COFFEE_CATEGORY_ID, name: 'Coffee' },
      ]);
    });
  });

  describe('getItems (flat)', () => {
    it('returns every visible item at downtown', async () => {
      const items = await service.getItems(DOWNTOWN_LOCATION_ID);
      expect(items.map((item) => item.name)).toEqual(['Latte', 'Drip Coffee', 'Croissant']);
    });

    it('shows the single-location item only at its location', async () => {
      const downtown = await service.getItems(DOWNTOWN_LOCATION_ID);
      const airport = await service.getItems(AIRPORT_LOCATION_ID);

      expect(downtown.some((item) => item.name === 'Croissant')).toBe(true);
      expect(airport.some((item) => item.name === 'Croissant')).toBe(false);
      // absent-at-airport also removes drip, leaving only the everywhere latte.
      expect(airport.map((item) => item.name)).toEqual(['Latte']);
    });

    it('narrows to a single category when categoryId is given', async () => {
      const coffee = await service.getItems(DOWNTOWN_LOCATION_ID, COFFEE_CATEGORY_ID);
      expect(coffee.map((item) => item.name)).toEqual(['Latte', 'Drip Coffee']);
    });
  });
});
