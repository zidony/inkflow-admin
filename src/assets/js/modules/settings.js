/* ============================================================
   InkFlow Admin — Settings Page Module
   ============================================================ */

import { showToast } from './toast.js';
import { t } from './i18n.js';
import { registerActions } from './action-bus.js';
import { api } from '../services/api.js';

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

    registerActions({
      'switch-settings': ({ element }) => this.switchSection(element.getAttribute('data-section')),
      'clear-cache': ({ element }) =>
        this.runMaintenanceAction(element, t('clearingCache'), t('cacheCleared'), 'success', () =>
          api.maintenance.clearCache()
        ),
      'rebuild-assets': ({ element }) =>
        this.runMaintenanceAction(element, t('rebuildingAssets'), t('assetsRebuilt'), 'info', () =>
          api.maintenance.rebuildAssets()
        ),
      'send-test-email': ({ element }) =>
        this.runMaintenanceAction(
          element,
          t('sendingTestEmail'),
          t('testEmailSent'),
          'success',
          () => api.maintenance.sendTestEmail()
        )
    });
  }

  async runMaintenanceAction(button, loadingText, doneText, type, task) {
    if (button.disabled) return;

    const originalContent = [...button.childNodes];
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm me-1';
    spinner.setAttribute('aria-hidden', 'true');

    button.disabled = true;
    button.replaceChildren(spinner, document.createTextNode(loadingText));

    try {
      await task();
      showToast(doneText, type);
    } catch {
      showToast(t('actionFailed'), 'danger');
    } finally {
      button.disabled = false;
      button.replaceChildren(...originalContent);
    }
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
