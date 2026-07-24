import type {
  ItemDetailResponseDto,
  ItemVariationResponseDto,
} from '@/lib/api/generated/menuFlowAPI.schemas';
import { formatMoney } from '@/utils/format-money';

import type { ItemDetailView, ItemVariationView } from './item-detail-view.types';

/**
 * Adapts the `/items/:id` DTO into the detail view model — the one place item + variation prices
 * become display strings (via `formatMoney`) and the primary image is resolved. Parallels
 * `to-menu-view.ts` so both views stay declarative and insulated from the wire contract.
 */
export function toItemDetailView(item: ItemDetailResponseDto): ItemDetailView {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    priceLabel: item.price === null ? null : formatMoney(item.price),
    imageUrl: item.imageUrls[0] ?? null,
    variations: item.variations.map(toVariationView),
    available: item.available,
    availabilityWindows: item.availabilityWindows ?? null,
  };
}

function toVariationView(variation: ItemVariationResponseDto): ItemVariationView {
  return {
    id: variation.id,
    name: variation.name,
    priceLabel: variation.price === null ? null : formatMoney(variation.price),
  };
}
