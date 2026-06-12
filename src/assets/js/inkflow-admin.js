/* ============================================================
   InkFlow Admin — Core Application Module
   v2.1.1
   ============================================================ */

import { ThemeManager } from './modules/theme.js';
import { SidebarManager } from './modules/sidebar.js';
import { SearchManager } from './modules/search.js';
import { BulkSelectManager } from './modules/bulk.js';
import { EditorManager } from './modules/editor.js';
import { DelegationManager } from './modules/delegation.js';
import { FilterManager } from './modules/filter.js';
import { ImageUploadManager } from './modules/image-upload.js';
import { LoginManager } from './modules/login.js';
import { NotificationManager } from './modules/notification.js';
import { SettingsManager } from './modules/settings.js';
import { UserAvatarManager } from './modules/user-avatar.js';

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
      this.delegation = new DelegationManager();
      this.filter = new FilterManager();
      this.imageUpload = new ImageUploadManager();
      this.login = new LoginManager();
      this.notification = new NotificationManager();
      this.settings = new SettingsManager();
      this.userAvatar = new UserAvatarManager();

      // Bind theme toggle directly to global scope so TopBar button can call it
      window.inkflowToggleTheme = () => this.theme.toggleTheme();

      // Lazy-load the charting bundle (Chart.js) only on pages that render a chart.
      if (document.getElementById('visits-chart')) {
        import('./modules/chart.js')
          .then(({ ChartManager }) => {
            this.chart = new ChartManager();
          })
          .catch(() => {});
      }
    });
  }
}

// Initialize the core system
new InkFlowAdmin();
