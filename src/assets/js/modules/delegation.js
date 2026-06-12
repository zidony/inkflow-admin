/* ============================================================
   InkFlow Admin — Central Event Delegation & General Helpers
   ============================================================ */
import { showToast } from './toast.js';
import { t, i18n } from './i18n.js';
import { registerActions } from './action-bus.js';
import { syncNotificationDateGroups } from './notification-dom.js';

export class DelegationManager {
  constructor() {
    this.init();
  }

  init() {
    // 1. Setup topbar date
    const dateEl = document.getElementById('topbar-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString(i18n.dateLocale, {
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

    // 3. Register this module's actions on the central action bus
    registerActions({
      'toggle-theme': () => window.inkflowToggleTheme?.(),
      'toggle-user-status': ({ element }) => this.toggleUserStatus(element),
      'copy-field': ({ element }) => this.copyField(element),
      delete: ({ element }) => this.confirmDelete(element),
      'email-user': ({ element }) => this.emailUser(element),
      'force-user-logout': ({ element }) =>
        this.runAsyncButtonAction(element, t('forcingUserLogout'), t('userLoggedOut'), 'warning'),
      'focus-image-crop': () => this.focusImageCrop(),
      'import-tags': ({ element }) => this.importTags(element),
      toast: ({ element }) => this.showToast(element),
      'read-all': () => this.readAllNotifications(),
      'permanent-delete': ({ element }) => this.permanentDelete(element),
      'preview-image': ({ element }) => this.previewImage(element),
      'publish-comment-reply': ({ element }) =>
        this.runAsyncButtonAction(
          element,
          t('publishingCommentReply'),
          t('commentReplyPublished'),
          'success'
        ),
      'regenerate-thumbnails': ({ element }) => this.regenerateThumbnails(element),
      'save-comment-draft': ({ element }) =>
        this.runAsyncButtonAction(element, t('savingCommentDraft'), t('commentDraftSaved'), 'info'),
      'select-cover-media': ({ element }) => this.selectCoverMedia(element),
      'send-password-reset': ({ element }) =>
        this.runAsyncButtonAction(
          element,
          t('sendingPasswordReset'),
          t('passwordResetSent'),
          'info'
        ),
      'toggle-comment-status': ({ element }) => this.toggleCommentStatus(element),
      'toggle-post-status': ({ element }) => this.togglePostStatus(element),
      'use-gravatar': ({ element }) => this.useGravatar(element),
      'validate-link': ({ element }) => this.validateLink(element),
      navigate: ({ element }) => this.navigate(element),
      trigger: ({ element }) => this.triggerTarget(element),
      'clear-preview': ({ element }) => this.clearPreview(element)
    });

    registerActions(
      {
        'save-notification-pref': () => this.saveNotificationPreference(),
        'toggle-mail-pref': ({ element }) => this.toggleMailPreference(element)
      },
      'change'
    );
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

  runAsyncButtonAction(button, loadingText, doneText, type) {
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
    }, 900);
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

  focusImageCrop() {
    const previewBox = document.getElementById('img-preview-box');
    if (!previewBox) return;

    previewBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    previewBox.classList.add('is-cropping');

    window.clearTimeout(this.imageCropTimer);
    this.imageCropTimer = window.setTimeout(() => {
      previewBox.classList.remove('is-cropping');
    }, 3600);

    showToast(t('imageCropModeEnabled'), 'info');
  }

  regenerateThumbnails(regenerateBtn) {
    if (regenerateBtn.disabled) return;

    const originalContent = [...regenerateBtn.childNodes];
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm me-1';
    spinner.setAttribute('aria-hidden', 'true');

    regenerateBtn.disabled = true;
    regenerateBtn.replaceChildren(spinner, document.createTextNode(t('thumbnailRegenerating')));

    window.setTimeout(() => {
      regenerateBtn.disabled = false;
      regenerateBtn.replaceChildren(...originalContent);
      showToast(t('thumbnailRegenerated'), 'success');
    }, 1000);
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
      statusBadge.replaceChildren(
        dot,
        document.createTextNode(nextBanned ? t('userStatusBanned') : t('userStatusActive'))
      );
    }

    const label = nextBanned ? t('unbanUser') : t('banUser');
    statusBtn.setAttribute('title', label);
    statusBtn.setAttribute('aria-label', label);
    statusBtn.setAttribute('data-toast-msg', nextBanned ? t('userBanned') : t('userUnbanned'));
    statusBtn.setAttribute('data-toast-type', nextBanned ? 'danger' : 'success');

    const icon = statusBtn.querySelector('i');
    if (icon) {
      icon.className = nextBanned ? 'bi bi-person-check' : 'bi bi-person-x';
    }

    // Re-evaluate row visibility against the active search query + filter tab.
    document.dispatchEvent(new CustomEvent('inkflow:rows-changed'));

    this.showToast(statusBtn);
  }

