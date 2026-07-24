import type { SquareService } from '../../square/square.service';
import { CatalogService } from './catalog.service';
import {
  createSquareServiceMock,
  type SquareServiceMock,
} from '../../../test/utils/square-service.mock';
import { ClientNotFoundError } from '../../common/errors/client-not-found.error';
import {
  AIRPORT_LOCATION_ID,
  CATALOG_SNAPSHOT,
  COFFEE_CATEGORY_ID,
  CROISSANT_PRICE,
  DOWNTOWN_LOCATION_ID,
  LATTE_IMAGE_URL,
  LATTE_LARGE_PRICE,
  LATTE_PRICE,
  PASTRY_CATEGORY_ID,
  SNAPSHOT_LOCATIONS,
} from '../../../test/utils/catalog-snapshot.fixture';
import type { AvailabilityPeriodModel, CatalogSnapshot } from '../../square/square.types';

describe('CatalogService', () => {
  let square: SquareServiceMock;
  let service: CatalogService;

  beforeEach(() => {
    square = createSquareServiceMock();
    square.getCatalog.mockResolvedValue(CATALOG_SNAPSHOT);
    square.getLocations.mockResolvedValue(SNAPSHOT_LOCATIONS);
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

    it('marks categories with no availability periods as available: true with null windows', async () => {
      const menu = await service.getCatalog(DOWNTOWN_LOCATION_ID);
      expect(menu.every((group) => group.available)).toBe(true);
      expect(menu.every((group) => group.availabilityWindows === null)).toBe(true);
    });

    it('marks a time-limited category available: false when outside its window', async () => {
      const PERIOD_ID = 'period-breakfast';
      const breakfastPeriod: AvailabilityPeriodModel = {
        id: PERIOD_ID,
        // SUN window — test will always run on a non-Sunday in CI (and if it does run Sunday,
        // the start/end window of 00:00:00–00:01:00 makes false practically guaranteed).
        dayOfWeek: 'SUN',
        startLocalTime: '00:00:00',
        endLocalTime: '00:01:00',
      };
      const snapshotWithBreakfast: CatalogSnapshot = {
        ...CATALOG_SNAPSHOT,
        categories: [
          ...CATALOG_SNAPSHOT.categories,
          {
            id: 'cat-breakfast',
            name: 'Breakfast',
            presentAtAllLocations: true,
            presentAtLocationIds: [],
            absentAtLocationIds: [],
            availabilityPeriodIds: [PERIOD_ID],
          },
        ],
        items: [
          ...CATALOG_SNAPSHOT.items,
          {
            id: 'item-oatmeal',
            name: 'Oatmeal',
            categoryId: 'cat-breakfast',
            imageIds: [],
            variations: [{ id: 'var-oatmeal', price: { amount: 650, currency: 'USD' } }],
            presentAtAllLocations: true,
            presentAtLocationIds: [],
            absentAtLocationIds: [],
          },
        ],
        availabilityPeriods: { [PERIOD_ID]: breakfastPeriod },
      };
      square.getCatalog.mockResolvedValue(snapshotWithBreakfast);

      const menu = await service.getCatalog(DOWNTOWN_LOCATION_ID);

      const breakfast = menu.find((g) => g.id === 'cat-breakfast');
      expect(breakfast?.available).toBe(false);
      // SUN window with no matching day → empty array (has periods, none apply today)
      expect(Array.isArray(breakfast?.availabilityWindows)).toBe(true);
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

    it('marks items available: true with null windows when their category has no periods', async () => {
      const items = await service.getItems(DOWNTOWN_LOCATION_ID);
      expect(items.every((item) => item.available)).toBe(true);
      expect(items.every((item) => item.availabilityWindows === null)).toBe(true);
    });

    it('inherits available: false from a time-limited category (outside its window)', async () => {
      const PERIOD_ID = 'period-breakfast';
      const snapshotWithBreakfast: CatalogSnapshot = {
        ...CATALOG_SNAPSHOT,
        categories: [
          ...CATALOG_SNAPSHOT.categories,
          {
            id: 'cat-breakfast',
            name: 'Breakfast',
            presentAtAllLocations: true,
            presentAtLocationIds: [],
            absentAtLocationIds: [],
            availabilityPeriodIds: [PERIOD_ID],
          },
        ],
        items: [
          ...CATALOG_SNAPSHOT.items,
          {
            id: 'item-oatmeal',
            name: 'Oatmeal',
            categoryId: 'cat-breakfast',
            imageIds: [],
            variations: [{ id: 'var-oatmeal', price: { amount: 650, currency: 'USD' } }],
            presentAtAllLocations: true,
            presentAtLocationIds: [],
            absentAtLocationIds: [],
          },
        ],
        // SUN 00:00–00:01 window → practically never matches (see the getCatalog test above).
        availabilityPeriods: {
          [PERIOD_ID]: {
            id: PERIOD_ID,
            dayOfWeek: 'SUN',
            startLocalTime: '00:00:00',
            endLocalTime: '00:01:00',
          },
        },
      };
      square.getCatalog.mockResolvedValue(snapshotWithBreakfast);

      const items = await service.getItems(DOWNTOWN_LOCATION_ID);
      const oatmeal = items.find((item) => item.name === 'Oatmeal');
      expect(oatmeal?.available).toBe(false);
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

  describe('getItem (detail)', () => {
    it('returns the item with resolved image URLs, the "from" price, and all variations', async () => {
      const latte = await service.getItem('item-latte', DOWNTOWN_LOCATION_ID);

      expect(latte).toMatchObject({
        id: 'item-latte',
        name: 'Latte',
        description: 'Espresso with steamed milk',
        price: { amount: LATTE_PRICE, currency: 'USD' },
        imageUrls: [LATTE_IMAGE_URL],
      });
      expect(latte.variations).toEqual([
        { id: 'var-latte', name: 'Small', price: { amount: LATTE_PRICE, currency: 'USD' } },
        {
          id: 'var-latte-lg',
          name: 'Large',
          price: { amount: LATTE_LARGE_PRICE, currency: 'USD' },
        },
      ]);
    });

    it('resolves no image URLs for an item without images', async () => {
      const drip = await service.getItem('item-drip', DOWNTOWN_LOCATION_ID);
      expect(drip.imageUrls).toEqual([]);
    });

    it('carries availability inherited from the item category', async () => {
      const latte = await service.getItem('item-latte', DOWNTOWN_LOCATION_ID);
      expect(latte.available).toBe(true);
      expect(latte.availabilityWindows).toBeNull();
    });

    it('throws NotFound for an unknown id', async () => {
      await expect(service.getItem('item-missing', DOWNTOWN_LOCATION_ID)).rejects.toBeInstanceOf(
        ClientNotFoundError,
      );
    });

    it('throws NotFound when the item is not visible at the location', async () => {
      // Croissant is downtown-only, so it isn't on the airport's menu.
      await expect(service.getItem('item-croissant', AIRPORT_LOCATION_ID)).rejects.toBeInstanceOf(
        ClientNotFoundError,
      );
    });
  });
});
