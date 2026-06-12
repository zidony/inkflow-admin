/* ============================================================
   InkFlow Admin — Notification Center Module
   ============================================================ */

import { showToast } from './toast.js';
import { t } from './i18n.js';
import { registerActions } from './action-bus.js';
import { syncNotificationDateGroups } from './notification-dom.js';

export class NotificationManager {
  constructor() {
    this.list = document.getElementById('notif-full-list');
    this.emptyState = document.getElementById('notif-empty');
    this.filterTabs = document.getElementById('notif-filter-tabs');
    this.init();
  }

  init() {
    if (!this.list) return;

    registerActions({
      'read-one': ({ event, element }) => {
        event.preventDefault();
        this.markOneRead(element);
      },
      'delete-notif': ({ event, element }) => {
        event.preventDefault();
        this.deleteNotification(element);
      },
      'filter-type': ({ event, element }) => {
        event.preventDefault();
        this.filterByType(element.getAttribute('data-filter'), element);
      },
      'clear-read-notifs': ({ event, element }) => {
        event.preventDefault();
        this.clearReadNotifications(element);
      }
    });
  }

  markOneRead(button) {
    const row = button.closest('.ink-notif-row');
    if (!row) return;

    row.classList.remove('unread');
    row.querySelector('.ink-unread-dot')?.remove();
    this.syncUnreadCounts();

    const activeFilter = this.filterTabs?.querySelector('.ink-filter-tab.active')?.dataset.filter;
    if (activeFilter === 'unread') {
      row.classList.add('d-none');
      this.updateEmptyState();
    }

    showToast(t('allRead'), 'success');
  }

  deleteNotification(button) {
    const row = button.closest('.ink-notif-row');
    if (!row) return;

    row.remove();
    this.syncUnreadCounts();
    this.updateEmptyState();
    showToast(t('deleted'), 'danger');
  }

  clearReadNotifications(button) {
    this.list.querySelectorAll('.ink-notif-row:not(.unread)').forEach(row => row.remove());
    this.updateEmptyState();
    showToast(button.getAttribute('data-toast-msg') || t('deleted'), 'success');
  }

  filterByType(filter, button) {
    if (!filter) return;

    if (this.filterTabs) {
      this.filterTabs.querySelectorAll('.ink-filter-tab').forEach(tab => {
        const isActive = tab === button;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    this.list.querySelectorAll('.ink-notif-row').forEach(row => {
      const shouldShow =
        filter === 'all' ||
        (filter === 'unread' && row.classList.contains('unread')) ||
        row.getAttribute('data-type') === filter;

      row.classList.toggle('d-none', !shouldShow);
    });

    this.updateEmptyState();
  }

  updateEmptyState() {
    if (!this.emptyState) return;

    syncNotificationDateGroups(this.list);

    const hasVisibleRows = [...this.list.querySelectorAll('.ink-notif-row')].some(
      row => !row.classList.contains('d-none')
    );
    this.emptyState.classList.toggle('d-none', hasVisibleRows);
  }

  syncUnreadCounts() {
    const unreadCount = this.list.querySelectorAll('.ink-notif-row.unread').length;
    this.updateCount('notif-badge', String(unreadCount));
    this.updateCount('cnt-unread', `(${unreadCount})`);
    this.updateCount('stat-unread', String(unreadCount));
  }

  updateCount(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
      if (id === 'notif-badge') {
        element.classList.toggle('d-none', value === '0');
      }
    }
  }
}
