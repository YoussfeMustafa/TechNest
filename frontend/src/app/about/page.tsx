'use client';

import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { ShieldCheck, Award, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const { language } = useStore();
  const t = translations[language];

  return (
    <div className="py-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.aboutUs}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'ar' ? 'الريادة والتميز في عالم التكنولوجيا والإلكترونيات' : 'Pioneering technology and smart lifestyle retail'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.aboutText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 space-y-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">100% Genuine</h3>
            <p className="text-xs text-slate-500">All devices are sealed from official manufacturers with certified warranty.</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
            <Award className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Best Price Guarantee</h3>
            <p className="text-xs text-slate-500">Unmatched competitive deals with zero hidden charges.</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 space-y-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fast Nationwide Delivery</h3>
            <p className="text-xs text-slate-500">Doorstep delivery within 24 to 48 hours anywhere in Egypt & GCC.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
