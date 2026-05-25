/* ============================================================
   InkFlow Admin — Sidebar and Navigation Module
   ============================================================ */

export class SidebarManager {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.toggle = document.getElementById('sidebar-toggle');
    this.overlay = document.getElementById('sidebar-overlay');
    this.COLLAPSED_KEY = 'inkflow_sidebar_collapsed';

    this.init();
  }

  isMobile() {
    return window.innerWidth < 992;
  }

  applySidebarState(collapsed) {
    if (this.isMobile()) return;
    if (this.sidebar) {
      this.sidebar.classList.toggle('collapsed', collapsed);
    }
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    try {
      localStorage.setItem(this.COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {}
  }

  init() {
    // 1. Setup toggle clicks
    if (this.toggle && this.sidebar) {
      this.toggle.addEventListener('click', () => {
        if (this.isMobile()) {
          this.sidebar.classList.toggle('mobile-open');
          if (this.overlay) this.overlay.classList.toggle('active');
        } else {
          this.applySidebarState(!this.sidebar.classList.contains('collapsed'));
        }
      });
    }

    // 2. Setup mobile overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => {
        if (this.sidebar) this.sidebar.classList.remove('mobile-open');
        this.overlay.classList.remove('active');
      });
    }

    // 3. Restore collapsed preference
    try {
      if (!this.isMobile() && this.sidebar && localStorage.getItem(this.COLLAPSED_KEY) === '1') {
        this.applySidebarState(true);
      }
    } catch {}

    // 4. Handle resize adjustments
    window.addEventListener('resize', () => {
      if (!this.isMobile() && this.sidebar) {
        this.sidebar.classList.remove('mobile-open');
        if (this.overlay) this.overlay.classList.remove('active');
      }
    });

    // 5. Setup Submenu Accordions
    document.querySelectorAll('.nav-link-item[data-toggle="submenu"]').forEach(btn => {
      const targetEl = document.getElementById(btn.getAttribute('data-target'));
      if (targetEl) {
        targetEl.style.transition = 'max-height 0.25s cubic-bezier(.4,0,.2,1)';
        targetEl.style.overflow = 'hidden';
        targetEl.style.maxHeight = btn.getAttribute('aria-expanded') === 'true'
          ? targetEl.scrollHeight + 'px'
          : '0';
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (!target) return;
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        // Collapse other menus
        document.querySelectorAll('.nav-link-item[data-toggle="submenu"]').forEach(b => {
          if (b !== btn) {
            b.setAttribute('aria-expanded', 'false');
            const t = document.getElementById(b.getAttribute('data-target'));
            if (t) t.style.maxHeight = '0';
          }
        });

        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          target.style.maxHeight = target.scrollHeight + 'px';
        } else {
          btn.setAttribute('aria-expanded', 'false');
          target.style.maxHeight = '0';
        }
      });
    });
  }
}
