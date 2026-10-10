'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import {
  Menu,
  Flame,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Watch,
  Gamepad2,
  Home,
  Zap,
  BatteryCharging,
  ChevronDown,
} from 'lucide-react';

const CATEGORIES_LIST = [
  { slug: 'smartphones', icon: Smartphone, nameEn: 'Smartphones', nameAr: 'هواتف ذكية' },
  { slug: 'tablets', icon: Tablet, nameEn: 'Tablets', nameAr: 'أجهزة لوحية' },
  { slug: 'laptops', icon: Laptop, nameEn: 'Laptops', nameAr: 'حواسيب محمولة' },
  { slug: 'audio', icon: Headphones, nameEn: 'Audio', nameAr: 'صوتيات وسماعات' },
  { slug: 'smart-watches', icon: Watch, nameEn: 'Smart Watches', nameAr: 'ساعات ذكية' },
  { slug: 'gaming', icon: Gamepad2, nameEn: 'Gaming Gear', nameAr: 'منصات ألعاب' },
  { slug: 'home-appliances', icon: Home, nameEn: 'Home Appliances', nameAr: 'أجهزة منزلية' },
  { slug: 'small-electrical', icon: Zap, nameEn: 'Personal Care', nameAr: 'عناية شخصية' },
  { slug: 'phone-accessories', icon: BatteryCharging, nameEn: 'Accessories', nameAr: 'إكسسوارات' },
];

export function MegaMenu() {
  const { language } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const t = translations[language];

  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800 text-slate-200 text-xs font-semibold select-none hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* All Categories Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer rounded-t-lg"
          >
            <Menu className="w-4 h-4" />
            <span>{t.allCategories}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Flyout panel */}
          {dropdownOpen && (
            <div
              onMouseLeave={() => setDropdownOpen(false)}
              className="absolute top-full left-0 rtl:left-auto rtl:right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2"
            >
              {CATEGORIES_LIST.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-blue-500" />
                    <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Horizontal Navigation Links */}
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {CATEGORIES_LIST.slice(0, 6).map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
              </Link>
            );
          })}
        </div>

        {/* Flash deals highlight badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/products?isFlashDeal=true"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all font-bold text-xs"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{t.flashDeals}</span>
          </Link>

          <Link
            href="/brands"
            className="text-slate-400 hover:text-white transition-colors"
          >
            {t.brands}
          </Link>
        </div>
      </div>
    </nav>
  );
}
