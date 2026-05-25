/* ============================================================
   InkFlow Admin — Bulk Selection Manager Module
   ============================================================ */

export class BulkSelectManager {
  constructor() {
    this.selectAll = document.getElementById('select-all');
    this.bulkBar = document.getElementById('bulk-action-bar');
    this.bulkCnt = document.getElementById('bulk-count');
    this.init();
  }

  updateBulkBar() {
    const checked = document.querySelectorAll('.ink-row-check:checked').length;
    if (this.bulkBar) {
      this.bulkBar.classList.toggle('show', checked > 0);
    }
    if (this.bulkCnt) {
      this.bulkCnt.textContent = checked;
    }
    if (this.selectAll) {
      const total = document.querySelectorAll('.ink-row-check').length;
      this.selectAll.indeterminate = checked > 0 && checked < total;
      this.selectAll.checked = total > 0 && checked === total;
    }
  }

  init() {
    if (this.selectAll) {
      this.selectAll.addEventListener('change', () => {
        document.querySelectorAll('.ink-row-check').forEach(cb => {
          cb.checked = this.selectAll.checked;
        });
        this.updateBulkBar();
      });
    }

    document.querySelectorAll('.ink-row-check').forEach(cb => {
      cb.addEventListener('change', () => this.updateBulkBar());
    });
  }
}
