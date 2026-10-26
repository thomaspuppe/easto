# Syntax Highlighting with MicroLighter

**Date**: 2026-10-26
**Status**: ✅ COMPLETE
**Version**: 0.8.3 → 0.9.0

## What Was Done

### 1. New dependency

`microlighter@^2.2.0` (zero transitive dependencies). Total: 4 direct dependencies, 8 packages.

### 2. Copy step in index.js

After the template assets are copied, easto copies MicroLighter's `dist/` folder into the output:

```javascript
const microlighterDir = path.dirname(fileURLToPath(import.meta.resolve('microlighter')))
fs.cpSync(microlighterDir, `${OUTPUT_DIR}/assets/microlighter`, {
  recursive: true,
  filter: src => !src.endsWith('.d.ts')
})
```

`import.meta.resolve()` resolves relative to easto's own `index.js`, so it works both in this repo and when easto lives in a blog's `node_modules`. Result: 60 files, ~290 KB in `output/assets/microlighter/`. Browsers only load the runner (~4.6 KB), one theme, and the grammars a page actually uses.

### 3. Templates

`templates/post.html`:

```html
<link rel="stylesheet" href="/assets/microlighter/themes/github.css"/>
<script type="module" src="/assets/microlighter/microlighter.min.js"></script>
...
<body data-syntax-theme="github">
```

`templates/assets/styles.css`: added a `.post pre code` rule that resets the inline-code background, color, padding and font size inside code blocks.

### 4. Tests (test.sh)

- New expected files: `assets/microlighter/microlighter.min.js`, `grammars/javascript.js`, `themes/github.css`
- `markdown-features-test` contains `<pre><code class="language-javascript">`
- No `.d.ts` files in the output
- `microlighter.min.js` is served as `text/javascript`
- Fixed a pre-existing bug: `wait $SERVER_PID` returned 143 after `kill`, so `set -e` aborted the script. `test.sh` always exited non-zero and never printed "All tests passed". It now uses `wait ... || true`.

All tests pass. Verified in the browser: `CSS.highlights` contains the token ranges, and the `javascript` and `ruby` grammars load on demand.

## Breaking Changes

None. Templates that don't include the script/link are unaffected. The only side effect is an additional `assets/microlighter/` folder in the output.

## Migration Path (blog.thomaspuppe.de)

1. `npm update easto` in the blog repo (pulls in microlighter).
2. Add the `<link>`/`<script>` and `data-syntax-theme` to `themes/easto/post.html`. Pick a theme from `node_modules/microlighter/dist/themes/`.
3. Add `.post pre code { background: none; color: inherit; padding: 0; font-size: inherit; }` to the blog styles.
4. Theme vs. blog styles: the theme sets the `pre` background (`[data-syntax-theme=…] pre:has(code)` wins over `.post pre`). To keep the blog's dark `#34495e` blocks, override `--syntax-background`/`--syntax-foreground` or choose a dark theme.
5. Content: only blocks with a language get highlighted. In the blog, most code is raw `<pre>…</pre>` HTML without `<code>`, and the fenced blocks have no language. Use `` ```js `` or `<pre><code class="language-css">…</code></pre>` (MicroLighter only scans `pre > code`).
