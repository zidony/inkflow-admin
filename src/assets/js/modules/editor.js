/* ============================================================
   InkFlow Admin — Post Editor & Form Helpers Module
   ============================================================ */
import { showToast } from './toast.js';
import { t } from './i18n.js';

function setIconText(element, iconClass, text) {
  const icon = document.createElement('i');
  icon.className = iconClass;
  element.replaceChildren(icon, document.createTextNode(text));
}

function setSpinnerText(element, text) {
  const spinner = document.createElement('span');
  spinner.className = 'spinner-border spinner-border-sm me-1';
  element.replaceChildren(spinner, document.createTextNode(text));
}

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
          span.appendChild(document.createTextNode(text));

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          const removeIcon = document.createElement('i');
          removeIcon.className = 'bi bi-x';
          removeBtn.appendChild(removeIcon);
          removeBtn.addEventListener('click', () => span.remove());
          span.appendChild(removeBtn);

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
            const image = document.createElement('img');
            image.src = e.target.result;
            image.alt = 'cover';

            const overlay = document.createElement('div');
            overlay.className = 'ink-cover-overlay';

            const icon = document.createElement('i');
            icon.className = 'bi bi-arrow-repeat';
            overlay.appendChild(icon);
            overlay.appendChild(document.createTextNode(' ' + t('changeCover')));

            coverPreview.replaceChildren(image, overlay);
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
        setSpinnerText(this, t('publishing'));
        setTimeout(() => {
          this.disabled = false;
          setIconText(this, 'bi bi-send-fill me-1', t('publishBtn'));
          showToast(t('published'), 'success');
        }, 1200);
      });
    }

    const saveDraftBtn = document.getElementById('btn-save-draft');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        showToast(t('draftSaved'), 'info');
      });
    }

    const previewBtn = document.getElementById('btn-preview');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        showToast(t('previewOpened'), 'info');
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
        setIconText(
          saveStatus,
          'bi bi-circle-fill ink-save-status-icon ink-save-status-icon-warning',
          t('unsaved')
        );
        asTimer = setTimeout(() => {
          setIconText(
            saveStatus,
            'bi bi-check-circle-fill ink-save-status-icon ink-save-status-icon-success',
            t('draftAutoSaved')
          );
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
        if (
          !t.includes('插入') &&
          !t.includes('撤销') &&
          !t.includes('重做') &&
          !t.includes('全屏')
        ) {
          this.classList.toggle('active');
        }
      });
    });
  }
}
