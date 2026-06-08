/* ============================================================
   InkFlow Admin - Image Upload Preview Module
   ============================================================ */

export class ImageUploadManager {
  constructor() {
    this.fileInput = document.getElementById('img-file-input');
    this.previewBox = document.getElementById('img-preview-box');
    this.uploadZone = document.getElementById('img-upload-zone');
    this.previewImage = document.getElementById('img-preview-img');
    this.init();
  }

  init() {
    if (!this.fileInput || !this.previewBox || !this.uploadZone || !this.previewImage) return;

    this.fileInput.addEventListener('change', () => this.previewSelectedFile());
  }

  previewSelectedFile() {
    const file = this.fileInput.files && this.fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', event => {
      this.previewImage.src = String(event.target.result || '');
      this.previewImage.alt = file.name;
      this.previewBox.classList.remove('d-none');
      this.uploadZone.classList.add('d-none');
    });
    reader.readAsDataURL(file);
  }
}
