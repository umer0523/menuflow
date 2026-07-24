import { Injectable, Logger } from '@nestjs/common';

import { ClientNotFoundError } from '../../common/errors/client-not-found.error';
import {
  getTodayWindows,
  isAvailableNow,
  isItemVisibleAtLocation,
} from '../../square/availability.util';
import { resolveItemPrice } from '../../square/money.util';
import { SquareService } from '../../square/square.service';
import type {
  AvailabilityPeriodModel,
  CatalogCategoryModel,
  CatalogItemModel,
  ItemVariationModel,
  MoneyModel,
} from '../../square/square.types';
import { UNCATEGORIZED } from './catalog.constants';
import { AvailabilityWindowDto } from './dto/availability-window-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ItemDetailResponseDto } from './dto/item-detail-response.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemVariationResponseDto } from './dto/item-variation-response.dto';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import { MoneyResponseDto } from './dto/money-response.dto';

/** The availability projection shared by a category group and the items inheriting from it. */
interface ResolvedAvailability {
  available: boolean;
  availabilityWindows: AvailabilityWindowDto[] | null;
}

/** Availability for an item with no category or a category without periods: always orderable. */
const ALWAYS_AVAILABLE: ResolvedAvailability = { available: true, availabilityWindows: null };

/**
 * Business layer for the menu (core requirements #2 + #3). Reads the cached `CatalogSnapshot` from
 * the `SquareService` seam, applies the location-availability rule, and maps internal models →
 * response DTOs (the boundary that keeps Square/internal shapes from leaking to clients).
 *
 * `buildMenu` is the single source of truth: `/catalog` returns its groups, `/categories` projects
 * their headers, and `/items` is the flattened, optionally category-filtered view.
 */
