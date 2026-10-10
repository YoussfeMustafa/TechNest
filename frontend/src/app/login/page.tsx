'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setLanguage, language, fetchCart, fetchWishlist } = useStore();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('message') === 'session-expired') {
      setError(language === 'ar'
        ? 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.'
        : 'Your session expired. Please sign in again.');
    }
  }, [language]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem('technest_access_token', res.data.accessToken);
        if (res.data.refreshToken) {
          localStorage.setItem('technest_refresh_token', res.data.refreshToken);
        }
        setUser(res.data.user);
        await api.mergeCart([]);
        await fetchCart();
        await fetchWishlist();

        const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
        const returnTo = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : '/';
        if (res.data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push(returnTo);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCustomerCredentials = () => {
    setEmail('customer@technest.com');
    setPassword('Customer@123456');
  };

  const fillAdminCredentials = () => {
    setEmail('admin@technest.com');
    setPassword('Admin@123456');
  };

  return (
    <div className="py-12 max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-blue-500/30">
          T
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {t.signIn}
        </h1>
        <p className="text-xs text-slate-400">
          {language === 'ar' ? 'سجل دخولك لمتابعة طلباتك وإتمام الشراء بسرعة' : 'Sign in to access your orders and fast checkout'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* Quick Demo Fill Buttons */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 block flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ar' ? 'بيانات تجريبية سريعة:' : 'Quick Demo Credentials:'}</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillCustomerCredentials}
              className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] font-bold border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10 rtl:pl-4 rtl:pr-10"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10 rtl:pl-4 rtl:pr-10"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{t.signIn}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>{language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"} </span>
          <Link href="/register" className="font-bold text-blue-600 hover:underline">
            {t.register}
          </Link>
        </div>
      </div>
    </div>
  );
}
