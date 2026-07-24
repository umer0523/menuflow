'use client';

import Image from 'next/image';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { ArrowLeft, Clock, ImageOff, RefreshCw } from 'lucide-react';

import { ITEM_DETAIL, MENU_COPY } from '@/constants/menu.constants';
import { ROUTES } from '@/constants/routes.constants';
import { useItem } from '@/hooks/use-item';
import { buildAvailabilityLabel } from '@/lib/catalog/availability-label';
import { toItemDetailView } from '@/lib/catalog/to-item-detail-view';
import { useSelectedLocation } from '@/providers/location-provider';
import { getErrorMessage } from '@/utils/get-error-message';

/**
 * Item-detail view (core requirement #5): image (or placeholder), name, description, formatted
 * price, and variations. Distinguishes a 404 (item not on this location's menu) from an infra error,
 * and renders explicit loading / not-found / error+retry states — never a bare spinner.
 */
export function ItemDetail({ itemId }: { itemId: string }) {
  const { selectedLocationId } = useSelectedLocation();
  const { data, isPending, isError, error, refetch } = useItem(itemId, selectedLocationId);

  if (isPending) {
    return (
      <div aria-busy="true" aria-label={ITEM_DETAIL.LOADING_LABEL} className="flex flex-col gap-4">
        <span className="h-64 w-full max-w-md animate-pulse rounded-lg bg-muted" />
        <span className="h-6 w-48 animate-pulse rounded bg-muted" />
        <span className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError) {
    const isNotFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="flex flex-col items-start gap-3">
        <BackLink />
        {isNotFound ? (
          <p className="text-sm text-muted-foreground">{ITEM_DETAIL.NOT_FOUND}</p>
        ) : (
          <div role="alert" className="flex items-center gap-3 text-sm text-destructive">
            <span>{getErrorMessage(error)}</span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 font-medium text-foreground hover:bg-accent"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              {MENU_COPY.RETRY}
            </button>
          </div>
        )}
      </div>
    );
  }

  const item = toItemDetailView(data);

  return (
    <article className="flex flex-col gap-6">
      <BackLink />
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground"
              aria-label={ITEM_DETAIL.NO_IMAGE}
            >
              <ImageOff className="h-8 w-8" aria-hidden="true" />
              <span className="text-xs">{ITEM_DETAIL.NO_IMAGE}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{item.name}</h2>
            <span className="whitespace-nowrap text-lg font-semibold">
              {item.priceLabel ?? MENU_COPY.NO_PRICE}
            </span>
          </div>
          {!item.available ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {buildAvailabilityLabel(item.availabilityWindows)}
            </span>
          ) : null}
          {item.description ? <p className="text-muted-foreground">{item.description}</p> : null}

          {item.variations.length > 0 ? (
            <section aria-label={ITEM_DETAIL.OPTIONS_LABEL} className="mt-2">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {ITEM_DETAIL.OPTIONS_LABEL}
              </h3>
              <ul className="flex flex-col gap-1">
                {item.variations.map((variation) => (
                  <li
                    key={variation.id}
                    className="flex items-center justify-between border-b border-border/60 py-1 text-sm"
                  >
                    <span>{variation.name ?? item.name}</span>
                    <span className="font-medium">
                      {variation.priceLabel ?? MENU_COPY.NO_PRICE}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function BackLink() {
  return (
    <Link
      href={ROUTES.HOME}
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {ITEM_DETAIL.BACK}
    </Link>
  );
}
