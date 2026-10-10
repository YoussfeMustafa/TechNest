'use client';

import { useStore } from '../../lib/store';
import { Currency } from '../../types';

export function CurrencyToggle() {
  const { currency, setCurrency, language } = useStore();

  const handleSelect = (curr: Currency) => {
    setCurrency(curr);
  };

  return (
    <div className="flex items-center rounded-xl bg-slate-900/60 p-0.5 border border-slate-700/50 text-xs font-semibold">
      <button
        onClick={() => handleSelect('EGP')}
        className={`px-2 py-1 rounded-lg transition-all ${
          currency === 'EGP'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {language === 'ar' ? 'ج.م' : 'EGP'}
      </button>
      <button
        onClick={() => handleSelect('AED')}
        className={`px-2 py-1 rounded-lg transition-all ${
          currency === 'AED'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {language === 'ar' ? 'د.إ' : 'AED'}
      </button>
    </div>
  );
}
