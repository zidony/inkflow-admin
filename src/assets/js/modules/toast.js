/* ============================================================
   InkFlow Admin — Message Toast Notification Module
   ============================================================ */

export function showToast(message, type = 'success') {
  const icons = {
    success: 'bi-check-circle-fill',
    danger: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };
  
  const colors = {
    success: '#16a34a',
    danger: '#ef4444',
    warning: '#d97706',
    info: '#0d6ecc'
  };
  
  const toast = document.createElement('div');
  
  // Apply premium styling
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '9999',
    background: 'var(--ink-card-bg, #fff)',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: 'var(--ink-card-shadow-hover, 0 8px 30px rgba(0,0,0,.14))',
    fontSize: '.85rem',
    fontFamily: '"Plus Jakarta Sans",system-ui,sans-serif',
    fontWeight: '500',
    color: 'var(--ink-gray-800, #334155)',
    maxWidth: '320px',
    borderLeft: '4px solid ' + colors[type],
    border: '1px solid var(--ink-card-border, #e2e8f0)',
    borderLeftColor: colors[type],
    animation: 'ink-fade-up .3s ease both'
  });
  
  const iconEl = document.createElement('i');
  iconEl.className = 'bi ' + icons[type];
  Object.assign(iconEl.style, {
    color: colors[type],
    fontSize: '1rem',
    flexShrink: '0'
  });
  
  const msgEl = document.createElement('span');
  msgEl.style.flex = '1';
  msgEl.textContent = message; // Safe DOM text node insertion
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  Object.assign(closeBtn.style, {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--ink-gray-400, #94a3b8)',
    fontSize: '1.1rem',
    padding: '0',
    lineHeight: '1',
    marginLeft: '4px'
  });
  closeBtn.addEventListener('click', () => toast.remove());
  
  toast.appendChild(iconEl);
  toast.appendChild(msgEl);
  toast.appendChild(closeBtn);
  document.body.appendChild(toast);
  
  // Auto dismiss after 3.5 seconds
  setTimeout(() => {
    toast.style.animation = 'ink-fade-up .3s ease reverse forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3500);
}

// Bind to window for HTML inline script backward compatibility
window.showToast = showToast;
