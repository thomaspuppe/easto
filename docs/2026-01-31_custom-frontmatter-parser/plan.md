# Plan: Replace gray-matter with Custom Frontmatter Parser

**Date**: 2026-01-31
**Goal**: Remove gray-matter dependency and its 9 sub-dependencies by implementing a lightweight custom frontmatter parser

## Problem

After replacing `ncp` and `yaml-front-matter` with `fs.cpSync()` and `gray-matter` (see docs/2026-01-30_dependencies/), analysis revealed that **gray-matter is still too heavy for easto's simple needs**:

- gray-matter: 76K + 9 dependencies (~1.1MB total)
- Brings in js-yaml (364K), esprima (324K), argparse (184K), sprintf-js (80K), and 5 utility packages
- Full YAML 1.2 parser is overkill for easto's simple frontmatter
- easto only uses: strings, dates, booleans, simple arrays

## Current Usage

gray-matter is used once in index.js:72:
```javascript
const { data, content } = matter(fileContent)
```

It parses YAML frontmatter from markdown files with very simple structures:
- Strings: `title: Example Post`
- Dates: `date: 2024-12-15`
- Booleans: `draft: false`
- Arrays: `tags: [item1, item2]`
- Special characters: URLs with colons, quoted strings

## Proposed Solution

Replace gray-matter with a custom `parseFrontmatter()` utility function (~50-100 lines):

1. Extract content between `---` delimiters using regex
2. Parse YAML line-by-line for key-value pairs
3. Support the exact YAML subset easto uses:
   - Strings (quoted and unquoted)
   - Dates (YYYY-MM-DD → Date object)
   - Booleans (true/false)
   - Simple arrays ([item1, item2])
   - Special characters in quoted strings
4. Return `{ data, content }` matching gray-matter API

## Expected Benefits

- **Package count**: 18 → 9 (50% reduction)
- **node_modules size**: 2.2M → ~1.2M (45% reduction)
- **Build time**: Same or faster
- **Code maintainability**: ~50-100 lines of simple code vs 1MB of external YAML parser
- **Security**: 11 fewer packages to audit

## Implementation Plan

### 1. Create Comprehensive Test Content Files

Create 2 new test markdown files to cover edge cases:

- **content/2025-01_frontmatter-edge-cases.md** (draft: false):
  - Special characters in strings (quotes, apostrophes)
  - URLs with colons
  - Multi-word array items
  - Regular fields (title, date, description, etc.)

- **content/2025-02_quotes-and-escaping.md** (draft: true):
  - Quoted title with colon
  - Quoted description with nested quotes
  - Empty array
  - Single-item array
  - Boolean true (vs false in other files)

### 2. Implement parseFrontmatter() Function

Add to index.js after eval_template() function:

```javascript
// Parse YAML frontmatter from markdown files
// Supports: strings, dates (YYYY-MM-DD), booleans, arrays
const parseFrontmatter = (fileContent) => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = fileContent.match(frontmatterRegex)

  if (!match) {
    throw new Error('No frontmatter found')
  }

  const [, frontmatterText, content] = match
  const data = {}

  frontmatterText.split('\n').forEach(line => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) return

    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) return

    const key = line.slice(0, colonIndex).trim()
    let value = line.slice(colonIndex + 1).trim()

    // Parse value based on type
    if (!value) {
      data[key] = ''
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Array: [item1, item2, item3]
      const arrayContent = value.slice(1, -1).trim()
      data[key] = arrayContent === '' ? [] : arrayContent.split(',').map(item => item.trim())
    } else if (value === 'true') {
      data[key] = true
    } else if (value === 'false') {
      data[key] = false
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Date in YYYY-MM-DD format
      data[key] = new Date(value)
    } else if ((value.startsWith('"') && value.endsWith('"')) ||
               (value.startsWith("'") && value.endsWith("'"))) {
      // Quoted string - remove quotes and unescape
      data[key] = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'")
    } else {
      // Unquoted string
      data[key] = value
    }
  })

  return { data, content }
}
```

### 3. Replace gray-matter Usage

Update index.js:

```javascript
// Before:
import matter from 'gray-matter'
const { data, content } = matter(fileContent)
data.__content = content
let fileContentFrontmatter = data

// After:
// (no import needed)
const { data: fileContentFrontmatter, content } = parseFrontmatter(fileContent)
```

### 4. Remove Dependency

Update package.json:
- Remove `gray-matter` from dependencies
- Bump version to 0.8.3
- Run `npm install` to clean up package-lock.json

This will also remove all 9 sub-dependencies:
- js-yaml, argparse, esprima, sprintf-js, kind-of, section-matter, extend-shallow, is-extendable, strip-bom-string

### 5. Update Tests

Add tests to test.sh:

- Check new edge case files exist
- Update post count from 2 → 3 (new non-draft post)
- Update feed timestamp to most recent post (2025-01-15)
- Test special characters are parsed correctly
- Test URLs with colons are parsed correctly
- Test empty arrays work
- Test single-item arrays work
- Verify draft: true is handled correctly

### 6. Run Benchmark

Use existing benchmark.sh script:
```bash
./docs/2026-01-30_dependencies/benchmark.sh docs/2026-01-31_custom-frontmatter-parser/benchmark-custom-parser.md
```

Compare with previous benchmark (docs/2026-01-30_dependencies/benchmark-after.md).

### 7. Documentation

- Create devlog in docs/2026-01-31_custom-frontmatter-parser/
- Update CLAUDE.md to document the custom parser
- Create benchmark comparison report

### 8. Commit

Version bump to 0.8.3 with clear commit message about removing gray-matter.

## Testing Strategy

### Unit Test Coverage (via test.sh)

1. **File generation**: All expected files exist
2. **Draft handling**: Drafts have HTML but not in index/feeds
3. **Post counting**: Correct number of posts in index
4. **Feed timestamps**: Use most recent post date
5. **Headline IDs**: GitHub-style IDs generated
6. **Edge cases**:
   - Special characters in strings
   - URLs with colons
   - Multi-word array items
   - Empty arrays
   - Single-item arrays
   - Quoted strings with colons

### Manual Testing

1. Build site: `npm run build`
2. Check console output: "Wrote 3 posts and 2 drafts"
3. Serve locally: `npm run serve`
4. Verify all pages render correctly
5. Check feeds contain correct posts

## Risks and Mitigation

### Risk 1: Custom parser bugs
**Mitigation**: Comprehensive test coverage including edge cases

### Risk 2: Missing YAML features
**Mitigation**: Parser only supports features actually used in easto (strings, dates, booleans, simple arrays)

### Risk 3: User blog has complex YAML
**Mitigation**: Asked user about their actual blog.thomaspuppe.de usage - confirmed only simple formats + special characters

### Risk 4: Build time regression
**Mitigation**: Benchmark before/after; simple regex parsing should be faster than full YAML parser

## Success Criteria

✅ All tests pass (existing + new edge case tests)
✅ Build time same or better
✅ Package count reduced from 18 → 9
✅ node_modules size reduced from 2.2M → ~1.2M
✅ Zero external YAML dependencies
✅ All frontmatter features work (strings, dates, booleans, arrays, special chars)

## Rollback Plan

If custom parser fails:
1. Revert changes to index.js
2. Re-add gray-matter to package.json
3. Run `npm install`
4. All existing tests should pass

The changes are isolated to:
- index.js (add parseFrontmatter function, remove gray-matter import)
- package.json (remove gray-matter, bump version)
- test.sh (add edge case tests)
- New test content files (can be left or removed)
