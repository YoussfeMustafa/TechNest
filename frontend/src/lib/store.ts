import { create } from 'zustand';
import { Currency, Language, User, Cart, Product } from '../types';
import { api } from './api';

interface AppState {
  language: Language;
  currency: Currency;
  user: User | null;
  authReady: boolean;
  cart: Cart;
  wishlistIds: string[];
  compareList: Product[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  quickViewProduct: Product | null;

  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  logout: () => Promise<void>;

  setIsCartOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;

  fetchCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<boolean>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  language: 'ar', // Default to Arabic as Dubai Phone alternative, switchable instantly
  currency: 'EGP',
  user: null,
  authReady: false,
  cart: { items: [], itemCount: 0, subtotal: 0 },
  wishlistIds: [],
  compareList: [],
  isCartOpen: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
  quickViewProduct: null,

  setLanguage: (lang) => {
    set({ language: lang });
    if (typeof window !== 'undefined') {
      localStorage.setItem('technest_lang', lang);
      document.cookie = `technest_lang=${lang}; path=/; max-age=31536000`;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  },

  setCurrency: (currency) => {
    set({ currency });
    if (typeof window !== 'undefined') {
      localStorage.setItem('technest_currency', currency);
    }
  },

  setUser: (user) => {
    set({ user });
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('technest_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('technest_user');
      }
    }
  },

  setAuthReady: (authReady) => set({ authReady }),

  logout: async () => {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('technest_refresh_token')
      : null;
    try {
      await api.logout(refreshToken);
    } catch (e) {
      // Ignore network errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('technest_access_token');
      localStorage.removeItem('technest_refresh_token');
      localStorage.removeItem('technest_user');
    }
    set({ user: null, cart: { items: [], itemCount: 0, subtotal: 0 } });
  },

  setIsCartOpen: (open) => set({ isCartOpen: open }),
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setQuickViewProduct: (product) => set({ quickViewProduct: product }),

  fetchCart: async () => {
    try {
      const res = await api.getCart();
      if (res.data) {
        set({ cart: res.data });
      }
    } catch (e) {
      console.error('Error fetching cart:', e);
    }
  },

  addToCart: async (productId, variantId = null, quantity = 1) => {
    try {
      const res = await api.addToCart({ productId, variantId, quantity });
      if (res.success && res.data) {
        set({ cart: res.data, isCartOpen: true });
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('Error adding to cart:', e);
      throw e;
    }
  },

  updateCartQuantity: async (itemId, quantity) => {
    try {
      await api.updateCartItem(itemId, quantity);
      await get().fetchCart();
    } catch (e) {
      console.error('Error updating cart:', e);
    }
  },

  removeFromCart: async (itemId) => {
    try {
      await api.removeCartItem(itemId);
      await get().fetchCart();
    } catch (e) {
      console.error('Error removing cart item:', e);
    }
  },

  clearCart: async () => {
    try {
      await api.clearCart();
      set({ cart: { items: [], itemCount: 0, subtotal: 0 } });
    } catch (e) {
      console.error('Error clearing cart:', e);
    }
  },

  fetchWishlist: async () => {
    if (!get().user) return;
    try {
      const res = await api.getWishlist();
      if (res.data) {
        set({ wishlistIds: res.data.map((p: any) => p.id) });
      }
    } catch (e) {
      console.error('Error fetching wishlist:', e);
    }
  },

  toggleWishlist: async (product) => {
    if (!get().user) {
      // Local toggle for guests
      const current = get().wishlistIds;
      if (current.includes(product.id)) {
        set({ wishlistIds: current.filter((id) => id !== product.id) });
      } else {
        set({ wishlistIds: [...current, product.id] });
      }
      return;
    }

    try {
      const res = await api.toggleWishlist(product.id);
      if (res.success) {
        if (res.data.inWishlist) {
          set({ wishlistIds: [...get().wishlistIds, product.id] });
        } else {
          set({ wishlistIds: get().wishlistIds.filter((id) => id !== product.id) });
        }
      }
    } catch (e) {
      console.error('Error toggling wishlist:', e);
    }
  },

  isInWishlist: (productId) => {
    return get().wishlistIds.includes(productId);
  },

  addToCompare: (product) => {
    const list = get().compareList;
    if (list.some((p) => p.id === product.id)) return false;
    if (list.length >= 3) return false;
    set({ compareList: [...list, product] });
    return true;
  },

  removeFromCompare: (productId) => {
    set({ compareList: get().compareList.filter((p) => p.id !== productId) });
  },

  clearCompare: () => {
    set({ compareList: [] });
  },
}));
