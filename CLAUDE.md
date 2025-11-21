# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Easto is a lightweight static-site generator written in Node.js. It converts Markdown files with YAML frontmatter into HTML pages, generates RSS/Atom/JSON feeds, and is designed to be used as a dependency in blog projects.

The repository includes complete test content and templates that mirror the real-world usage in [blog.thomaspuppe.de](https://github.com/thomaspuppe/blog.thomaspuppe.de).

## Core Architecture

### Single-file Architecture
The entire generator is contained in `index.js` (approximately 168 lines). This is intentional for simplicity, though TODOs indicate potential future modularization.

### Processing Pipeline
1. **Parse Arguments**: Command-line args are parsed manually into a Map (format: `--key=value`)
2. **Read Configuration**: Loads config from JSON file specified via `--config` arg
3. **Process Content**: Reads markdown files from content directory, sorted reverse-alphabetically by filename (newest first)
4. **Extract Frontmatter**: Uses `yaml-front-matter` to parse YAML metadata from markdown files
5. **Convert Markdown**: Uses `marked` library to convert markdown to HTML
6. **Apply Templates**: Uses template evaluation via `Function()` constructor to inject content into templates
7. **Generate Feeds**: Creates RSS, Atom, and JSON feeds using the `feed` library
8. **Copy Assets**: Uses `ncp` to copy template assets and static files to output directory

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

- `marked@^4.1.0`: Markdown to HTML conversion
- `yaml-front-matter@^4.1.1`: Parse YAML frontmatter from markdown
- `feed@^4.2.2`: Generate RSS/Atom/JSON feeds
- `ncp@^2.0.0`: Recursive file copying

No build tools, transpilers, or bundlers required - just Node.js and npm.

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

## Testing Your Changes

1. Make changes to `index.js`
2. Build: `npm run build`
3. Check output in `./output/` directory
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
