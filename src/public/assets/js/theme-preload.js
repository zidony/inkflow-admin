(function () {
  try {
    const theme = localStorage.getItem('inkflow_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const sidebarCollapsed = localStorage.getItem('inkflow_sidebar_collapsed');
    if (sidebarCollapsed === '1' && window.innerWidth >= 992) {
      document.documentElement.classList.add('sidebar-collapsed');
    }
  } catch {
    // Keep theme bootstrapping best-effort for private browsing and strict storage policies.
  }
})();
