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
    if (this.toggle) {
      this.toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    }
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
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
          this.toggle.setAttribute(
            'aria-expanded',
            this.sidebar.classList.contains('mobile-open') ? 'true' : 'false'
          );
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
        if (this.toggle) this.toggle.setAttribute('aria-expanded', 'false');
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

    // 5. Highlight active menu based on current URL or SSR state
    const ssrActiveLink = document.querySelector('.sidebar-nav-wrap .nav-link-item.active');

    if (!ssrActiveLink) {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';

      // Remove default active classes in case they were left in HTML
      document.querySelectorAll('.nav-link-item').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });

      const activeLink = document.querySelector(`.sidebar-nav-wrap a[href="${currentPath}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
        const submenuWrap = activeLink.closest('.submenu-wrap');
        if (submenuWrap) {
          submenuWrap.classList.add('show');
          const toggleBtn = document.querySelector(
            `.nav-link-item[data-target="${submenuWrap.id}"]`
          );
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.classList.add('active');
          }
        }
      }
    }

    // 6. Setup Submenu Accordions
    document.querySelectorAll('.nav-link-item[data-toggle="submenu"]').forEach(btn => {
      const targetEl = document.getElementById(btn.getAttribute('data-target'));
      if (targetEl) {
        // Sync initial state from SSR or JS routing
        if (btn.getAttribute('aria-expanded') === 'true') {
          targetEl.classList.add('show');
        }
      }

      btn.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (!target) return;
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        // Collapse other menus
        document.querySelectorAll('.nav-link-item[data-toggle="submenu"]').forEach(b => {
          if (b !== btn) {
            b.setAttribute('aria-expanded', 'false');
            const t = document.getElementById(b.getAttribute('data-target'));
            if (t) t.classList.remove('show');
          }
        });

        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          target.classList.add('show');
        } else {
          btn.setAttribute('aria-expanded', 'false');
          target.classList.remove('show');
        }
      });
    });
  }
}
