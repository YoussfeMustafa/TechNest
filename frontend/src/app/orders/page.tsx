'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { formatPrice, formatDate } from '../../lib/utils';
import { Order } from '../../types';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Printer,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();
  const { user, language, currency } = useStore();
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        setLoading(true);
        const res = await api.getOrders();
        if (res.data) {
          setOrders(res.data);
        }
      } catch (e) {
        console.error('Failed to load orders:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, router]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(t.cancelConfirm)) return;
    try {
      setCancellingId(orderId);
      const res = await api.cancelOrder(orderId, 'Cancelled by user request');
      if (res.success) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const printInvoice = (order: Order) => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.orders}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ar' ? 'تتبع شحناتك وسجل طلباتك السابقة' : 'Track deliveries and view purchase invoices'}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <Package className="w-10 h-10" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            {language === 'ar' ? 'لم تقم بأي طلبات حتى الآن' : 'No orders placed yet'}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {language === 'ar' ? 'اكتشف أفضل الهواتف والأجهزة الذكية وابدأ التسوق!' : 'Explore our flagship store and place your first order!'}
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            {t.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isCancellable = order.status === 'PENDING' || order.status === 'CONFIRMED';
            const statusLabel = t.orderStatus[order.status] || order.status;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">
                      {formatDate(order.createdAt, language)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      {statusLabel}
                    </span>

                    <button
                      onClick={() => printInvoice(order)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                    <div
                      className={`flex flex-col items-center gap-1.5 ${
                        order.status !== 'CANCELLED' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <span>{t.orderStatus.PENDING}</span>
                    </div>

                    <div
                      className={`flex flex-col items-center gap-1.5 ${
                        ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span>{t.orderStatus.PROCESSING}</span>
                    </div>

                    <div
                      className={`flex flex-col items-center gap-1.5 ${
                        ['SHIPPED', 'DELIVERED'].includes(order.status)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <span>{t.orderStatus.SHIPPED}</span>
                    </div>

                    <div
                      className={`flex flex-col items-center gap-1.5 ${
                        order.status === 'DELIVERED'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{t.orderStatus.DELIVERED}</span>
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-3 pt-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=100'}
                        alt=""
                        className="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">
                          {language === 'ar' ? item.productNameAr : item.productNameEn}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Qty: {item.quantity} × {formatPrice(item.price, currency, language)}
                        </p>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatPrice(item.total, currency, language)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer with totals & cancel option */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-400">{t.total}:</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {formatPrice(order.total, currency, language)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({order.payment?.method === 'COD' ? t.cashOnDelivery : t.creditCard})
                    </span>
                  </div>

                  {isCancellable && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === order.id ? 'Cancelling...' : t.cancelOrder}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
