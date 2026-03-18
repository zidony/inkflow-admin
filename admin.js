/* ============================================================
   Blog Admin — Shared JavaScript
   Vanilla JS, no dependencies
   ============================================================ */

(function () {
  'use strict';

  /* ---- Sidebar toggle ---- */
  const sidebar  = document.getElementById('sidebar');
  const mainWrap = document.getElementById('main-wrapper');
  const toggle   = document.getElementById('sidebar-toggle');
  const overlay  = document.getElementById('sidebar-overlay');
  const COLLAPSED_KEY = 'ba_sidebar_collapsed';

  function isMobile() { return window.innerWidth < 992; }

  function applySidebarState(collapsed) {
    if (isMobile()) return;
    sidebar.classList.toggle('collapsed', collapsed);
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    try { localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0'); } catch (e) {}
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      if (isMobile()) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      } else {
        const next = !sidebar.classList.contains('collapsed');
        applySidebarState(next);
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });
  }

  // Restore state on load
  try {
    if (!isMobile() && localStorage.getItem(COLLAPSED_KEY) === '1') {
      applySidebarState(true);
    }
  } catch (e) {}

  window.addEventListener('resize', function () {
    if (!isMobile()) {
      sidebar.classList.remove('mobile-open');
      overlay && overlay.classList.remove('active');
    }
  });

  /* ---- Submenu accordion ---- */
  document.querySelectorAll('.nav-link-item[data-toggle="submenu"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-target');
      const target   = document.getElementById(targetId);
      if (!target) return;

      const isOpen = this.getAttribute('aria-expanded') === 'true';

      // Close others
      document.querySelectorAll('.nav-link-item[data-toggle="submenu"]').forEach(function (b) {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          const t = document.getElementById(b.getAttribute('data-target'));
          if (t) { t.style.maxHeight = '0'; }
        }
      });

      if (!isOpen) {
        this.setAttribute('aria-expanded', 'true');
        target.style.maxHeight = target.scrollHeight + 'px';
      } else {
        this.setAttribute('aria-expanded', 'false');
        target.style.maxHeight = '0';
      }
    });

    // Initialize open state
    if (btn.getAttribute('aria-expanded') === 'true') {
      const t = document.getElementById(btn.getAttribute('data-target'));
      if (t) { t.style.maxHeight = t.scrollHeight + 'px'; }
    }
  });

  /* ---- Submenu transition styles ---- */
  document.querySelectorAll('.submenu-wrap').forEach(function (el) {
    el.style.transition = 'max-height 0.25s cubic-bezier(.4,0,.2,1)';
    el.style.overflow   = 'hidden';
    if (!el.style.maxHeight) el.style.maxHeight = '0';
  });

  /* ---- Tag input ---- */
  const tagInput = document.getElementById('tag-input');
  const tagList  = document.getElementById('tag-list');
  if (tagInput && tagList) {
    tagInput.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ',') && this.value.trim()) {
        e.preventDefault();
        addTag(this.value.trim().replace(/,$/, ''));
        this.value = '';
      }
    });

    function addTag(text) {
      const li = document.createElement('span');
      li.className = 'tag-item';
      li.innerHTML = text + '<button type="button"><i class="bi bi-x"></i></button>';
      li.querySelector('button').addEventListener('click', function () { li.remove(); });
      tagList.appendChild(li);
    }

    // Init pre-filled tags
    tagList.querySelectorAll('.tag-item button').forEach(function (btn) {
      btn.addEventListener('click', function () { btn.closest('.tag-item').remove(); });
    });
  }

  /* ---- Cover image preview ---- */
  const coverInput   = document.getElementById('cover-file-input');
  const coverPreview = document.getElementById('cover-preview');
  if (coverInput && coverPreview) {
    coverPreview.addEventListener('click', function () { coverInput.click(); });
    coverInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          coverPreview.innerHTML =
            '<img src="' + e.target.result + '" alt="cover">' +
            '<div class="cover-preview-overlay"><i class="bi bi-arrow-repeat"></i> 更换图片</div>';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  /* ---- Category pill toggle ---- */
  document.querySelectorAll('.category-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      this.classList.toggle('selected');
    });
  });

  /* ---- Animated stat counters ---- */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target') || el.textContent.replace(/[^0-9]/g, ''), 10);
    if (isNaN(target)) return;
    const duration = 900;
    const start    = performance.now();
    const suffix   = el.getAttribute('data-suffix') || '';
    const prefix   = el.getAttribute('data-prefix') || '';

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-value[data-target]').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---- Chart.js mini bar chart (dashboard) ---- */
  function initMiniChart() {
    const canvas = document.getElementById('visits-chart');
    if (!canvas || !window.Chart) return;

    const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const data   = [1200, 1900, 1500, 2800, 2200, 3100, 2600, 3800, 3200, 4100, 3700, 4800];

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '访问量',
          data: data,
          backgroundColor: function (ctx) {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return '#0d6ecc';
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(13,110,204,.85)');
            gradient.addColorStop(1, 'rgba(6,182,212,.45)');
            return gradient;
          },
          borderRadius: 5,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            bodyFont:  { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 }, color: '#94a3b8' }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 }, color: '#94a3b8' }
          }
        }
      }
    });
  }

  // Wait for Chart.js to load
  if (document.readyState === 'complete') {
    initMiniChart();
  } else {
    window.addEventListener('load', initMiniChart);
  }

  /* ---- Table bulk select ---- */
  const selectAll = document.getElementById('select-all');
  if (selectAll) {
    selectAll.addEventListener('change', function () {
      document.querySelectorAll('.row-check').forEach(function (cb) {
        cb.checked = selectAll.checked;
      });
      updateBulkBar();
    });

    document.querySelectorAll('.row-check').forEach(function (cb) {
      cb.addEventListener('change', function () { updateBulkBar(); });
    });
  }

  function updateBulkBar() {
    const checked = document.querySelectorAll('.row-check:checked').length;
    const bar     = document.getElementById('bulk-action-bar');
    const cnt     = document.getElementById('bulk-count');
    if (!bar) return;
    bar.style.display = checked > 0 ? 'flex' : 'none';
    if (cnt) cnt.textContent = checked;
  }

  /* ---- Search filter (post list) ---- */
  const listSearch = document.getElementById('list-search');
  if (listSearch) {
    listSearch.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      document.querySelectorAll('.admin-table tbody tr').forEach(function (row) {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  /* ---- Toast notification ---- */
  window.showToast = function (message, type) {
    type = type || 'success';
    const icons = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    const colors = { success: '#16a34a', danger: '#ef4444', warning: '#d97706', info: '#0d6ecc' };

    const toast = document.createElement('div');
    toast.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:9999',
      'background:#fff', 'border-radius:10px', 'padding:12px 18px',
      'display:flex', 'align-items:center', 'gap:10px',
      'box-shadow:0 8px 30px rgba(0,0,0,.15)', 'font-size:.85rem',
      'font-family:"Plus Jakarta Sans",sans-serif', 'font-weight:500',
      'color:#334155', 'max-width:320px', 'border-left:3px solid ' + colors[type],
      'animation:fadeInUp .3s ease'
    ].join(';');

    toast.innerHTML = '<i class="bi ' + icons[type] + '" style="color:' + colors[type] + ';font-size:1rem;flex-shrink:0"></i>' + message +
      '<button onclick="this.parentNode.remove()" style="margin-left:auto;border:none;background:transparent;cursor:pointer;color:#94a3b8;font-size:1rem;padding:0;line-height:1">&times;</button>';

    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.animation = 'fadeInUp .3s ease reverse forwards';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3500);
  };

  /* ---- Publish button ---- */
  const publishBtn = document.getElementById('btn-publish');
  if (publishBtn) {
    publishBtn.addEventListener('click', function () {
      this.disabled = true;
      this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> 发布中...';
      setTimeout(function () {
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<i class="bi bi-send-fill"></i> 发布文章';
        window.showToast('文章已成功发布！', 'success');
      }, 1200);
    });
  }

  const saveDraftBtn = document.getElementById('btn-save-draft');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', function () {
      window.showToast('草稿已自动保存', 'info');
    });
  }

  /* ---- Word count simulation ---- */
  const editorBody = document.getElementById('editor-body');
  const wordCountEl = document.getElementById('word-count');
  if (editorBody && wordCountEl) {
    editorBody.addEventListener('input', function () {
      const text  = this.textContent || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      wordCountEl.textContent = words;
    });
  }

  /* ---- Animate page cards on load ---- */
  document.querySelectorAll('.anim-fade-up').forEach(function (el, i) {
    el.style.animationDelay = (i * 0.05) + 's';
  });

  /* ---- Date display ---- */
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    const now = new Date();
    const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateEl.textContent = now.toLocaleDateString('zh-CN', opts);
  }

})();
