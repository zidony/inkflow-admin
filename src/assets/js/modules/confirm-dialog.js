/* ============================================================
   InkFlow Admin — Reusable Confirm Dialog

   Promise-based replacement for the native window.confirm(). Native
   confirm() is synchronous, OS-styled, and — critically — after repeated
   calls the browser offers "prevent this page from creating more dialogs";
   once ticked, confirm() silently returns false and destructive actions
   stop working until reload. This funnels every confirmation through one
   reusable Bootstrap modal (same stack as the avatar-crop modal) instead.

   Usage:
     import { confirmDialog } from './confirm-dialog.js';
     if (await confirmDialog({ message: t('confirmDelete') })) { ...delete... }

   All copy is passed in by the caller (keys live in i18n.js), so this
   module stays text-free and locale-agnostic.
   ============================================================ */

const MODAL_ID = 'ink-confirm-modal';

let modalEl = null;
let titleEl = null;
let messageEl = null;
let confirmBtn = null;

// Build the reusable modal DOM once, using createElement (no HTML-string APIs).
function buildModal() {
  const root = document.createElement('div');
  root.className = 'modal fade';
  root.id = MODAL_ID;
  root.tabIndex = -1;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-hidden', 'true');
  root.setAttribute('aria-labelledby', `${MODAL_ID}-title`);

  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog modal-dialog-centered';

  const content = document.createElement('div');
  content.className = 'modal-content';

  // Header: title + close button
  const header = document.createElement('div');
  header.className = 'modal-header';
  titleEl = document.createElement('h5');
  titleEl.className = 'modal-title fw-bold';
  titleEl.id = `${MODAL_ID}-title`;
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn-close';
  closeBtn.setAttribute('data-bs-dismiss', 'modal');
  header.append(titleEl, closeBtn);

  // Body: message
  const body = document.createElement('div');
  body.className = 'modal-body';
  messageEl = document.createElement('p');
  messageEl.className = 'mb-0';
  body.append(messageEl);

  // Footer: cancel + confirm
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-light';
  cancelBtn.setAttribute('data-bs-dismiss', 'modal');
  cancelBtn.setAttribute('data-ink-confirm-cancel', '');
  confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'btn btn-danger';
  confirmBtn.setAttribute('data-ink-confirm-ok', '');
  footer.append(cancelBtn, confirmBtn);

  content.append(header, body, footer);
  dialog.append(content);
  root.append(dialog);
  document.body.append(root);

  modalEl = root;
  modalEl.__cancelBtn = cancelBtn;
  modalEl.__closeBtn = closeBtn;
  return root;
}

function ensureModal() {
  if (!modalEl || !document.body.contains(modalEl)) {
    buildModal();
  }
  return modalEl;
}

/**
 * Show a confirm dialog. Resolves true on confirm, false on cancel / dismiss.
 * Falls back to window.confirm when Bootstrap's modal isn't available.
 * @param {{message: string, title?: string, confirmText?: string, cancelText?: string, confirmType?: string}} options
 * @returns {Promise<boolean>}
 */
export function confirmDialog({
  message,
  title = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  confirmType = 'danger'
} = {}) {
  const Modal = window.bootstrap?.Modal;
  if (!Modal) {
    // Graceful degradation when Bootstrap JS hasn't loaded.
    return Promise.resolve(window.confirm(message));
  }

  ensureModal();
  titleEl.textContent = title;
  messageEl.textContent = message;
  confirmBtn.textContent = confirmText;
  confirmBtn.className = `btn btn-${confirmType}`;
  modalEl.__cancelBtn.textContent = cancelText;

  const instance = Modal.getOrCreateInstance(modalEl);

  return new Promise(resolve => {
    let confirmed = false;

    const onConfirm = () => {
      confirmed = true;
      instance.hide();
    };
    // hidden.bs.modal fires for confirm, cancel, close, and backdrop click;
    // anything that isn't an explicit confirm resolves false.
    const onHidden = () => {
      confirmBtn.removeEventListener('click', onConfirm);
      modalEl.removeEventListener('hidden.bs.modal', onHidden);
      resolve(confirmed);
    };

    confirmBtn.addEventListener('click', onConfirm);
    modalEl.addEventListener('hidden.bs.modal', onHidden);
    instance.show();
  });
}
