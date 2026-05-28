# InkFlow Admin

**English README** | [中文说明书](README.md)

A beautiful, out-of-the-box, commercial-grade HTML administration dashboard template designed for blogs and content management systems. The project has undergone a complete modern engineering overhaul driven by **Vite + ES6 Modules + PostCSS**, offering a blazing-fast local development experience and optimal bundle sizes for production. It also introduces a highly immersive, futuristic **Dark Mode** and an intelligent **i18n internationalization engine**.

---

## 🚀 Live Demo

* 🌐 **InkFlow Blog Theme Demo:** [https://zidony.github.io/inkflow-theme](https://zidony.github.io/inkflow-theme)

* ⚙️ **InkFlow Admin Dashboard Demo:** [https://zidony.github.io/inkflow-admin](https://zidony.github.io/inkflow-admin) 

---

## ✨ Key Architectural Highlights & Engineering Features

- **🚀 Modern Build Pipeline**: Completely migrated to **Vite 5** to enjoy zero-delay Hot Module Replacement (HMR) during development and extreme production minification driven by Esbuild.
- **📦 High-Cohesion ESM Architecture**: Fully decoupled the monolithic IIFE global script into clean, single-responsibility ES6 modules (`Sidebar`, `Theme`, `Search`, `Bulk`, `Toast`, `Editor`, `Chart`).
- **🌙 Full-Scale Dark Mode**: Smooth theme toggling perfectly implemented via CSS Custom Properties. Includes a dynamic toggle button inside TopBars, transitions, and state caching using `localStorage`.
- **🌐 Responsive i18n Engine**: Dynamic runtime translation that automatically senses the HTML `<html lang="...">` tag. Switching between `lang="zh-CN"` and `lang="en"` immediately adapts all delete confirms, loading indicators, toasts, and Chart.js dataset labels.
- **📏 Strict Quality Standards**: Configured with ESLint (v9 Flat Config) + Prettier. Run `npm run lint` to guarantee 0 errors and 0 warnings.
- **🗜️ Zero-Dependency ZIP Packaging**: Implemented a native Python packaging script with zero npm dependencies. Run `npm run release` to automatically compile and generate a pure distribution zip (~90 KB) at `release/inkflow-admin-v2.1.0.zip`, isolating node_modules and developer source files.
- **🤖 GitHub Actions CI/CD**: Cloud release automation ready. Tagging `v*` automatically triggers云 pipeline builds, packaging, and uploads the ZIP archive directly as a GitHub Release asset.

---

## 📂 Directory Structure

```text
inkflow-admin/
├── .github/
│   └── workflows/
│       └── release.yml         # GitHub Actions automated release pipeline
├── dist/                       # Compiled assets output (excluded from Git tracking)
├── release/                    # Release ZIP archives (excluded from Git tracking)
├── scripts/
│   ├── migrate.py              # Automated source codebase refactoring script
│   ├── add_theme_toggle.py     # Theme toggle button injector script
│   └── release.py              # Zero-dependency ZIP packaging script (Python)
├── src/                        # Core source files
│   ├── assets/
│   │   ├── css/
│   │   │   └── inkflow-admin.css  # Core layout & styling system (CSS Variables)
│   │   └── js/
│   │       ├── modules/        # ES6 Modules
│   │       │   ├── i18n.js     # Internationalization dictionary & translator
│   │       │   ├── theme.js    # Theme mode manager (Light/Dark Mode)
│   │       │   ├── sidebar.js  # Collapsible sidebar & sub-accordion manager
│   │       │   ├── search.js   # Global hotkeys (Ctrl+K) & live table search
│   │       │   ├── bulk.js     # Bulk row selections & actions sync
│   │       │   ├── toast.js    # Premium toast notifications bubble
│   │       │   ├── chart.js    # Responsive chart redrawing on theme events
│   │       │   └── delegation.js # Centralized event delegation engine
│   │       └── inkflow-admin.js   # Unified ESM entry point
│   ├── category-edit.html      # 18 page templates
│   ├── index.html
│   └── ...
├── eslint.config.js            # ESLint Flat Config
├── .prettierrc                 # Prettier formatting rules
├── postcss.config.js           # PostCSS (Autoprefixer + CSSNano) config
├── package.json                # Project dependencies and script commands
└── vite.config.js              # Vite bundler configurations
```

---

## 🚀 Quick Start

Developing this project requires Node.js (v18+) and Python 3.

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/inkflow-admin.git
cd inkflow-admin

# Install devDependencies
npm install
```

### 2. Launch Local Dev Server (with HMR)
```bash
npm run dev
# Vite will launch the dev server, opening http://localhost:3000 in your browser.
```
Any modifications to HTML/CSS/JS inside `src/` will hot-reload instantly.

### 3. Lint & Code Style Checks
```bash
npm run lint       # Run style analysis
npm run lint:fix   # Auto-beautify and format all stylesheets, scripts, and pages
```

### 4. Build & Package Release
```bash
npm run release
# Triggers Vite compilation and packages the dist output into release/*.zip
```

---

## ⚙️ Event Delegation & JS API (`inkflow-admin.js`)

The project utilizes a centralized event delegation system mapped to `data-action` attributes, eliminating raw inline `onclick` attributes completely to prevent XSS vulnerabilities.

| data-action Attribute | Support Attributes | Description |
| :--- | :--- | :--- |
| `toast` | `data-toast-msg`, `data-toast-type` | Triggers custom safe toast notifications bubble |
| `delete` | None | Intercepts delete actions on rows to display confirm |
| `navigate` | `data-href` | Secure seamless page transitions |
| `permanent-delete` | `data-href` | Double-check dialog for permanent deletion |
| `toggle-theme` | None | Real-time theme mode toggle |

**Global Javascript Hooks (for inline page calls)**:
* `window.showToast(message, type)`: Triggers toast alerts (types: `success` / `info` / `warning` / `danger`).
* `window.inkflowT(key)`: Invokes the global i18n translator.
* `window.inkflowToggleTheme()`: Triggers全 theme toggles.

---

## 🗺️ Version History

| Version | Description |
| :--- | :--- |
| **v2.1.0** | **Engineering Architecture**: Introduced Handlebars templating for HTML componentization (extracting common headers/sidebars); comprehensively refactored and modularized 1600+ lines of CSS; eradicated 300+ inline styles using new utility classes; fixed sidebar active state dynamic routing; configured Stylelint and Husky for stricter CI/CD code quality. |
| **v2.0.0** | **Major Milestone Upgrade**: Fully integrated Vite build tools with isolated `src/` and `dist/` directories, removing file hashes to allow stable static template integration; decomposed monolithic IIFE script into clean ES6 Modules; implemented responsive **Dark Mode** with CSS variables and transition animations; added dynamic **i18n translation engine** linked to `<html lang>`; configured ESLint v9 Flat Config and Prettier rules; introduced automated Python packaging scripts and cloud GitHub Actions CI/CD workflows. |
| v1.9.1 | Decoupled badge `.ink-badge` into "structure + colors", refactored indicator dot into unified `.ink-dot`, extracted global focus ring variables `--ink-focus-ring`. |
| v1.9 | Standardized prefix from `if-` to `ink-` globally, introduced global hotkeys `Ctrl+K` and `ESC` listener, enhanced sandboxing for无痕 `localStorage` calls. |
| v1.8 | Refactored thumbnails and double-line list structures into unified utility `.ink-item-text`, added atomic `u-` classes, standardized list paginations. |
| v1.7 | Enabled `ink-` prefix globally, built gradient avatar component `.ink-avatar` and table column layouts `.ink-cell-title`, cleared inline HTML styles. |
| v1.6 | Restructured codebase with pure data-driven event delegation engines; rewrote safe showToast API; supported standard Bootstrap 5 breadcrumbs. |
| v1.5 | Re-styled structures, optimized mobile responsive layouts, cleared redundant styles. |
| v1.4 | Renamed CiCMS to **InkFlow**, upgraded Bootstrap to **5.3.8**, relocated assets folder to `assets/`, protected editor layout width overflows, built notification center page, updated README. |
| v1.3 | Dashboard equal height grid alignment, white-background filter tabs, standard page headers. |
| v1.2 | Compact dashboard row-1 design, dragging images uploading queue with local FileReader previews, bootstrap modals cropping workflow. |
| v1.1 | Standardized CSS prefixes (`ink-`), built editor UI toolbar. |
| v1.0 | Initial release, core static page templates. |

---

## 📜 License

MIT License — free to use in personal or commercial projects, provided the original copyright header is preserved.

---

> Made with ♥ for the InkFlow blog platform.
