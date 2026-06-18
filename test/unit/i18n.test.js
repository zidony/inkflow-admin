import { describe, it, expect } from 'vitest';
import { I18nManager, locales } from '../../src/assets/js/modules/i18n.js';

/* I18nManager reads the active language from <html lang> / window.InkFlowLang,
   interpolates {params}, exposes array entries via list(), and derives a
   BCP-47 date locale. */

describe('i18n', () => {
  it('detects language from <html lang> (zh-CN -> zh)', () => {
    document.documentElement.setAttribute('lang', 'zh-CN');
    delete window.InkFlowLang;
    expect(new I18nManager().lang).toBe('zh');
  });

  it('detects English from <html lang="en-US">', () => {
    document.documentElement.setAttribute('lang', 'en-US');
    delete window.InkFlowLang;
    expect(new I18nManager().lang).toBe('en');
  });

  it('window.InkFlowLang overrides the html attribute', () => {
    document.documentElement.setAttribute('lang', 'zh-CN');
    window.InkFlowLang = 'en';
    expect(new I18nManager().lang).toBe('en');
    delete window.InkFlowLang;
  });

  it('falls back to zh for an unknown language', () => {
    document.documentElement.setAttribute('lang', 'fr-FR');
    delete window.InkFlowLang;
    expect(new I18nManager().lang).toBe('zh');
  });

  it('translates a known key and falls back to the key itself when missing', () => {
    document.documentElement.setAttribute('lang', 'en-US');
    const i18n = new I18nManager();
    expect(i18n.t('deleted')).toBe(locales.en.deleted);
    expect(i18n.t('totally-unknown-key')).toBe('totally-unknown-key');
  });

  it('interpolates {param} placeholders', () => {
    document.documentElement.setAttribute('lang', 'en-US');
    const i18n = new I18nManager();
    expect(i18n.t('tagsImported', { count: 3 })).toContain('3');
  });

  it('list() returns the array entry, with a zh fallback, [] when absent', () => {
    document.documentElement.setAttribute('lang', 'en-US');
    const i18n = new I18nManager();
    expect(i18n.list('months')).toHaveLength(12);
    expect(i18n.list('not-an-array')).toEqual([]);
  });

  it('dateLocale maps language to a BCP-47 tag', () => {
    document.documentElement.setAttribute('lang', 'en-US');
    expect(new I18nManager().dateLocale).toBe('en-US');
    document.documentElement.setAttribute('lang', 'zh-CN');
    expect(new I18nManager().dateLocale).toBe('zh-CN');
  });

  it('zh and en dictionaries expose the same keys (no missing translations)', () => {
    const zhKeys = Object.keys(locales.zh).sort();
    const enKeys = Object.keys(locales.en).sort();
    expect(enKeys).toEqual(zhKeys);
  });
});
