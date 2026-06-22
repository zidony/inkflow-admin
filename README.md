# InkFlow Admin

**中文说明书** | [English README](README.en.md)

一套为博客 / 内容管理系统设计的后台管理面板主题模板。项目基于 **Vite + ES6 Modules + PostCSS** 构建，提供本地开发、静态页面构建、暗黑模式和基础 i18n 文案切换能力。

---

## 🚀 在线预览 (Live Demo)

* 🌐 **InkFlow 博客主题演示:** [https://zidony.github.io/inkflow-theme](https://zidony.github.io/inkflow-theme)

* ⚙️ **InkFlow 管理后台演示:** [https://zidony.github.io/inkflow-admin](https://zidony.github.io/inkflow-admin) 

---

## ✨ 核心特性

- **🚀 Vite 构建流程**：使用 **Vite 5** 进行本地开发和生产构建，支持开发阶段 HMR 与生产资源压缩。
- **📦 ESM 模块化脚本**：将全局脚本拆分为多个 ES Modules，包括 Sidebar、Theme、Search、Bulk、Toast、Editor 和 Chart 等模块。图表模块按需动态加载并在编译期独立为 `inkflow-chart.js`，非仪表盘页面不再加载 Chart.js，主包体积显著降低。
- **🌙 暗黑模式**：基于 CSS 变量实现明暗主题切换，并通过 `localStorage` 记录用户选择。
- **🌐 i18n 文案切换**：根据 HTML 的 `<html lang="...">` 属性切换确认提示、加载状态、通知气泡和 Chart.js 图表标签等运行时文案。
- **🔌 服务/适配层**：所有"后端操作"（删除、发布、状态切换、登录、维护任务等）统一经 `services/http.js` 的单一 `request()` 接缝调用，并在调用处具备失败提示接缝。买家只需把该函数体从内置 mock 换成 `fetch()` 即可对接真实后端，无需在各模块里逐个查找替换。
- **🪟 统一确认弹窗**：删除等危险操作改用可复用的 Bootstrap Modal 确认框（`confirmDialog()`，与头像裁剪弹窗同栈），替代原生 `confirm()`，规避浏览器"阻止此页面再创建对话框"导致删除静默失效的陷阱；Bootstrap 不可用时自动降级回原生 `confirm()`。
- **📏 代码质量工具**：配置 ESLint、Stylelint、Prettier、HTML 结构检查、可访问性检查、响应式守卫、内联样式检查、运行时 i18n 检查、JS 边界检查和模板动作校验，可通过 `npm run quality` 运行发布前检查。
- **🧪 测试体系**：`npm run test` 运行 Vitest 单元测试（i18n、ListFilter、ActionBus、服务层 mock）；`npm run test:e2e` 用零依赖的 Chrome DevTools Protocol 脚本驱动真实无头浏览器，对全部页面做「加载无报错 + 核心交互」冒烟（无需安装 Playwright/Puppeteer）。测试默认独立运行，不阻断发布门禁。
- **🗜️ 发布打包**：使用 Node.js 标准库生成 `releases/inkflow-admin-v*.zip`，发布包只包含构建产物和 README 文档。
- **🤖 GitHub Actions 发布流程**：推送 `v*` 标签时运行质量检查、构建、打包并上传 ZIP 到 GitHub Release。

---

## 📁 目录结构

```text
inkflow-admin/
├── .github/
│   └── workflows/
│       └── release.yml         # GitHub Actions 自动化发版流水线
├── dist/                       # 编译产物目录（自动生成，不纳入 Git 追踪）
├── releases/                   # 发版压缩包目录（自动生成，不纳入 Git 追踪）
├── scripts/                    # 工程化脚本（质量门禁 + 自动发版）
│   ├── lib/files.mjs           # 脚本共享的文件遍历工具
│   ├── check-*.mjs             # 质量门禁脚本（HTML/可访问性/响应式/令牌/i18n/边界/文档/发布）
│   └── release.mjs             # 自动化打包发版脚本 (Node.js 标准库)
├── src/                        # 核心源码目录
│   ├── assets/
│   │   ├── css/
│   │   │   └── inkflow-admin.css  # 核心样式系统 (支持 CSS 变量)
│   │   └── js/
│   │       ├── modules/        # ES6 模块拆分目录
│   │       │   ├── i18n.js     # i18n 国际化字典与翻译器
│   │       │   ├── theme.js    # 主题模式控制器 (Light/Dark Mode)
│   │       │   ├── sidebar.js  # 侧边栏及菜单收缩管理器
│   │       │   ├── search.js   # 全局键盘快捷键与数据过滤
│   │       │   ├── bulk.js     # 批量操作与工具条状态同步
│   │       │   ├── toast.js    # 消息气泡封装
│   │       │   ├── confirm-dialog.js # 可复用 Bootstrap Modal 确认弹窗（替代原生 confirm）
│   │       │   ├── chart.js    # 图表模块（按需动态加载，编译为独立 inkflow-chart.js）
│   │       │   └── delegation.js # 核心事件委托引擎
│   │       ├── services/       # 服务/适配层（对接后端的单一接缝）
│   │       │   ├── http.js     # 唯一传输接缝（内置 mock，替换为 fetch 即可接真实后端）
│   │       │   └── api.js      # 按域分组的后端方法封装（posts/users/comments/...）
│   │       └── inkflow-admin.js   # 主入口脚本 (ES Module)
│   ├── category-edit.html      # 18 个页面模板
│   ├── index.html
│   └── ...
├── test/                       # 测试（不纳入发布包）
│   ├── unit/                   # Vitest 单元测试
│   └── e2e/                    # 零依赖 CDP 全页冒烟脚本
├── eslint.config.js            # 代码规范校验配置
├── .prettierrc                 # Prettier 自动格式化配置
├── postcss.config.js           # PostCSS (Autoprefixer + CSSNano) 配置
├── package.json                # 项目依赖及自动化脚本配置
├── vitest.config.js            # Vitest 单元测试配置 (jsdom)
└── vite.config.js              # Vite 现代化工程构建配置
```

---

## 🚀 快速开始

开发本项目需要您本地具备 Node.js (v18+) 环境。

### 1. 克隆并安装依赖
```bash
# 克隆仓库
git clone https://github.com/your-username/inkflow-admin.git
cd inkflow-admin

# 安装开发依赖
npm install
```

### 2. 启动本地开发服务 (支持 HMR 热更新)
```bash
npm run dev
# Vite 将启动开发服务器，默认端口取决于本地环境
```
在 `src/` 下修改 HTML/CSS/JS 代码时，Vite 会在支持的场景下触发热更新或页面刷新。

### 3. 代码质量控制与规范化
```bash
npm run quality    # 运行 ESLint、Stylelint 和 Prettier 检查
npm run check:tokens # 检查高频颜色与圆角是否通过设计变量引用
npm run check:i18n # 检查运行时文案国际化边界
npm run check:js-boundaries # 检查模块与全局 JS 边界规则
npm run check:docs # 检查 README/INSTALL 是否覆盖关键发布脚本
npm run lint:fix   # 自动修复可修复的脚本和样式问题，并格式化源码
```

`npm run quality` 还会校验 HTML 标签闭合、重复属性、重复 ID、受支持的 `data-action` 值、基础可访问性属性、响应式布局守卫、内联样式清理状态、设计变量边界、运行时文案国际化、JS 模块边界规则和文档脚本覆盖情况。

### 4. 一键发版打包归档
```bash
npm run release
# 运行 Vite 构建，并将 dist 与 README 打包到 releases/ 目录
```

### 5. 发布包校验
```bash
npm run release:check
npm run check:release
# 校验版本一致性、README 最新版本记录、dist/ZIP 内容和外链资源
```

### 6. 集成与部署
`INSTALL.md` 提供 `dist/` 产物接入说明，覆盖 Nginx、Apache、GitHub Pages、普通后端模板目录、自定义主题色、Logo、菜单和权限入口。

---

## ⚙️ 事件委托与 JS API (`inkflow-admin.js`)

项目采用基于 `data-action` 的中央事件委托方式，减少页面模板中的内联事件绑定。

| data-action 属性 | 配合属性 | 说明 |
| :--- | :--- | :--- |
| `toast` | `data-toast-msg`, `data-toast-type` | 显示防 XSS 气泡弹窗 |
| `delete` | 无 | 拦截表格/列表行的删除按钮，触发二次确认 |
| `bulk-delete` | 无 | 删除当前列表中已勾选的行，并同步批量选择状态 |
| `clear-cache` | 无 | 在设置页模拟清除缓存流程并显示完成反馈 |
| `clear-selection` | 无 | 取消当前列表中的勾选状态并隐藏批量工具栏 |
| `copy-field` | `data-target`, `data-copy-value`, `data-toast-msg`, `data-toast-type` | 复制目标输入框或指定文本内容到剪贴板 |
| `edit-slug` | 无 | 解锁文章编辑页 Slug 字段并聚焦选中文本 |
| `email-user` | 无 | 从当前用户列表行读取邮箱并打开系统邮件客户端 |
| `force-user-logout` | 无 | 在用户编辑页模拟强制退出所有登录并显示按钮加载反馈 |
| `focus-image-crop` | 无 | 聚焦图片编辑页预览区并高亮裁剪网格 |
| `generate-excerpt` | 无 | 从文章编辑器正文抽取摘要并填入摘要字段 |
| `import-tags` | 无 | 读取标签编辑页批量输入内容，去空行去重后显示导入数量 |
| `navigate` | `data-href` | 触发无感页面跳转 |
| `permanent-delete` | `data-href` | 触发永久删除二次确认 |
| `preview-image` | 无 | 在新标签页打开当前图片行的预览资源 |
| `publish-comment-reply` | 无 | 在评论详情页模拟发布管理员回复并显示按钮加载反馈 |
| `rebuild-assets` | 无 | 在设置页模拟重新生成静态资源流程并显示完成反馈 |
| `regenerate-thumbnails` | 无 | 在图片编辑页模拟缩略图重新生成过程并显示完成反馈 |
| `save-comment-draft` | 无 | 在评论详情页模拟保存回复草稿并显示按钮加载反馈 |
| `select-cover-media` | 无 | 在文章/栏目编辑页模拟从媒体库选择封面并更新预览 |
| `send-password-reset` | 无 | 在用户编辑页模拟发送密码重置邮件并显示按钮加载反馈 |
| `send-test-email` | 无 | 在设置页模拟发送 SMTP 测试邮件并显示按钮加载反馈 |
| `toggle-editor-fullscreen` | 无 | 切换文章编辑器面板全屏状态并同步按钮语义 |
| `toggle-editor-mode` | `data-editor-mode` | 切换文章编辑器的源码/预览模式并同步按钮状态 |
| `toggle-theme` | 无 | 触发暗黑/明亮模式切换 |
| `toggle-user-status` | `data-toast-msg`, `data-toast-type` | 切换用户列表行的封禁/正常状态并显示反馈 |
| `toggle-comment-status` | `data-comment-status`, `data-toast-msg`, `data-toast-type` | 切换评论列表行或评论详情页的审核/待审/垃圾状态 |
| `toggle-post-status` | `data-post-status`, `data-toast-msg`, `data-toast-type` | 切换文章列表行的发布状态并同步筛选状态 |
| `use-gravatar` | 无 | 在用户编辑页模拟使用邮箱 Gravatar 头像并更新头像预览 |
| `validate-link` | 无 | 在链接编辑页验证 URL 输入格式并显示按钮加载反馈 |

**保留的全局可用 JS 方法 (方便 HTML 页面调用)**：
* `window.showToast(message, type)`：弹出 Toast 通知（类型支持：success/info/warning/danger）。
* `window.inkflowT(key)`：调用全局国际化翻译器。
* `window.inkflowToggleTheme()`：切换全站主题模式。

---

## 🗺️ 版本历史

> [查看完整更新日志 / View Full Changelog](CHANGELOG.md)

---

## 📜 License

MIT License — 自由用于个人或商业项目，保留版权声明即可。

---

> Made with ♥ for the InkFlow blog platform.
