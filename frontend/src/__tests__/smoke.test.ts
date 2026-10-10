import { describe, it, expect } from 'vitest';
import { translations } from '../lib/translations';
import { formatPrice } from '../lib/utils';

describe('Frontend Smoke Tests', () => {
  it('Bilingual translations are complete for core actions', () => {
    expect(translations.en.brandName).toBe('TechNest');
    expect(translations.ar.brandName).toBe('تيك نست');
    expect(translations.en.addToCart).toBeDefined();
    expect(translations.ar.addToCart).toBeDefined();
    expect(translations.en.checkout).toBeDefined();
    expect(translations.ar.checkout).toBeDefined();
  });

  it('Currency conversion calculations format correctly in EGP and AED', () => {
    const priceEgp = formatPrice(1000, 'EGP', 'en');
    expect(priceEgp).toContain('1,000');
    expect(priceEgp).toContain('EGP');

    const priceAed = formatPrice(1000, 'AED', 'en');
    expect(priceAed).toContain('AED');

    const priceAr = formatPrice(1000, 'EGP', 'ar');
    expect(priceAr).toContain('ج.م');
  });
});
