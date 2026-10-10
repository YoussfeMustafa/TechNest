'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store';
import { Banner } from '../../types';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface HeroSliderProps {
  banners: Banner[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const { language } = useStore();
  const [current, setCurrent] = useState(0);

  const heroBanners = banners.filter((b) => b.position === 'HERO');
  const count = heroBanners.length;

  useEffect(() => {
    if (count <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, 6000);
    return () => clearInterval(interval);
  }, [count]);

  if (count === 0) return null;

  const currentBanner = heroBanners[current];
  const title = language === 'ar' ? currentBanner.titleAr : currentBanner.titleEn;
  const subtitle = language === 'ar' ? currentBanner.subtitleAr : currentBanner.subtitleEn;
  const buttonText = language === 'ar' ? currentBanner.buttonTextAr : currentBanner.buttonTextEn;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 shadow-2xl min-h-[380px] sm:min-h-[460px] flex items-center">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentBanner.imageEn}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-[0.4] transition-all duration-700 ease-in-out scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent rtl:bg-gradient-to-l rtl:from-slate-950 rtl:via-slate-950/70 rtl:to-transparent" />
      </div>

      {/* Banner Content */}
      <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
          Featured Launch 2026
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-lg">
            {subtitle}
          </p>
        )}

        <div className="pt-2">
          <Link
            href={currentBanner.link || '/products'}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + count) % count)}
            className="absolute left-4 rtl:left-auto rtl:right-4 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          <button
            onClick={() => setCurrent((prev) => (prev + 1) % count)}
            className="absolute right-4 rtl:right-auto rtl:left-4 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? 'w-8 bg-blue-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
