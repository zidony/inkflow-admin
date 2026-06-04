(function () {
  try {
    const theme = localStorage.getItem('inkflow_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch {
    // Keep theme bootstrapping best-effort for private browsing and strict storage policies.
  }
})();
