/* ============================================================
   InkFlow Admin — Search and Global Keyboard Shortcuts
   ============================================================ */

export class SearchManager {
  constructor() {
    this.listSearch = document.getElementById('list-search');
    this.sidebar = document.getElementById('sidebar');
    this.overlay = document.getElementById('sidebar-overlay');
    this.init();
  }

  init() {
    // 1. Live search filtering
    if (this.listSearch) {
      this.listSearch.addEventListener('input', () => {
        const q = this.listSearch.value.toLowerCase();
        document.querySelectorAll('.ink-table tbody tr').forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }

    // 2. Global keyboard shortcuts
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
