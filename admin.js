/* ============================================================
   InkFlow Admin — Shared JavaScript  v1.1
   Vanilla JS, no external runtime dependencies
   ============================================================ */
(function () {
  'use strict';

  /* ── SIDEBAR TOGGLE ── */
  var sidebar = document.getElementById('sidebar');
  var toggle = document.getElementById('sidebar-toggle');
  var overlay = document.getElementById('sidebar-overlay');
  var COLLAPSED_KEY = 'inkflow_sidebar_collapsed';

  function isMobile() { return window.innerWidth < 992; }

  function applySidebarState(collapsed) {
    if (isMobile()) return;
    sidebar.classList.toggle('collapsed', collapsed);
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    try { localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0'); } catch (_) { }
  }

  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      if (isMobile()) {
        sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
      } else {
        applySidebarState(!sidebar.classList.contains('collapsed'));
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      sidebar && sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });
  }

  try {
    if (!isMobile() && sidebar && localStorage.getItem(COLLAPSED_KEY) === '1') {
      applySidebarState(true);
    }
  } catch (_) { }

  window.addEventListener('resize', function () {
    if (!isMobile() && sidebar) {
      sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('active');
    }
  });

  /* ── SUBMENU ACCORDION ── */
  document.querySelectorAll('.nav-link-item[data-toggle="submenu"]').forEach(function (btn) {
    var targetEl = document.getElementById(btn.getAttribute('data-target'));
    if (targetEl) {
      targetEl.style.transition = 'max-height 0.25s cubic-bezier(.4,0,.2,1)';
      targetEl.style.overflow = 'hidden';
      targetEl.style.maxHeight = btn.getAttribute('aria-expanded') === 'true'
        ? targetEl.scrollHeight + 'px' : '0';
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById(this.getAttribute('data-target'));
      if (!target) return;
      var isOpen = this.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.nav-link-item[data-toggle="submenu"]').forEach(function (b) {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          var t = document.getElementById(b.getAttribute('data-target'));
          if (t) t.style.maxHeight = '0';
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
  });

  /* ── LIVE SEARCH ── */
  var listSearch = document.getElementById('list-search');
  if (listSearch) {
    listSearch.addEventListener('input', function () {
      var q = this.value.toLowerCase();
      document.querySelectorAll('.ci-table tbody tr').forEach(function (row) {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  /* ── BULK SELECT ── */
  var selectAll = document.getElementById('select-all');
  var bulkBar = document.getElementById('bulk-action-bar');
  var bulkCnt = document.getElementById('bulk-count');

  function updateBulkBar() {
    var checked = document.querySelectorAll('.ci-row-check:checked').length;
    if (bulkBar) bulkBar.classList.toggle('show', checked > 0);
    if (bulkCnt) bulkCnt.textContent = checked;
    if (selectAll) {
      var total = document.querySelectorAll('.ci-row-check').length;
      selectAll.indeterminate = checked > 0 && checked < total;
      selectAll.checked = total > 0 && checked === total;
    }
  }

  if (selectAll) {
    selectAll.addEventListener('change', function () {
      document.querySelectorAll('.ci-row-check').forEach(function (cb) { cb.checked = selectAll.checked; });
      updateBulkBar();
    });
  }
  document.querySelectorAll('.ci-row-check').forEach(function (cb) { cb.addEventListener('change', updateBulkBar); });

  /* ── CONFIRM DELETE ── */
  window.ciConfirmDelete = function (btn) {
    if (!confirm('确定要删除该项目吗？此操作不可撤销。')) return;
    var row = btn.closest('tr');
    if (row) { row.style.transition = 'opacity .3s'; row.style.opacity = '0'; setTimeout(function () { row.remove(); }, 320); }
    showToast('已删除', 'danger');
  };

  /* ── TAG INPUT ── */
  var tagInput = document.getElementById('tag-input');
  var tagList = document.getElementById('tag-list');

  if (tagInput && tagList) {
    tagInput.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ',') && this.value.trim()) {
        e.preventDefault();
        var text = this.value.trim().replace(/,+$/, '');
        var span = document.createElement('span');
        span.className = 'ci-tag';
        span.innerHTML = text + '<button type="button"><i class="bi bi-x"></i></button>';
        span.querySelector('button').addEventListener('click', function () { span.remove(); });
        tagList.appendChild(span);
        this.value = '';
      }
    });
    tagList.querySelectorAll('.ci-tag button').forEach(function (btn) {
      btn.addEventListener('click', function () { btn.closest('.ci-tag').remove(); });
    });
  }

  /* ── COVER PREVIEW ── */
  var coverInput = document.getElementById('cover-file-input');
  var coverPreview = document.getElementById('cover-preview');
  if (coverInput && coverPreview) {
    coverPreview.addEventListener('click', function () { coverInput.click(); });
    coverInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          coverPreview.innerHTML = '<img src="' + e.target.result + '" alt="cover"><div class="ci-cover-overlay"><i class="bi bi-arrow-repeat"></i> 更换图片</div>';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  /* ── CATEGORY PILL TOGGLE ── */
  document.querySelectorAll('.ci-pill').forEach(function (pill) {
    pill.addEventListener('click', function () { this.classList.toggle('selected'); });
  });

  /* ── STAT COUNTER ANIMATION ── */
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        var dur = 900, t0 = performance.now();
        (function step(now) {
          var p = Math.min((now - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        })(t0);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.stat-value[data-target]').forEach(function (el) { obs.observe(el); });
  }

  /* ── VISITS CHART ── */
  function initVisitsChart() {
    var canvas = document.getElementById('visits-chart');
    if (!canvas || !window.Chart) return;
    new window.Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [{
          label: '访问量', data: [1200, 1900, 1500, 2800, 2200, 3100, 2600, 3800, 3200, 4100, 3700, 4800],
          backgroundColor: function (ctx) {
            var c = ctx.chart; if (!c.chartArea) return '#0d6ecc';
            var g = c.ctx.createLinearGradient(0, c.chartArea.top, 0, c.chartArea.bottom);
            g.addColorStop(0, 'rgba(13,110,204,.85)'); g.addColorStop(1, 'rgba(6,182,212,.45)'); return g;
          }, borderRadius: 5, borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, tooltip: {
            backgroundColor: '#0f172a', padding: 10, cornerRadius: 8,
            titleFont: { family: "'Plus Jakarta Sans',sans-serif", size: 11 },
            bodyFont: { family: "'Plus Jakarta Sans',sans-serif", size: 12 }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans',sans-serif", size: 10 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans',sans-serif", size: 10 } } }
        }
      }
    });
  }
  if (document.readyState === 'complete') { initVisitsChart(); } else { window.addEventListener('load', initVisitsChart); }

  /* ── TOPBAR DATE ── */
  var dateEl = document.getElementById('topbar-date');
  if (dateEl) { dateEl.textContent = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }); }

  /* ── PUBLISH BUTTON ── */
  var publishBtn = document.getElementById('btn-publish');
  if (publishBtn) {
    publishBtn.addEventListener('click', function () {
      this.disabled = true; this.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>发布中…';
      var self = this;
      setTimeout(function () { self.disabled = false; self.innerHTML = '<i class="bi bi-send-fill me-1"></i>发布文章'; showToast('文章已成功发布！', 'success'); }, 1200);
    });
  }

  var saveDraftBtn = document.getElementById('btn-save-draft');
  if (saveDraftBtn) { saveDraftBtn.addEventListener('click', function () { showToast('草稿已保存', 'info'); }); }

  var previewBtn = document.getElementById('btn-preview');
  if (previewBtn) { previewBtn.addEventListener('click', function () { showToast('预览已在新标签页打开', 'info'); }); }

  /* ── WORD COUNT ── */
  var editorBody = document.getElementById('editor-body');
  var wordCountEl = document.getElementById('word-count');
  if (editorBody && wordCountEl) {
    editorBody.addEventListener('input', function () {
      var t = (this.textContent || '').trim();
      wordCountEl.textContent = t ? t.split(/\s+/).length : 0;
    });
  }

  /* ── AUTO-SAVE STATUS ── */
  var saveStatus = document.getElementById('save-status');
  if (saveStatus) {
    var asTimer;
    function triggerAS() {
      clearTimeout(asTimer);
      saveStatus.innerHTML = '<i class="bi bi-circle-fill" style="color:var(--ci-warning-400);font-size:.45rem;vertical-align:middle;margin-right:3px"></i>未保存';
      asTimer = setTimeout(function () {
        saveStatus.innerHTML = '<i class="bi bi-check-circle-fill" style="color:var(--ci-success-400);font-size:.7rem;vertical-align:middle;margin-right:3px"></i>草稿已自动保存 · 刚刚';
      }, 1800);
    }
    var titleInp = document.getElementById('post-title');
    if (titleInp) titleInp.addEventListener('input', triggerAS);
    if (editorBody) editorBody.addEventListener('input', triggerAS);
  }

  /* ── EDITOR TOOLBAR ── */
  document.querySelectorAll('.ci-toolbar-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = this.title || '';
      if (!t.includes('插入') && !t.includes('撤销') && !t.includes('重做') && !t.includes('全屏')) {
        this.classList.toggle('active');
      }
    });
  });

  /* ── FILTER TABS (generic) ── */
  document.querySelectorAll('.ci-filter-tabs').forEach(function (group) {
    group.querySelectorAll('.ci-filter-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        group.querySelectorAll('.ci-filter-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var filter = tab.dataset.filter;
        if (!filter) return;
        document.querySelectorAll('.ci-table tbody tr').forEach(function (row) {
          row.style.display = (filter === 'all' || row.dataset.status === filter) ? '' : 'none';
        });
      });
    });
  });

  /* ── SETTINGS NAV ── */
  window.switchSettings = function (section) {
    ['site', 'post', 'comment', 'media', 'seo', 'smtp', 'security', 'cache', 'advanced'].forEach(function (s) {
      var el = document.getElementById('section-' + s);
      if (el) el.style.display = (s === section) ? '' : 'none';
    });
    document.querySelectorAll('.ci-settings-nav-item').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.section === section);
    });
  };

  /* ── TOAST ── */
  window.showToast = function (message, type) {
    type = type || 'success';
    var icons = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    var colors = { success: '#16a34a', danger: '#ef4444', warning: '#d97706', info: '#0d6ecc' };
    var toast = document.createElement('div');
    Object.assign(toast.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999', background: '#fff',
      borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 30px rgba(0,0,0,.14)', fontSize: '.85rem',
      fontFamily: '"Plus Jakarta Sans",system-ui,sans-serif', fontWeight: '500', color: '#334155',
      maxWidth: '320px', borderLeft: '3px solid ' + colors[type], animation: 'ci-fade-up .3s ease both'
    });
    toast.innerHTML = '<i class="bi ' + icons[type] + '" style="color:' + colors[type] + ';font-size:1rem;flex-shrink:0"></i><span style="flex:1">' + message + '</span><button onclick="this.parentNode.remove()" style="border:none;background:transparent;cursor:pointer;color:#94a3b8;font-size:1.1rem;padding:0;line-height:1;margin-left:4px">&times;</button>';
    document.body.appendChild(toast);
    setTimeout(function () { toast.style.animation = 'ci-fade-up .3s ease reverse forwards'; setTimeout(function () { toast && toast.remove(); }, 300); }, 3500);
  };

  /* ── STAGGER ANIMATIONS ── */
  document.querySelectorAll('.ci-anim').forEach(function (el, i) {
    if (!el.style.getPropertyValue('--ci-delay')) { el.style.setProperty('--ci-delay', (i * 0.04) + 's'); }
  });

})();
