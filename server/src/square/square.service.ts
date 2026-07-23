import { Inject, Injectable, Logger } from '@nestjs/common';
import { Square, SquareClient, SquareError } from 'square';

import { TtlCache } from '../common/cache/ttl-cache';
import { ClientInternalError } from '../common/errors/client-internal.error';
import { toMoney } from './money.util';
import { SQUARE_CLIENT } from './square-client.provider';
import { CATALOG_LIST_TYPES, SQUARE_CACHE } from './square.constants';
import { isCatalogCategory, isCatalogItem, isItemVariation } from './square.guards';
import type {
  CatalogCategoryModel,
  CatalogItemModel,
  CatalogSnapshot,
  ItemVariationModel,
  SquareLocationModel,
} from './square.types';

/** Structural view of the availability fields shared (but not via a common base) by items + categories. */
interface AvailabilitySource {
  presentAtAllLocations?: boolean;
  presentAtLocationIds?: string[];
  absentAtLocationIds?: string[];
}

/**
 * The **sole** Square touchpoint (architecture §5). Owns the SDK client, pagination, the
 * in-memory TTL cache, and mapping Square's SDK objects → internal models. Feature services
 * (M3/M4) depend on this seam, never on Square directly — which keeps it mockable in tests.
 */
@Injectable()
export class SquareService {
  private readonly logger = new Logger(SquareService.name);
  private readonly locationsCache = new TtlCache<SquareLocationModel[]>(
    SQUARE_CACHE.LOCATIONS_TTL_MS,
  );
  private readonly catalogCache = new TtlCache<CatalogSnapshot>(SQUARE_CACHE.CATALOG_TTL_MS);

  constructor(@Inject(SQUARE_CLIENT) private readonly client: SquareClient) {}

  async getLocations(): Promise<SquareLocationModel[]> {
    const cached = this.locationsCache.get(SQUARE_CACHE.LOCATIONS_KEY);
    if (cached) {
      return cached;
    }
    try {
      const { locations = [] } = await this.client.locations.list();
      const models = locations
        .map((location) => this.mapLocation(location))
        .filter((location) => location.id !== '');
      this.locationsCache.set(SQUARE_CACHE.LOCATIONS_KEY, models);
      return models;
    } catch (error) {
      throw this.toClientError('getLocations', error);
    }
  }

  async getCatalog(): Promise<CatalogSnapshot> {
    const cached = this.catalogCache.get(SQUARE_CACHE.CATALOG_KEY);
    if (cached) {
      return cached;
    }
    try {
      const page = await this.client.catalog.list({ types: CATALOG_LIST_TYPES });
      const items: CatalogItemModel[] = [];
      const categories: CatalogCategoryModel[] = [];
      // The SDK `Page` is async-iterable and follows pagination cursors transparently,
      // so this single loop consumes every page of the catalog.
      for await (const object of page) {
        if (isCatalogItem(object)) {
          items.push(this.mapItem(object));
        } else if (isCatalogCategory(object)) {
          const category = this.mapCategory(object);
          if (category.id !== '') {
            categories.push(category);
          }
        }
      }
      const snapshot: CatalogSnapshot = { items, categories };
      this.catalogCache.set(SQUARE_CACHE.CATALOG_KEY, snapshot);
      return snapshot;
    } catch (error) {
      throw this.toClientError('getCatalog', error);
    }
  }

  private mapLocation(location: Square.Location): SquareLocationModel {
    return {
      id: location.id ?? '',
      name: location.name ?? '',
      timezone: location.timezone ?? '',
      currency: location.currency ?? '',
      status: location.status ?? '',
    };
  }

  private mapItem(object: Square.CatalogObject.Item): CatalogItemModel {
    const data = object.itemData;
    const variations: ItemVariationModel[] = (data?.variations ?? [])
      .filter(isItemVariation)
      .map((variation) => ({
        id: variation.id,
        name: variation.itemVariationData?.name ?? undefined,
        price: toMoney(variation.itemVariationData?.priceMoney),
      }));
    return {
      id: object.id,
      name: data?.name ?? '',
      description: data?.description ?? undefined,
      categoryId: this.resolveCategoryId(data),
      imageIds: data?.imageIds ?? [],
      variations,
      ...this.availability(object),
    };
  }

  private mapCategory(object: Square.CatalogObject.Category): CatalogCategoryModel {
    return {
      // Category `id` is optional in the SDK; empty-id categories are dropped by the caller.
      id: object.id ?? '',
      name: object.categoryData?.name ?? '',
      ...this.availability(object),
    };
  }

  private availability(object: AvailabilitySource): {
    presentAtAllLocations: boolean;
    presentAtLocationIds: string[];
    absentAtLocationIds: string[];
  } {
    return {
      // Square defaults `present_at_all_locations` to true when unset.
      presentAtAllLocations: object.presentAtAllLocations ?? true,
      presentAtLocationIds: object.presentAtLocationIds ?? [],
      absentAtLocationIds: object.absentAtLocationIds ?? [],
    };
  }

  private resolveCategoryId(data: Square.CatalogItem | undefined): string | undefined {
    // Square deprecated `categoryId` in favor of `reportingCategory`/`categories`; prefer the
    // newer fields and fall back to the legacy one so older seed data still resolves.
    return (
      data?.reportingCategory?.id ?? data?.categories?.[0]?.id ?? data?.categoryId ?? undefined
    );
  }

  private toClientError(operation: string, error: unknown): ClientInternalError {
    const statusCode = error instanceof SquareError ? error.statusCode : undefined;
    // Square upstream failures (incl. exhausted rate-limit retries) are infrastructure errors:
    // log with structured context, then surface a generic 500 that never leaks Square detail.
    this.logger.error({
      operation,
      statusCode,
      message: error instanceof Error ? error.message : String(error),
    });
    return new ClientInternalError('Failed to reach Square');
  }
}
