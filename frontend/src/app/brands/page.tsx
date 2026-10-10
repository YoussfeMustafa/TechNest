'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { Brand } from '../../types';
import { Loader2 } from 'lucide-react';

export default function BrandsPage() {
  const { language } = useStore();
  const t = translations[language];
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await api.getBrands();
        if (res.data) setBrands(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, []);

  return (
    <div className="py-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.brands}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'ar' ? 'تصفح أجهزتنا حسب الماركة والشركة المصنعة' : 'Browse devices by authorized manufacturers and brands'}
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/products?brand=${b.slug}`}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center justify-center hover:shadow-xl hover:border-blue-500 transition-all group"
            >
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {b.name}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {b._count?.products || 0} {language === 'ar' ? 'منتج' : 'products'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
