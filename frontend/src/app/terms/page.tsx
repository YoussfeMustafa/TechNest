'use client';

import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';

export default function TermsPage() {
  const { language } = useStore();
  const t = translations[language];

  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
        {t.termsConditions}
      </h1>
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-4">
        <p>
          Welcome to TechNest. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.
        </p>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Orders & Pricing</h3>
        <p>
          All product prices are quoted in Egyptian Pounds (EGP) or UAE Dirhams (AED) as selected and include applicable value-added taxes unless stated otherwise. TechNest reserves the right to correct pricing typographical errors prior to order dispatch.
        </p>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Delivery & Inspection</h3>
        <p>
          Upon receiving your parcel, please inspect the external security seal before accepting delivery. Cash on delivery payments must be settled in local currency with the courier representative.
        </p>
      </div>
    </div>
  );
}
