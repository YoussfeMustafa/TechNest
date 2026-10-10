'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { Language, Currency } from '../types';

export function Providers({ children }: { children: React.ReactNode }) {
  const { setLanguage, setCurrency, setUser, fetchCart, fetchWishlist } = useStore();

  useEffect(() => {
    // Restore language preference
    const savedLang = localStorage.getItem('technest_lang') as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      setLanguage('ar'); // Default to Arabic
    }

    // Restore currency preference
    const savedCurrency = localStorage.getItem('technest_currency') as Currency | null;
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    // Restore user session if stored
    const savedUser = localStorage.getItem('technest_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('technest_user');
      }
    }

    // Initialize cart & wishlist
    fetchCart();
    fetchWishlist();
  }, [setLanguage, setCurrency, setUser, fetchCart, fetchWishlist]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  );
}
