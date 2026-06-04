/* ============================================================
   InkFlow Admin — Core Application Module
   v2.1.1
   ============================================================ */

import * as bootstrap from 'bootstrap';
import { ThemeManager } from './modules/theme.js';
import { SidebarManager } from './modules/sidebar.js';
import { SearchManager } from './modules/search.js';
import { BulkSelectManager } from './modules/bulk.js';
import { EditorManager } from './modules/editor.js';
import { ChartManager } from './modules/chart.js';
import { DelegationManager } from './modules/delegation.js';
import { FilterManager } from './modules/filter.js';
import { LoginManager } from './modules/login.js';
import { UserAvatarManager } from './modules/user-avatar.js';

window.bootstrap = bootstrap;

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
      this.filter = new FilterManager();
      this.login = new LoginManager();
      this.userAvatar = new UserAvatarManager();

      // Bind theme toggle directly to global scope so TopBar button can call it
      window.inkflowToggleTheme = () => this.theme.toggleTheme();
    });
  }
}

// Initialize the core system
new InkFlowAdmin();
