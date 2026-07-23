import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ItemDetailResponseDto } from './dto/item-detail-response.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemsQueryDto } from './dto/items-query.dto';
import { MenuCategoryResponseDto } from './dto/menu-category-response.dto';

/** Thin controller for core requirements #2 + #3 — errors propagate to the global exception filter. */
@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('catalog')
  @ApiOkResponse({
    type: [MenuCategoryResponseDto],
    description: 'Grouped menu (non-empty categories with their items) for the location.',
  })
  getCatalog(@Query() query: CatalogQueryDto): Promise<MenuCategoryResponseDto[]> {
    return this.catalog.getCatalog(query.locationId);
  }

  @Get('categories')
  @ApiOkResponse({
    type: [CategoryResponseDto],
    description: 'Non-empty categories visible at the location.',
  })
  getCategories(@Query() query: CatalogQueryDto): Promise<CategoryResponseDto[]> {
    return this.catalog.getCategories(query.locationId);
  }

  @Get('items')
  @ApiOkResponse({
    type: [ItemResponseDto],
    description: 'Items visible at the location, optionally filtered by category.',
  })
  getItems(@Query() query: ItemsQueryDto): Promise<ItemResponseDto[]> {
    return this.catalog.getItems(query.locationId, query.categoryId);
  }

  @Get('items/:id')
  @ApiOkResponse({ type: ItemDetailResponseDto, description: 'Detail for a single item.' })
  @ApiNotFoundResponse({ description: 'No item with this id is visible at the location.' })
  getItem(
    @Param('id') itemId: string,
    @Query() query: CatalogQueryDto,
  ): Promise<ItemDetailResponseDto> {
    return this.catalog.getItem(itemId, query.locationId);
  }
}
