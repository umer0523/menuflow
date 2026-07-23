import { LocationSwitcher } from './location-switcher';

/** App shell header: brand + the location switcher. Shared frame for the menu views (M4+). */
export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">MenuFlow</h1>
          <p className="text-sm text-muted-foreground">Multi-location Square menu browser</p>
        </div>
        <LocationSwitcher />
      </div>
    </header>
  );
}
