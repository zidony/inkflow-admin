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
  'clear-preview': manager => manager.clearPreview()
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

    // 3. Central Event Delegation
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
      readAll: () => this.readAllNotifications(),
      permanentDelete: () => this.permanentDelete(actionEl),
      navigate: () => this.navigate(actionEl),
      triggerTarget: () => this.triggerTarget(actionEl),
      clearPreview: () => this.clearPreview(actionEl),
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

  readAllNotifications() {
    const activeFilter = document.querySelector('#notif-filter-tabs .ink-filter-tab.active')
      ?.dataset.filter;

    document.querySelectorAll('.ink-notif-item.unread, .ink-notif-row.unread').forEach(item => {
      item.classList.remove('unread');
      item.querySelector('.ink-notif-dot, .ink-unread-dot')?.remove();

      if (activeFilter === 'unread' && item.classList.contains('ink-notif-row')) {
        item.classList.add('d-none');
      }
    });

    this.updateNotificationCount('notif-badge', '0');
    this.updateNotificationCount('cnt-unread', '(0)');
    this.updateNotificationCount('stat-unread', '0');
    this.updateNotificationEmptyState();
    showToast(t('allRead'), 'success');
  }

  updateNotificationCount(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
      if (id === 'notif-badge') {
        element.classList.toggle('d-none', value === '0');
      }
    }
  }

  updateNotificationEmptyState() {
    const list = document.getElementById('notif-full-list');
    const emptyState = document.getElementById('notif-empty');
    if (!list || !emptyState) return;

    const hasVisibleRows = [...list.querySelectorAll('.ink-notif-row')].some(
      row => !row.classList.contains('d-none')
    );
    emptyState.classList.toggle('d-none', hasVisibleRows);
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

  clearPreview(clearBtn) {
    const previewBox = clearBtn.closest('.ink-image-preview-box');
    if (previewBox) {
      previewBox.classList.add('d-none');
    }

    const fileInput = document.getElementById('img-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  saveNotificationPreference() {
    showToast(t('notificationPreferenceSaved'), 'success');
  }

  toggleMailPreference(mailPref) {
    showToast(t(mailPref.checked ? 'mailNotificationEnabled' : 'mailNotificationDisabled'), 'info');
  }
}
