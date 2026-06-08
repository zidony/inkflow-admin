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
- **📦 ESM 模块化脚本**：将全局脚本拆分为多个 ES Modules，包括 Sidebar、Theme、Search、Bulk、Toast、Editor 和 Chart 等模块。
- **🌙 暗黑模式**：基于 CSS 变量实现明暗主题切换，并通过 `localStorage` 记录用户选择。
- **🌐 i18n 文案切换**：根据 HTML 的 `<html lang="...">` 属性切换确认提示、加载状态、通知气泡和 Chart.js 图表标签等运行时文案。
- **📏 代码质量工具**：配置 ESLint、Stylelint、Prettier、HTML 结构检查、可访问性检查、响应式守卫、内联样式检查、运行时 i18n 检查、JS 边界检查和模板动作校验，可通过 `npm run quality` 运行发布前检查。
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
├── scripts/
│   ├── migrate.py              # 一键工程化源码重构迁移脚本
│   ├── add_theme_toggle.py     # 按钮自动注入脚本
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
│   │       │   ├── chart.js    # 智能图表模块 (感应主题自动重绘)
│   │       │   └── delegation.js # 核心事件委托引擎
│   │       └── inkflow-admin.js   # 主入口脚本 (ES Module)
│   ├── category-edit.html      # 18 个页面模板
│   ├── index.html
│   └── ...
├── eslint.config.js            # 代码规范校验配置
├── .prettierrc                 # Prettier 自动格式化配置
├── postcss.config.js           # PostCSS (Autoprefixer + CSSNano) 配置
├── package.json                # 项目依赖及自动化脚本配置
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
npm run check:i18n # 检查运行时文案国际化边界
npm run check:js-boundaries # 检查模块与全局 JS 边界规则
npm run check:docs # 检查 README/INSTALL 是否覆盖关键发布脚本
npm run lint:fix   # 自动修复可修复的脚本和样式问题，并格式化源码
```

`npm run quality` 还会校验 HTML 标签闭合、重复属性、重复 ID、受支持的 `data-action` 值、基础可访问性属性、响应式布局守卫、内联样式清理状态、运行时文案国际化、JS 模块边界规则和文档脚本覆盖情况。

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
| `navigate` | `data-href` | 触发无感页面跳转 |
| `permanent-delete` | `data-href` | 触发永久删除二次确认 |
| `toggle-theme` | 无 | 触发暗黑/明亮模式切换 |

**保留的全局可用 JS 方法 (方便 HTML 页面调用)**：
* `window.showToast(message, type)`：弹出 Toast 通知（类型支持：success/info/warning/danger）。
* `window.inkflowT(key)`：调用全局国际化翻译器。
* `window.inkflowToggleTheme()`：切换全站主题模式。

---

## 🗺️ 版本历史

| 版本 | 主要内容 |
| :--- | :--- |
| **v2.3.2** | **可访问性与质量守卫维护更新**：将上传区、预览区和通知页脚等交互目标改为原生按钮或链接；补齐头像裁剪弹窗标题关联和关闭按钮可访问性标签；新增文档脚本覆盖检查，并扩展 HTML/可访问性守卫，校验按钮类型、链接 href、`aria-controls`、`aria-labelledby` 和交互目标 ID 引用。 |
| **v2.3.1** | **移动端与可访问性维护更新**：修复通知中心、文章编辑页和仪表盘在 320px 等窄屏下的换行与横向溢出问题；补齐编辑器工具栏、侧边栏当前页、Toast 通知和分页禁用状态的可访问性语义；扩展响应式、可访问性和发布校验守卫，并修复 v2.3.0 中文版本记录乱码。 |
| **v2.3.0** | **外部依赖与质量守卫升级**：Bootstrap 5.3.8 CSS/JS 与 Bootstrap Icons 1.13.1 改为通过 jsDelivr CDN 加载并补齐 SRI；本地应用 CSS/JS 不再打包 Bootstrap 与图标字体负载；扩展 HTML、可访问性、发布校验和 JS 边界检查，覆盖按钮类型、图标语义、tab 语义、分页标签、图片尺寸、允许的 CDN 资源和移动端布局守卫。 |
| **v2.2.4** | **移动端稳定性与质量守卫更新**：优化仪表盘、页面头部、筛选栏、设置导航、通知列表、编辑页侧栏和头像裁剪在移动端的布局表现；扩展响应式布局、运行时 i18n 文案和 JS 模块边界的自动化检查。 |
| **v2.2.3** | **维护版优化**：新增独立 `npm run release:check` 发布校验脚本，检查版本一致性、README 版本记录、dist/ZIP 内容和外链资源；发布包补充 `INSTALL.md` 集成说明；为侧边栏、主题切换、搜索和下拉菜单补齐基础可访问性属性。 |
| **v2.2.2** | **发布包校验与文档修订**：将 Bootstrap Icons 字体声明收敛为 woff2-only；新增发布包内容校验，阻止源码、临时文件、Python 脚本和重复字体格式进入 ZIP；修订中英文 README，移除夸大表述并统一为更客观的工程说明。 |
| **v2.2.1** | **发布链路与项目字体优化**：将项目字体声明收敛为 woff2-only；删除已废弃的 Python 发版脚本，统一使用 Node.js 标准库完成 ZIP 打包；同步中英文 README 的发版目录、运行环境与发布流程说明。 |
| **v2.2.0** | **安全基线与发布流程更新**：核心 UI 库与字体改为本地构建资源，支持内网环境部署；移除登录页内联脚本、头像裁剪等位置的原生事件绑定与 DOM 字符串拼接；使用 Node.js 标准库重构 ZIP 打包逻辑；CI 流程增加发布前质量检查。 |
| **v2.1.1** | **深度架构优化与修复**：将列表筛选区域并入表格 Header 降低 DOM 深度；侧边栏菜单重构为标准 `ul/li` 语义化标签；修复并独立抽离 `filter.js` 解决列表状态过滤失效问题；全面清理冗余 CSS 工具类并接入 Bootstrap 5 原生样式。 |
| **v2.1.0** | **工程化进阶**：引入 Vite Handlebars 模板引擎实现 HTML 组件化（抽离公用头部与侧边栏）；拆分并整理 1600 行以上 CSS；建立实用工具类以减少页面内联样式；修复侧边栏静态路由高亮问题；配置 Stylelint 与 Husky 提供代码规范检查。 |
| **v2.0.0** | **里程碑升级**：全面接入 Vite 构建工具，剥离 `src/` 与 `dist/`，去除了随机哈希码以方便买家无缝集成；将 JS 完全重构成 ES6 模块；全新推出支持 transition 过渡动画的**暗黑模式**与基于 `<html lang>` 感应的 **i18n 双语切换引擎**；配置 ESLint v9 Flat Config 与 Prettier 代码规范；引入 Python 极简绿色打包归档脚本与 GitHub Actions 自动化发版流水线。 |
| v1.9.1 | CSS 架构整理：按“结构 + 颜色”拆分徽章组件（`.ink-badge`），合并状态圆点为 `.ink-dot`，提取全局焦点光环变量 `--ink-focus-ring`，减少重复样式。 |
| v1.9 | 组件前缀与交互更新：全局组件与变量前缀从 `if-` 调整为 `ink-`；引入全局 `Ctrl+K` 搜索与 `ESC` 快捷键；增强 `localStorage` 调用的异常处理。 |
| v1.8 | 样式原子化与组件复用深度重构：全站大一统缩略图组件与双行图文排版组件（`ink-item-text`），提取 `u-` 前缀原子化工具类，消除大量内联样式，统一所有列表的分页结构与文字格式，代码更加精简和高级。 |
| v1.7 | UI 结构统一：全站组件启用 `ink-` 前缀，构建 `ink-avatar` 头像组件与 `ink-cell-title` 列表排版规范，减少内联 HTML 样式。 |
| v1.6 | 底层重构：引入基于数据属性的事件委托；重写 showToast 以使用安全的文本插入方式；兼容 Bootstrap 5 标准面包屑结构。 |
| v1.5 | 结构重构、移动端适配优化、样式清理 |
| v1.4 | 更名 CiCMS → **InkFlow**、Bootstrap 5.3.3 → **5.3.8**、资源移至 `assets/`、编辑器防溢出 CSS、通知中心独立页面、README |
| v1.3 | Dashboard 等高修复、filter-tabs 白底卡片、page-header 按钮统一、全站 CF 邮箱修复 |
| v1.2 | Dashboard 重构（8:4 布局）、图片上传、头像裁剪、通知下拉、picsum 修复 |
| v1.1 | CSS 前缀规范化（`ink-`），富文本编辑器 UI，全站 JS 对齐 |
| v1.0 | 初始版本，基础页面结构 |

---

## 📜 License

MIT License — 自由用于个人或商业项目，保留版权声明即可。

---

> Made with ♥ for the InkFlow blog platform.
