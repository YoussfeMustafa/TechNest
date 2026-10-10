'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, language, currency } = useStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ products: any[]; categories: any[] }>({
    products: [],
    categories: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSuggestions({ products: [], categories: [] });
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions({ products: [], categories: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.getSearchSuggestions(query);
        if (res.data) {
          setSuggestions(res.data);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          {loading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions Dropdown */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim().length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>Type to search products, brands, or categories</p>
            </div>
          ) : (
            <div>
              {/* Categories Matches */}
              {suggestions.categories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {t.shopByCategory}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-100 dark:border-blue-900/30 transition-all"
                      >
                        {language === 'ar' ? cat.nameAr : cat.nameEn}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Matches */}
              {suggestions.products.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {t.featuredProducts}
                  </h4>
                  <div className="space-y-2">
                    {suggestions.products.map((prod) => {
                      const image = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=200';
                      const price = prod.discountPrice || prod.basePrice;

                      return (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                        >
                          <img
                            src={image}
                            alt={language === 'ar' ? prod.nameAr : prod.nameEn}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {language === 'ar' ? prod.nameAr : prod.nameEn}
                            </h5>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(price, currency, language)}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {suggestions.products.length === 0 && suggestions.categories.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <p>No results found for &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
