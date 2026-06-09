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

function serializeEditorSource(editorBody) {
  const serializer = new window.XMLSerializer();
  return [...editorBody.childNodes]
    .map(node =>
      node.nodeType === window.Node.ELEMENT_NODE
        ? serializer.serializeToString(node)
        : node.textContent
    )
    .join('\n');
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
            image.width = coverPreview.classList.contains('ratio') ? 400 : 600;
            image.height = coverPreview.classList.contains('ratio') ? 225 : 200;
            image.loading = 'lazy';
            image.decoding = 'async';

            const overlay = document.createElement('div');
            overlay.className = 'ink-cover-overlay';

            const icon = document.createElement('i');
            icon.className = 'bi bi-arrow-repeat';
            icon.setAttribute('aria-hidden', 'true');
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
    const publishButtons = document.querySelectorAll('.js-publish-btn');
    publishButtons.forEach(publishBtn => {
      publishBtn.addEventListener('click', function () {
        this.disabled = true;
        setSpinnerText(this, t('publishing'));
        setTimeout(() => {
          this.disabled = false;
          setIconText(this, 'bi bi-send-fill me-1', t('publishBtn'));
          showToast(t('published'), 'success');
        }, 1200);
      });
    });

    const saveDraftButtons = document.querySelectorAll('.js-save-draft-btn');
    saveDraftButtons.forEach(saveDraftBtn => {
      saveDraftBtn.addEventListener('click', () => {
        showToast(t('draftSaved'), 'info');
      });
    });

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

    const excerptButton = document.querySelector('[data-action="generate-excerpt"]');
    const excerptField = document.getElementById('post-excerpt');
    if (excerptButton && excerptField && editorBody) {
      excerptButton.addEventListener('click', () => {
        const sourceText = (editorBody.textContent || '').replace(/\s+/g, ' ').trim();
        if (!sourceText) return;

        excerptField.value =
          sourceText.length > 150 ? `${sourceText.slice(0, 150)}...` : sourceText;
        showToast(t('excerptGenerated'), 'success');
      });
    }

    const slugButton = document.querySelector('[data-action="edit-slug"]');
    const slugField = document.getElementById('slug-preview');
    if (slugButton && slugField) {
      slugButton.addEventListener('click', () => {
        slugField.readOnly = false;
        slugField.classList.add('is-editing');
        slugField.focus();
        slugField.select();
        showToast(t('slugEditable'), 'info');
      });

      slugField.addEventListener('blur', () => {
        slugField.readOnly = true;
        slugField.classList.remove('is-editing');
      });
    }

    document.querySelectorAll('[data-action="toggle-editor-mode"]').forEach(modeButton => {
      modeButton.addEventListener('click', () => {
        if (!editorBody) return;

        const mode = modeButton.getAttribute('data-editor-mode') || 'preview';
        const isSourceMode = mode === 'source';

        document.querySelectorAll('[data-action="toggle-editor-mode"]').forEach(button => {
          const isActive = button === modeButton;
          button.classList.toggle('active', isActive);
          button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (isSourceMode) {
          editorBody.previewNodes = [...editorBody.childNodes].map(node => node.cloneNode(true));
          editorBody.textContent = serializeEditorSource(editorBody);
          editorBody.setAttribute('contenteditable', 'false');
          showToast(t('sourceModeEnabled'), 'info');
          return;
        }

        if (editorBody.previewNodes) {
          editorBody.replaceChildren(...editorBody.previewNodes.map(node => node.cloneNode(true)));
        }
        editorBody.setAttribute('contenteditable', 'true');
        editorBody.focus();
        showToast(t('previewModeEnabled'), 'info');
      });
    });

    const fullscreenButton = document.querySelector('[data-action="toggle-editor-fullscreen"]');
    if (fullscreenButton && editorBody) {
      fullscreenButton.addEventListener('click', () => {
        const editorPanel = editorBody.closest('.ink-panel');
        if (!editorPanel) return;

        const isFullscreen = !editorPanel.classList.contains('is-editor-fullscreen');
        editorPanel.classList.toggle('is-editor-fullscreen', isFullscreen);
        fullscreenButton.classList.toggle('active', isFullscreen);
        fullscreenButton.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
        fullscreenButton.setAttribute('aria-label', isFullscreen ? '退出全屏' : '全屏');
        fullscreenButton.setAttribute('title', isFullscreen ? '退出全屏' : '全屏');

        const icon = fullscreenButton.querySelector('i');
        if (icon) {
          icon.className = isFullscreen ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen';
        }

        editorBody.focus();
        showToast(t(isFullscreen ? 'fullscreenEnabled' : 'fullscreenDisabled'), 'info');
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
    const isToggleToolbarButton = btn => {
      const label = btn.title || '';
      return (
        !label.includes('插入') &&
        !label.includes('撤销') &&
        !label.includes('重做') &&
        !label.includes('全屏')
      );
    };

    document.querySelectorAll('.ink-toolbar-btn').forEach(btn => {
      if (isToggleToolbarButton(btn)) {
        btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
      }

      btn.addEventListener('click', function () {
        if (isToggleToolbarButton(this)) {
          this.classList.toggle('active');
          this.setAttribute('aria-pressed', this.classList.contains('active') ? 'true' : 'false');
        }
      });
    });
  }
}
