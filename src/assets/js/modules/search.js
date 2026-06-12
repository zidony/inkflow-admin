/* ============================================================
   InkFlow Admin — Global Keyboard Shortcuts

   Live table filtering lives in ListFilterManager (list-filter.js); this
   module only owns the keyboard UX: Ctrl/Cmd+K focuses search, ESC closes the
   mobile sidebar.
   ============================================================ */

export class SearchManager {
  constructor() {
    this.listSearch = document.getElementById('list-search');
    this.sidebar = document.getElementById('sidebar');
    this.overlay = document.getElementById('sidebar-overlay');
    this.init();
  }

  init() {
    document.addEventListener('keydown', e => {
      // Ctrl/Cmd + K: Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        if (this.listSearch) {
          e.preventDefault();
          this.listSearch.focus();
        }
      }
      // ESC: Close mobile menu
      if (e.key === 'Escape') {
        if (this.sidebar && this.sidebar.classList.contains('mobile-open')) {
          this.sidebar.classList.remove('mobile-open');
          if (this.overlay) this.overlay.classList.remove('active');
        }
      }
    });
  }
}
