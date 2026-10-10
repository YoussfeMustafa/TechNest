'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { formatPrice, formatDate } from '../../lib/utils';
import { api } from '../../lib/api';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, language, currency } = useStore();
  const t = translations[language];

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.role !== 'ADMIN') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          api.getAdminStats(),
          api.getAdminOrders({ limit: 10 }),
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (ordersRes.data) setOrders(ordersRes.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [user, router]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading admin operations...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">
          Admin Privileges Required
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          You must sign in as an Administrator (`admin@technest.com`) to access management functions.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.adminDashboard}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'ar' ? 'نظرة عامة على المبيعات، الطلبات والمخزون' : 'Overview of store revenues, active orders, and low-stock alerts'}
        </p>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-bold block">
              {language === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
              {formatPrice(stats.totalRevenue, currency, language)}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-bold block">
              {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
              {stats.totalOrders}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-bold block">
              {language === 'ar' ? 'المنتجات النشطة' : 'Active Catalog'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
              {stats.totalProducts}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-bold block">
              {language === 'ar' ? 'العملاء المسجلين' : 'Customers'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
              {stats.totalUsers}
            </span>
          </div>
        </div>
      )}

      {/* Orders Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white">
          {language === 'ar' ? 'إدارة الطلبات الحالية' : 'Recent Customer Orders'}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl rtl:rounded-l-none rtl:rounded-r-xl">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3 rounded-r-xl rtl:rounded-r-none rtl:rounded-l-xl">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {ord.orderNumber}
                  </td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                    {ord.user?.name || 'Customer'}
                  </td>
                  <td className="p-3 text-slate-400">
                    {formatDate(ord.createdAt, language)}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {formatPrice(ord.total, currency, language)}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {ord.payment?.method || 'COD'}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={ord.status}
                      disabled={updatingId === ord.id}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
