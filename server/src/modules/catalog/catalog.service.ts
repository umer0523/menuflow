import { Injectable } from '@nestjs/common';

import { ClientNotFoundError } from '../../common/errors/client-not-found.error';
import { isItemVisibleAtLocation } from '../../square/availability.util';
import { resolveItemPrice } from '../../square/money.util';
import { SquareService } from '../../square/square.service';
import type { CatalogItemModel, ItemVariationModel, MoneyModel } from '../../square/square.types';
import { UNCATEGORIZED } from './catalog.constants';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ItemDetailResponseDto } from './dto/item-detail-response.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemVariationResponseDto } from './dto/item-variation-response.dto';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';
import { MoneyResponseDto } from './dto/money-response.dto';

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
    const { items } = await this.square.getCatalog();
    return items
      .filter((item) => isItemVisibleAtLocation(item, locationId))
      .filter((item) => categoryId === undefined || item.categoryId === categoryId)
      .map((item) => this.toItemDto(item));
  }

  /**
   * Item detail (core requirement #5). 404s when the id is unknown **or** the item isn't visible at
   * the location — an item off this location's menu isn't reachable here, consistent with the list
   * endpoints. Resolves image URLs from the snapshot's `imageId → url` map (no extra Square call).
   */
  async getItem(itemId: string, locationId: string): Promise<ItemDetailResponseDto> {
    const snapshot = await this.square.getCatalog();
    const item = snapshot.items.find((candidate) => candidate.id === itemId);
    if (!item || !isItemVisibleAtLocation(item, locationId)) {
      throw new ClientNotFoundError(`Item ${itemId} was not found`);
    }
    return {
      ...this.toItemDto(item),
      imageUrls: item.imageIds
        .map((imageId) => snapshot.images[imageId])
        .filter((url): url is string => url !== undefined),
      variations: item.variations.map((variation) => this.toVariationDto(variation)),
    };
  }

  private async buildMenu(locationId: string): Promise<MenuCategoryResponseDto[]> {
    const snapshot = await this.square.getCatalog();
    const visibleItems = snapshot.items.filter((item) => isItemVisibleAtLocation(item, locationId));
    const itemsByCategory = this.groupByCategory(visibleItems);
    const knownCategoryIds = new Set(snapshot.categories.map((category) => category.id));

    // Emit categories in Square's own order, dropping any with no visible item here (hide empty).
    const groups: MenuCategoryResponseDto[] = [];
    for (const category of snapshot.categories) {
      const items = itemsByCategory.get(category.id);
      if (items && items.length > 0) {
        groups.push({
          id: category.id,
          name: category.name,
          items: items.map((i) => this.toItemDto(i)),
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
        items: orphans.map((item) => this.toItemDto(item)),
      });
    }

    return groups;
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

  private toItemDto(item: CatalogItemModel): ItemResponseDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      price: this.toMoneyDto(resolveItemPrice(item)),
      imageIds: item.imageIds,
    };
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
