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

| 版本 | 主要内容 |
| :--- | :--- |
| **v2.7.2** | **持续集成修复与通知中心UI优化**：修复因 `sidebar.js` 代码格式化（Prettier）未达标导致 `npm run quality` 门禁未通过，进而引发 GitHub Action 自动化发版流产的严重集成事故；优化顶部导航栏通知下拉框的视觉布局，将图标缩小至 32px 并调整 `padding` 与 `gap` 参数，解决左间距过大、右间距受挤压导致的视觉失衡，释放下拉框内的文字展示空间。 |
| **v2.7.1** | **侧边栏视觉修正与全站脚本补全**：还原侧边栏父级菜单在高亮（active）状态下深蓝半透明的 rgba 背景色与 1px 亮蓝内描边，彻底解决使用纯亮蓝色带来的不协调刺眼感及阴影晕染问题；缩小侧边栏第一个分组标签（主菜单）与顶部 Logo 的距离；补全除首页外所有其他静态页面缺失的 `{{> scripts }}` Handlebars 注入块，修复了全站除首页外的顶部用户下拉菜单点击无反应的交互问题。 |
| **v2.7.0** | **架构级重构与后端 SSR 集成优化**：重写了侧边栏菜单的高亮匹配逻辑，新增对后端直出（SSR） `.active` 状态的防抖退让判定，彻底解决 JS 与后端路由之间的控制权冲突；移除了原本依赖 JS 运行时计算 `max-height` 的菜单折叠动画，代以引入现代化的纯 CSS Grid (`grid-template-rows: 0fr / 1fr`) 与 `.show` 类驱动机制，赋予后端预设手风琴展开状态的能力；确立了“三层架构”的 CSS 变量语义化模型，在 `_variables.css` 中注入了全局主题令牌 (`--color-primary` 等) 与侧边栏组件级令牌，并运用自动化脚本清理了全站 CSS 文件中超过 100 处的色阶硬编码（如 `--ink-300`），将系统的换肤可扩展性提升至全新高度。 |
| **v2.6.3** | **侧边栏及UI细节维护更新**：修复侧边栏折叠状态下 CSS 强制隐藏导致的二级菜单展开失效与动画丢失问题；在 theme-preload.js 中提前预置侧边栏状态类消除 FOUC 闪烁；补全并同步父级菜单的 active 路由高亮；采用 CSS inherit 结合文字描边方案，为纯图标模式建立一/二级菜单的原生视觉层次感；修正登录框 .ink-login-card 错误的圆角变量引用导致变形为巨大椭圆形的问题。 |
| **v2.6.2** | **响应式溢出修复与巡检脚本更新**：修复文章编辑页 `post-edit.html` 粘性操作条在桌面宽度下因负边距（`margin: 0 -24px`）导致页面横向溢出、出现水平滚动条的问题 —— 该 sticky bar 位于 `#page-content` 之外，没有内边距可抵消，故改为 `margin: 0 0 20px`（与移动端方针一致，视觉不变）；新增零依赖的 CDP 响应式巡检脚本（`npm run test:responsive`），对全部 18 页 × 桌面/平板/手机/小屏 4 个视口做横向溢出检测并截图存档，同时校验移动端侧边栏抽屉开合，独立于发版门禁运行。 |
| **v2.6.1** | **确认弹窗组件化更新**：新增可复用的 `confirm-dialog.js`，用运行时构建的 Bootstrap Modal（`createElement`，与头像裁剪弹窗同栈）替代删除/永久删除/批量删除三处的原生 `confirm()`，规避浏览器"阻止此页面再创建对话框"导致删除静默失效的陷阱并统一品牌视觉；三处调用改为 `async/await`，Bootstrap 不可用时降级回原生 `confirm()`；新增 `confirmTitle/confirmOk/confirmCancel` 中英文案；e2e 冒烟补充确认/取消两条路径（取消保留行、确认删除行），并在无头环境注入本地 Bootstrap 以确定性验证。 |
| **v2.6.0** | **测试体系更新**：引入 Vitest（jsdom）单元测试，覆盖 i18n、`ListFilterManager`、`ActionBus` 与服务层 mock，共 26 项断言；新增零依赖的 Chrome DevTools Protocol 端到端冒烟脚本（`npm run test:e2e`），自管 `vite preview` 与无头 Chrome/Edge，对全部 18 个页面做「加载无报错 + 主题切换 / 乐观删除 / 列表过滤 / 设置导航 / 通知已读」冒烟，无需安装 Playwright/Puppeteer；测试独立于 `quality` 与 CI 发版门禁运行，不阻断发布。 |
| **v2.5.0** | **客户端服务/适配层更新**：新增 `services/http.js`（唯一传输接缝，内置 mock，替换函数体为 `fetch()` 即可对接真实后端）与 `services/api.js`（按 posts/comments/users/links/tags/media/notifications/maintenance/auth 分域的薄方法封装）；将 delegation、editor、bulk、login、notification、settings 各模块中原本内联的 `setTimeout` 模拟操作全部改为经服务层调用，并在调用处加入 `try/catch → 失败 toast` 接缝（新增 `actionFailed` 文案）；各方法保留原有延迟时长，对外可见的延迟、加载态、toast 与 DOM 效果保持完全不变。 |
| **v2.4.1** | **事件委托统一与列表过滤修复更新**：将分散在 6 个模块的 `document` 监听器整合为单一中央 `ActionBus`，各模块通过 `registerActions(map, type)` 注册 click/change 动作，使「中央事件委托」名实相符并大幅精简委托层；新增统一的 `ListFilterManager`，按「搜索关键词 ∧ 状态筛选」双条件单点求值行可见性，修复了先搜索后切换筛选标签（或反之）会重新显示已过滤行的状态丢失问题，并在 `inkflow:rows-changed` 后按合并条件复算可见性。 |
| **v2.4.0** | **构建分包与性能优化更新**：将 Chart.js 经动态 `import()` 拆出主包，并在编译期独立为 `inkflow-chart.js`，仅在含 `#visits-chart` 的仪表盘页按需加载，主入口脚本体积从约 247KB 降至约 44KB（gzip 约 83→13KB）；将图表月份、文章/用户状态徽章与编辑器全屏等剩余运行时中文文案收敛进 `i18n.js`，顶栏日期 locale 随当前语言切换，并为 `I18nManager` 新增 `list()` 与 `dateLocale` 辅助方法；修正中英 README 目录结构中不存在的脚本条目，与实际工程化脚本保持一致。 |
| **v2.3.14** | **CSS 变量体系与设计令牌守卫更新**：新增语义化背景、文本、边框、圆角和控件尺寸 token，收敛高频硬编码圆角到共享变量；新增 `check:tokens` 设计令牌边界检查并接入 `quality`，同步 README、INSTALL 和文档覆盖校验，防止主题样式维护中重新散落高频硬编码值。 |
| **v2.3.13** | **后台表单与本地交互维护更新**：将设置页测试邮件、链接验证、标签批量导入、文章/栏目封面媒体库、用户 Gravatar 与账号安全按钮从占位提示升级为真实本地交互；扩展评论详情页审核状态同步，并继续同步 `data-action` 文档、i18n 文案和 HTML 校验白名单。 |
| **v2.3.12** | **文章编辑器可访问性与全屏交互维护更新**：新增 `toggle-editor-fullscreen` 动作，让文章编辑器全屏按钮具备真实面板全屏/退出行为并同步按钮状态；将栏目分类 pill、SEO/更多设置折叠标题和封面预览入口改为原生按钮控件，补齐 `aria-pressed`、`aria-expanded` 与 `aria-controls` 等语义，同时保留原视觉样式。 |
| **v2.3.11** | **列表与文章编辑交互维护更新**：新增 `clear-selection` 取消批量勾选动作，将共用批量工具栏的占位按钮升级为真实状态同步；新增 `generate-excerpt`、`edit-slug` 与 `toggle-editor-mode` 文章编辑动作，让摘要生成、Slug 修改和源码/预览模式切换具备真实本地交互，并继续保持文档与校验覆盖。 |
| **v2.3.10** | **用户与图片编辑交互维护更新**：修复用户列表封禁状态使用 `blocked` 导致与 `banned` 筛选值不一致的问题；新增 `email-user` 动作，让用户列表信封按钮打开系统邮件客户端；新增 `focus-image-crop` 与 `regenerate-thumbnails` 图片编辑动作，将裁剪和重新生成缩略图从占位提示升级为可见的交互反馈。 |
| **v2.3.9** | **文章与仪表盘状态交互维护更新**：新增 `toggle-post-status` 文章发布状态动作，将文章列表的通过审核和发布按钮从提示升级为真实行状态更新，并与当前筛选条件保持一致；仪表盘最新评论的通过审核按钮复用评论状态动作，直接更新状态徽章。 |
| **v2.3.8** | **列表交互行为维护更新**：扩展 `copy-field` 支持 `data-copy-value`，将图片列表复制链接按钮从提示升级为真实复制上传路径；新增 `toggle-comment-status` 评论状态动作，让评论列表的通过审核和标记垃圾按钮更新行状态、状态徽章并与当前筛选条件保持一致。 |
| **v2.3.7** | **图片操作与动态预览维护更新**：为动态生成的封面预览补齐尺寸、懒加载和装饰图标语义守卫；新增可复用的 `copy-field` 剪贴板动作，并将图片编辑页直链复制从提示升级为真实复制；新增 `preview-image` 动作，让图片列表预览按钮打开当前行图片资源，并同步文档与校验。 |
| **v2.3.6** | **列表交互与图片预览维护更新**：批量删除后广播统一的行变更事件，便于列表计数和后续监听逻辑保持一致；为图片编辑页新增选择文件后的即时预览，并在移除预览后恢复上传区域；将用户列表封禁/解封从占位提示升级为真实行状态切换，并补充 `toggle-user-status` 文档与校验。 |
| **v2.3.5** | **批量删除与可访问性维护更新**：将批量删除从占位提示改为真实删除已勾选行，并在单行删除、批量删除后同步选择数量与全选状态；补充 `bulk-delete` 文档与文档覆盖检查；为动态 Toast 图标补齐 `aria-hidden` 语义并扩展可访问性守卫。 |
| **v2.3.4** | **通知中心分组与 JS 安全守卫更新**：在通知筛选、全部已读和清除已读后隐藏无可见通知的日期分组；抽取通知日期分组同步逻辑，减少模块间重复 DOM 遍历；扩展 JS 边界检查，阻止重新引入 HTML 字符串注入 API 和动态代码执行。 |
| **v2.3.3** | **通知中心交互修复更新**：修复“全部已读”只弹提示不更新列表状态的问题；同步顶部徽标、未读筛选计数和统计面板未读数；删除未读通知时同步计数；将“清除已读”改为真实移除已读通知；收窄模板 ID 引用校验范围，并新增 `data-action` 运行时覆盖检查。 |
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
