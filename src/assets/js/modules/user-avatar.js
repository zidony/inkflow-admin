/* ============================================================
   InkFlow Admin — User Avatar Preview Module
   ============================================================ */

import { registerActions } from './action-bus.js';

export class UserAvatarManager {
  constructor() {
    this.fileInput = document.getElementById('avatar-file-input');
    this.avatarImage = document.getElementById('avatar-img');
    this.avatarInitials = document.getElementById('avatar-initials');
    this.cropImage = document.getElementById('crop-source-img');
    this.zoomInput = document.getElementById('crop-zoom');
    this.modalEl = document.getElementById('avatarCropModal');
    this.pendingImageSrc = '';
    this.init();
  }

  init() {
    if (!this.fileInput || !this.avatarImage || !this.cropImage || !this.modalEl) return;

    this.fileInput.addEventListener('change', () => this.previewSelectedFile());

    if (this.zoomInput) {
      this.zoomInput.addEventListener('input', () => {
        const scale = Number(this.zoomInput.value || 100) / 100;
        this.cropImage.style.transform = `scale(${scale})`;
      });
    }

    registerActions({
      'apply-avatar-crop': () => this.applyCrop()
    });
  }

  previewSelectedFile() {
    const file = this.fileInput.files && this.fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', e => {
      this.pendingImageSrc = String(e.target.result || '');
      this.cropImage.src = this.pendingImageSrc;
      this.cropImage.style.transform = 'scale(1)';

      if (this.zoomInput) {
        this.zoomInput.value = '100';
      }

      this.getModal().show();
    });
    reader.readAsDataURL(file);
  }

  applyCrop() {
    if (!this.pendingImageSrc) return;

    this.avatarImage.src = this.pendingImageSrc;
    this.avatarImage.classList.remove('d-none');

    if (this.avatarInitials) {
      this.avatarInitials.classList.add('d-none');
    }

    this.getModal().hide();
  }

  getModal() {
    return window.bootstrap.Modal.getOrCreateInstance(this.modalEl);
  }
}
