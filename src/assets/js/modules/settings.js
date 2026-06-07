/* ============================================================
   InkFlow Admin — Settings Page Module
   ============================================================ */

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
  }

  switchSection(section) {
    if (!settingsSections.includes(section)) return;

    settingsSections.forEach(key => {
      const sectionEl = document.getElementById(`section-${key}`);
      if (sectionEl) sectionEl.classList.toggle('d-none', key !== section);
    });

    this.nav.querySelectorAll('.ink-settings-nav-item').forEach(button => {
      const isActive = button.dataset.section === section;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }
}
