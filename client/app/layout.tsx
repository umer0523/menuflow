import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { LocationProvider } from '@/providers/location-provider';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'MenuFlow',
  description: 'Browse a multi-location Square menu by location and category.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <LocationProvider>{children}</LocationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
