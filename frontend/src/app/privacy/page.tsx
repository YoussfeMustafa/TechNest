'use client';

import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';

export default function PrivacyPage() {
  const { language } = useStore();
  const t = translations[language];

  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
        {t.privacyPolicy}
      </h1>
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-4">
        <p>
          At TechNest, we treat the privacy and security of your personal information with paramount care and strict confidentiality.
        </p>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Information We Collect</h3>
        <p>
          We collect your name, shipping address, contact phone number, and email address solely to process, deliver, and support your orders.
        </p>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Data Security</h3>
        <p>
          We use industry-standard HTTPS encryption and store sensitive credentials securely with bcrypt hashing. We never sell your personal data to third parties.
        </p>
      </div>
    </div>
  );
}
