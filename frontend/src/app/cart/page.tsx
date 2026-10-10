'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { formatPrice } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, language, currency } = useStore();
  const t = translations[language];

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    setValidatingCoupon(true);

    try {
      const res = await api.validateCoupon(couponCode, cart.subtotal);
      if (res.success && res.data) {
        setCouponDiscount(res.data.discountAmount);
        setCouponSuccess(t.couponApplied);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || t.invalidCoupon);
      setCouponDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const shippingFee = cart.subtotal > 1500 || cart.subtotal === 0 ? 0 : 50;
  const taxableAmount = Math.max(0, cart.subtotal - couponDiscount);
  const tax = Math.round(taxableAmount * 0.05 * 100) / 100;
  const total = Math.max(0, cart.subtotal - couponDiscount + shippingFee + tax);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {t.emptyCartTitle}
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">{t.emptyCartDesc}</p>
        <Link
          href="/products"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
        >
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
        {t.cart} ({cart.itemCount})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Items Table */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const img = item.product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=200';
            const name = language === 'ar' ? item.product.nameAr : item.product.nameEn;
            const variantText = item.variant
              ? [
                  language === 'ar' ? item.variant.colorAr : item.variant.colorEn,
                  item.variant.storage,
                  item.variant.ram,
                ]
                  .filter(Boolean)
                  .join(' - ')
              : null;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
              >
                <img
                  src={img}
                  alt={name}
                  className="w-24 h-24 object-contain rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 shrink-0"
                />

                <div className="flex-1 min-w-0 text-center sm:text-left rtl:sm:text-right">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                      {name}
                    </h3>
                  </Link>
                  {variantText && (
                    <span className="text-xs text-slate-400 font-medium block mt-0.5">
                      {variantText}
                    </span>
                  )}
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 block mt-2">
                    {formatPrice(item.unitPrice, currency, language)}
                  </span>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center gap-4 self-center">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Code Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>{t.couponCode}</span>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="WELCOME10 / TECH50"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={validatingCoupon}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                {t.applyCoupon}
              </button>
            </form>

            {couponSuccess && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{couponSuccess}</span>
              </div>
            )}
            {couponError && (
              <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{couponError}</span>
              </div>
            )}
          </div>

          {/* Pricing summary */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h3>

            <div className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {formatPrice(cart.subtotal, currency, language)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>{t.discount}</span>
                  <span>-{formatPrice(couponDiscount, currency, language)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t.shipping}</span>
                <span className={shippingFee === 0 ? 'text-emerald-500 font-bold' : 'text-slate-900 dark:text-white'}>
                  {shippingFee === 0 ? t.free : formatPrice(shippingFee, currency, language)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t.tax}</span>
                <span className="text-slate-900 dark:text-white">
                  {formatPrice(tax, currency, language)}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline text-base font-black text-slate-900 dark:text-white">
                <span>{t.total}</span>
                <span className="text-xl text-blue-600 dark:text-blue-400">
                  {formatPrice(total, currency, language)}
                </span>
              </div>
            </div>

            <Link
              href={`/checkout${couponDiscount > 0 ? `?coupon=${couponCode}` : ''}`}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 active:scale-98 transition-all"
            >
              <span>{t.checkout}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
