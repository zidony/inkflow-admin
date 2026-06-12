/* ============================================================
   InkFlow Admin — List View Filter (search + status, unified)

   Single source of truth for which list-table rows are visible. Free-text
   search and the status-filter tabs used to each write row.style.display
   independently, so they clobbered one another (e.g. typing in search then
   switching tabs revealed filtered-out rows). Here both inputs feed one
   evaluator: a row is visible only when it matches BOTH the query AND the tab.

   It also re-applies on `inkflow:rows-changed`, so status toggles and bulk
   edits respect the active query/tab without re-implementing the logic.
   ============================================================ */

export class ListFilterManager {
  constructor() {
    this.table = document.querySelector('.ink-table');
    this.searchInput = document.getElementById('list-search');
    this.filterTabs = document.querySelector('.ink-filter-tabs');
    this.query = '';
    this.statusFilter = 'all';
    this.init();
  }

  init() {
    // Only list pages have a table; nothing to filter otherwise.
    if (!this.table) return;

    // Seed the active filter from a pre-selected tab, if the markup has one.
    const activeTab = this.filterTabs?.querySelector('.ink-filter-tab.active');
    if (activeTab) {
      this.statusFilter = activeTab.getAttribute('data-filter') || 'all';
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.query = this.searchInput.value.trim().toLowerCase();
        this.apply();
      });
    }

    if (this.filterTabs) {
      this.filterTabs.addEventListener('click', event => {
        const tab = event.target.closest('.ink-filter-tab');
        if (!tab || !this.filterTabs.contains(tab)) return;

        this.setActiveTab(tab);
        this.statusFilter = tab.getAttribute('data-filter') || 'all';
        this.apply();
      });
    }

    // Re-evaluate after rows are added/removed or a row's status changes.
    document.addEventListener('inkflow:rows-changed', () => this.apply());
  }

  setActiveTab(activeTab) {
    this.filterTabs.querySelectorAll('.ink-filter-tab').forEach(tab => {
      const isActive = tab === activeTab;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  matchesQuery(row) {
    if (!this.query) return true;
    return row.textContent.toLowerCase().includes(this.query);
  }

  matchesFilter(row) {
    if (this.statusFilter === 'all') return true;
    return row.getAttribute('data-status') === this.statusFilter;
  }

  apply() {
    this.table.querySelectorAll('tbody tr').forEach(row => {
      const visible = this.matchesQuery(row) && this.matchesFilter(row);
      row.style.display = visible ? '' : 'none';
    });
  }
}
