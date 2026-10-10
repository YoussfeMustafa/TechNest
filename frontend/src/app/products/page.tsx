'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { ProductCard } from '../../components/product/ProductCard';
import { Product, Category, Brand } from '../../types';
import { formatPrice } from '../../lib/utils';
import {
  Filter,
  Grid,
  List,
  ChevronDown,
  RotateCcw,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, currency } = useStore();
  const t = translations[language];

  // Filters state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter params
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') || '';
  const isFlashDealParam = searchParams.get('isFlashDeal') || '';
  const isFeaturedParam = searchParams.get('isFeatured') || '';
  const pageParam = searchParams.get('page') || '1';

  // Load categories and brands once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          api.getCategories(),
          api.getBrands(),
        ]);
        if (catsRes.data) setCategories(catsRes.data);
        if (brandsRes.data) setBrands(brandsRes.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          limit: '12',
          page: pageParam,
          sort: sortParam,
        };
        if (categoryParam) params.category = categoryParam;
        if (brandParam) params.brand = brandParam;
        if (minPriceParam) params.minPrice = minPriceParam;
        if (maxPriceParam) params.maxPrice = maxPriceParam;
        if (inStockParam) params.inStock = inStockParam;
        if (isFlashDealParam) params.isFlashDeal = isFlashDealParam;
        if (isFeaturedParam) params.isFeatured = isFeaturedParam;

        const res = await api.getProducts(params);
        if (res.data) {
          setProducts(res.data);
          setTotal(res.meta?.total || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFiltered();
  }, [
    categoryParam,
    brandParam,
    sortParam,
    minPriceParam,
    maxPriceParam,
    inStockParam,
    isFlashDealParam,
    isFeaturedParam,
    pageParam,
  ]);

  const updateParam = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    current.set('page', '1');
    router.push(`/products?${current.toString()}`);
  };

  const resetFilters = () => {
    router.push('/products');
  };

  return (
    <div className="py-4">
      {/* Page Title & Breadcrumb header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isFlashDealParam ? t.flashDeals : isFeaturedParam ? t.featuredProducts : categoryParam ? categories.find(c => c.slug === categoryParam)?.[language === 'ar' ? 'nameAr' : 'nameEn'] || t.allCategories : t.allCategories}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ar' ? `عرض ${total} منتج متاح` : `Showing ${total} available products`}
          </p>
        </div>

        {/* Top Controls: Mobile filter trigger, Sort select, View Mode */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            <span>{t.filters}</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pr-8 rtl:pr-4 rtl:pl-8 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              <option value="newest">{t.sortOptions.newest}</option>
              <option value="price-asc">{t.sortOptions.priceAsc}</option>
              <option value="price-desc">{t.sortOptions.priceDesc}</option>
              <option value="rating">{t.sortOptions.rating}</option>
              <option value="popularity">{t.sortOptions.popularity}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div
          className={`lg:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } space-y-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm h-fit`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>{t.filters}</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              {t.categoryFilter}
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('category', '')}
                className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !categoryParam
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.allCategories}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.slug)}
                  className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    categoryParam === c.slug
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{language === 'ar' ? c.nameAr : c.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              {t.brandFilter}
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('brand', '')}
                className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !brandParam
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {language === 'ar' ? 'جميع الماركات' : 'All Brands'}
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateParam('brand', b.slug)}
                  className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    brandParam === b.slug
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              {t.priceRange}
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={language === 'ar' ? 'من' : 'Min'}
                value={minPriceParam}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="w-1/2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder={language === 'ar' ? 'إلى' : 'Max'}
                value={maxPriceParam}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="w-1/2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Availability Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={inStockParam === 'true'}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{t.inStock}</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-bold text-slate-400">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">
                {language === 'ar' ? 'لا توجد منتجات تطابق هذه الفلاتر' : 'No products found matching these filters'}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                {language === 'ar' ? 'جرب تغيير معايير البحث أو تصفير الفلاتر' : 'Try adjusting your search criteria or resetting filters'}
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                {language === 'ar' ? 'عرض جميع المنتجات' : 'View All Products'}
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-4'
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center font-bold text-xs text-slate-400">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

