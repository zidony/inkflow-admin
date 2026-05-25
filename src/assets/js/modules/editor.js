/* ============================================================
   InkFlow Admin — Post Editor & Form Helpers Module
   ============================================================ */
import { showToast } from './toast.js';
import { t } from './i18n.js';

export class EditorManager {
  constructor() {
    this.init();
  }

  init() {
    // 1. Tag Input
    const tagInput = document.getElementById('tag-input');
    const tagList = document.getElementById('tag-list');

    if (tagInput && tagList) {
      tagInput.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ',') && this.value.trim()) {
          e.preventDefault();
          const text = this.value.trim().replace(/,+$/, '');
          const span = document.createElement('span');
          span.className = 'ink-tag';
          span.innerHTML = text + '<button type="button"><i class="bi bi-x"></i></button>';
          span.querySelector('button').addEventListener('click', () => span.remove());
          tagList.appendChild(span);
          this.value = '';
        }
      });
      tagList.querySelectorAll('.ink-tag button').forEach(btn => {
        btn.addEventListener('click', () => btn.closest('.ink-tag').remove());
      });
    }

    // 2. Cover Image Preview
    const coverInput = document.getElementById('cover-file-input');
    const coverPreview = document.getElementById('cover-preview');
    if (coverInput && coverPreview) {
      coverPreview.addEventListener('click', () => coverInput.click());
      coverInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
          reader.onload = function (e) {
            coverPreview.innerHTML = `
              <img src="${e.target.result}" alt="cover">
              <div class="ink-cover-overlay"><i class="bi bi-arrow-repeat"></i> ${t("changeCover")}</div>
            `;
          };
          reader.readAsDataURL(this.files[0]);
        }
      });
    }

    // 3. Category Pill Toggle
    document.querySelectorAll('.ink-pill').forEach(pill => {
      pill.addEventListener('click', function () {
        this.classList.toggle('selected');
      });
    });

    // 4. Publish / Draft buttons
    const publishBtn = document.getElementById('btn-publish');
    if (publishBtn) {
      publishBtn.addEventListener('click', function () {
        this.disabled = true;
        this.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>${t("publishing")}`;
        setTimeout(() => {
          this.disabled = false;
          this.innerHTML = `<i class="bi bi-send-fill me-1"></i>${t("publishBtn")}`;
          showToast(t("published"), 'success');
        }, 1200);
      });
    }

    const saveDraftBtn = document.getElementById('btn-save-draft');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        showToast(t("draftSaved"), 'info');
      });
    }

    const previewBtn = document.getElementById('btn-preview');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        showToast(t("previewOpened"), 'info');
      });
    }

    // 5. Word Count
    const editorBody = document.getElementById('editor-body');
    const wordCountEl = document.getElementById('word-count');
    if (editorBody && wordCountEl) {
      editorBody.addEventListener('input', function () {
        const t = (this.textContent || '').trim();
        wordCountEl.textContent = t ? t.split(/\s+/).length : 0;
      });
    }

    // 6. Auto-Save Status
    const saveStatus = document.getElementById('save-status');
    if (saveStatus) {
      let asTimer;
      const triggerAS = () => {
        clearTimeout(asTimer);
        saveStatus.innerHTML = `
          <i class="bi bi-circle-fill" style="color:var(--ink-warning-400);font-size:.45rem;vertical-align:middle;margin-right:3px"></i>${t("unsaved")}
        `;
        asTimer = setTimeout(() => {
          saveStatus.innerHTML = `
            <i class="bi bi-check-circle-fill" style="color:var(--ink-success-400);font-size:.7rem;vertical-align:middle;margin-right:3px"></i>${t("draftAutoSaved")}
          `;
        }, 1800);
      };
      
      const titleInp = document.getElementById('post-title');
      if (titleInp) titleInp.addEventListener('input', triggerAS);
      if (editorBody) editorBody.addEventListener('input', triggerAS);
    }

    // 7. Editor Toolbar
    document.querySelectorAll('.ink-toolbar-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const t = this.title || '';
        if (!t.includes('插入') && !t.includes('撤销') && !t.includes('重做') && !t.includes('全屏')) {
          this.classList.toggle('active');
        }
      });
    });

    // 8. Bind Settings Switcher to global window scope for inline calls
    window.switchSettings = function (section) {
      ['site', 'post', 'comment', 'media', 'seo', 'smtp', 'security', 'cache', 'advanced'].forEach(s => {
        const el = document.getElementById('section-' + s);
        if (el) el.classList.toggle('d-none', s !== section);
      });
      document.querySelectorAll('.ink-settings-nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
      });
    };
  }
}
