import { randomUUID } from 'node:crypto';

import { Logger, type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Square, SquareClient } from 'square';

import { AppModule } from '../src/app.module';
import { SQUARE_CLIENT } from '../src/square/square-client.provider';

/**
 * One-shot sandbox seeder for local development. Provisions the challenge's target data set —
 * 2 locations, 7 categories, 14 items (with priced variations), including one item absent at the
 * second location and one present *only* there (proves the location-availability rule), plus
 * Breakfast / Lunch / Dinner categories gated by `AVAILABILITY_PERIOD` objects (proves the
 * time-of-day rule) — all verifiable end-to-end against the real sandbox.
 *
 * Writes go through the raw SDK client (via the `SQUARE_CLIENT` DI token) rather than
 * `SquareService`: the app's seam is deliberately read-only, and seeding is a dev tool, not an
 * app capability. Idempotent by guard, not by upsert: it refuses to run when a second location
 * or any catalog item already exists, so re-runs can't duplicate `#`-temp-id objects. Pass
 * `--reset` (or `SEED_RESET=1`) to wipe the catalog first and reapply over existing data.
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
  { key: 'breakfast', name: 'Breakfast' },
  { key: 'lunch', name: 'Lunch' },
  { key: 'dinner', name: 'Dinner' },
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
  {
    key: 'oatmeal',
    name: 'Steel-Cut Oatmeal',
    description: 'Served with brown sugar and fresh berries. Available 7–11 AM.',
    categoryKey: 'breakfast',
    variations: [{ name: 'Regular', cents: 650 }],
  },
  {
    key: 'avocado-toast',
    name: 'Avocado Toast',
    description: 'Multigrain with smashed avocado and everything seasoning. Available 7–11 AM.',
    categoryKey: 'breakfast',
    variations: [{ name: 'Regular', cents: 875 }],
  },
  {
    key: 'soup-of-the-day',
    name: 'Soup of the Day',
    description: "Ask your barista for today's selection. Available 11 AM–3 PM.",
    categoryKey: 'lunch',
    variations: [
      { name: 'Cup', cents: 650 },
      { name: 'Bowl', cents: 850 },
    ],
  },
  {
    key: 'grilled-chicken-salad',
    name: 'Grilled Chicken Salad',
    description:
      'Mixed greens, cherry tomatoes, cucumber, lemon vinaigrette. Available 11 AM–3 PM.',
    categoryKey: 'lunch',
    variations: [{ name: 'Regular', cents: 1200 }],
  },
  {
    key: 'pasta-primavera',
    name: 'Pasta Primavera',
    description: 'Seasonal vegetables, olive oil, parmesan. Available 5–10 PM.',
    categoryKey: 'dinner',
    variations: [{ name: 'Regular', cents: 1600 }],
  },
  {
    key: 'ny-strip',
    name: 'NY Strip',
    description: '10 oz dry-aged strip, served with roasted potatoes. Available 5–10 PM.',
    categoryKey: 'dinner',
    variations: [
      { name: 'Regular', cents: 3200 },
      { name: 'Add truffle butter', cents: 3700 },
    ],
  },
];

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

/** One `AVAILABILITY_PERIOD` object per day for the Breakfast window (07:00–11:00, every day). */
const BREAKFAST_PERIOD_OBJECTS: Square.CatalogObject[] = DAYS_OF_WEEK.map((day) => ({
  type: 'AVAILABILITY_PERIOD',
  id: `#avail-breakfast-${day.toLowerCase()}`,
  availabilityPeriodData: { dayOfWeek: day, startLocalTime: '07:00:00', endLocalTime: '11:00:00' },
}));

const BREAKFAST_PERIOD_IDS: string[] = DAYS_OF_WEEK.map(
  (day) => `#avail-breakfast-${day.toLowerCase()}`,
);

/** Lunch window: 11:00 AM – 3:00 PM every day. */
const LUNCH_PERIOD_OBJECTS: Square.CatalogObject[] = DAYS_OF_WEEK.map((day) => ({
  type: 'AVAILABILITY_PERIOD',
  id: `#avail-lunch-${day.toLowerCase()}`,
  availabilityPeriodData: { dayOfWeek: day, startLocalTime: '11:00:00', endLocalTime: '15:00:00' },
}));

const LUNCH_PERIOD_IDS: string[] = DAYS_OF_WEEK.map((day) => `#avail-lunch-${day.toLowerCase()}`);

