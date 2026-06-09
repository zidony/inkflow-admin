/* ============================================================
   InkFlow Admin — Central Event Delegation & General Helpers
   ============================================================ */
import { showToast } from './toast.js';
import { t } from './i18n.js';
import { syncNotificationDateGroups } from './notification-dom.js';

const clickActionHandlers = {
  'toggle-theme': manager => manager.toggleTheme(),
  'toggle-user-status': manager => manager.toggleUserStatus(),
  'copy-field': manager => manager.copyField(),
  delete: manager => manager.confirmDelete(),
  'email-user': manager => manager.emailUser(),
  toast: manager => manager.showToast(),
  'read-all': manager => manager.readAll(),
  'permanent-delete': manager => manager.permanentDelete(),
  'preview-image': manager => manager.previewImage(),
  'toggle-comment-status': manager => manager.toggleCommentStatus(),
  'toggle-post-status': manager => manager.togglePostStatus(),
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
      toggleUserStatus: () => this.toggleUserStatus(actionEl),
      copyField: () => this.copyField(actionEl),
      confirmDelete: () => this.confirmDelete(actionEl),
      emailUser: () => this.emailUser(actionEl),
      showToast: () => this.showToast(actionEl),
      readAll: () => this.readAllNotifications(),
      permanentDelete: () => this.permanentDelete(actionEl),
      previewImage: () => this.previewImage(actionEl),
      toggleCommentStatus: () => this.toggleCommentStatus(actionEl),
      togglePostStatus: () => this.togglePostStatus(actionEl),
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
        document.dispatchEvent(new CustomEvent('inkflow:rows-changed'));
      }, 320);
    }
    showToast(t('deleted'), 'danger');
  }

  showToast(toastBtn) {
    const msg = toastBtn.getAttribute('data-toast-msg') || t('toastSuccess');
    const type = toastBtn.getAttribute('data-toast-type') || 'success';
    showToast(msg, type);
  }

  async copyField(copyBtn) {
    const targetId = copyBtn.getAttribute('data-target');
    const copyValue = copyBtn.getAttribute('data-copy-value');
    const field = targetId
      ? document.getElementById(targetId)
      : copyBtn.closest('.input-group')?.querySelector('input');
    const value = copyValue || field?.value || field?.textContent || '';

    if (!value) return;

    try {
      if (window.navigator.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(value);
      } else if (field.select) {
        field.select();
        document.execCommand('copy');
      }
      showToast(
        copyBtn.getAttribute('data-toast-msg') || t('copied'),
        copyBtn.getAttribute('data-toast-type') || 'success'
      );
    } catch {
      showToast(t('copyFailed'), 'danger');
    }
  }

  emailUser(emailBtn) {
    const row = emailBtn.closest('tr');
    const email = row?.querySelector('.ink-item-text small')?.textContent?.trim();
    if (!email) return;

    window.location.href = `mailto:${encodeURIComponent(email)}`;
    showToast(t('emailComposerOpened'), 'info');
  }

  toggleUserStatus(statusBtn) {
    const row = statusBtn.closest('tr');
    if (!row) return;

    const nextBanned = row.dataset.status !== 'banned';
    row.dataset.status = nextBanned ? 'banned' : 'active';

    const statusBadge = row.querySelector('td:nth-last-child(2) .ink-badge');
    if (statusBadge) {
      statusBadge.classList.remove('u-tint-green', 'u-tint-red', 'u-tint-slate');
      statusBadge.classList.add(nextBanned ? 'u-tint-red' : 'u-tint-green');

      const dot = document.createElement('span');
      dot.className = 'ink-badge-dot';
      statusBadge.replaceChildren(dot, document.createTextNode(nextBanned ? '已封禁' : '正常'));
    }

    const label = nextBanned ? '解封用户' : '封禁用户';
    statusBtn.setAttribute('title', label);
    statusBtn.setAttribute('aria-label', label);
    statusBtn.setAttribute('data-toast-msg', nextBanned ? '用户已被封禁' : '用户已解封');
    statusBtn.setAttribute('data-toast-type', nextBanned ? 'danger' : 'success');

    const icon = statusBtn.querySelector('i');
    if (icon) {
      icon.className = nextBanned ? 'bi bi-person-check' : 'bi bi-person-x';
    }

    const activeFilter = document
      .querySelector('.ink-filter-tab.active')
      ?.getAttribute('data-filter');
    if (activeFilter && activeFilter !== 'all') {
      row.style.display = row.dataset.status === activeFilter ? '' : 'none';
    }

    this.showToast(statusBtn);
  }

  toggleCommentStatus(statusBtn) {
    const row = statusBtn.closest('tr');
    const nextStatus = statusBtn.getAttribute('data-comment-status');
    if (!row || !nextStatus) return;

    const statusMap = {
      approved: { label: '已审核', className: 'u-tint-green' },
      spam: { label: '垃圾', className: 'u-tint-red' },
      pending: { label: '待审核', className: 'u-tint-amber' }
    };
    const status = statusMap[nextStatus];
    if (!status) return;

    row.dataset.status = nextStatus;

    const statusBadge = row.querySelector('td:nth-last-child(2) .ink-badge');
    if (statusBadge) {
      statusBadge.classList.remove('u-tint-green', 'u-tint-red', 'u-tint-amber');
      statusBadge.classList.add(status.className);

      const dot = document.createElement('span');
      dot.className = 'ink-badge-dot';
      statusBadge.replaceChildren(dot, document.createTextNode(status.label));
    }

    const activeFilter = document
      .querySelector('.ink-filter-tab.active')
      ?.getAttribute('data-filter');
    if (activeFilter && activeFilter !== 'all') {
      row.style.display = row.dataset.status === activeFilter ? '' : 'none';
    }

    this.showToast(statusBtn);
  }

  togglePostStatus(statusBtn) {
    const row = statusBtn.closest('tr');
    const nextStatus = statusBtn.getAttribute('data-post-status');
    if (!row || !nextStatus) return;

    const statusMap = {
      published: { label: '已发布', className: 'u-tint-green' },
      draft: { label: '草稿', className: 'u-tint-slate' },
      pending: { label: '待审核', className: 'u-tint-amber' }
    };
    const status = statusMap[nextStatus];
    if (!status) return;

    row.dataset.status = nextStatus;

    const statusBadge = row.querySelector('td:nth-last-child(2) .ink-badge');
    if (statusBadge) {
      statusBadge.classList.remove('u-tint-green', 'u-tint-slate', 'u-tint-amber');
      statusBadge.classList.add(status.className);

      const dot = document.createElement('span');
      dot.className = 'ink-badge-dot';
      statusBadge.replaceChildren(dot, document.createTextNode(status.label));
    }

    const activeFilter = document
      .querySelector('.ink-filter-tab.active')
      ?.getAttribute('data-filter');
    if (activeFilter && activeFilter !== 'all') {
      row.style.display = row.dataset.status === activeFilter ? '' : 'none';
    }

    this.showToast(statusBtn);
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

    syncNotificationDateGroups(list);

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

  previewImage(previewBtn) {
    const image = previewBtn.closest('tr')?.querySelector('img');
    if (!image?.src) return;

    window.open(image.src, '_blank', 'noopener,noreferrer');
    showToast(t('previewOpened'), 'info');
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

    const uploadZone = document.getElementById('img-upload-zone');
    if (uploadZone) {
      uploadZone.classList.remove('d-none');
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
