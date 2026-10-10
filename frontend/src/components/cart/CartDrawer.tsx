'use client';

import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { formatPrice } from '../../lib/utils';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    language,
    currency,
  } = useStore();

  const t = translations[language];

  if (!isCartOpen) return null;

  const freeShippingThreshold = 1500;
  const progressPercent = Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100));
  const diffToFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {t.cart} ({cart.itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress */}
          <div className="px-6 py-3 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-blue-700 dark:text-blue-300">
                {diffToFreeShipping === 0
                  ? (language === 'ar' ? '🎉 حصلت على شحن مجاني!' : '🎉 You unlocked Free Shipping!')
                  : (language === 'ar'
                      ? `أضف ${formatPrice(diffToFreeShipping, currency, language)} للشحن المجاني`
                      : `Add ${formatPrice(diffToFreeShipping, currency, language)} for free shipping`)}
              </span>
              <span className="text-blue-600 dark:text-blue-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-blue-200 dark:bg-blue-900/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {t.emptyCartTitle}
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  {t.emptyCartDesc}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20"
                >
                  {t.continueShopping}
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const img = item.product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=200';
                const name = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                const variantText = item.variant
                  ? [
                      language === 'ar' ? item.variant.colorAr : item.variant.colorEn,
                      item.variant.storage,
                      item.variant.ram,
                    ]
                      .filter(Boolean)
                      .join(' / ')
                  : null;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <img
                      src={img}
                      alt={name}
                      className="w-20 h-20 object-cover rounded-xl bg-white dark:bg-slate-800 p-1 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                            {name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {variantText && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {variantText}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(item.unitPrice, currency, language)}
                        </span>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center text-slate-800 dark:text-slate-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout button */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                <span>{t.subtotal}</span>
                <span className="text-blue-600 dark:text-blue-400 text-lg">
                  {formatPrice(cart.subtotal, currency, language)}
                </span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform active:scale-98"
                >
                  <span>{t.checkout}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full block text-center py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {language === 'ar' ? 'عرض السلة الكاملة وتطبيق الكوبون' : 'View Full Cart & Apply Coupon'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
