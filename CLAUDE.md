# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Easto is a lightweight static-site generator written in Node.js. It converts Markdown files with YAML frontmatter into HTML pages, generates RSS/Atom/JSON feeds, and is designed to be used as a dependency in blog projects.

The repository includes complete test content and templates that mirror the real-world usage in [blog.thomaspuppe.de](https://github.com/thomaspuppe/blog.thomaspuppe.de).

## Development Philosophy

**This project values simplicity and pragmatism over complexity.**

When working on easto:
- Prefer simple, straightforward solutions over frameworks and abstractions
- Keep the single-file architecture - don't split `index.js` into modules without good reason
- Use bash scripts instead of test frameworks (see `test.sh` as an example)
- Avoid adding dependencies unless absolutely necessary
- Choose vanilla Node.js over libraries when possible
- Keep it fast and understandable - this is a ~168 line generator, not an enterprise application

The goal is to keep easto simple enough that someone can read and understand the entire codebase in 10 minutes.

## Development Log (Devlog)

**For major changes to easto, maintain a dated devlog in the `docs/` directory.**

When implementing significant changes (architecture changes, dependency updates, breaking changes, major features), create a dated directory and document:

1. **Plan**: Create a `plan.md` file outlining:
   - What problem you're solving
   - Research findings
   - Proposed approach with alternatives considered
   - Implementation steps
   - Why this approach was chosen

2. **Completion**: Create a `completed.md` file documenting:
   - What was actually done
   - Code changes made
   - Test results
   - Breaking changes (if any)
   - Migration path for users

### Directory Structure

```
docs/
└── YYYY-MM-DD_brief-description/
    ├── plan.md
    ├── completed.md
    └── [any supporting files]
```

### Example

See `docs/2026-01-30_commonjs-to-esm/` for a complete example of the ESM migration that updated easto from CommonJS to ES Modules.

### When to Create a Devlog

Create a devlog for changes that:
- Modify core architecture or behavior
- Update major dependencies (especially breaking changes)
- Introduce breaking changes for users
- Add significant new features
- Require migration steps for existing users

Don't create devlogs for:
- Bug fixes
- Documentation updates
- Minor dependency patches
- Code style changes

This practice helps future maintainers (including future Claude instances) understand the evolution of the project and the reasoning behind major decisions.

## Versioning

**Update the version number in `package.json` to reflect the scope of changes.**

Easto is not published to npm for external users, but version numbers help track the evolution of the project. Follow semantic versioning loosely:

### Version Bump Guidelines

**Major version (x.0.0)** - Breaking changes:
- Changes that break compatibility with existing usage
- Require migration steps for users (e.g., CommonJS → ESM)
- Architectural changes that affect how easto is used as a dependency
- Example: `0.7.3` → `0.8.0` (ESM migration)

**Minor version (0.x.0)** - New features or significant improvements:
- New functionality added (new features, options, or capabilities)
- Significant dependency updates that add capabilities
- Non-breaking improvements to existing features
- Example: Adding sitemap generation, new template variables

**Patch version (0.0.x)** - Bug fixes and small improvements:
- Bug fixes that don't change behavior
- Documentation updates
- Performance improvements
- Minor dependency updates (security patches, bug fixes)
- Code refactoring without behavior changes

### When to Update

- Update the version **before creating a devlog** for major/minor changes
- Update in the same commit as the changes, or as the final step
- Include the version change in the devlog's `completed.md` file

### Current Version

Check `package.json` for the current version. As of 2026-01-30, easto is at version `0.8.2`.

## Core Architecture

### Single-file Architecture
The entire generator is contained in `index.js` (approximately 168 lines). This is intentional for simplicity, though TODOs indicate potential future modularization.

### ES Modules (ESM)
Easto uses ES Modules (ESM) with `"type": "module"` in package.json. All imports use ESM syntax (`import` instead of `require`). This is the modern Node.js standard and required for compatibility with newer versions of dependencies like `feed@^5.x` and `marked@^17.x`.

**Breaking change**: Projects using easto v0.7.x (CommonJS) will need to either:
- Convert to ESM themselves
- Use dynamic `import()` to load easto
- Stay on easto v0.7.3

### Processing Pipeline
1. **Parse Arguments**: Command-line args are parsed manually into a Map (format: `--key=value`)
2. **Read Configuration**: Loads config from JSON file specified via `--config` arg
3. **Process Content**: Reads markdown files from content directory, sorted reverse-alphabetically by filename (newest first)
4. **Extract Frontmatter**: Uses custom `parseFrontmatter()` utility function (index.js:43-95) to parse YAML metadata from markdown files
5. **Convert Markdown**: Uses `marked` library to convert markdown to HTML (with `marked-gfm-heading-id` extension for heading IDs)
6. **Apply Templates**: Uses template evaluation via `Function()` constructor to inject content into templates
7. **Generate Feeds**: Creates RSS, Atom, and JSON feeds using the `feed` library
   - **Important**: Feed timestamps (`lastBuildDate` in RSS, `updated` in Atom) are set to the date of the most recent published post, not the current build time
   - This prevents unnecessary feed updates when rebuilding without new content
   - Only non-draft posts are considered when determining the most recent date
8. **Copy Assets**: Uses native `fs.cpSync()` to copy template assets and static files to output directory

### Template System
Templates use a custom evaluation system (`eval_template` function at index.js:35-38) that creates a new Function with parameters and evaluates template strings as JavaScript template literals.

Templates have access to:
- `blogmeta`: Blog configuration from config JSON
- `meta`: Frontmatter metadata from markdown file
- `content`: Rendered HTML content

Expected template files (in `TEMPLATES_DIR`):
- `index.html`: Homepage layout with `${ content }` placeholder for teasers
- `index_teaser.html`: Template for each post teaser on the homepage
- `post.html`: Full page template for individual blog posts
- `assets/`: Directory containing CSS and other static assets (e.g., `styles.css`)

Template syntax example:
```javascript
`<h1>${ meta.title }</h1>
<time datetime="${ meta.date }">${ meta.datelabel }</time>
${ content }`
```

### Frontmatter Parser

Easto uses a custom `parseFrontmatter()` function (index.js:43-95) instead of external YAML libraries. This lightweight parser (~52 lines) handles all frontmatter needs with zero dependencies.

**Supported YAML features:**
- **Strings**: Quoted (`"value"` or `'value'`) and unquoted (`value`)
- **Dates**: YYYY-MM-DD format (e.g., `2024-12-15`) → converted to Date objects
- **Booleans**: `true` or `false` → converted to boolean
- **Arrays**: Inline format `[item1, item2, item3]` → converted to string array
- **Empty arrays**: `[]` → empty array
- **Special characters**: Supported in quoted strings (quotes, colons, etc.)
- **Comments**: Lines starting with `#` are skipped
- **Empty values**: `key:` → empty string

**Not supported** (intentionally, as easto doesn't need them):
- Multi-line strings (YAML `|` or `>` syntax)
- Nested objects or complex data structures
- Advanced YAML 1.2 features

**Examples:**
```yaml
title: Simple String
title: "String with: colon"
url: https://example.com:8080/path
date: 2024-12-15
draft: false
tags: [web development, javascript]
empty: []
special: "It's \"great\""
```

See test files `content/2025-01_frontmatter-edge-cases.md` and `content/2025-02_quotes-and-escaping.md` for comprehensive examples.

### Content Format
Markdown files must include YAML frontmatter with these fields:

**Required fields:**
- `title`: Post title
- `date`: Publication date (YAML date format: `2024-12-15`)
- `datelabel`: Human-readable date string for display (e.g., "December 15th, 2024")
- `language`: Content language code (`en`, `de`, etc.)
- `tags`: Array of tags/categories (e.g., `[web development, javascript]`)
- `permalink`: Custom output filename without extension (e.g., `my-blog-post`)
- `draft`: Boolean - set to `true` to exclude from feeds and index
- `description`: Short summary for meta tags and teasers

Example frontmatter:
```yaml
---
title: My Blog Post
date: 2024-12-15
datelabel: December 15th, 2024
language: en
tags: [web development, javascript]
permalink: my-blog-post
draft: false
description: A short description of the post
---
```

## Commands

### Testing Easto Standalone
```bash
# Build with test content
npm run build
# or: node index.js --config=test_config.json --verbose=true

# Serve locally
npm run serve
# or: node serve.js

# Visit http://localhost:8000/
```

### Generate Site with Custom Config
```bash
node index.js --config=path/to/config.json --verbose=true
```

Command-line arguments override config file settings:
- `--config=file.json`: Config file path (required)
- `--content=dir`: Content directory
- `--output=dir`: Output directory
- `--templates=dir`: Templates directory
- `--data=dir`: Static files directory
- `--verbose=true`: Enable verbose logging

### Linting
This project uses ESLint with the Standard style:
```bash
npx eslint index.js
```

## Local Development Server

Easto generates files **without extensions** (e.g., `/blog-post` instead of `/blog-post.html`). Standard static servers won't handle this correctly.

### Using serve.js (Included)
```bash
npm run serve
# or: node serve.js
```

The `serve.js` script:
- Serves extensionless files with `Content-Type: text/html`
- Serves assets (CSS, images, etc.) with correct MIME types
- Runs on http://localhost:8000/
- Shows request logs for debugging

### Using Caddy
If Caddy is installed, use the included `Caddyfile`:
```bash
caddy run
```

The Caddyfile configuration handles extensionless files with `try_files` directive.

## Configuration

### test_config.json
The repository includes `test_config.json` for testing easto standalone. This demonstrates all required configuration fields.

### Config Structure
The config JSON file should contain:
- `content_dir`: Path to markdown content files (default: `./content`)
- `output_dir`: Path for generated HTML files (default: `./output`)
- `templates_dir`: Path to template files (default: `./templates`)
- `data_dir`: Path to static files like images, downloads (commonly named `./static`)
- `author`: Author name (used in templates and feeds)
- `baseurl`: Base URL for the site (used in feed generation and links)
- `feed`: Object with feed configuration:
  - `title`: Feed/blog title
  - `description`: Feed description
  - `id`: Unique feed identifier (usually baseurl)
  - `link`: Feed link (usually baseurl)
  - `copyright`: Copyright notice
  - `feedLinks`: Object with URLs to RSS/Atom/JSON feeds
  - `author`: Object with author `name`, `email`, `link`

See `test_config.json` for a complete example.

## Directory Structure

```
easto/
├── index.js              # Main generator (single file, ~168 lines)
├── serve.js              # Local dev server for extensionless files
├── test.sh               # Test script (no framework needed)
├── Caddyfile             # Caddy server configuration
├── test_config.json      # Example configuration for testing
├── package.json          # Dependencies and npm scripts
├── content/              # Example markdown content
│   ├── 2024-12_example-post.md         # Published post example
│   ├── 2023-06_draft-example.md        # Draft post example
│   └── 2019-03_markdown-features.md    # Markdown rendering test
├── templates/            # Templates matching real blog
│   ├── index.html        # Homepage layout
│   ├── index_teaser.html # Post teaser component
│   ├── post.html         # Individual post layout
│   └── assets/
│       └── styles.css    # Real blog styles (with dark mode)
├── static/               # Static files to copy to output
│   └── README.md
└── output/               # Generated site (not committed)
```

## Key Dependencies

- `marked@^17.0.1`: Markdown to HTML conversion (ESM)
- `marked-gfm-heading-id@^4.1.3`: Generate GitHub-style heading IDs (ESM)
- `feed@^5.2.0`: Generate RSS/Atom/JSON feeds (ESM)
- **Custom parseFrontmatter()**: YAML frontmatter parser (~52 lines, zero dependencies)
- Native `fs.cpSync()`: Recursive file copying (Node.js standard library, v16.7.0+)

**Total: 3 external dependencies, 7 packages** (including transitive dependencies)

**Note**: Easto is an ESM (ES Modules) package as of v0.8.0. The package.json includes `"type": "module"`. This is a breaking change from v0.7.x which used CommonJS.

As of v0.8.3 (2026-01-31), easto uses:
- Native Node.js APIs when possible (fs.cpSync for file copying, regex for frontmatter parsing)
- Minimal external dependencies (3 direct, 7 total packages)
- Custom utility functions for simple tasks (frontmatter parsing)
- Only actively-maintained, essential dependencies

No build tools, transpilers, bundlers, or heavy YAML parsers required - just Node.js and npm.

## Important Implementation Notes

### File Naming and Ordering
Content files are processed in reverse alphabetical order (newest first). Use date-prefixed filenames (e.g., `2024-12_post-title.md`) to control ordering.

### Extensionless Output Files
Generated HTML files have no extension (e.g., `output/blog-post` not `output/blog-post.html`). This requires:
- Special handling for local development (`serve.js` or Caddy)
- Standard behavior on production servers (most handle this automatically)

### Draft Posts
Posts with `draft: true` in frontmatter:
- ✅ HTML file is generated
- ❌ Not included in feeds (RSS/Atom/JSON)
- ❌ Not shown in index page teaser list
- ✅ Counted separately in build output ("Wrote X posts and Y drafts")

### Template Evaluation Security
The template system uses `Function()` constructor for evaluation, which means templates have access to the full JavaScript runtime. Only use trusted template files.

### Synchronous I/O
All file operations are currently synchronous. This is acceptable for small to medium blogs but may need optimization for very large sites. Build times are typically <100ms for small blogs.

### Feed Directory Creation
The code creates `${OUTPUT_DIR}/feed/` directory without checking if it exists. This will error if the directory already exists. Always clean the output directory before running (`rm -rf ./output/*`).

## Testing

### Automated Tests

Run the test suite:
```bash
npm test
# or: ./test.sh
```

The `test.sh` script is a simple bash script (no testing framework) that:
1. Builds the site with `test_config.json`
2. Checks all expected output files exist
3. Verifies index has exactly 2 posts (drafts excluded)
4. Confirms draft post HTML exists but is NOT in index or feeds
5. Validates localhost URLs are used
6. Verifies headline IDs are generated correctly (tests `marked-gfm-heading-id` extension)
   - Checks both h2 and h3 elements have proper `id` attributes
7. Verifies feed timestamps match most recent post date (not current build time)
   - Tests RSS `lastBuildDate` and Atom `updated` fields
   - Ensures feeds don't change when rebuilding without new content
8. Starts the dev server temporarily
9. Tests HTTP requests to index and extensionless files
10. Validates Content-Type headers (text/html for posts, text/css for CSS)
11. Stops the server and reports results

Tests exit with code 0 on success, non-zero on failure (suitable for CI/CD).

### Manual Testing

1. Make changes to `index.js`
2. Build: `npm run build`
3. Test: `npm test` (runs automated tests)
4. Serve: `npm run serve`
5. Visit http://localhost:8000/
6. Test extensionless URLs (e.g., `/example-post-full-frontmatter`)
7. Verify feeds: `/feed/rss`, `/feed/atom`, `/feed/json`
8. Check draft behavior (draft post HTML exists but not in index/feeds)

## Typical Usage Pattern

Easto is designed to be used as a dependency in separate blog repositories. See [blog.thomaspuppe.de](https://github.com/thomaspuppe/blog.thomaspuppe.de) for real-world usage.

Example blog repo structure:
```bash
blog-repo/
├── content/              # Your blog posts
├── static/               # Your images, downloads
├── themes/easto/         # Your custom templates
├── easto_config.json     # Your config
├── package.json          # Dependencies including easto
└── output/              # Generated site
```

Build command in blog repo:
```bash
rm -rf ./output/* && node ./node_modules/easto/index.js --config=easto_config.json
```

Or via npm script:
```json
{
  "scripts": {
    "build": "rm -rf ./output/* && node ./node_modules/easto/index.js --config=easto_config.json"
  }
}
```

Templates and content typically live in the blog repository, not in the easto repository. The easto repository's templates and content are for testing and demonstration only.
