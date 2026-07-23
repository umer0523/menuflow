import { Square } from 'square';

import { SquareObjectType } from './square-object-type.enum';

/**
 * Type guards that narrow Square's mixed `CatalogObject` union by `type` — used to sift the
 * flat catalog list into items, categories, and variations without `any` or assertions.
 */

export function isCatalogItem(object: Square.CatalogObject): object is Square.CatalogObject.Item {
  return object.type === SquareObjectType.Item;
}

export function isCatalogCategory(
  object: Square.CatalogObject,
): object is Square.CatalogObject.Category {
  return object.type === SquareObjectType.Category;
}

export function isItemVariation(
  object: Square.CatalogObject,
): object is Square.CatalogObject.ItemVariation {
  return object.type === SquareObjectType.ItemVariation;
}

export function isCatalogImage(object: Square.CatalogObject): object is Square.CatalogObject.Image {
  return object.type === SquareObjectType.Image;
}