@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private readonly square: SquareService) {}

  /** Grouped menu: visible, non-empty categories each with their location-visible items. */
  async getCatalog(locationId: string): Promise<MenuCategoryResponseDto[]> {
    return this.buildMenu(locationId);
  }

  /** Just the visible, non-empty category headers — feeds the category filter UI. */
  async getCategories(locationId: string): Promise<CategoryResponseDto[]> {
    const menu = await this.buildMenu(locationId);
    return menu.map(({ id, name }) => ({ id, name }));
  }

  /** Flat list of location-visible items, optionally narrowed to a single category. */
  async getItems(locationId: string, categoryId?: string): Promise<ItemResponseDto[]> {
    const [snapshot, locations] = await Promise.all([
      this.square.getCatalog(),
      this.square.getLocations(),
    ]);
    const timezone = locations.find((l) => l.id === locationId)?.timezone ?? 'UTC';
    const categoriesById = this.indexCategories(snapshot.categories);
    return snapshot.items
      .filter((item) => isItemVisibleAtLocation(item, locationId))
      .filter((item) => categoryId === undefined || item.categoryId === categoryId)
      .map((item) =>
        this.toItemDto(
          item,
          this.resolveItemAvailability(
            item,
            categoriesById,
            snapshot.availabilityPeriods,
            timezone,
          ),
        ),
      );
  }

  /**
   * Item detail (core requirement #5). 404s when the id is unknown **or** the item isn't visible at
   * the location — an item off this location's menu isn't reachable here, consistent with the list
   * endpoints. Resolves image URLs from the snapshot's `imageId → url` map (no extra Square call).
   */
  async getItem(itemId: string, locationId: string): Promise<ItemDetailResponseDto> {
    const [snapshot, locations] = await Promise.all([
      this.square.getCatalog(),
      this.square.getLocations(),
    ]);
    const item = snapshot.items.find((candidate) => candidate.id === itemId);
    if (!item || !isItemVisibleAtLocation(item, locationId)) {
      throw new ClientNotFoundError(`Item ${itemId} was not found`);
    }
    const timezone = locations.find((l) => l.id === locationId)?.timezone ?? 'UTC';
    const availability = this.resolveItemAvailability(
      item,
      this.indexCategories(snapshot.categories),
      snapshot.availabilityPeriods,
      timezone,
    );
    return {
      ...this.toItemDto(item, availability),
      imageUrls: item.imageIds
        .map((imageId) => snapshot.images[imageId])
        .filter((url): url is string => url !== undefined),
      variations: item.variations.map((variation) => this.toVariationDto(variation)),
    };
  }

  private async buildMenu(locationId: string): Promise<MenuCategoryResponseDto[]> {
    // Both calls hit the TTL cache on the hot path; Promise.all keeps cold misses concurrent.
    const [snapshot, locations] = await Promise.all([
      this.square.getCatalog(),
      this.square.getLocations(),
    ]);
    // Unknown locationId (e.g. race between deletion and cache refresh) → UTC fallback so all
    // categories default to available: true rather than throwing.
    const timezone = locations.find((l) => l.id === locationId)?.timezone ?? 'UTC';

    const visibleItems = snapshot.items.filter((item) => isItemVisibleAtLocation(item, locationId));
    const itemsByCategory = this.groupByCategory(visibleItems);
    const knownCategoryIds = new Set(snapshot.categories.map((category) => category.id));

    this.logDebug(locationId, timezone, snapshot.categories);

    // Emit categories in Square's own order, dropping any with no visible item here (hide empty).
    const groups: MenuCategoryResponseDto[] = [];
    for (const category of snapshot.categories) {
      const items = itemsByCategory.get(category.id);
      if (items && items.length > 0) {
        // The category and every item inside it share one availability computation.
        const availability = this.resolveAvailability(
          category.availabilityPeriodIds,
          snapshot.availabilityPeriods,
          timezone,
        );
        groups.push({
          id: category.id,
          name: category.name,
          items: items.map((i) => this.toItemDto(i, availability)),
          available: availability.available,
          availabilityWindows: availability.availabilityWindows,
        });
      }
    }

    // Defensive: a visible item whose category is missing from the snapshot still gets shown.
    const orphans = visibleItems.filter(
      (item) => item.categoryId === undefined || !knownCategoryIds.has(item.categoryId),
    );
    if (orphans.length > 0) {
      groups.push({
        id: UNCATEGORIZED.id,
        name: UNCATEGORIZED.name,
        items: orphans.map((item) => this.toItemDto(item, ALWAYS_AVAILABLE)),
        available: true,
        availabilityWindows: null,
      });
    }

    return groups;
  }

  /** Emits the resolved timezone, current local day/time, and per-category availability inputs. */
  private logDebug(
    locationId: string,
    timezone: string,
    categories: CatalogCategoryModel[],
  ): void {
    const nowLocal = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
    this.logger.debug(
      `buildMenu location=${locationId} timezone=${timezone} nowLocal=${nowLocal} — ` +
        `categories with periods: ` +
        JSON.stringify(
          categories
            .filter((c) => c.availabilityPeriodIds.length > 0)
            .map((c) => ({ name: c.name, periodIds: c.availabilityPeriodIds })),
        ),
    );
  }

  private indexCategories(
    categories: CatalogCategoryModel[],
  ): Map<string, CatalogCategoryModel> {
    return new Map(categories.map((category) => [category.id, category]));
  }

  private groupByCategory(items: CatalogItemModel[]): Map<string | undefined, CatalogItemModel[]> {
    const byCategory = new Map<string | undefined, CatalogItemModel[]>();
    for (const item of items) {
      const bucket = byCategory.get(item.categoryId);
      if (bucket) {
        bucket.push(item);
      } else {
        byCategory.set(item.categoryId, [item]);
      }
    }
    return byCategory;
  }

  private toItemDto(item: CatalogItemModel, availability: ResolvedAvailability): ItemResponseDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      price: this.toMoneyDto(resolveItemPrice(item)),
      imageIds: item.imageIds,
      available: availability.available,
      availabilityWindows: availability.availabilityWindows,
    };
  }

  /** Resolves a category's (or its items') availability from its periods in the location timezone. */
  private resolveAvailability(
    periodIds: string[],
    periods: Record<string, AvailabilityPeriodModel>,
    timezone: string,
  ): ResolvedAvailability {
    return {
      available: isAvailableNow(periodIds, periods, timezone),
      availabilityWindows: getTodayWindows(periodIds, periods, timezone),
    };
  }

  /** An item inherits the availability of its category; no/unknown category → always available. */
  private resolveItemAvailability(
    item: CatalogItemModel,
    categoriesById: Map<string, CatalogCategoryModel>,
    periods: Record<string, AvailabilityPeriodModel>,
    timezone: string,
  ): ResolvedAvailability {
    const category = item.categoryId ? categoriesById.get(item.categoryId) : undefined;
    if (category === undefined) {
      return ALWAYS_AVAILABLE;
    }
    return this.resolveAvailability(category.availabilityPeriodIds, periods, timezone);
  }

  private toVariationDto(variation: ItemVariationModel): ItemVariationResponseDto {
    return {
      id: variation.id,
      name: variation.name,
      price: this.toMoneyDto(variation.price),
    };
  }

  private toMoneyDto(money: MoneyModel | null): MoneyResponseDto | null {
    return money === null ? null : { amount: money.amount, currency: money.currency };
  }
}
