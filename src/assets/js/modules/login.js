/* ============================================================
   InkFlow Admin — Login Page Module
   ============================================================ */
import { t } from './i18n.js';

function setButtonContent(button, iconClass, text) {
  const icon = document.createElement('i');
  icon.className = iconClass;
  button.replaceChildren(icon, document.createTextNode(' ' + text));
}

function setLoadingContent(button) {
  const spinner = document.createElement('span');
  spinner.className = 'spinner-border spinner-border-sm me-2';
  button.replaceChildren(spinner, document.createTextNode(t('loginVerifying')));
}

export class LoginManager {
  constructor() {
    this.userInput = document.getElementById('login-user');
    this.passwordInput = document.getElementById('login-pass');
    this.errorBox = document.getElementById('login-error');
    this.loginButton = document.getElementById('login-btn');
    this.eyeIcon = document.getElementById('eye-icon');
    this.init();
  }

  init() {
    if (!this.loginButton || !this.userInput || !this.passwordInput) return;

    document.addEventListener('click', e => {
      if (e.target.closest('[data-action="toggle-pwd"]')) {
        this.togglePassword();
      }

      if (e.target.closest('[data-action="do-login"]')) {
        this.login();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        this.login();
      }
    });
  }

  togglePassword() {
    if (!this.passwordInput || !this.eyeIcon) return;

    const nextType = this.passwordInput.type === 'password' ? 'text' : 'password';
    this.passwordInput.type = nextType;
    this.eyeIcon.className = nextType === 'password' ? 'bi bi-eye-slash' : 'bi bi-eye';
  }

  login() {
    if (!this.loginButton || this.loginButton.disabled) return;

    const user = this.userInput.value.trim();
    const pass = this.passwordInput.value;

    if (this.errorBox) {
      this.errorBox.classList.add('d-none');
    }

    this.loginButton.disabled = true;
    setLoadingContent(this.loginButton);

    setTimeout(() => {
      this.loginButton.disabled = false;
      setButtonContent(this.loginButton, 'bi bi-box-arrow-in-right', t('loginButton'));

      if (user && pass) {
        window.location.href = 'index.html';
        return;
      }

      if (this.errorBox) {
        this.errorBox.classList.remove('d-none');
      }
    }, 900);
  }
}
