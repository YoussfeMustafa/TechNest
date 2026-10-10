'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store';
import { Product } from '../../types';
import { translations } from '../../lib/translations';
import { ProductCard } from '../product/ProductCard';
import { Flame, Clock, ArrowRight } from 'lucide-react';

interface FlashDealsProps {
  products: Product[];
}

export function FlashDeals({ products }: FlashDealsProps) {
  const { language } = useStore();
  const t = translations[language];

  // 48 hour flash countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 54,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <section className="my-12">
      <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 p-6 sm:p-8">
        {/* Header bar with countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-orange-500/30">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.flashDeals}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {language === 'ar' ? 'عروض لفترة محدودة جداً بخصومات تصل إلى 30%' : 'Limited-time deals with up to 30% savings'}
              </p>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900 text-white px-4 py-2 rounded-2xl border border-slate-800 shadow-md">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300 mr-1 rtl:ml-1 rtl:mr-0">{t.endsIn}:</span>
            <div className="flex items-center gap-1 font-mono text-sm font-bold text-amber-400">
              <span className="w-7 text-center bg-slate-800 px-1 py-0.5 rounded">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="w-7 text-center bg-slate-800 px-1 py-0.5 rounded">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="w-7 text-center bg-slate-800 px-1 py-0.5 rounded">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all footer */}
        <div className="mt-8 text-center">
          <Link
            href="/products?isFlashDeal=true"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
