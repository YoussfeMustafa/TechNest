'use client';

import { useState } from 'react';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { Mail, CheckCircle2 } from 'lucide-react';

export function Newsletter() {
  const { language } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <section className="my-16">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto backdrop-blur-md">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.newsletterTitle}
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 font-medium">
            {t.newsletterDesc}
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-sm font-bold backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{t.subscribed}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-md"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95"
              >
                {t.subscribe}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
