# Plan: Syntax Highlighting with MicroLighter

**Date**: 2026-10-26
**Goal**: Highlight code blocks on blog.thomaspuppe.de using [MicroLighter](https://davatron5000.github.io/microlighter/)

## Problem

Code blocks are rendered as plain monospaced text. easto is only used for blog.thomaspuppe.de, so the solution can be tailored to that blog.

## Research Findings

MicroLighter (`microlighter@2.2.0`, MIT, by Dave Rupert):

- **Runs in the browser only.** It uses the CSS Custom Highlight API (`CSS.highlights`, `::highlight()`) and does not emit `<span>` per token. It cannot pre-render at build time, so easto can't "bake" highlighting into the HTML.
- Zero runtime dependencies, ~4.6 KB auto runner (`microlighter.min.js`), 40 TextMate grammars loaded on demand via `import('./grammars/<lang>.js')`.
- Finds `pre > code` and reads the language from `class="language-*"`, `data-language` (on `<code>` or `<pre>`) or `lang`.
- Themes are plain CSS files, activated via `data-syntax-theme="<name>"` on `<body>` or a container. Most themes use `light-dark()`, so they follow `prefers-color-scheme` like the blog's own dark mode.
- Browser support follows the Custom Highlight API (Chrome/Edge 105+, Safari 17.2+, Firefox 140+). Older browsers show the plain code: graceful degradation.

What easto already provides:

- `marked` renders fenced code blocks with a language as `<pre><code class="language-xyz">`, which is exactly what MicroLighter needs. No markdown changes needed.
- `serve.js` already serves `.js` as `text/javascript` (required for module scripts).

## Approaches Considered

1. **Template only, load from CDN** (`cdn.jsdelivr.net/npm/microlighter@2/...`). No easto change, but adds a third-party request to a blog that self-hosts everything else (fonts included) and has privacy implications.
2. **Blog vendors the files** into `themes/easto/assets/`. No easto change, but updates are manual copy-paste.
3. **easto depends on microlighter and copies its `dist/` into `output/assets/microlighter/`** ✅ The template opts in with one `<link>` and one `<script>`. Updating is `npm update`, and the files are self-hosted.

## Why Approach 3

- Small change: one dependency with zero transitive deps, plus ~10 lines in `index.js`.
- Self-hosted, with no CDN dependency.
- Templates stay in control: no script/link tag, no highlighting. easto injects nothing into the HTML.

## Implementation Steps

1. `npm install microlighter@^2.2.0`
2. In `index.js`, resolve the package via `import.meta.resolve('microlighter')` (works both standalone and when easto is installed in the blog's `node_modules`). Copy `dist/` to `${OUTPUT_DIR}/assets/microlighter`, skipping `.d.ts` files.
3. Include the theme CSS and `microlighter.min.js` in `templates/post.html` and set `data-syntax-theme` on `<body>`.
4. Fix `.post pre code` styling, since the inline-code background otherwise shows up per line inside blocks.
5. Extend `test.sh`: assets exist, no `.d.ts`, the `language-javascript` class is present, and JS is served as `text/javascript`.
6. Bump the version to 0.9.0 (new feature) and update the docs.
