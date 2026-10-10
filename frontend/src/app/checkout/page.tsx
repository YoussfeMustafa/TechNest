'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { formatPrice } from '../../lib/utils';
import { api } from '../../lib/api';
import { Address } from '../../types';
import {
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Plus,
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, language, currency, user, authReady, fetchCart } = useStore();
  const t = translations[language];

  const prefilledCoupon = searchParams.get('coupon') || '';

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Cairo',
    state: '',
    postalCode: '',
    country: 'Egypt',
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'STRIPE'>('COD');
  const [couponCode, setCouponCode] = useState(prefilledCoupon);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    if (authReady && !user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [authReady, user, router]);

  // Load saved addresses if authenticated
  useEffect(() => {
    async function loadAddresses() {
      if (user) {
        try {
          const res = await api.getAddresses();
          if (res.data && res.data.length > 0) {
            setAddresses(res.data);
            const defaultAddr = res.data.find((a: Address) => a.isDefault) || res.data[0];
            setSelectedAddressId(defaultAddr.id);
          } else {
            setIsNewAddress(true);
          }
        } catch (e) {
          setIsNewAddress(true);
        }
      } else {
        setIsNewAddress(true);
      }
    }

    loadAddresses();
  }, [user]);

  // Validate prefilled coupon if exists
  useEffect(() => {
    async function checkCoupon() {
      if (prefilledCoupon && cart.subtotal > 0) {
        try {
          const res = await api.validateCoupon(prefilledCoupon, cart.subtotal);
          if (res.data) setCouponDiscount(res.data.discountAmount);
        } catch (e) {
          // Ignore
        }
      }
    }
    checkCoupon();
  }, [prefilledCoupon, cart.subtotal]);

  const shippingFee = cart.subtotal > 1500 || cart.subtotal === 0 ? 0 : 50;
  const taxableAmount = Math.max(0, cart.subtotal - couponDiscount);
  const tax = Math.round(taxableAmount * 0.05 * 100) / 100;
  const total = Math.max(0, cart.subtotal - couponDiscount + shippingFee + tax);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Require address
    if (isNewAddress) {
      if (!newAddress.recipientName || !newAddress.phone || !newAddress.street || !newAddress.city) {
        setError(language === 'ar' ? 'يرجى استكمال جميع بيانات التوصيل' : 'Please provide all shipping address fields');
        return;
      }
    } else if (!selectedAddressId) {
      setError(language === 'ar' ? 'يرجى اختيار عنوان التوصيل' : 'Please select a delivery address');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        paymentMethod,
        currency,
        couponCode: couponCode || undefined,
      };

      if (!isNewAddress && selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.shippingAddress = newAddress;
      }

      const res = await api.createOrder(payload);
      if (res.success && res.data) {
        setOrderSuccess(res.data);
        await fetchCart();

        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed. Please check product stock or try again.');
    } finally {
      setLoading(false);
    }
  };

  // Order Confirmed Screen
  if (!authReady || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-bold text-xs text-slate-400">
        {language === 'ar' ? 'جارٍ تحميل صفحة الدفع...' : 'Loading checkout...'}
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="py-12 max-w-xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {t.orderConfirmation}
        </h1>

        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {t.orderThanks}
        </p>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-left rtl:text-right space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400">{t.orderNumber}:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {orderSuccess.orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">{t.paymentMethod}:</span>
            <span className="font-bold">
              {orderSuccess.payment?.method === 'COD' ? t.cashOnDelivery : t.creditCard}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-sm font-black">
            <span>{t.total}:</span>
            <span className="text-blue-600 dark:text-blue-400 text-lg">
              {formatPrice(orderSuccess.total, currency, language)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => router.push(user ? '/orders' : '/')}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
          >
            {user ? t.orders : t.continueShopping}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
        {t.checkout}
      </h1>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Shipping & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Shipping Address */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {t.shippingDetails}
                </h2>
              </div>

              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsNewAddress(!isNewAddress)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isNewAddress ? (language === 'ar' ? 'العناوين المحفوظة' : 'Saved Addresses') : (language === 'ar' ? 'عنوان جديد' : 'New Address')}</span>
                </button>
              )}
            </div>

            {/* Existing Saved Addresses */}
            {!isNewAddress && addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                        {addr.label}
                      </span>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100">
                      {addr.recipientName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {addr.street}, {addr.city}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{addr.phone}</p>
                  </label>
                ))}
              </div>
            ) : (
              /* New Address Form */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.recipientName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.recipientName}
                    onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.street} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.city} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.country}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={newAddress.country}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Payment Method */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {t.paymentMethod}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Banknote className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    {t.cashOnDelivery}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'ادفع نقداً عند استلام الشحنة لباب بيتك' : 'Pay in cash upon doorstep delivery'}
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  paymentMethod === 'STRIPE'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'STRIPE'}
                  onChange={() => setPaymentMethod('STRIPE')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <CreditCard className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    {t.creditCard}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'بطاقة بنكية آمنة فورية (وضع تجريبي)' : 'Instant 256-bit encrypted card checkout'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary & Place Order */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {language === 'ar' ? 'ملخص المنتجات' : 'Items in Order'}
            </h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=100'}
                    alt=""
                    className="w-10 h-10 object-contain rounded-lg bg-slate-50 dark:bg-slate-800 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice, currency, language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Details */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {formatPrice(cart.subtotal, currency, language)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-500 font-bold">
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
                <span>{formatPrice(tax, currency, language)}</span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline text-base font-black text-slate-900 dark:text-white">
                <span>{t.total}</span>
                <span className="text-xl text-blue-600 dark:text-blue-400">
                  {formatPrice(total, currency, language)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 active:scale-98 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t.placeOrder}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center font-bold text-xs text-slate-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
