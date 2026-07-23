import { ItemDetail } from '@/components/features/item-detail';
import { SiteHeader } from '@/components/features/site-header';

/**
 * Item-detail route. `params` is async in Next 15. Renders the shared header (which keeps the
 * location switcher available, so a deep-link still resolves a location) above the detail view.
 */
export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <ItemDetail itemId={id} />
      </main>
    </div>
  );
}
