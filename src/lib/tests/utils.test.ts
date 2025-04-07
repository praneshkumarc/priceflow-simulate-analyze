
import { describe, it, expect, afterEach } from 'vitest';
import { cn, isMobile } from '@/lib/utils';

describe('Utility functions', () => {
  describe('cn (className merge utility)', () => {
    it('merges classNames correctly', () => {
      // Basic merge
      expect(cn('a', 'b')).toBe('a b');
      
      // With conditional classes
      expect(cn('a', true && 'b', false && 'c')).toBe('a b');
      
      // With undefined values
      expect(cn('a', undefined, 'b')).toBe('a b');
      
      // With array of classes
      expect(cn('a', ['b', 'c'])).toBe('a b c');
      
      // With object notation
      expect(cn('a', { b: true, c: false })).toMatch(/a b/);
      expect(cn('a', { b: true, c: false })).not.toMatch(/c/);
    });
    
    it('handles empty and falsy inputs', () => {
      expect(cn('')).toBe('');
      expect(cn(null)).toBe('');
      expect(cn(undefined)).toBe('');
      expect(cn(false)).toBe('');
    });
  });
  
  describe('isMobile function', () => {
    const originalUserAgent = window.navigator.userAgent;
    const mockUserAgent = (userAgent: string) => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: userAgent,
        configurable: true
      });
    };
    
    afterEach(() => {
      // Restore original userAgent
      Object.defineProperty(window.navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
    
    it('detects mobile devices correctly', () => {
      // Mobile user agents
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
      expect(isMobile()).toBe(true);
      
      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G975F)');
      expect(isMobile()).toBe(true);
    });
    
    it('detects desktop devices correctly', () => {
      // Desktop user agent
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
      expect(isMobile()).toBe(false);
      
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
      expect(isMobile()).toBe(false);
    });
  });
});
