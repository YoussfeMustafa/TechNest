'use client';

import Link from 'next/link';
import { useStore } from '../../lib/store';
import { Brand } from '../../types';
import { translations } from '../../lib/translations';

interface BrandStripProps {
  brands: Brand[];
}

export function BrandStrip({ brands }: BrandStripProps) {
  const { language } = useStore();
  const t = translations[language];

  if (!brands || brands.length === 0) return null;

  return (
    <section className="my-14 py-8 border-y border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {t.brands}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ar' ? 'الوكلاء الرسميون المعتمدون مع شهادات الضمان' : 'Authorized official dealers with manufacturer warranty'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/products?brand=${brand.slug}`}
            className="flex-shrink-0 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-center min-w-[130px] group"
          >
            <span className="font-extrabold text-sm sm:text-base text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
