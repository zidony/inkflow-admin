import { t } from './i18n.js';

export class ThemeManager {
  constructor() {
    this.THEME_KEY = 'inkflow_theme';
    this.currentTheme = 'light';
    this.init();
  }

  init() {
    // 1. Determine theme (localStorage -> System Preference -> Light default)
    const cachedTheme = localStorage.getItem(this.THEME_KEY);
    if (cachedTheme === 'dark' || cachedTheme === 'light') {
      this.currentTheme = cachedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.currentTheme = 'dark';
    }

    // 2. Apply theme to HTML root
    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch {}

    // Dispatch global event just in case charts or other scripts need to re-render
    const event = new CustomEvent('inkflowThemeChanged', { detail: { theme } });
    window.dispatchEvent(event);

    this.updateToggleButtons();
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  updateToggleButtons() {
    // Sync UI icons/states for all toggle buttons on the page
    const btns = document.querySelectorAll('[data-action="toggle-theme"]');
    btns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        if (this.currentTheme === 'dark') {
          icon.className = 'bi bi-sun';
          btn.setAttribute('title', t('toggleLightMode'));
          btn.setAttribute('aria-label', t('toggleLightMode'));
          btn.setAttribute('aria-pressed', 'true');
        } else {
          icon.className = 'bi bi-moon-stars';
          btn.setAttribute('title', t('toggleDarkMode'));
          btn.setAttribute('aria-label', t('toggleDarkMode'));
          btn.setAttribute('aria-pressed', 'false');
        }
      }
    });
  }
}
