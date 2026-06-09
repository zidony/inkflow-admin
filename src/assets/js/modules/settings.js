/* ============================================================
   InkFlow Admin — Settings Page Module
   ============================================================ */

import { showToast } from './toast.js';
import { t } from './i18n.js';

const settingsSections = [
  'site',
  'post',
  'comment',
  'media',
  'seo',
  'smtp',
  'security',
  'cache',
  'advanced'
];

export class SettingsManager {
  constructor() {
    this.nav = document.querySelector('.ink-settings-nav');
    this.init();
  }

  init() {
    if (!this.nav) return;

    this.nav.addEventListener('click', event => {
      const switchButton = event.target.closest('[data-action="switch-settings"]');
      if (!switchButton) return;

      this.switchSection(switchButton.getAttribute('data-section'));
    });

    document.addEventListener('click', event => {
      const clearCacheButton = event.target.closest('[data-action="clear-cache"]');
      if (clearCacheButton) {
        this.runMaintenanceAction(
          clearCacheButton,
          t('clearingCache'),
          t('cacheCleared'),
          'success'
        );
        return;
      }

      const rebuildAssetsButton = event.target.closest('[data-action="rebuild-assets"]');
      if (rebuildAssetsButton) {
        this.runMaintenanceAction(
          rebuildAssetsButton,
          t('rebuildingAssets'),
          t('assetsRebuilt'),
          'info'
        );
      }
    });
  }

  runMaintenanceAction(button, loadingText, doneText, type) {
    if (button.disabled) return;

    const originalContent = [...button.childNodes];
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm me-1';
    spinner.setAttribute('aria-hidden', 'true');

    button.disabled = true;
    button.replaceChildren(spinner, document.createTextNode(loadingText));

    window.setTimeout(() => {
      button.disabled = false;
      button.replaceChildren(...originalContent);
      showToast(doneText, type);
    }, 1000);
  }

  switchSection(section) {
    if (!settingsSections.includes(section)) return;

    settingsSections.forEach(key => {
      const sectionEl = document.getElementById(`section-${key}`);
      if (!sectionEl) return;

      const isActive = key === section;
      sectionEl.classList.toggle('d-none', !isActive);
      sectionEl.toggleAttribute('hidden', !isActive);
    });

    this.nav.querySelectorAll('.ink-settings-nav-item').forEach(button => {
      const isActive = button.dataset.section === section;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }
}
