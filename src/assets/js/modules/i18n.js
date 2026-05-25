/* ============================================================
   InkFlow Admin — Internationalization (i18n) Module
   ============================================================ */

export const locales = {
  zh: {
    confirmDelete: "确定要删除该项目吗？此操作不可撤销。",
    deleted: "已删除",
    allRead: "已全部标记已读",
    permDeleteConfirm: "确定永久删除吗？此操作不可恢复。",
    fileDeleted: "文件已删除",
    publishing: "发布中…",
    published: "文章已成功发布！",
    publishBtn: "发布文章",
    draftSaved: "草稿已保存",
    previewOpened: "预览已在新标签页打开",
    draftAutoSaved: "草稿已自动保存 · 刚刚",
    unsaved: "未保存",
    toastSuccess: "操作成功",
    visitsLabel: "访问量",
    toggleLightMode: "切换到明亮模式",
    toggleDarkMode: "切换到暗黑模式",
    changeCover: "更换图片"
  },
  en: {
    confirmDelete: "Are you sure you want to delete this item? This action cannot be undone.",
    deleted: "Deleted",
    allRead: "All marked as read",
    permDeleteConfirm: "Are you sure you want to delete permanently? This action cannot be recovered.",
    fileDeleted: "File deleted",
    publishing: "Publishing...",
    published: "Article published successfully!",
    publishBtn: "Publish Article",
    draftSaved: "Draft saved",
    previewOpened: "Preview opened in a new tab",
    draftAutoSaved: "Draft auto-saved · Just now",
    unsaved: "Unsaved",
    toastSuccess: "Success",
    visitsLabel: "Visits",
    toggleLightMode: "Switch to light mode",
    toggleDarkMode: "Switch to dark mode",
    changeCover: "Change Image"
  }
};

export class I18nManager {
  constructor() {
    this.lang = this.detectLanguage();
  }

  detectLanguage() {
    // 1. Check if user forced a language via global window config
    if (window.InkFlowLang && locales[window.InkFlowLang]) {
      return window.InkFlowLang;
    }

    // 2. Detect language from HTML <html lang="..."> attribute
    const htmlLang = document.documentElement.getAttribute('lang') || 'zh-CN';
    const langKey = htmlLang.toLowerCase().split('-')[0]; // 'zh-CN' -> 'zh', 'en-US' -> 'en'
    
    if (locales[langKey]) {
      return langKey;
    }

    return 'zh'; // Fallback default
  }

  t(key) {
    const dict = locales[this.lang] || locales.zh;
    return dict[key] || key;
  }
}

// Instantiate and export a single global translator instance
export const i18n = new I18nManager();
export const t = (key) => i18n.t(key);

// Bind to window for absolute customization & HTML inline backup
window.inkflowT = t;
