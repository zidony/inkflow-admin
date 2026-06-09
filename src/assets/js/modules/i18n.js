/* ============================================================
   InkFlow Admin — Internationalization (i18n) Module
   ============================================================ */

export const locales = {
  zh: {
    confirmDelete: '确定要删除该项目吗？此操作不可撤销。',
    deleted: '已删除',
    allRead: '已全部标记已读',
    permDeleteConfirm: '确定永久删除吗？此操作不可恢复。',
    fileDeleted: '文件已删除',
    publishing: '发布中…',
    published: '文章已成功发布！',
    publishBtn: '发布文章',
    draftSaved: '草稿已保存',
    previewOpened: '预览已在新标签页打开',
    draftAutoSaved: '草稿已自动保存 · 刚刚',
    unsaved: '未保存',
    copied: '已复制到剪贴板',
    copyFailed: '复制失败，请手动复制',
    emailComposerOpened: '邮件客户端已打开',
    linkUrlRequired: '请先填写链接地址',
    linkUrlInvalid: '链接地址格式不正确',
    validatingLink: '正在验证...',
    linkValid: '链接有效',
    tagsImportEmpty: '请先输入要导入的标签',
    importingTags: '正在导入...',
    tagsImported: '已导入 {count} 个标签',
    selectedCoverAlt: '已选择的封面图',
    coverMediaSelected: '已从媒体库选择封面',
    imageCropModeEnabled: '图片裁剪区域已高亮',
    thumbnailRegenerating: '正在重新生成...',
    thumbnailRegenerated: '缩略图已重新生成',
    selectionCleared: '已取消选择',
    excerptGenerated: '摘要已自动生成',
    slugEditable: 'Slug 已可编辑',
    sourceModeEnabled: '已切换到源码模式',
    previewModeEnabled: '已切换到预览模式',
    fullscreenEnabled: '全屏模式已开启',
    fullscreenDisabled: '全屏模式已退出',
    clearingCache: '正在清除缓存...',
    cacheCleared: '缓存已全部清除',
    rebuildingAssets: '正在重新生成...',
    assetsRebuilt: 'CSS/JS 资源已重新生成',
    sendingTestEmail: '正在发送测试邮件...',
    testEmailSent: '测试邮件发送成功',
    toastSuccess: '操作成功',
    visitsLabel: '访问量',
    toggleLightMode: '切换到明亮模式',
    toggleDarkMode: '切换到暗黑模式',
    changeCover: '更换图片',
    notificationPreferenceSaved: '偏好已保存',
    mailNotificationEnabled: '邮件通知已开启',
    mailNotificationDisabled: '邮件通知已关闭',
    loginVerifying: '验证中…',
    loginButton: '登录后台'
  },
  en: {
    confirmDelete: 'Are you sure you want to delete this item? This action cannot be undone.',
    deleted: 'Deleted',
    allRead: 'All marked as read',
    permDeleteConfirm:
      'Are you sure you want to delete permanently? This action cannot be recovered.',
    fileDeleted: 'File deleted',
    publishing: 'Publishing...',
    published: 'Article published successfully!',
    publishBtn: 'Publish Article',
    draftSaved: 'Draft saved',
    previewOpened: 'Preview opened in a new tab',
    draftAutoSaved: 'Draft auto-saved · Just now',
    unsaved: 'Unsaved',
    copied: 'Copied to clipboard',
    copyFailed: 'Copy failed. Please copy manually.',
    emailComposerOpened: 'Email composer opened',
    linkUrlRequired: 'Enter a link URL first',
    linkUrlInvalid: 'Link URL format is invalid',
    validatingLink: 'Validating...',
    linkValid: 'Link is valid',
    tagsImportEmpty: 'Enter tags to import first',
    importingTags: 'Importing...',
    tagsImported: '{count} tags imported',
    selectedCoverAlt: 'Selected cover image',
    coverMediaSelected: 'Cover selected from media library',
    imageCropModeEnabled: 'Image crop area highlighted',
    thumbnailRegenerating: 'Regenerating...',
    thumbnailRegenerated: 'Thumbnails regenerated',
    selectionCleared: 'Selection cleared',
    excerptGenerated: 'Excerpt generated',
    slugEditable: 'Slug is editable',
    sourceModeEnabled: 'Source mode enabled',
    previewModeEnabled: 'Preview mode enabled',
    fullscreenEnabled: 'Fullscreen mode enabled',
    fullscreenDisabled: 'Fullscreen mode disabled',
    clearingCache: 'Clearing cache...',
    cacheCleared: 'Cache cleared',
    rebuildingAssets: 'Rebuilding...',
    assetsRebuilt: 'CSS/JS assets rebuilt',
    sendingTestEmail: 'Sending test email...',
    testEmailSent: 'Test email sent',
    toastSuccess: 'Success',
    visitsLabel: 'Visits',
    toggleLightMode: 'Switch to light mode',
    toggleDarkMode: 'Switch to dark mode',
    changeCover: 'Change Image',
    notificationPreferenceSaved: 'Preference saved',
    mailNotificationEnabled: 'Email notifications enabled',
    mailNotificationDisabled: 'Email notifications disabled',
    loginVerifying: 'Verifying...',
    loginButton: 'Log in'
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

  t(key, params = {}) {
    const dict = locales[this.lang] || locales.zh;
    const text = dict[key] || key;
    return Object.entries(params).reduce(
      (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
      text
    );
  }
}

// Instantiate and export a single global translator instance
export const i18n = new I18nManager();
export const t = (key, params) => i18n.t(key, params);

// Bind to window for absolute customization & HTML inline backup
window.inkflowT = t;
