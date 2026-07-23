import { MenuBrowser } from '@/components/features/menu-browser';
import { SiteHeader } from '@/components/features/site-header';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <MenuBrowser />
      </main>
    </div>
  );
}
