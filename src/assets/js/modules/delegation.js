/* ============================================================
   InkFlow Admin — Central Event Delegation & General Helpers
   ============================================================ */
import { showToast } from './toast.js';
import { t } from './i18n.js';

const clickActionHandlers = {
  'toggle-theme': manager => manager.toggleTheme(),
  delete: manager => manager.confirmDelete(),
  toast: manager => manager.showToast(),
  'read-all': manager => manager.readAll(),
  'permanent-delete': manager => manager.permanentDelete(),
  navigate: manager => manager.navigate(),
  trigger: manager => manager.triggerTarget(),
  'toggle-pwd': manager => manager.callWindowHandler('togglePwd'),
  'do-login': manager => manager.callWindowHandler('doLogin'),
  'clear-preview': manager => manager.callWindowHandler('clearPreview')
};

const changeActionHandlers = {
  'save-notification-pref': manager => manager.saveNotificationPreference(),
  'toggle-mail-pref': manager => manager.toggleMailPreference()
};

export class DelegationManager {
  constructor() {
    this.init();
  }

  init() {
    // 1. Setup topbar date
    const dateEl = document.getElementById('topbar-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    }

    // 2. Stagger animations
    document.querySelectorAll('.ink-anim').forEach((el, i) => {
      if (!el.style.getPropertyValue('--ink-delay')) {
        el.style.setProperty('--ink-delay', i * 0.04 + 's');
      }
    });

    // 3. Baseline accessibility semantics for template controls.
    this.enhanceControlSemantics();

    // 4. Central Event Delegation
    document.body.addEventListener('click', e => this.handleClick(e));
    document.body.addEventListener('change', e => this.handleChange(e));
  }

  handleClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.getAttribute('data-action');
    const handler = clickActionHandlers[action];
    if (!handler) return;

    handler({
      event,
      element: actionEl,
      toggleTheme: () => {
        if (typeof window.inkflowToggleTheme === 'function') {
          window.inkflowToggleTheme();
        }
      },
      confirmDelete: () => this.confirmDelete(actionEl),
      showToast: () => this.showToast(actionEl),
      readAll: () => showToast(t('allRead'), 'success'),
      permanentDelete: () => this.permanentDelete(actionEl),
      navigate: () => this.navigate(actionEl),
      triggerTarget: () => this.triggerTarget(actionEl),
      callWindowHandler: (handlerName, dataAttributes = []) =>
        this.callWindowHandler(handlerName, actionEl, dataAttributes),
      saveNotificationPreference: () => this.saveNotificationPreference(),
      toggleMailPreference: () => this.toggleMailPreference(actionEl)
    });
  }

  handleChange(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.getAttribute('data-action');
    const handler = changeActionHandlers[action];
    if (!handler) return;

    handler({
      element: actionEl,
      saveNotificationPreference: () => this.saveNotificationPreference(),
      toggleMailPreference: () => this.toggleMailPreference(actionEl)
    });
  }

  enhanceControlSemantics() {
    document.querySelectorAll('button:not([type])').forEach(button => {
      button.setAttribute('type', 'button');
    });

    document
      .querySelectorAll('button[title], a.btn-icon[title], .ink-toolbar-btn[title]')
      .forEach(el => {
        if (!el.getAttribute('aria-label')) {
          el.setAttribute('aria-label', el.getAttribute('title'));
        }
      });

    document.querySelectorAll('.btn-icon i, .ink-toolbar-btn i').forEach(icon => {
      icon.setAttribute('aria-hidden', 'true');
    });

    document.querySelectorAll('.ink-filter-tabs').forEach(tabList => {
      tabList.setAttribute('role', 'tablist');
      tabList.querySelectorAll('.ink-filter-tab').forEach(tab => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
      });
    });

    const settingsNav = document.querySelector('.ink-settings-nav');
    if (settingsNav) {
      settingsNav.setAttribute('role', 'tablist');
      settingsNav.querySelectorAll('.ink-settings-nav-item').forEach(btn => {
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');
      });
    }
  }

  confirmDelete(deleteBtn) {
    if (!confirm(t('confirmDelete'))) return;
    const row = deleteBtn.closest('tr') || deleteBtn.closest('.ink-item-container');
    if (row) {
      row.style.transition = 'opacity .3s';
      row.style.opacity = '0';
      setTimeout(() => {
        row.remove();
      }, 320);
    }
    showToast(t('deleted'), 'danger');
  }

  showToast(toastBtn) {
    const msg = toastBtn.getAttribute('data-toast-msg') || t('toastSuccess');
    const type = toastBtn.getAttribute('data-toast-type') || 'success';
    showToast(msg, type);
  }

  permanentDelete(permDelBtn) {
    if (!confirm(t('permDeleteConfirm'))) return;

    showToast(t('fileDeleted'), 'danger');
    const href = permDelBtn.getAttribute('data-href');
    if (href) {
      setTimeout(() => {
        window.location = href;
      }, 800);
    }
  }

  navigate(navBtn) {
    const href = navBtn.getAttribute('data-href');
    if (href) window.location = href;
  }

  triggerTarget(triggerBtn) {
    const targetId = triggerBtn.getAttribute('data-target');
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (target) target.click();
  }

  callWindowHandler(handlerName, actionEl, dataAttributes = []) {
    if (typeof window[handlerName] !== 'function') return;

    const args = dataAttributes.map(attribute => actionEl.getAttribute(attribute));
    if (handlerName === 'filterByType') {
      args.push(actionEl);
    } else if (!args.length) {
      args.push(actionEl);
    }

    window[handlerName](...args);
  }

  saveNotificationPreference() {
    showToast(t('notificationPreferenceSaved'), 'success');
  }

  toggleMailPreference(mailPref) {
    showToast(t(mailPref.checked ? 'mailNotificationEnabled' : 'mailNotificationDisabled'), 'info');
  }
}
