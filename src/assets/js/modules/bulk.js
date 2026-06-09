/* ============================================================
   InkFlow Admin — Bulk Selection Manager Module
   ============================================================ */

import { showToast } from './toast.js';
import { t } from './i18n.js';

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

    document.addEventListener('inkflow:rows-changed', () => this.updateBulkBar());

    document.addEventListener('click', event => {
      const clearSelectionButton = event.target.closest('[data-action="clear-selection"]');
      if (clearSelectionButton) {
        event.preventDefault();
        this.clearSelection();
        return;
      }

      const bulkDeleteButton = event.target.closest('[data-action="bulk-delete"]');
      if (!bulkDeleteButton) return;

      event.preventDefault();
      this.deleteSelectedRows();
    });
  }

  clearSelection() {
    const checkedBoxes = document.querySelectorAll('.ink-row-check:checked');
    if (!checkedBoxes.length) return;

    checkedBoxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    this.updateBulkBar();
    showToast(t('selectionCleared'), 'info');
  }

  deleteSelectedRows() {
    const checkedRows = [...document.querySelectorAll('.ink-row-check:checked')]
      .map(checkbox => checkbox.closest('tr') || checkbox.closest('.ink-item-container'))
      .filter(Boolean);

    if (!checkedRows.length) return;
    if (!confirm(t('confirmDelete'))) return;

    checkedRows.forEach(row => row.remove());
    document.dispatchEvent(new CustomEvent('inkflow:rows-changed'));
    this.updateBulkBar();
    showToast(t('deleted'), 'danger');
  }
}
