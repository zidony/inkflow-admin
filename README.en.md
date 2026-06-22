# InkFlow Admin

**English README** | [中文说明书](README.md)

An HTML administration dashboard template designed for blogs and content management systems. The project uses **Vite + ES6 Modules + PostCSS** for local development and static builds, with dark mode and basic runtime i18n text switching.

---

## 🚀 Live Demo

* 🌐 **InkFlow Blog Theme Demo:** [https://zidony.github.io/inkflow-theme](https://zidony.github.io/inkflow-theme)

* ⚙️ **InkFlow Admin Dashboard Demo:** [https://zidony.github.io/inkflow-admin](https://zidony.github.io/inkflow-admin) 

---

## ✨ Core Features

- **🚀 Vite Build Workflow**: Uses **Vite 5** for local development and production builds, including development HMR and production asset minification.
- **📦 ESM JavaScript Modules**: Splits global behavior into ES Modules, including Sidebar, Theme, Search, Bulk, Toast, Editor, and Chart modules. The chart module is dynamically imported on demand and compiled into a standalone `inkflow-chart.js`, so non-dashboard pages no longer ship Chart.js and the main bundle shrinks significantly.
- **🌙 Dark Mode**: Uses CSS custom properties for light/dark theme switching and stores the user preference in `localStorage`.
- **🌐 Runtime i18n Text Switching**: Reads the HTML `<html lang="...">` attribute to switch runtime text for confirms, loading states, toasts, and Chart.js labels.
- **🔌 Service / Adapter Layer**: Every "backend operation" (delete, publish, status toggle, login, maintenance tasks, etc.) funnels through a single `request()` seam in `services/http.js`, with an error-toast seam at each call site. To go live, a buyer just swaps that function body from the built-in mock to `fetch()` — no hunting through individual modules.
- **🪟 Unified Confirm Dialog**: Destructive actions (delete) use a reusable Bootstrap modal (`confirmDialog()`, same stack as the avatar-crop modal) instead of the native `confirm()`, avoiding the browser's "prevent this page from creating more dialogs" trap that silently breaks deletion; it degrades gracefully back to native `confirm()` when Bootstrap is unavailable.
- **📏 Code Quality Tooling**: Configures ESLint, Stylelint, Prettier, HTML structure checks, accessibility checks, responsive guards, inline-style checks, runtime i18n checks, JS boundary checks, and template action validation. Run `npm run quality` before publishing.
- **🧪 Test Suite**: `npm run test` runs Vitest unit tests (i18n, ListFilter, ActionBus, service-layer mock); `npm run test:e2e` drives real headless Chrome via a zero-dependency Chrome DevTools Protocol script, smoke-testing every page for "loads with no console errors + core interactions" (no Playwright/Puppeteer needed). Tests run independently and do not block the release gate.
- **🗜️ Release Packaging**: Uses the Node.js standard library to generate `releases/inkflow-admin-v*.zip`, containing the built assets and README files.
- **🤖 GitHub Actions Release Workflow**: A `v*` tag runs quality checks, builds the project, packages the release ZIP, and uploads it to GitHub Release.

---

## 📂 Directory Structure

```text
inkflow-admin/
├── .github/
│   └── workflows/
│       └── release.yml         # GitHub Actions automated release pipeline
├── dist/                       # Compiled assets output (excluded from Git tracking)
├── releases/                   # Release ZIP archives (excluded from Git tracking)
├── scripts/                    # Engineering scripts (quality gates + release)
│   ├── lib/files.mjs           # Shared file-traversal helpers for scripts
│   ├── check-*.mjs             # Quality-gate scripts (HTML/a11y/responsive/tokens/i18n/boundaries/docs/release)
│   └── release.mjs             # Zero-dependency ZIP packaging script (Node.js standard library)
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
│   │       │   ├── toast.js    # Toast notification helper
│   │       │   ├── confirm-dialog.js # Reusable Bootstrap modal confirm dialog (replaces native confirm)
│   │       │   ├── chart.js    # Chart module (dynamically imported, compiled to standalone inkflow-chart.js)
│   │       │   └── delegation.js # Centralized event delegation engine
│   │       ├── services/       # Service / adapter layer (single seam to the backend)
│   │       │   ├── http.js     # Single transport seam (built-in mock; swap to fetch for a real backend)
│   │       │   └── api.js      # Domain-grouped backend method wrappers (posts/users/comments/...)
│   │       └── inkflow-admin.js   # Unified ESM entry point
│   ├── category-edit.html      # 18 page templates
│   ├── index.html
│   └── ...
├── test/                       # Tests (excluded from the release package)
│   ├── unit/                   # Vitest unit tests
│   └── e2e/                    # Zero-dependency CDP full-page smoke script
├── eslint.config.js            # ESLint Flat Config
├── .prettierrc                 # Prettier formatting rules
├── postcss.config.js           # PostCSS (Autoprefixer + CSSNano) config
├── package.json                # Project dependencies and script commands
├── vitest.config.js            # Vitest unit-test config (jsdom)
└── vite.config.js              # Vite bundler configurations
```

---

## 🚀 Quick Start

Developing this project requires Node.js (v18+).

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
# Vite will launch a dev server. The port depends on your local environment.
```
Changes to HTML/CSS/JS inside `src/` trigger HMR or a page reload when supported by Vite.

### 3. Lint & Code Style Checks
```bash
npm run quality    # Run ESLint, Stylelint, and Prettier checks
npm run check:tokens # Check high-frequency colors and radii use design tokens
npm run check:i18n # Check runtime text localization boundaries
npm run check:js-boundaries # Check module/global JS boundary rules
npm run check:docs # Check README/INSTALL coverage for release scripts
npm run lint:fix   # Fix supported script/style issues and format source files
```

`npm run quality` also validates HTML tag balance, duplicate attributes, duplicate IDs, supported `data-action` values, baseline accessibility attributes, responsive layout guards, inline style cleanup, design token boundaries, runtime text localization, JS module boundary rules, and release-script documentation coverage.

### 4. Build & Package Release
```bash
npm run release
# Runs the Vite build and packages dist plus README files into releases/
```

### 5. Release Package Check
```bash
npm run release:check
npm run check:release
# Checks version consistency, README version entries, dist/ZIP contents, and approved CDN asset integrity
```

### 6. Integration & Deployment
`INSTALL.md` explains how to integrate the `dist/` output with Nginx, Apache, GitHub Pages, backend template directories, custom theme colors, logo changes, menu changes, and permission entry points.

---

## ⚙️ Event Delegation & JS API (`inkflow-admin.js`)

The project uses centralized event delegation mapped to `data-action` attributes to reduce inline event bindings in page templates.

| data-action Attribute | Support Attributes | Description |
| :--- | :--- | :--- |
| `toast` | `data-toast-msg`, `data-toast-type` | Triggers toast notifications |
| `delete` | None | Intercepts delete actions on rows to display confirm |
| `bulk-delete` | None | Deletes checked rows in the current list and syncs bulk selection state |
| `clear-cache` | None | Simulates cache clearing on the settings page and shows completion feedback |
| `clear-selection` | None | Clears checked rows in the current list and hides the bulk toolbar |
| `copy-field` | `data-target`, `data-copy-value`, `data-toast-msg`, `data-toast-type` | Copies the target input or configured text content to the clipboard |
| `edit-slug` | None | Unlocks the post edit slug field and focuses the selected text |
| `email-user` | None | Reads the email address from the current user row and opens the system email composer |
| `force-user-logout` | None | Simulates signing out all sessions on the user edit page with button loading feedback |
| `focus-image-crop` | None | Focuses the image edit preview area and highlights the crop grid |
| `generate-excerpt` | None | Extracts an excerpt from the post editor body and fills the excerpt field |
| `import-tags` | None | Reads tag batch input, removes empty and duplicate lines, and reports the imported count |
| `navigate` | `data-href` | Navigates to the configured URL |
| `permanent-delete` | `data-href` | Double-check dialog for permanent deletion |
| `preview-image` | None | Opens the current image row preview asset in a new tab |
| `publish-comment-reply` | None | Simulates publishing an admin reply on the comment detail page with button loading feedback |
| `rebuild-assets` | None | Simulates rebuilding static assets on the settings page and shows completion feedback |
| `regenerate-thumbnails` | None | Simulates thumbnail regeneration on the image edit page and shows completion feedback |
| `save-comment-draft` | None | Simulates saving a reply draft on the comment detail page with button loading feedback |
| `select-cover-media` | None | Simulates selecting a cover from the media library and updates the preview on post/category edit pages |
| `send-password-reset` | None | Simulates sending a password reset email on the user edit page with button loading feedback |
| `send-test-email` | None | Simulates sending an SMTP test email on the settings page with button loading feedback |
| `toggle-editor-fullscreen` | None | Toggles the post editor panel fullscreen state and syncs button semantics |
| `toggle-editor-mode` | `data-editor-mode` | Switches the post editor source/preview mode and syncs button state |
| `toggle-theme` | None | Toggles the theme mode |
| `toggle-user-status` | `data-toast-msg`, `data-toast-type` | Toggles a user list row between banned and active states with feedback |
| `toggle-comment-status` | `data-comment-status`, `data-toast-msg`, `data-toast-type` | Toggles a comment row or detail page between moderation states |
| `toggle-post-status` | `data-post-status`, `data-toast-msg`, `data-toast-type` | Toggles a post list row between publishing states and keeps filters aligned |
| `use-gravatar` | None | Simulates applying an email Gravatar on the user edit page and updates the avatar preview |
| `validate-link` | None | Validates the URL input format on the link edit page and shows button loading feedback |

**Global JavaScript Hooks (for page calls)**:
* `window.showToast(message, type)`: Triggers toast alerts (types: `success` / `info` / `warning` / `danger`).
* `window.inkflowT(key)`: Invokes the global i18n translator.
* `window.inkflowToggleTheme()`: Toggles the current theme.

---

## 🗺️ Version History

> [View Full Changelog](CHANGELOG.md)

---

## 📜 License

MIT License — free to use in personal or commercial projects, provided the original copyright header is preserved.

---

> Made with ♥ for the InkFlow blog platform.
