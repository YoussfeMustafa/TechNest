'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { ProductCard } from '../../components/product/ProductCard';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { Heart, Loader2 } from 'lucide-react';

export default function WishlistPage() {
  const { language, wishlistIds, user } = useStore();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (user) {
        try {
          setLoading(true);
          const res = await api.getWishlist();
          if (res.data) setProducts(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback for guest
        setLoading(false);
      }
    }
    loadWishlist();
  }, [user]);

  return (
    <div className="py-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
          <span>{t.wishlist}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'ar' ? 'المنتجات التي حفظتها لشرائها لاحقاً' : 'Saved gadgets ready for your next order'}
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            {language === 'ar' ? 'قائمة أمنياتك فارغة' : 'Your wishlist is currently empty'}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {language === 'ar' ? 'انقر على أيقونة القلب على أي منتج لحفظه هنا' : 'Click the heart icon on any product to save it for later'}
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            {t.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
