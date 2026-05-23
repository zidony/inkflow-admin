# InkFlow Admin

一套为博客 / 内容管理系统设计的精美后台管理面板 HTML 模板，基于 Bootstrap 5.3.8 + Bootstrap Icons 1.13.1 构建，纯原生 JS，无框架依赖，开箱即用。

---

## 🚀 在线预览 (Live Demo)

* 🌐 **InkFlow 博客主题演示:** [https://zidony.github.io/inkflow-theme](https://zidony.github.io/inkflow-theme)

* ⚙️ **InkFlow 管理后台演示:** [https://zidony.github.io/inkflow-admin](https://zidony.github.io/inkflow-admin) 

---

## ✨ 特性

- **19 + 1 个完整页面**：覆盖博客后台所有核心功能场景
- **响应式布局**：完美适配桌面、平板和移动端
- **Bootstrap 5.3.8**：使用最新 Bootstrap 5 稳定版，支持原生 Popover / Dropdown / Modal
- **统一设计语言**：深蓝主题（`#0d6ecc`），`if-` 前缀 CSS 命名规范，`--if-*` CSS 变量体系
- **可折叠侧边栏**：支持手风琴子菜单、折叠态 Tooltip、状态持久化（`localStorage`）
- **富文本编辑器 UI**：自定义工具栏、防溢出编辑区（长链接/宽图/宽表格/代码块均有保护）
- **通知中心**：顶栏下拉快速预览 + 独立通知中心页面（分类筛选、搜索、已读/删除）
- **图片上传**：拖拽上传、FileReader 本地预览、替换/裁剪/移除
- **头像裁剪**：Bootstrap Modal + 缩放 Slider 圆形裁剪工作流
- **轻量无依赖**：仅依赖 CDN 的 Bootstrap 5 和 Bootstrap Icons，无 jQuery、无 Vue、无 React

---

## 📁 目录结构

```
inkflow-admin/
├── assets/
│   ├── css/
│   │   └── inkflow-admin.css          # 全局样式
│   └── js/
│       └── inkflow-admin.js           # 全局脚本
├── index.html             # 仪表盘
├── post-list.html             # 文章列表
├── post-edit.html             # 发布 / 编辑文章
├── comment-list.html          # 评论列表
├── comment-edit.html          # 评论详情
├── category-list.html         # 栏目列表
├── category-edit.html         # 栏目编辑
├── tag-list.html              # 标签列表
├── tag-edit.html              # 标签编辑
├── image-list.html            # 图片管理
├── image-edit.html            # 图片上传 / 编辑
├── link-list.html             # 链接管理
├── link-edit.html             # 链接编辑
├── user-list.html             # 用户列表
├── user-edit.html             # 用户编辑（含头像裁剪）
├── settings.html              # 系统设置
├── notification-center.html   # 通知中心
├── login.html                 # 登录页
└── README.md
```

---

## 🚀 快速开始

直接用浏览器打开 `index.html` 即可预览，无需构建工具或服务器。

```bash
# 克隆仓库
git clone https://github.com/your-username/inkflow-admin.git

# 直接在浏览器打开
open inkflow-admin/index.html
```

如需本地开发服务（解决部分浏览器跨域限制），推荐使用：

```bash
# VS Code Live Server 插件（推荐）
# 或 Python 内置服务器
python3 -m http.server 8080
# 访问 http://localhost:8080/index.html
```

---

## 🛠 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| [Bootstrap](https://getbootstrap.com/) | 5.3.8 | 布局、组件、交互 |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | 1.13.1 | 图标库 |
| 原生 JavaScript | ES5+ | 侧边栏、Toast、批量操作等 |
| [Chart.js](https://www.chartjs.org/) | CDN | 访问量柱状图（dashboard） |

> 所有 CDN 资源均通过 [jsDelivr](https://www.jsdelivr.com/) 加载，无需本地安装。

---

## 📄 页面说明

### 仪表盘 `index.html`
- 4 张紧凑统计卡（文章 / 评论 / 浏览量 / 用户），8:4 比例与快捷操作并排
- 年度访问趋势柱状图（Chart.js）
- 内容概况 + 系统状态侧栏
- 最新文章 / 最新评论列表
- 顶栏通知下拉（含 6 条示例通知、全部已读功能）

### 文章编辑 `post-edit.html`
- 双列编辑器布局：左侧主编辑区，右侧粘性侧边栏
- 自定义富文本工具栏（格式 / 插入 / 全屏）
- 内容溢出防护（长链接断行、图片/视频最大宽度限制、表格横向滚动、代码块滚动）
- SEO 设置折叠面板
- 文章标签输入（Enter 添加）
- 封面图本地上传预览
- 粘性顶部操作栏（返回 / 草稿 / 发布）

### 图片管理 `image-list.html` + `image-edit.html`
- 图片列表支持拖拽排序 UI
- 上传页支持拖拽上传、FileReader 预览、替换、移除

### 用户编辑 `user-edit.html`
- 头像上传 → FileReader → Bootstrap Modal 裁剪工作流
- 圆形裁剪框 + 缩放 Slider

### 通知中心 `notification-center.html`
- 按类型筛选（评论 / 用户 / 系统）
- 全文搜索
- 单条已读 / 删除（带动画）
- 右侧统计面板 + 通知偏好开关

---

## 🎨 设计规范

### 主色系
```css
--if-500: #0d6ecc   /* 主色 */
--if-400: #3b8de0
--if-300: #7ab3eb
--if-100: #d0e6f9
--if-50:  #e8f2fd
```

### CSS 命名规范
- 所有自定义类使用 `if-` 前缀（如 `.if-panel`、`.if-table`、`.if-badge`）
- CSS 变量使用 `--if-` 前缀（如 `--if-gray-500`、`--if-card-shadow`）
- JS 中的 `localStorage` key 使用 `inkflow_` 前缀

### 常用组件类
```
.if-panel / .if-panel-header / .if-panel-body   面板
.if-table                                        数据表格
.if-badge / .if-badge-blue/green/amber           标签徽章
.if-filter-tabs / .if-filter-tab                 筛选标签栏
.if-bulk-bar                                     批量操作栏
.if-editor-toolbar / .if-editor-body            富文本编辑器
.if-cover-preview                                封面图预览
.stat-card-compact                               紧凑统计卡
.if-notif-dropdown                              通知下拉
.btn-danger-soft                                 危险操作软按钮
```

---

## ⚙️ 事件委托与 JS API（`inkflow-admin.js`）

v1.6 引入了基于 `data-action` 的底层事件委托引擎，彻底剥离了内联的 `onclick` 事件。

| data-action 属性 | 配合属性 | 说明 |
|------|------|------|
| `toast` | `data-toast-msg`, `data-toast-type` | 显示安全弹窗，从根源消除 XSS 攻击 |
| `delete` | 无 | 自动拦截并处理表格/列表行的带弹窗删除交互 |
| `navigate` | `data-href` | 实现安全的无感页面跳转 |
| `permanent-delete` | `data-href` | 二次确认永久删除，完成后自动跳转页面 |

**保留的全局可用方法**：
| 函数 | 说明 |
|------|------|
| `showToast(message, type)` | 在自定义脚本中直接调用以显示 Toast 弹窗（类型支持：success/info/warning/danger） |

侧边栏折叠状态持久化 key：`inkflow_sidebar_collapsed`

---

## 🗺️ 版本历史

| 版本 | 主要内容 |
|------|----------|
| v1.0 | 初始版本，基础页面结构 |
| v1.1 | CSS 前缀规范化（`if-`），富文本编辑器 UI，全站 JS 对齐 |
| v1.2 | Dashboard 重构（8:4 布局）、图片上传、头像裁剪、通知下拉、picsum 修复 |
| v1.3 | Dashboard 等高修复、filter-tabs 白底卡片、page-header 按钮统一、全站 CF 邮箱修复 |
| v1.4 | 更名 CiCMS → **InkFlow**、Bootstrap 5.3.3 → **5.3.8**、资源移至 `assets/`、编辑器防溢出 CSS、通知中心独立页面、README |
| v1.5 | 结构重构、移动端适配优化、样式清理 |
| v1.6 | 底层重构：引入纯数据驱动的事件委托引擎，彻底移除内联 onClick 事件；重写 showToast 消除 XSS 安全隐患；兼容 BS5 标准面包屑结构。 |
| v1.7 | UI架构统一：全站组件启用 `if-` 前缀，构建全局 `if-avatar` 高级头像渐变组件与 `if-cell-title` 列表排版规范，肃清海量内联 HTML 样式代码，全面提升底层源码的整洁度与高级感。 |
| v1.8 | 样式原子化与组件复用深度重构：全站大一统缩略图组件与双行图文排版组件（`if-item-text`），提取 `u-` 前缀原子化工具类，消除大量内联样式，统一所有列表的分页结构与文字格式，代码更加精简和高级。 |

---

## 📜 License

MIT License — 自由用于个人或商业项目，保留版权声明即可。

---

> Made with ♥ for the InkFlow blog platform.
