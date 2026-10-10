'use client';

import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const { language } = useStore();
  const t = translations[language];

  const faqs = [
    {
      qEn: 'Are all products sold on TechNest genuine and under warranty?',
      qAr: 'هل جميع المنتجات المباعة على تيك نست أصلية وتخضع للضمان؟',
      aEn: 'Yes, 100% of our products are brand new, sealed in original factory packaging, and backed by the official local agent warranty in Egypt and GCC.',
      aAr: 'نعم، جميع منتجاتنا جديدة تماماً في علبها الأصلية المختومة ومشمولة بالضمان الرسمي المعتمد من الوكيل المحلي في مصر والخليج.',
    },
    {
      qEn: 'What payment methods do you support?',
      qAr: 'ما هي طرق الدفع المتاحة على الموقع؟',
      aEn: 'We support Cash on Delivery (COD) across Egypt, as well as Visa, MasterCard, and electronic payments.',
      aAr: 'ندعم الدفع نقداً عند الاستلام (COD) في جميع محافظات مصر، بالإضافة إلى الدفع بالبطاقات البنكية فيزا وماستركارد.',
    },
    {
      qEn: 'How long does shipping take?',
      qAr: 'كم يستغرق توصيل الشحنة؟',
      aEn: 'Orders within Cairo, Giza, and Alexandria are delivered within 24 to 48 hours. Other governorates within 2-3 business days.',
      aAr: 'يتم التوصيل في القاهرة والجيزة والإسكندرية خلال 24 إلى 48 ساعة، وباقي المحافظات خلال 2 إلى 3 أيام عمل.',
    },
    {
      qEn: 'What is your return and exchange policy?',
      qAr: 'ما هي سياسة الاستبدال والاسترجاع؟',
      aEn: 'We provide a 14-day hassle-free return and exchange policy in accordance with the Consumer Protection Agency regulations.',
      aAr: 'نوفر سياسة استبدال واسترجاع سهلة خلال 14 يوماً وفقاً لأحكام جهاز حماية المستهلك.',
    },
  ];

  return (
    <div className="py-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.faq}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'ar' ? 'إجابات على الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions and helpful answers'}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{language === 'ar' ? f.qAr : f.qEn}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-6 rtl:pr-0 rtl:pl-6">
              {language === 'ar' ? f.aAr : f.aEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
