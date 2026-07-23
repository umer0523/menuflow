import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Square, SquareError } from 'square';

import { ClientInternalError } from '../common/errors/client-internal.error';
import { SQUARE_CLIENT } from './square-client.provider';
import { SquareService } from './square.service';
import {
  AIRPORT_LOCATION_ID,
  CATALOG_OBJECTS,
  DOWNTOWN_LOCATION_ID,
  ITEMS,
  TWO_LOCATIONS,
} from '../../test/utils/square-fixtures';

interface MockSquareClient {
  locations: { list: jest.Mock };
  catalog: { list: jest.Mock };
}

/** Mimics the SDK's async-iterable `Page`, which follows pagination cursors transparently. */
function asPage(objects: Square.CatalogObject[]): AsyncIterable<Square.CatalogObject> {
  return {
    async *[Symbol.asyncIterator]() {
      yield* objects;
    },
  };
}

describe('SquareService', () => {
  let service: SquareService;
  let client: MockSquareClient;
  let errorLog: jest.SpyInstance;

  beforeEach(async () => {
    // Silence + capture the structured error log so expected-failure tests stay quiet and can
    // assert that Square failures are logged before being mapped.
    errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    client = {
      locations: { list: jest.fn() },
      catalog: { list: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [SquareService, { provide: SQUARE_CLIENT, useValue: client }],
    }).compile();
    service = moduleRef.get(SquareService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getLocations', () => {
    it('maps locations and caches the result (no second Square call)', async () => {
      client.locations.list.mockResolvedValue({ locations: TWO_LOCATIONS });

      const first = await service.getLocations();
      const second = await service.getLocations();

      expect(first).toHaveLength(2);
      expect(first[0]).toMatchObject({ id: DOWNTOWN_LOCATION_ID, name: 'Downtown' });
      expect(second).toBe(first);
      expect(client.locations.list).toHaveBeenCalledTimes(1);
    });

    it('maps a Square failure to a ClientInternalError', async () => {
      client.locations.list.mockRejectedValue(
        new SquareError({ message: 'boom', statusCode: 500 }),
      );

      await expect(service.getLocations()).rejects.toBeInstanceOf(ClientInternalError);
      expect(errorLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCatalog', () => {
    it('follows pagination and normalizes items + categories', async () => {
      client.catalog.list.mockResolvedValue(asPage(CATALOG_OBJECTS));

      const snapshot = await service.getCatalog();

      expect(snapshot.items).toHaveLength(ITEMS.length);
      expect(snapshot.categories).toHaveLength(2);

      const croissant = snapshot.items.find((item) => item.id === 'item-croissant');
      expect(croissant).toMatchObject({
        name: 'Croissant',
        presentAtAllLocations: false,
        presentAtLocationIds: [DOWNTOWN_LOCATION_ID],
        variations: [expect.objectContaining({ price: { amount: 375, currency: 'USD' } })],
      });

      const drip = snapshot.items.find((item) => item.id === 'item-drip');
      expect(drip?.absentAtLocationIds).toEqual([AIRPORT_LOCATION_ID]);
    });

    it('caches the snapshot (no second Square call)', async () => {
      client.catalog.list.mockResolvedValue(asPage(CATALOG_OBJECTS));

      const first = await service.getCatalog();
      const second = await service.getCatalog();

      expect(second).toBe(first);
      expect(client.catalog.list).toHaveBeenCalledTimes(1);
    });

    it('maps a rate-limit (429) failure to a ClientInternalError', async () => {
      client.catalog.list.mockRejectedValue(
        new SquareError({ message: 'rate limited', statusCode: 429 }),
      );

      await expect(service.getCatalog()).rejects.toBeInstanceOf(ClientInternalError);
      expect(errorLog).toHaveBeenCalledTimes(1);
    });
  });
});
