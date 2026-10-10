'use client';

import Link from 'next/link';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export function Footer() {
  const { language } = useStore();
  const t = translations[language];

  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800 text-sm">
      {/* Trust badges strip */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t.freeShipping}</h4>
              <p className="text-xs text-slate-400">{t.freeShippingDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t.officialWarranty}</h4>
              <p className="text-xs text-slate-400">{t.officialWarrantyDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t.securePayment}</h4>
              <p className="text-xs text-slate-400">{t.securePaymentDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t.easyReturns}</h4>
              <p className="text-xs text-slate-400">{t.easyReturnsDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
              T
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">TechNest</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {t.aboutText}
          </p>

          <div className="space-y-2 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>19855 / +20 (2) 2795-0000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>support@technest.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>{language === 'ar' ? '15 ميدان التحرير، وسط البلد، القاهرة، مصر' : '15 El-Tahrir Square, Downtown, Cairo, Egypt'}</span>
            </div>
          </div>
        </div>

        {/* Categories column */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">{t.allCategories}</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/products?category=smartphones" className="hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'هواتف ذكية' : 'Smartphones'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=laptops" className="hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'حواسيب محمولة' : 'Laptops'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=tablets" className="hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'أجهزة لوحية' : 'Tablets'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=audio" className="hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'صوتيات وسماعات' : 'Audio & Headphones'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=smart-watches" className="hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'ساعات ذكية' : 'Smart Watches'}
              </Link>
            </li>
            <li>
              <Link href="/products?category=gaming" className="hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'منصات ألعاب' : 'Gaming Consoles'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">{t.customerService}</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">
                {t.contactUs}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-blue-400 transition-colors">
                {t.faq}
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'الشحن والتوصيل' : 'Shipping & Delivery'}
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-blue-400 transition-colors">
                {language === 'ar' ? 'سياسة الاستبدال والاسترجاع' : 'Returns & Warranty'}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">
                {t.termsConditions}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                {t.privacyPolicy}
              </Link>
            </li>
          </ul>
        </div>

        {/* Account & Quick links */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">{t.quickLinks}</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/profile" className="hover:text-blue-400 transition-colors">
                {t.profile}
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-blue-400 transition-colors">
                {t.orders}
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-blue-400 transition-colors">
                {t.wishlist}
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-blue-400 transition-colors">
                {t.cart}
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-blue-400 transition-colors">
                {t.adminDashboard}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright & payment methods */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TechNest Electronics. {t.allRightsReserved}</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">CASH ON DELIVERY</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">VISA</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">MASTERCARD</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">VALU</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
