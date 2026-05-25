/* ============================================================
   InkFlow Admin — Unified Shared Entry Script (ES Module)
   v2.0.0
   ============================================================ */

import { ThemeManager } from './modules/theme.js';
import { SidebarManager } from './modules/sidebar.js';
import { SearchManager } from './modules/search.js';
import { BulkSelectManager } from './modules/bulk.js';
import { EditorManager } from './modules/editor.js';
import { ChartManager } from './modules/chart.js';
import { DelegationManager } from './modules/delegation.js';

class InkFlowAdmin {
  constructor() {
    this.init();
  }

  init() {
    // Instantiate all modules when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.theme = new ThemeManager();
      this.sidebar = new SidebarManager();
      this.search = new SearchManager();
      this.bulk = new BulkSelectManager();
      this.editor = new EditorManager();
      this.chart = new ChartManager();
      this.delegation = new DelegationManager();

      // Bind theme toggle directly to global scope so TopBar button can call it
      window.inkflowToggleTheme = () => this.theme.toggleTheme();
    });
  }
}

// Initialize the core system
new InkFlowAdmin();
