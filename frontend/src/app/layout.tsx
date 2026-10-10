import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '../components/layout/Header';
import { MegaMenu } from '../components/layout/MegaMenu';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import { SearchModal } from '../components/ui/SearchModal';
import { MobileDrawer } from '../components/layout/MobileDrawer';

export const metadata: Metadata = {
  title: 'TechNest | Premier Electronics & Smartphones Store',
  description: 'Shop genuine smartphones, laptops, audio, wearables, consoles, and appliances with fast delivery and official warranty.',
  keywords: ['smartphones', 'laptops', 'electronics', 'dubai phone', 'cairo', 'egypt', 'uae', 'apple', 'samsung'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Providers>
          <Header />
          <MegaMenu />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <SearchModal />
          <MobileDrawer />
        </Providers>
      </body>
    </html>
  );
}
