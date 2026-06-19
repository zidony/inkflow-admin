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

| Version | Description |
| :--- | :--- |
| **v2.7.0** | **Architecture Refactoring & Backend SSR Integration Update**: Rewrote the sidebar menu active routing logic to include a defensive fallback that respects pre-rendered `.active` classes from backend SSR, eliminating state conflicts between client JS and backend routers; replaced the JS-calculated inline `max-height` accordion animation with a modern, pure CSS Grid (`grid-template-rows: 0fr / 1fr`) and `.show` class-driven approach, allowing backends to pre-open menus deterministically; established a "3-Tier" CSS variable semantic model by injecting global theme tokens (e.g., `--color-primary`) and sidebar component tokens into `_variables.css`, and used automation scripts to replace over 100 hardcoded color scales (e.g., `--ink-300`) across all CSS files, drastically improving the thematic extensibility of the dashboard. |
| **v2.6.3** | **Sidebar & UI Detail Maintenance Update**: Fixed broken sub-menu accordion animations in the collapsed sidebar caused by forced CSS hiding; preloaded the collapsed state in theme-preload.js to eliminate FOUC flickering; added active routing state to parent menus; refactored icon colors to use native CSS inheritance and added a text-stroke to parent icons for natural visual hierarchy; corrected a badge-radius variable reference on the .ink-login-card that caused elliptical deformation. |
| **v2.6.2** | **Responsive Overflow Fix & Sweep Script Update**: Fixed horizontal overflow (a sideways scrollbar) on the post editor `post-edit.html` at desktop widths, caused by the sticky action bar's negative margin (`margin: 0 -24px`) — the bar lives outside `#page-content` so there was no padding to cancel; changed to `margin: 0 0 20px` (matching the mobile rule, no visual change). Added a zero-dependency CDP responsive sweep (`npm run test:responsive`) that checks every one of the 18 pages × desktop/tablet/mobile/small viewports for horizontal overflow with screenshot archiving, and verifies the mobile sidebar drawer open/close; it runs independently of the release gate. |
| **v2.6.1** | **Confirm Dialog Componentization Update**: Added a reusable `confirm-dialog.js` that builds a Bootstrap modal at runtime (via `createElement`, same stack as the avatar-crop modal) to replace the native `confirm()` at all three delete / permanent-delete / bulk-delete sites — avoiding the browser's "prevent this page from creating more dialogs" trap that silently breaks deletion, and unifying the brand visuals. The three call sites became `async/await`; it degrades to native `confirm()` when Bootstrap is unavailable. Added `confirmTitle/confirmOk/confirmCancel` (zh/en); the e2e smoke now covers both confirm and cancel paths (cancel keeps the row, confirm removes it) and injects local Bootstrap in headless for deterministic verification. |
| **v2.6.0** | **Test Suite Update**: Introduced Vitest (jsdom) unit tests covering i18n, `ListFilterManager`, `ActionBus`, and the service-layer mock — 26 assertions in total. Added a zero-dependency Chrome DevTools Protocol end-to-end smoke script (`npm run test:e2e`) that self-manages `vite preview` and headless Chrome/Edge, smoke-testing all 18 pages for "loads with no console errors + theme toggle / optimistic delete / list filter / settings nav / notification read", with no Playwright/Puppeteer needed. Tests run independently of `quality` and the CI release gate and never block a release. |
| **v2.5.0** | **Client-Side Service / Adapter Layer Update**: Added `services/http.js` (the single transport seam — a built-in mock whose function body can be swapped to `fetch()` to talk to a real backend) and `services/api.js` (thin domain-grouped wrappers across posts/comments/users/links/tags/media/notifications/maintenance/auth). Rewired the inline `setTimeout` mocks in the delegation, editor, bulk, login, notification, and settings modules to call through the service layer, with a `try/catch → error toast` seam at each call site (new `actionFailed` text). Each method keeps its original latency, so the visible delays, loading states, toasts, and DOM effects are unchanged. |
| **v2.4.1** | **Unified Event Delegation & List-Filter Fix**: Consolidated the `document` listeners scattered across six modules into a single central `ActionBus`; each module now registers click/change actions via `registerActions(map, type)`, making the "central event delegation" claim match the implementation and trimming the delegation layer substantially. Added a unified `ListFilterManager` that derives row visibility from a single `search ∧ status-filter` predicate, fixing the state-loss bug where searching and then switching filter tabs (or vice versa) re-revealed already-filtered rows; it also recomputes visibility on `inkflow:rows-changed`. |
| **v2.4.0** | **Build Code-Splitting & Performance Update**: Split Chart.js out of the entry bundle via a dynamic `import()` and emit it as a standalone `inkflow-chart.js`, loaded on demand only on the dashboard page that contains `#visits-chart`; the main entry script drops from ~247 kB to ~44 kB (gzip ~83 → 13 kB). Moved the remaining runtime Chinese text (chart months, post/user status badges, editor fullscreen labels) into `i18n.js`, derived the topbar date locale from the active language, and added `list()` / `dateLocale` helpers to `I18nManager`; fixed the zh/en README directory structure to drop non-existent scripts and match the real engineering scripts. |
| **v2.3.14** | **CSS Variable System & Design Token Guard Update**: Added semantic background, text, border, radius, and control-size tokens, and consolidated high-frequency hardcoded radii into shared variables; introduced the `check:tokens` design-token boundary check into `quality`, with README, INSTALL, and documentation guard coverage to prevent common hardcoded style values from drifting back into theme CSS. |
| **v2.3.13** | **Admin Form & Local Interaction Maintenance Update**: Upgraded settings test email, link validation, tag batch import, post/category cover media selection, user Gravatar, and account security buttons from placeholder toasts into real local interactions; extended comment detail moderation status syncing while keeping `data-action` docs, i18n text, and HTML validation allowlists aligned. |
| **v2.3.12** | **Post Editor Accessibility & Fullscreen Interaction Maintenance Update**: Added the `toggle-editor-fullscreen` action so the post editor fullscreen button expands and exits an in-page fullscreen panel while syncing button state; changed category pills, SEO/more-settings collapse headers, and the cover preview trigger to native button controls with `aria-pressed`, `aria-expanded`, and `aria-controls` semantics while preserving the existing visual style. |
| **v2.3.11** | **List & Post Editor Interaction Maintenance Update**: Added the `clear-selection` action so the shared bulk toolbar clears checked rows and syncs state instead of showing a placeholder toast; added `generate-excerpt`, `edit-slug`, and `toggle-editor-mode` post editor actions so excerpt generation, slug editing, and source/preview switching behave as real local interactions with documentation and validation coverage. |
| **v2.3.10** | **User & Image Edit Interaction Maintenance Update**: Fixed the user list banned-state enum so row state stays aligned with the `banned` filter; added the `email-user` action so user-list envelope buttons open the system email composer; added `focus-image-crop` and `regenerate-thumbnails` image edit actions to replace placeholder crop and thumbnail toasts with visible interaction feedback. |
| **v2.3.9** | **Post & Dashboard Status Interaction Maintenance Update**: Added the `toggle-post-status` publishing action so post list approve and publish buttons update row state and remain aligned with the active filter; reused the comment moderation action on dashboard latest-comment approvals so status badges update inline. |
| **v2.3.8** | **List Interaction Behavior Maintenance Update**: Extended `copy-field` with `data-copy-value` support and changed image list copy buttons from placeholder toasts into real upload-path copying; added the `toggle-comment-status` action so comment list approve and spam buttons update row state, status badges, and the active filter view consistently. |
| **v2.3.7** | **Image Actions & Dynamic Preview Maintenance Update**: Added dimensions, lazy loading, and decorative icon semantics for dynamically generated cover previews; introduced the reusable `copy-field` clipboard action and changed the image edit direct-link copy button from a placeholder toast into real copying; added the `preview-image` action so image list preview buttons open the current row asset, with documentation and validation coverage. |
| **v2.3.6** | **List Interaction & Image Preview Maintenance Update**: Broadcast the shared row-change event after bulk deletion so list counters and future listeners stay aligned; added immediate selected-file previews on the image edit page and restored the upload zone after clearing previews; upgraded user list block/unblock actions from placeholder toasts into real row status toggles and documented the `toggle-user-status` action. |
| **v2.3.5** | **Bulk Delete & Accessibility Maintenance Update**: Changed bulk delete from a placeholder toast into real checked-row removal and synchronized selected counts plus select-all state after single-row and bulk deletion; documented the `bulk-delete` action and added documentation coverage checks; marked dynamically rendered toast icons as `aria-hidden` and extended accessibility guards for that runtime semantic. |
| **v2.3.4** | **Notification Grouping & JS Safety Guard Update**: Hidden notification date groups when filtering, marking all read, or clearing read items leaves no visible rows in that group; extracted shared notification date-group syncing to reduce duplicate DOM traversal across modules; expanded JS boundary checks to block HTML string injection APIs and dynamic code execution. |
| **v2.3.3** | **Notification Center Interaction Fix Update**: Fixed the mark-all-read action so it updates list state instead of only showing a toast; synchronized the topbar badge, unread filter count, and unread statistics; kept counters aligned when unread notifications are deleted; changed clear-read into a real read-row removal action; tightened template ID reference checks and added runtime coverage checks for `data-action` values. |
| **v2.3.2** | **Accessibility & Quality Guard Maintenance Update**: Replaced upload, preview, and notification footer action targets with native buttons or links; connected the avatar crop modal to its visible title and localized its close label; added documentation coverage checks and expanded HTML/accessibility guards for button types, link hrefs, `aria-controls`, `aria-labelledby`, and interactive target ID references. |
| **v2.3.1** | **Mobile & Accessibility Maintenance Update**: Fixed narrow-screen wrapping and page-level overflow issues in the notification center, post editor, and dashboard; added accessibility semantics for editor toolbar toggles, current sidebar navigation, toast notifications, and disabled pagination controls; expanded responsive, accessibility, and release guards; restored the garbled Chinese v2.3.0 changelog entry. |
| **v2.3.0** | **External Vendor Assets & Quality Guard Upgrade**: Loaded Bootstrap 5.3.8 CSS/JS and Bootstrap Icons 1.13.1 from jsDelivr with SRI; removed Bootstrap and icon font payloads from local app CSS/JS bundles; expanded HTML, accessibility, release, and JS boundary checks for button types, icon semantics, tab semantics, pagination labels, image dimensions, approved CDN assets, and mobile layout guards. |
| **v2.2.4** | **Mobile Stability & Quality Guard Update**: Improved mobile layout behavior for dashboards, headers, filters, settings navigation, notification rows, editor sidebars, and avatar cropping; expanded automated checks for responsive layout guards, runtime i18n text, and JS module boundary rules. |
| **v2.2.3** | **Maintenance Update**: Added standalone `npm run release:check` validation for version consistency, README version entries, dist/ZIP contents, and external resource references; included `INSTALL.md` in release packages; added baseline accessibility attributes for sidebar, theme toggle, search, and dropdown controls. |
| **v2.2.2** | **Release Package Checks & Documentation Revision**: Consolidated Bootstrap Icons to woff2-only font declarations; added release package content checks to block source files, temporary files, Python scripts, and duplicate font formats from the ZIP; revised English and Chinese README wording to use more neutral engineering descriptions. |
| **v2.2.1** | **Release Pipeline & Project Font Optimization**: Consolidated project font declarations to woff2-only output; removed the deprecated Python release script and standardized ZIP packaging on the Node.js standard library; synchronized English and Chinese README release directory, runtime requirement, and packaging workflow docs. |
| **v2.2.0** | **Security Baseline & Release Workflow Update**: Moved core UI libraries and fonts to local build assets for offline or intranet deployment; removed native event bindings and DOM string concatenation in areas such as the login page and avatar cropping; refactored ZIP packaging to use the Node.js standard library; added pre-release quality checks to CI. |
| **v2.1.1** | **Optimization & Bug Fixes**: Merged standalone filter panels into `.card-header` to flatten DOM depth; refactored sidebar navigation into standard semantic `ul/li` tags; restored and extracted `filter.js` to fix table filtering; replaced redundant custom CSS utility classes with Bootstrap 5 equivalents where practical. |
| **v2.1.0** | **Engineering Architecture**: Introduced Handlebars templating for HTML componentization (extracting common headers/sidebars); split and organized more than 1600 lines of CSS; added utility classes to reduce inline styles; fixed sidebar active state routing; configured Stylelint and Husky for code quality checks. |
| **v2.0.0** | **Build System Upgrade**: Integrated Vite build tooling with separate `src/` and `dist/` directories, removed generated file hashes for stable static template integration, split the IIFE script into ES Modules, added CSS-variable dark mode, added runtime i18n text switching based on `<html lang>`, configured ESLint and Prettier, and introduced packaging scripts plus GitHub Actions release workflows. |
| v1.9.1 | Decoupled badge `.ink-badge` into "structure + colors", refactored indicator dot into unified `.ink-dot`, extracted global focus ring variables `--ink-focus-ring`. |
| v1.9 | Standardized prefix from `if-` to `ink-` globally, introduced global hotkeys `Ctrl+K` and `ESC` listener, and improved fallback handling for private-browsing `localStorage` access. |
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
