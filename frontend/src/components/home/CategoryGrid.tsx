'use client';

import Link from 'next/link';
import { useStore } from '../../lib/store';
import { Category } from '../../types';
import { translations } from '../../lib/translations';
import { ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const { language } = useStore();
  const t = translations[language];

  if (!categories || categories.length === 0) return null;

  return (
    <section className="my-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.shopByCategory}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ar' ? 'استكشف أحدث الأجهزة الذكية مقسمة بعناية' : 'Explore the latest premium gadgets organized by categories'}
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>{t.viewAll}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.slice(0, 10).map((cat) => {
          const name = language === 'ar' ? cat.nameAr : cat.nameEn;
          const image = cat.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600';

          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col items-center text-center hover:shadow-xl hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-3 mb-3 flex items-center justify-center overflow-hidden">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-contain group-hover:scale-115 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {name}
              </h3>

              <span className="text-[11px] text-slate-400 mt-0.5">
                {cat._count?.products ? `${cat._count.products} ${language === 'ar' ? 'منتج' : 'items'}` : (language === 'ar' ? 'تصفح الآن' : 'Explore')}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
