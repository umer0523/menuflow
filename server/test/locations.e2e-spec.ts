import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { ClientInternalError } from '../src/common/errors/client-internal.error';
import { SquareService } from '../src/square/square.service';
import type { SquareLocationModel } from '../src/square/square.types';
import { createSquareServiceMock, type SquareServiceMock } from './utils/square-service.mock';

const LOCATION_MODELS: SquareLocationModel[] = [
  {
    id: 'loc-downtown',
    name: 'Downtown',
    timezone: 'America/New_York',
    currency: 'USD',
    status: 'ACTIVE',
  },
  {
    id: 'loc-airport',
    name: 'Airport',
    timezone: 'America/Chicago',
    currency: 'USD',
    status: 'ACTIVE',
  },
];

describe('Locations (e2e)', () => {
  let app: INestApplication;
  let square: SquareServiceMock;

  beforeEach(async () => {
    square = createSquareServiceMock();
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

  it('GET /locations returns normalized DTOs', async () => {
    square.getLocations.mockResolvedValue(LOCATION_MODELS);

    const response = await request(app.getHttpServer()).get('/locations').expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toEqual({
      id: 'loc-downtown',
      name: 'Downtown',
      timezone: 'America/New_York',
      currency: 'USD',
      status: 'ACTIVE',
    });
    expect(square.getLocations).toHaveBeenCalledTimes(1);
  });

  it('surfaces a Square failure as the standard error envelope', async () => {
    square.getLocations.mockRejectedValue(new ClientInternalError('Failed to reach Square'));

    const response = await request(app.getHttpServer()).get('/locations').expect(500);

    // SquareService already maps upstream failures to this safe, generic message (M2), so the
    // envelope carries it without leaking any raw Square detail.
    expect(response.body).toMatchObject({
      statusCode: 500,
      path: '/locations',
      message: 'Failed to reach Square',
    });
    expect(response.body).toHaveProperty('timestamp');
  });
});
