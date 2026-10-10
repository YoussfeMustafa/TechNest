'use client';

import Link from 'next/link';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageToggle } from '../ui/LanguageToggle';
import { CurrencyToggle } from '../ui/CurrencyToggle';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Menu,
  Phone,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export function Header() {
  const {
    language,
    cart,
    wishlistIds,
    setIsCartOpen,
    setIsSearchOpen,
    setIsMobileMenuOpen,
    user,
  } = useStore();

  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full shadow-md bg-slate-950 text-white transition-colors duration-200">
      {/* Top micro announcement bar */}
      <div className="hidden sm:block border-b border-slate-800/80 bg-slate-900/60 py-1.5 px-4 text-xs font-medium text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'أكبر تشكيلة هواتف وأجهزة معتمدة في مصر والخليج' : 'Premier Certified Electronics in Egypt & GCC'}</span>
            </span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>19855</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <CurrencyToggle />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu trigger & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                T
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  TechNest
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-blue-400 -mt-1">
                  Electronics
                </span>
              </div>
            </Link>
          </div>

          {/* Search Trigger Input (Desktop) */}
          <div className="flex-1 max-w-xl mx-4 hidden sm:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-slate-900 border border-slate-700/70 hover:border-blue-500 text-slate-400 text-sm transition-all shadow-inner group"
            >
              <span className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                  {t.searchPlaceholder}
                </span>
              </span>
              <kbd className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 rounded-md border border-slate-700">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile search icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account / Profile */}
            <Link
              href={user ? (user.role === 'ADMIN' ? '/admin' : '/profile') : '/login'}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <UserIcon className="w-5 h-5 text-blue-400" />
              <div className="hidden lg:flex flex-col text-left rtl:text-right">
                <span className="text-[11px] text-slate-400 font-medium">
                  {user ? (language === 'ar' ? 'مرحباً' : 'Welcome') : t.signIn}
                </span>
                <span className="text-xs font-bold truncate max-w-[100px]">
                  {user ? user.name.split(' ')[0] : t.myAccount}
                </span>
              </div>
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-blue-600/30 font-bold text-sm"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t.cart}</span>
              <span className="w-5 h-5 rounded-full bg-white text-blue-600 text-xs font-extrabold flex items-center justify-center ml-1 rtl:mr-1">
                {cart.itemCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
