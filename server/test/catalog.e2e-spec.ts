import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { ClientInternalError } from '../src/common/errors/client-internal.error';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { SquareService } from '../src/square/square.service';
import { createSquareServiceMock, type SquareServiceMock } from './utils/square-service.mock';
import {
  AIRPORT_LOCATION_ID,
  CATALOG_SNAPSHOT,
  COFFEE_CATEGORY_ID,
  DOWNTOWN_LOCATION_ID,
  LATTE_IMAGE_URL,
} from './utils/catalog-snapshot.fixture';

describe('Catalog (e2e)', () => {
  let app: INestApplication;
  let square: SquareServiceMock;

  beforeEach(async () => {
    square = createSquareServiceMock();
    square.getCatalog.mockResolvedValue(CATALOG_SNAPSHOT);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SquareService)
      .useValue(square)
      .compile();

    app = moduleRef.createNestApplication();
    // Mirror the production request contract from main.ts so envelopes/validation match.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /catalog', () => {
    it('returns the grouped menu for a location', async () => {
      const response = await request(app.getHttpServer())
        .get('/catalog')
        .query({ locationId: DOWNTOWN_LOCATION_ID })
        .expect(200);

      expect(response.body.map((group: { name: string }) => group.name)).toEqual([
        'Coffee',
        'Pastry',
      ]);
    });

    it('hides categories that are empty at the location (availability rule)', async () => {
      const response = await request(app.getHttpServer())
        .get('/catalog')
        .query({ locationId: AIRPORT_LOCATION_ID })
        .expect(200);

      // Pastry (downtown-only croissant) drops out; drip is absent at the airport.
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Coffee');
      expect(response.body[0].items.map((item: { name: string }) => item.name)).toEqual(['Latte']);
    });

    it('rejects a request missing the required locationId', async () => {
      await request(app.getHttpServer()).get('/catalog').expect(400);
    });
  });

  describe('GET /categories', () => {
    it('returns non-empty category headers for the location', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .query({ locationId: AIRPORT_LOCATION_ID })
        .expect(200);

      expect(response.body).toEqual([{ id: COFFEE_CATEGORY_ID, name: 'Coffee' }]);
    });
  });

  describe('GET /items', () => {
    it('returns the single-location item only at its location', async () => {
      const downtown = await request(app.getHttpServer())
        .get('/items')
        .query({ locationId: DOWNTOWN_LOCATION_ID })
        .expect(200);
      const airport = await request(app.getHttpServer())
        .get('/items')
        .query({ locationId: AIRPORT_LOCATION_ID })
        .expect(200);

      expect(downtown.body.map((item: { name: string }) => item.name)).toContain('Croissant');
      expect(airport.body.map((item: { name: string }) => item.name)).not.toContain('Croissant');
    });

    it('narrows items by categoryId', async () => {
      const response = await request(app.getHttpServer())
        .get('/items')
        .query({ locationId: DOWNTOWN_LOCATION_ID, categoryId: COFFEE_CATEGORY_ID })
        .expect(200);

      expect(response.body.map((item: { name: string }) => item.name)).toEqual([
        'Latte',
        'Drip Coffee',
      ]);
    });
  });

  describe('GET /items/:id', () => {
    it('returns item detail with resolved image URLs and variations', async () => {
      const response = await request(app.getHttpServer())
        .get('/items/item-latte')
        .query({ locationId: DOWNTOWN_LOCATION_ID })
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'item-latte',
        name: 'Latte',
        imageUrls: [LATTE_IMAGE_URL],
      });
      expect(response.body.variations.map((v: { name: string }) => v.name)).toEqual([
        'Small',
        'Large',
      ]);
    });

    it('404s for an unknown item', async () => {
      await request(app.getHttpServer())
        .get('/items/item-missing')
        .query({ locationId: DOWNTOWN_LOCATION_ID })
        .expect(404);
    });

    it('404s for an item not visible at the location', async () => {
      await request(app.getHttpServer())
        .get('/items/item-croissant')
        .query({ locationId: AIRPORT_LOCATION_ID })
        .expect(404);
    });

    it('400s when locationId is missing', async () => {
      await request(app.getHttpServer()).get('/items/item-latte').expect(400);
    });
  });

  it('surfaces a Square failure as the standard error envelope', async () => {
    square.getCatalog.mockRejectedValue(new ClientInternalError('Failed to reach Square'));

    const response = await request(app.getHttpServer())
      .get('/catalog')
      .query({ locationId: DOWNTOWN_LOCATION_ID })
      .expect(500);

    expect(response.body).toMatchObject({
      statusCode: 500,
      message: 'Failed to reach Square',
    });
    expect(response.body.path).toContain('/catalog');
  });
});
