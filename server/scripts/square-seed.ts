import { randomUUID } from 'node:crypto';

import { Logger, type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Square, SquareClient } from 'square';

import { AppModule } from '../src/app.module';
import { SQUARE_CLIENT } from '../src/square/square-client.provider';

/**
 * One-shot sandbox seeder for local development. Provisions the challenge's target data set —
 * 2 locations, 4 categories, 8 items (with priced variations), including one item absent at the
 * second location and one present *only* there — so the location-availability rule is provable
 * end-to-end against the real sandbox.
 *
 * Writes go through the raw SDK client (via the `SQUARE_CLIENT` DI token) rather than
 * `SquareService`: the app's seam is deliberately read-only, and seeding is a dev tool, not an
 * app capability. Idempotent by guard, not by upsert: it refuses to run when a second location
 * or any catalog item already exists, so re-runs can't duplicate `#`-temp-id objects.
 *
 * Run: `pnpm --filter @menuflow/server seed:square` (needs `server/.env` sandbox credentials)
 */

const SECOND_LOCATION: Square.CreateLocationRequest = {
  location: {
    name: 'Uptown',
    description: 'Second MenuFlow location — proves per-location availability.',
    address: {
      addressLine1: '500 Uptown Ave',
      locality: 'New York',
      administrativeDistrictLevel1: 'NY',
      postalCode: '10027',
    },
  },
};

interface SeedVariation {
  name: string;
  cents: number;
}

interface SeedItem {
  key: string;
  name: string;
  description: string;
  categoryKey: string;
  variations: SeedVariation[];
  /** Omitted → available everywhere (Square's default). */
  availability?: 'absent-at-second' | 'only-at-second';
}

const CURRENCY = 'USD';

const SEED_CATEGORIES: ReadonlyArray<{ key: string; name: string }> = [
  { key: 'coffee', name: 'Coffee' },
  { key: 'pastries', name: 'Pastries' },
  { key: 'sandwiches', name: 'Sandwiches' },
  { key: 'seasonal', name: 'Seasonal' },
];

const SEED_ITEMS: ReadonlyArray<SeedItem> = [
  {
    key: 'latte',
    name: 'Latte',
    description: 'Espresso with steamed milk and a thin layer of foam.',
    categoryKey: 'coffee',
    variations: [
      { name: 'Small', cents: 450 },
      { name: 'Large', cents: 550 },
    ],
  },
  {
    key: 'espresso',
    name: 'Espresso',
    description: 'A double shot, pulled short.',
    categoryKey: 'coffee',
    variations: [{ name: 'Double', cents: 350 }],
  },
  {
    key: 'drip-coffee',
    name: 'Drip Coffee',
    description: 'Single-origin batch brew. Downtown exclusive.',
    categoryKey: 'coffee',
    variations: [{ name: 'Regular', cents: 300 }],
    availability: 'absent-at-second',
  },
  {
    key: 'croissant',
    name: 'Butter Croissant',
    description: 'Laminated overnight, baked every morning.',
    categoryKey: 'pastries',
    variations: [{ name: 'Regular', cents: 425 }],
  },
  {
    key: 'muffin',
    name: 'Blueberry Muffin',
    description: 'Wild blueberries, crumble top.',
    categoryKey: 'pastries',
    variations: [{ name: 'Regular', cents: 395 }],
  },
  {
    key: 'turkey-club',
    name: 'Turkey Club',
    description: 'Roast turkey, bacon, lettuce, tomato on sourdough.',
    categoryKey: 'sandwiches',
    variations: [
      { name: 'Half', cents: 700 },
      { name: 'Whole', cents: 1200 },
    ],
  },
  {
    key: 'caprese-panini',
    name: 'Caprese Panini',
    description: 'Fresh mozzarella, tomato, basil. Uptown exclusive.',
    categoryKey: 'sandwiches',
    variations: [{ name: 'Regular', cents: 950 }],
    availability: 'only-at-second',
  },
  {
    key: 'iced-spritz',
    name: 'Iced Citrus Spritz',
    description: 'Sparkling cold brew with orange and lemon.',
    categoryKey: 'seasonal',
    variations: [{ name: 'Regular', cents: 500 }],
  },
];

function toCategoryObject(category: { key: string; name: string }): Square.CatalogObject {
  return {
    type: 'CATEGORY',
    id: `#${category.key}`,
    presentAtAllLocations: true,
    categoryData: { name: category.name },
  };
}

function toItemObject(item: SeedItem, secondLocationId: string): Square.CatalogObject {
  const availability: Pick<
    Square.CatalogObject.Item,
    'presentAtAllLocations' | 'presentAtLocationIds' | 'absentAtLocationIds'
  > =
    item.availability === 'absent-at-second'
      ? { presentAtAllLocations: true, absentAtLocationIds: [secondLocationId] }
      : item.availability === 'only-at-second'
        ? { presentAtAllLocations: false, presentAtLocationIds: [secondLocationId] }
        : { presentAtAllLocations: true };

  return {
    type: 'ITEM',
    id: `#${item.key}`,
    ...availability,
    itemData: {
      name: item.name,
      description: item.description,
      categories: [{ id: `#${item.categoryKey}` }],
      reportingCategory: { id: `#${item.categoryKey}` },
      // Square rejects a variation whose availability is broader than its parent item's,
      // so the same availability fields are applied at both levels.
      variations: item.variations.map((variation) => ({
        type: 'ITEM_VARIATION',
        id: `#${item.key}-${variation.name.toLowerCase()}`,
        ...availability,
        itemVariationData: {
          itemId: `#${item.key}`,
          name: variation.name,
          pricingType: 'FIXED_PRICING',
          priceMoney: { amount: BigInt(variation.cents), currency: CURRENCY },
        },
      })),
    },
  };
}

async function ensureSecondLocation(client: SquareClient, logger: Logger): Promise<string> {
  const { locations = [] } = await client.locations.list();
  if (locations.length >= 2) {
    const existing = locations[1];
    logger.log(`Second location already exists: ${existing?.name} (${existing?.id}) — skipping.`);
    return existing?.id ?? '';
  }
  const { location } = await client.locations.create(SECOND_LOCATION);
  logger.log(`Created location: ${location?.name} (${location?.id})`);
  return location?.id ?? '';
}

async function seedCatalog(
  client: SquareClient,
  secondLocationId: string,
  logger: Logger,
): Promise<void> {
  const page = await client.catalog.list({ types: 'ITEM' });
  for await (const existing of page) {
    logger.log(`Catalog already has items (e.g. ${existing.id}) — skipping catalog seed.`);
    return;
  }
  const objects: Square.CatalogObject[] = [
    ...SEED_CATEGORIES.map(toCategoryObject),
    ...SEED_ITEMS.map((item) => toItemObject(item, secondLocationId)),
  ];
  await client.catalog.batchUpsert({
    idempotencyKey: randomUUID(),
    batches: [{ objects }],
  });
  logger.log(
    `Seeded ${SEED_CATEGORIES.length} categories and ${SEED_ITEMS.length} items ` +
      `(1 absent at the second location, 1 exclusive to it).`,
  );
}

async function main(): Promise<void> {
  const logger = new Logger('SquareSeed');
  const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: false,
  });
  try {
    const client = app.get<SquareClient>(SQUARE_CLIENT);
    const secondLocationId = await ensureSecondLocation(client, logger);
    if (secondLocationId === '') {
      throw new Error('Could not resolve a second location id; aborting catalog seed.');
    }
    await seedCatalog(client, secondLocationId, logger);
    logger.log('Seed complete — verify with `pnpm --filter @menuflow/server smoke:square`.');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void main();
