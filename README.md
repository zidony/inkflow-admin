# InkFlow Admin

**中文说明书** | [English README](README.en.md)

一套为博客 / 内容管理系统设计的精美、开箱即用的商用级后台管理面板主题模板。项目已完成现代化工程化升级，基于 **Vite + ES6 Modules + PostCSS** 驱动，拥有极速的本地开发体验和极致的生产环境包体积，并全新推出了高拟真、极具科技感的**全量暗黑模式（Dark Mode）**与 **动态 i18n 国际化引擎**。

---

## 🚀 在线预览 (Live Demo)

* 🌐 **InkFlow 博客主题演示:** [https://zidony.github.io/inkflow-theme](https://zidony.github.io/inkflow-theme)

* ⚙️ **InkFlow 管理后台演示:** [https://zidony.github.io/inkflow-admin](https://zidony.github.io/inkflow-admin) 

---

## ✨ 核心亮点与工程特性

- **🚀 现代化构建系统**：完全迁移至 **Vite 5**，享受零延迟的热更新（HMR）开发体验，以及生产环境由 Esbuild 驱动的极致文件压缩。
- **📦 高内聚 ESM 模块化**：将原来堆叠的 IIFE 全局脚本完全解耦，拆分为高内聚、职责单一的 ES6 模块（Sidebar、Theme、Search、Bulk、Toast、Editor、Chart）。
- **🌙 全站级暗黑模式（Dark Mode）**：完美通过 CSS 变量体系覆写全站 UI。在顶栏提供极简优雅的切换按钮，配合 `localStorage` 缓存状态，支持全站过渡动画。
- **🌐 智能 i18n 国际化引擎**：JS 模块全自动感应 HTML 的 `<html lang="...">` 属性。只需切换 `lang="zh-CN"` 或 `lang="en"`，全站的确认提示框、加载状态、通知气泡和 Chart.js 图表标签瞬间无缝双语切换。
- **📏 国际一流代码规范**：完美配置 ESLint (v9 Flat Config) + Prettier。运行 `npm run lint` 保证 0 错误、0 警告。
- **🗜️ 极致绿色发版打包**：编写了基于 Python 内置 zip 库的打包脚本，零外部 npm 依赖。运行 `npm run release` 一键生成仅 **90 KB 左右** 的纯净发版包 `release/inkflow-admin-v2.1.1.zip`，彻底隔离 `node_modules` 和源码。
- **🤖 GitHub Actions CI/CD**：完美配置云端自动化流水线。在推送 `v*` 标签时，云端自动触发打包并将 ZIP 附件发布到 GitHub Release。

---

## 📁 目录结构

```text
inkflow-admin/
├── .github/
│   └── workflows/
│       └── release.yml         # GitHub Actions 自动化发版流水线
├── dist/                       # 编译产物目录（自动生成，不纳入 Git 追踪）
├── release/                    # 发版压缩包目录（自动生成，不纳入 Git 追踪）
├── scripts/
│   ├── migrate.py              # 一键工程化源码重构迁移脚本
│   ├── add_theme_toggle.py     # 按钮自动注入脚本
│   └── release.py              # 自动化打包发版脚本 (Python 编写)
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

开发本项目需要您本地具备 Node.js (v18+) 与 Python 3 环境。

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
# Vite 将瞬间启动开发服务器，通常在浏览器打开 http://localhost:3000
```
在 `src/` 下修改任何 HTML/CSS/JS 代码，浏览器均会局部秒级热更新，无需手动刷新。

### 3. 代码质量控制与规范化
```bash
npm run lint       # 代码质量校验
npm run lint:fix   # 自动对全量样式、脚本、页面进行美化排版与修复
```

### 4. 一键发版打包归档
```bash
npm run release
# 自动触发 Vite 编译压缩，并打包输出纯净的发版 ZIP 包到 release/ 目录下
```

---

## ⚙️ 事件委托与 JS API (`inkflow-admin.js`)

项目采用基于 `data-action` 的中央事件委托引擎，代码职责单一，且完全消除了内联 `onclick` 安全隐患。

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
| **v2.1.1** | **深度架构优化与修复**：将列表筛选区域并入表格 Header 降低 DOM 深度；侧边栏菜单重构为标准 `ul/li` 语义化标签；修复并独立抽离 `filter.js` 解决列表状态过滤失效问题；全面清理冗余 CSS 工具类并接入 Bootstrap 5 原生样式。 |
| **v2.1.0** | **工程化进阶**：引入 Vite Handlebars 模板引擎实现 HTML 组件化（抽离公用头部与侧边栏）；全面重构并模块化拆分 1600 行臃肿 CSS；建立数十个实用工具类（Utility Classes）彻底消灭全局超 300 处内联样式；修复侧边栏静态路由高亮问题；配置 Stylelint 与 Husky 提供更严格的代码规范检查。 |
| **v2.0.0** | **里程碑升级**：全面接入 Vite 构建工具，剥离 `src/` 与 `dist/`，去除了随机哈希码以方便买家无缝集成；将 JS 完全重构成 ES6 模块；全新推出支持 transition 过渡动画的**暗黑模式**与基于 `<html lang>` 感应的 **i18n 双语切换引擎**；配置 ESLint v9 Flat Config 与 Prettier 代码规范；引入 Python 极简绿色打包归档脚本与 GitHub Actions 自动化发版流水线。 |
| v1.9.1 | CSS架构深度解耦：采用“结构+颜色”的原子化模式重构徽章组件（`.ink-badge`），合并冗余的状态圆点至唯一的 `.ink-dot` 体系，提取全局焦点光环变量 `--ink-focus-ring`，从底层彻底肃清上百行高耦合冗余代码。 |
| v1.9 | 品牌架构大统一与极客交互升级：全局组件与变量前缀从 `if-` 全面升级为 `ink-`；引入全局 `Ctrl+K` 搜索与 `ESC` 拦截快捷键；大幅增强 `localStorage` 调用的沙盒防御机制，确保极致无痕模式下的运行稳定性。 |
| v1.8 | 样式原子化与组件复用深度重构：全站大一统缩略图组件与双行图文排版组件（`ink-item-text`），提取 `u-` 前缀原子化工具类，消除大量内联样式，统一所有列表的分页结构与文字格式，代码更加精简和高级。 |
| v1.7 | UI架构统一：全站组件启用 `ink-` 前缀，构建全局 `ink-avatar` 高级头像渐变组件与 `ink-cell-title` 列表排版规范，肃清海量内联 HTML 样式代码，全面提升底层源码的整洁度与高级感。 |
| v1.6 | 底层重构：引入纯数据驱动的事件委托引擎，彻底移除内联 onClick 事件；重写 showToast 消除 XSS 安全隐患；兼容 BS5 标准面包屑结构。 |
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
