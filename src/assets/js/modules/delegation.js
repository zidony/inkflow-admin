/* ============================================================
   InkFlow Admin — Central Event Delegation & General Helpers
   ============================================================ */
import { showToast } from './toast.js';
import { t } from './i18n.js';

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
        el.style.setProperty('--ink-delay', (i * 0.04) + 's');
      }
    });
    // 3. Central Event Delegation
    document.body.addEventListener('click', (e) => {
      // Theme toggle
      const themeBtn = e.target.closest('[data-action="toggle-theme"]');
      if (themeBtn && typeof window.inkflowToggleTheme === 'function') {
        window.inkflowToggleTheme();
        return;
      }

      // Confirm Delete
      const deleteBtn = e.target.closest("[data-action='delete']");
      if (deleteBtn) {
        if (!confirm(t("confirmDelete"))) return;
        const row = deleteBtn.closest("tr") || deleteBtn.closest(".ink-item-container");
        if (row) {
          row.style.transition = "opacity .3s";
          row.style.opacity = "0";
          setTimeout(() => { row.remove(); }, 320);
        }
        showToast(t("deleted"), "danger");
        return;
      }

      // Toast triggers
      const toastBtn = e.target.closest("[data-action='toast']");
      if (toastBtn) {
        const msg = toastBtn.getAttribute("data-toast-msg") || t("toastSuccess");
        const type = toastBtn.getAttribute("data-toast-type") || "success";
        showToast(msg, type);
      }

      // Notification close / read all
      const readAllBtn = e.target.closest("[data-action='read-all']");
      if (readAllBtn) {
        showToast(t("allRead"), "success");
      }

      // Permanent delete
      const permDelBtn = e.target.closest('[data-action="permanent-delete"]');
      if (permDelBtn) {
        if (confirm(t("permDeleteConfirm"))) {
          showToast(t("fileDeleted"), "danger");
          const href = permDelBtn.getAttribute("data-href");
          if (href) setTimeout(() => { window.location = href; }, 800);
        }
      }

      // Navigate
      const navBtn = e.target.closest('[data-action="navigate"]');
      if (navBtn) {
        const href = navBtn.getAttribute("data-href");
        if (href) window.location = href;
      }

      // Trigger click on another element
      const triggerBtn = e.target.closest('[data-action="trigger"]');
      if (triggerBtn) {
        const targetId = triggerBtn.getAttribute("data-target");
        if (targetId) {
          const t = document.getElementById(targetId);
          if (t) t.click();
        }
      }

      // Custom dispatchers for page-specific inline functions
      const readOneBtn = e.target.closest('[data-action="read-one"]');
      if (readOneBtn && typeof window.markOneRead === "function") {
        window.markOneRead(readOneBtn);
      }

      const delNotifBtn = e.target.closest('[data-action="delete-notif"]');
      if (delNotifBtn && typeof window.deleteNotif === "function") {
        window.deleteNotif(delNotifBtn);
      }

      if (e.target.closest('[data-action="toggle-pwd"]') && typeof window.togglePwd === "function") {
        window.togglePwd();
      }
      
      if (e.target.closest('[data-action="do-login"]') && typeof window.doLogin === "function") {
        window.doLogin();
      }
      
      if (e.target.closest('[data-action="clear-preview"]') && typeof window.clearPreview === "function") {
        window.clearPreview();
      }

      const switchSetBtn = e.target.closest('[data-action="switch-settings"]');
      if (switchSetBtn && typeof window.switchSettings === "function") {
        window.switchSettings(switchSetBtn.getAttribute("data-section"));
      }

      const filterBtn = e.target.closest('[data-action="filter-type"]');
      if (filterBtn && typeof window.filterByType === "function") {
        window.filterByType(filterBtn.getAttribute("data-filter"), filterBtn);
      }
    });
  }
}
