import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Currency, Language } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1 AED ≈ 13.5 EGP
const AED_RATE = 0.074;

export function formatPrice(
  amountInEgp: number,
  currency: Currency = 'EGP',
  locale: Language = 'en'
): string {
  let displayAmount = amountInEgp;
  if (currency === 'AED') {
    displayAmount = Math.round(amountInEgp * AED_RATE);
  }

  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'decimal',
    maximumFractionDigits: 0,
  });

  const formattedNumber = formatter.format(displayAmount);
  const currencyLabel = locale === 'ar' ? (currency === 'EGP' ? 'ج.م' : 'د.إ') : currency;

  return locale === 'ar'
    ? `${formattedNumber} ${currencyLabel}`
    : `${currencyLabel} ${formattedNumber}`;
}

export function formatDate(dateString: string, locale: Language = 'en'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('technest_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('technest_session_id', sessionId);
  }
  return sessionId;
}
