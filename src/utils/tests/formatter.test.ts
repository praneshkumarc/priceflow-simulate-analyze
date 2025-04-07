
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, truncateText } from '@/utils/formatters';

describe('formatters utility functions', () => {
  describe('formatCurrency', () => {
    it('formats numbers as USD currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1000.5)).toBe('$1,000.50');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-1000)).toBe('-$1,000.00');
    });

    it('handles undefined or null by returning empty string', () => {
      expect(formatCurrency(undefined)).toBe('');
      expect(formatCurrency(null)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats dates in the specified format', () => {
      const date = new Date('2023-01-15');
      expect(formatDate(date)).toMatch(/Jan 15, 2023/);
    });

    it('handles string dates', () => {
      expect(formatDate('2023-01-15')).toMatch(/Jan 15, 2023/);
    });

    it('returns empty string for invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with the specified decimal places', () => {
      expect(formatNumber(1000.5678)).toBe('1,000.57');
      expect(formatNumber(1000.5678, 3)).toBe('1,000.568');
      expect(formatNumber(1000)).toBe('1,000.00');
    });

    it('handles undefined or null by returning empty string', () => {
      expect(formatNumber(undefined)).toBe('');
      expect(formatNumber(null)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('truncates text when it exceeds the specified length', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 10)).toBe('This is a...');
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    it('does not truncate text when it is shorter than the specified length', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    it('handles undefined or null by returning empty string', () => {
      expect(truncateText(undefined, 10)).toBe('');
      expect(truncateText(null, 10)).toBe('');
    });
  });
});