/** Dinner window: 5:00 PM – 10:00 PM every day. */
const DINNER_PERIOD_OBJECTS: Square.CatalogObject[] = DAYS_OF_WEEK.map((day) => ({
  type: 'AVAILABILITY_PERIOD',
  id: `#avail-dinner-${day.toLowerCase()}`,
  availabilityPeriodData: { dayOfWeek: day, startLocalTime: '17:00:00', endLocalTime: '22:00:00' },
}));

const DINNER_PERIOD_IDS: string[] = DAYS_OF_WEEK.map((day) => `#avail-dinner-${day.toLowerCase()}`);

function toCategoryObject(
  category: { key: string; name: string },
  availabilityPeriodIds: string[] = [],
): Square.CatalogObject {
  return {
    type: 'CATEGORY',
    id: `#${category.key}`,
    presentAtAllLocations: true,
    categoryData: {
      name: category.name,
      ...(availabilityPeriodIds.length > 0 ? { availabilityPeriodIds } : {}),
    },
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

/**
 * Deletes every existing catalog object so a reseed starts from a clean slate. Opt-in — only runs
 * when `--reset` (or `SEED_RESET=1`) is passed, because it is destructive. Used to reapply the seed
 * when a catalog already exists (e.g. to add the availability-period categories to an old sandbox).
 */
async function resetCatalog(client: SquareClient, logger: Logger): Promise<void> {
  const ids: string[] = [];
  const page = await client.catalog.list({ types: 'ITEM,CATEGORY,IMAGE,AVAILABILITY_PERIOD' });
  for await (const object of page) {
    if (object.id) {
      ids.push(object.id);
    }
  }
  if (ids.length === 0) {
    logger.log('Reset: catalog already empty.');
    return;
  }
  // `batchDelete` accepts up to 200 ids per call; deleting an ITEM cascades to its variations.
  for (let i = 0; i < ids.length; i += 200) {
    await client.catalog.batchDelete({ objectIds: ids.slice(i, i + 200) });
  }
  logger.log(`Reset: deleted ${ids.length} catalog object(s).`);
}

async function seedCatalog(
  client: SquareClient,
  secondLocationId: string,
  logger: Logger,
  reset: boolean,
): Promise<void> {
  if (!reset) {
    const page = await client.catalog.list({ types: 'ITEM' });
    for await (const existing of page) {
      logger.log(
        `Catalog already has items (e.g. ${existing.id}) — skipping catalog seed. ` +
          `Pass --reset (or SEED_RESET=1) to wipe and reseed.`,
      );
      return;
    }
  }
  const PERIOD_IDS_BY_KEY: Record<string, string[]> = {
    breakfast: BREAKFAST_PERIOD_IDS,
    lunch: LUNCH_PERIOD_IDS,
    dinner: DINNER_PERIOD_IDS,
  };
  const objects: Square.CatalogObject[] = [
    ...BREAKFAST_PERIOD_OBJECTS,
    ...LUNCH_PERIOD_OBJECTS,
    ...DINNER_PERIOD_OBJECTS,
    ...SEED_CATEGORIES.map((cat) => toCategoryObject(cat, PERIOD_IDS_BY_KEY[cat.key] ?? [])),
    ...SEED_ITEMS.map((item) => toItemObject(item, secondLocationId)),
  ];
  await client.catalog.batchUpsert({
    idempotencyKey: randomUUID(),
    batches: [{ objects }],
  });
  const totalPeriods =
    BREAKFAST_PERIOD_OBJECTS.length + LUNCH_PERIOD_OBJECTS.length + DINNER_PERIOD_OBJECTS.length;
  logger.log(
    `Seeded ${totalPeriods} availability periods, ` +
      `${SEED_CATEGORIES.length} categories, and ${SEED_ITEMS.length} items ` +
      `(breakfast 7–11 AM, lunch 11 AM–3 PM, dinner 5–10 PM).`,
  );
}

async function main(): Promise<void> {
  const logger = new Logger('SquareSeed');
  const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: false,
  });
  try {
    const client = app.get<SquareClient>(SQUARE_CLIENT);
    const reset = process.argv.includes('--reset') || process.env.SEED_RESET === '1';
    const secondLocationId = await ensureSecondLocation(client, logger);
    if (secondLocationId === '') {
      throw new Error('Could not resolve a second location id; aborting catalog seed.');
    }
    if (reset) {
      await resetCatalog(client, logger);
    }
    await seedCatalog(client, secondLocationId, logger, reset);
    logger.log('Seed complete — verify with `pnpm --filter @menuflow/server smoke:square`.');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void main();
