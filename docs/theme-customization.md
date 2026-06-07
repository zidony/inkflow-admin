# Theme Customization

InkFlow Admin uses CSS custom properties as the primary customization surface. Start with `src/assets/css/_variables.css`; avoid changing component CSS unless the component structure itself needs to change.

## Brand Variables

Update these first when changing the brand color:

- `--ink-50` through `--ink-900`
- `--ink-accent-400`
- `--ink-accent-500`
- `--ink-focus-ring`
- `--ink-shadow-brand`
- `--ink-shadow-brand-soft`

## Semantic Colors

Use semantic variables for stateful UI:

- Success: `--ink-success-400`, `--ink-success-500`, `--ink-success-soft`
- Warning: `--ink-warning-400`, `--ink-warning-500`, `--ink-warning-soft`
- Danger: `--ink-danger-400`, `--ink-danger-500`, `--ink-danger-600`, `--ink-danger-soft`

## Surfaces and Radius

For a denser or softer product feel, adjust:

- `--ink-surface-bg`
- `--ink-surface-muted`
- `--ink-surface-raised`
- `--ink-card-border`
- `--ink-card-shadow`
- `--ink-card-shadow-hover`
- `--ink-radius-xs` through `--ink-radius-2xl`
- `--ink-card-radius`

## Sidebar

Sidebar-specific variables are isolated so the navigation can keep enough contrast:

- `--sidebar-bg`
- `--sidebar-logo-bg`
- `--sidebar-border`
- `--sidebar-text`
- `--sidebar-text-muted`
- `--sidebar-active-bg`
- `--sidebar-hover-bg`

## Dark Mode

Dark mode overrides should keep contrast stable and avoid hard-coded component colors. Prefer:

- `--ink-dark-control-bg`
- `--ink-dark-control-border`
- `--ink-dark-focus-ring`

## Build

After changing variables, rebuild the static assets:

```bash
npm run build
```
