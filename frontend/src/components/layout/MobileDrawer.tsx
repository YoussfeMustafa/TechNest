'use client';

import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { LanguageToggle } from '../ui/LanguageToggle';
import { CurrencyToggle } from '../ui/CurrencyToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  X,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Watch,
  Gamepad2,
  Home,
  Zap,
  BatteryCharging,
  Flame,
  User,
  ShoppingBag,
  Heart,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES_LIST = [
  { slug: 'smartphones', icon: Smartphone, nameEn: 'Smartphones', nameAr: 'هواتف ذكية' },
  { slug: 'tablets', icon: Tablet, nameEn: 'Tablets', nameAr: 'أجهزة لوحية' },
  { slug: 'laptops', icon: Laptop, nameEn: 'Laptops', nameAr: 'حواسيب محمولة' },
  { slug: 'audio', icon: Headphones, nameEn: 'Audio', nameAr: 'صوتيات وسماعات' },
  { slug: 'smart-watches', icon: Watch, nameEn: 'Smart Watches', nameAr: 'ساعات ذكية' },
  { slug: 'gaming', icon: Gamepad2, nameEn: 'Gaming Gear', nameAr: 'منصات ألعاب' },
  { slug: 'home-appliances', icon: Home, nameEn: 'Home Appliances', nameAr: 'أجهزة منزلية' },
  { slug: 'small-electrical', icon: Zap, nameEn: 'Personal Care', nameAr: 'عناية شخصية' },
  { slug: 'phone-accessories', icon: BatteryCharging, nameEn: 'Accessories', nameAr: 'إكسسوارات الهواتف' },
];

export function MobileDrawer() {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    language,
    user,
    cart,
    wishlistIds,
  } = useStore();

  const t = translations[language];

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              T
            </div>
            <span className="font-extrabold text-base tracking-tight">TechNest</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <Link
            href={user ? '/profile' : '/login'}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {user ? (language === 'ar' ? 'أهلاً بك' : 'Welcome') : t.signIn}
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {user ? user.name : t.myAccount}
              </p>
            </div>
          </Link>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link
            href="/products?isFlashDeal=true"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-amber-500 bg-amber-50 dark:bg-amber-950/30 mb-2"
          >
            <Flame className="w-4 h-4 animate-pulse" />
            <span>{t.flashDeals}</span>
          </Link>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 pt-2 pb-1">
            {t.allCategories}
          </h3>

          {CATEGORIES_LIST.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer with toggles */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyToggle />
            <LanguageToggle />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
