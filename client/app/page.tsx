import { SiteHeader } from '@/components/features/site-header';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-muted-foreground">
          Pick a location above. The grouped menu, category filter, and item detail arrive in the
          next phases.
        </p>
      </main>
    </div>
  );
}
