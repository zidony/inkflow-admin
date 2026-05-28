export class FilterManager {
  constructor() {
    this.init();
  }

  init() {
    document.body.addEventListener('click', (e) => {
      const filterTab = e.target.closest('.ink-filter-tab');
      if (!filterTab) return;

      const container = filterTab.closest('.ink-filter-tabs');
      if (container) {
        container.querySelectorAll('.ink-filter-tab').forEach(t => t.classList.remove('active'));
        filterTab.classList.add('active');
      }

      const filter = filterTab.getAttribute('data-filter');
      const table = document.querySelector('.ink-table');
      if (!table) return;

      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        if (filter === 'all') {
          row.style.display = '';
        } else {
          const status = row.getAttribute('data-status');
          if (status === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        }
      });
    });
  }
}