  toggleCommentStatus(statusBtn) {
    const row = statusBtn.closest('tr');
    const nextStatus = statusBtn.getAttribute('data-comment-status');
    if (!nextStatus) return;

    const statusMap = {
      approved: { label: t('commentStatusApproved'), className: 'u-tint-green' },
      spam: { label: t('commentStatusSpam'), className: 'u-tint-red' },
      pending: { label: t('commentStatusPending'), className: 'u-tint-amber' }
    };
    const status = statusMap[nextStatus];
    if (!status) return;

    if (!row) {
      this.updateCommentDetailStatus(statusBtn, status);
      this.showToast(statusBtn);
      return;
    }

    row.dataset.status = nextStatus;

    const statusBadge = row.querySelector('td:nth-last-child(2) .ink-badge');
    if (statusBadge) {
      statusBadge.classList.remove('u-tint-green', 'u-tint-red', 'u-tint-amber');
      statusBadge.classList.add(status.className);

      const dot = document.createElement('span');
      dot.className = 'ink-badge-dot';
      statusBadge.replaceChildren(dot, document.createTextNode(status.label));
    }

    // Re-evaluate row visibility against the active search query + filter tab.
    document.dispatchEvent(new CustomEvent('inkflow:rows-changed'));

    this.showToast(statusBtn);
  }

  updateCommentDetailStatus(statusBtn, status) {
    const detailBadge = statusBtn
      .closest('main')
      ?.querySelector('.ink-comment-author-avatar')
      ?.closest('.d-flex')
      ?.querySelector('.ink-badge');
    if (!detailBadge) return;

    detailBadge.classList.remove('u-tint-green', 'u-tint-red', 'u-tint-amber');
    detailBadge.classList.add(status.className);

    const dot = document.createElement('span');
    dot.className = 'ink-badge-dot';
    detailBadge.replaceChildren(dot, document.createTextNode(status.label));
  }

