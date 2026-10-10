'use client';

import { useStore } from '../../lib/store';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useStore();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-700/50"
      aria-label="Switch Language"
      title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
    >
      <Globe className="w-3.5 h-3.5 text-blue-400" />
      <span>{language === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
}
