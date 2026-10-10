'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { HeroSlider } from '../components/home/HeroSlider';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FlashDeals } from '../components/home/FlashDeals';
import { BrandStrip } from '../components/home/BrandStrip';
import { Newsletter } from '../components/home/Newsletter';
import { ProductCard } from '../components/product/ProductCard';
import { useStore } from '../lib/store';
import { translations } from '../lib/translations';
import { Product, Category, Brand, Banner } from '../types';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { language } = useStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const t = translations[language];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bannersRes, catsRes, brandsRes, featRes, flashRes] = await Promise.all([
          api.getBanners(),
          api.getCategories(),
          api.getBrands(),
          api.getFeaturedProducts(),
          api.getFlashDeals(),
        ]);

        if (bannersRes.data) setBanners(bannersRes.data);
        if (catsRes.data) setCategories(catsRes.data);
        if (brandsRes.data) setBrands(brandsRes.data);
        if (featRes.data) setFeaturedProducts(featRes.data);
        if (flashRes.data) setFlashDeals(flashRes.data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          {language === 'ar' ? 'جاري تحميل الأجهزة والعروض...' : 'Loading TechNest flagship store...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Hero Slider */}
      <HeroSlider banners={banners} />

      {/* 2. Category Visual Grid */}
      <CategoryGrid categories={categories} />

      {/* 3. Flash Deals with Countdown */}
      <FlashDeals products={flashDeals} />

      {/* 4. Featured Flagships Section */}
      <section className="my-14">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {t.featuredProducts}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'أحدث الأجهزة الأكثر طلباً مع ضمان الوكيل' : 'Trending flagship releases with verified warranty'}
              </p>
            </div>
          </div>

          <Link
            href="/products?isFeatured=true"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Brand Logos Strip */}
      <BrandStrip brands={brands} />

      {/* 6. VIP Newsletter Box */}
      <Newsletter />
    </div>
  );
}
