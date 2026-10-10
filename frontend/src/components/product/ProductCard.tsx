'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store';
import { Product } from '../../types';
import { translations } from '../../lib/translations';
import { formatPrice } from '../../lib/utils';
import { Heart, ShoppingCart, Star, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, currency, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const t = translations[language];

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600';
  const price = product.discountPrice || product.basePrice;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.basePrice);
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.discountPrice!) / product.basePrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsAdding(true);
      const variantId = product.variants?.[0]?.id || null;
      await addToCart(product.id, variantId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Badges strip (Discount / Flash deal) */}
      <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold shadow-md shadow-rose-600/30">
            {discountPercent}% {t.off}
          </span>
        )}
        {product.isFlashDeal && (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md shadow-amber-500/30">
            HOT
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
          inWishlist
            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
            : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700'
        }`}
        aria-label="Wishlist"
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-slate-50 dark:bg-slate-800/50 p-6 overflow-hidden">
        <img
          src={primaryImage}
          alt={language === 'ar' ? product.nameAr : product.nameEn}
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category tags */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
              {product.brand?.name || 'TechNest'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug">
              {language === 'ar' ? product.nameAr : product.nameEn}
            </h3>
          </Link>
        </div>

        {/* Price & Add to cart button */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatPrice(price, currency, language)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.basePrice, currency, language)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95'
            }`}
            aria-label="Add to cart"
            title={t.addToCart}
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