  togglePostStatus(statusBtn) {
    const row = statusBtn.closest('tr');
    const nextStatus = statusBtn.getAttribute('data-post-status');
    if (!row || !nextStatus) return;

    const statusMap = {
      published: { label: t('postStatusPublished'), className: 'u-tint-green' },
      draft: { label: t('postStatusDraft'), className: 'u-tint-slate' },
      pending: { label: t('postStatusPending'), className: 'u-tint-amber' }
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

    // Re-evaluate row visibility against the active search query + filter tab.
    document.dispatchEvent(new CustomEvent('inkflow:rows-changed'));

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

  validateLink(validateBtn) {
    if (validateBtn.disabled) return;

    const field = validateBtn.closest('.input-group')?.querySelector('input[type="url"]');
    const value = field?.value.trim();
    if (!value) {
      field?.focus();
      showToast(t('linkUrlRequired'), 'danger');
      return;
    }

    try {
      new window.URL(value, window.location.origin);
    } catch {
      field?.focus();
      showToast(t('linkUrlInvalid'), 'danger');
      return;
    }

    const originalContent = [...validateBtn.childNodes];
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm me-1';
    spinner.setAttribute('aria-hidden', 'true');

    validateBtn.disabled = true;
    validateBtn.replaceChildren(spinner, document.createTextNode(t('validatingLink')));

    window.setTimeout(() => {
      validateBtn.disabled = false;
      validateBtn.replaceChildren(...originalContent);
      showToast(t('linkValid'), 'success');
    }, 800);
  }

  importTags(importBtn) {
    if (importBtn.disabled) return;

    const field = importBtn.closest('.ink-panel-body')?.querySelector('textarea');
    const tags = [
      ...new Set(
        (field?.value || '')
          .split(/\r?\n/)
          .map(tag => tag.trim())
          .filter(Boolean)
      )
    ];

    if (!tags.length) {
      field?.focus();
      showToast(t('tagsImportEmpty'), 'warning');
      return;
    }

    const originalContent = [...importBtn.childNodes];
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm me-1';
    spinner.setAttribute('aria-hidden', 'true');

    importBtn.disabled = true;
    importBtn.replaceChildren(spinner, document.createTextNode(t('importingTags')));

    window.setTimeout(() => {
      importBtn.disabled = false;
      importBtn.replaceChildren(...originalContent);
      if (field) field.value = '';
      showToast(t('tagsImported', { count: tags.length }), 'success');
    }, 800);
  }

  selectCoverMedia(mediaBtn) {
    const coverPreview = mediaBtn.closest('.ink-panel-body')?.querySelector('#cover-preview');
    if (!coverPreview) return;

    const isRatioPreview = coverPreview.classList.contains('ratio');
    const width = isRatioPreview ? 400 : 600;
    const height = isRatioPreview ? 225 : 200;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="coverGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f766e"/><stop offset="0.52" stop-color="#2563eb"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#coverGradient)"/><circle cx="${width * 0.78}" cy="${height * 0.3}" r="${height * 0.14}" fill="rgba(255,255,255,.72)"/><path d="M0 ${height * 0.78} ${width * 0.22} ${height * 0.42} ${width * 0.42} ${height * 0.66} ${width * 0.62} ${height * 0.48} ${width} ${height * 0.9} V${height} H0z" fill="rgba(255,255,255,.62)"/></svg>`;

    const image = document.createElement('img');
    image.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    image.alt = t('selectedCoverAlt');
    image.width = width;
    image.height = height;
    image.loading = 'lazy';
    image.decoding = 'async';

    const overlay = document.createElement('div');
    overlay.className = 'ink-cover-overlay';

    const icon = document.createElement('i');
    icon.className = 'bi bi-arrow-repeat';
    icon.setAttribute('aria-hidden', 'true');
    overlay.appendChild(icon);
    overlay.appendChild(document.createTextNode(' ' + t('changeCover')));

    coverPreview.replaceChildren(image, overlay);
    showToast(t('coverMediaSelected'), 'info');
  }

  useGravatar(gravatarBtn) {
    const panel = gravatarBtn.closest('.ink-panel-body');
    const avatarImage = panel?.querySelector('#avatar-img');
    const avatarInitials = panel?.querySelector('#avatar-initials');
    if (!avatarImage) return;

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"><rect width="90" height="90" rx="18" fill="#0f766e"/><circle cx="45" cy="33" r="17" fill="#ccfbf1"/><path d="M18 82c3-18 17-28 27-28s24 10 27 28" fill="#99f6e4"/><path d="M20 16h14v14H20zM56 16h14v14H56zM38 54h14v14H38z" fill="#f59e0b"/></svg>';

    avatarImage.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    avatarImage.alt = t('gravatarAlt');
    avatarImage.classList.remove('d-none');

    if (avatarInitials) {
      avatarInitials.classList.add('d-none');
    }

    showToast(t('gravatarApplied'), 'info');
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
      previewBox.classList.remove('is-cropping');
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
