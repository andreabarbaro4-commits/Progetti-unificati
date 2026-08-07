import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormatters } from './useFormatters';
import i18n from './i18n';

describe('useFormatters', () => {
  afterEach(async () => {
    // Reset to English after each test
    await i18n.changeLanguage('en');
  });

  it('returns formatDate, formatNumber, formatCurrency', () => {
    const { result } = renderHook(() => useFormatters());
    expect(result.current.formatDate).toBeTypeOf('function');
    expect(result.current.formatNumber).toBeTypeOf('function');
    expect(result.current.formatCurrency).toBeTypeOf('function');
  });

  it('formatDate uses dateStyle short by default', () => {
    const { result } = renderHook(() => useFormatters());
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    const formatted = result.current.formatDate(date);
    const expected = new Intl.DateTimeFormat('en', { dateStyle: 'short' }).format(date);
    expect(formatted).toBe(expected);
  });

  it('formatDate accepts custom options', () => {
    const { result } = renderHook(() => useFormatters());
    const date = new Date(2024, 0, 15);
    const options: Intl.DateTimeFormatOptions = { dateStyle: 'long' };
    const formatted = result.current.formatDate(date, options);
    const expected = new Intl.DateTimeFormat('en', options).format(date);
    expect(formatted).toBe(expected);
  });

  it('formatDate accepts string and number inputs', () => {
    const { result } = renderHook(() => useFormatters());
    const timestamp = new Date(2024, 5, 1).getTime();
    const fromNumber = result.current.formatDate(timestamp);
    const fromString = result.current.formatDate('2024-06-01');
    expect(fromNumber).toBeTruthy();
    expect(fromString).toBeTruthy();
  });

  it('formatNumber formats with active locale', () => {
    const { result } = renderHook(() => useFormatters());
    const formatted = result.current.formatNumber(1234.56);
    const expected = new Intl.NumberFormat('en').format(1234.56);
    expect(formatted).toBe(expected);
  });

  it('formatCurrency formats with currency style', () => {
    const { result } = renderHook(() => useFormatters());
    const formatted = result.current.formatCurrency(99.99, 'USD');
    const expected = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(99.99);
    expect(formatted).toBe(expected);
  });

  it('re-renders with new locale when language changes', async () => {
    const { result } = renderHook(() => useFormatters());

    // Format with English
    const numEn = result.current.formatNumber(1234.56);
    expect(numEn).toBe(new Intl.NumberFormat('en').format(1234.56));

    // Switch to Italian
    await act(async () => {
      await i18n.changeLanguage('it');
    });

    const numIt = result.current.formatNumber(1234.56);
    expect(numIt).toBe(new Intl.NumberFormat('it').format(1234.56));
  });

  it('formatCurrency includes currency symbol in output', () => {
    const { result } = renderHook(() => useFormatters());
    const formatted = result.current.formatCurrency(50, 'EUR');
    // EUR symbol or code should appear in output
    expect(formatted).toMatch(/€|EUR/);
  });
});
