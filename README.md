# easto

A lightweight static-site generator written in Node.js. Converts Markdown files with YAML frontmatter into HTML pages and generates RSS/Atom/JSON feeds.

## Features

- 📝 Markdown to HTML conversion using [marked](https://marked.js.org/)
- 📰 YAML frontmatter parsing
- 🔖 RSS, Atom, and JSON feed generation
- 📄 Custom templates using JavaScript template literals
- 🎨 Asset copying (CSS, images, etc.)
- ⚡ Fast build times (typically <100ms for small blogs)
- 📝 Draft post support

## Installation

```bash
npm install
```

## Quick Start

Test easto with the included example content:

```bash
node index.js --config=test_config.json --verbose=true
```

This will:
1. Read markdown files from `./content/`
2. Convert them to HTML using templates from `./templates/`
3. Generate RSS/Atom/JSON feeds
4. Copy assets and data files
5. Output everything to `./output/`

View the result:

```bash
npm run serve
# Visit http://localhost:8000/
```

## Usage

### Basic Command

```bash
node index.js --config=path/to/config.json
```

### With Options

```bash
node index.js --config=config.json --verbose=true
```

### Using as a Dependency

Easto is designed to be used as a dependency in your blog repository:

```json
{
  "dependencies": {
    "easto": "../easto"
  },
  "scripts": {
    "build": "rm -rf ./output/* && node ./node_modules/easto/index.js --config=easto_config.json"
  }
}
```

Then run: `npm run build`

## Configuration

Create a JSON config file (see `test_config.json` for an example):

```json
{
  "content_dir": "./content",
  "output_dir": "./output",
  "templates_dir": "./templates",
  "data_dir": "./static",
  "author": "Your Name",
  "baseurl": "https://yourblog.com/",
  "feed": {
    "title": "Your Blog Title",
    "description": "Blog description",
    "id": "https://yourblog.com",
    "link": "https://yourblog.com",
    "copyright": "All rights reserved 2024, Your Name",
    "feedLinks": {
      "json": "https://yourblog.com/feed/json",
      "atom": "https://yourblog.com/feed/atom",
      "rss": "https://yourblog.com/feed/rss"
    },
    "author": {
      "name": "Your Name",
      "email": "you@example.com",
      "link": "https://yourblog.com"
    }
  }
}
```

## Content Format

Create markdown files in your `content_dir` with YAML frontmatter:

```markdown
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

Your markdown content goes here...

## Headings work

So do **bold**, _italic_, and `code`.
```

### Required Frontmatter Fields

- `title`: Post title
- `date`: Publication date (YAML date format)
- `datelabel`: Human-readable date for display
- `language`: Content language (en, de, etc.)
- `tags`: Array of tags/categories
- `permalink`: URL slug (without .html extension)
- `draft`: Boolean - set to `true` to exclude from feeds/index
- `description`: Short summary for meta tags and teasers

## Templates

Create three template files in your `templates_dir`:

### `index.html` - Homepage template
Contains the layout for the homepage with `${ content }` placeholder for teasers.

### `index_teaser.html` - Post teaser template
Template for each post preview on the homepage.

### `post.html` - Individual post template
Full page template for individual blog posts.

All templates use JavaScript template literal syntax with access to:
- `blogmeta`: Your config.json values
- `meta`: Post frontmatter
- `content`: Rendered HTML content

Example:
```javascript
`<h1>${ meta.title }</h1>
<time datetime="${ meta.date }">${ meta.datelabel }</time>
${ content }`
```

## Directory Structure

```
your-blog/
├── content/              # Markdown files
│   ├── 2024-12_post-one.md
│   └── 2023-06_post-two.md
├── templates/            # HTML templates
│   ├── index.html
│   ├── index_teaser.html
│   ├── post.html
│   └── assets/          # CSS, fonts, etc.
├── static/              # Static files (images, downloads)
├── output/              # Generated site (gitignore this)
├── easto_config.json    # Configuration
└── package.json
```

## Development Server

Easto generates files without extensions (e.g., `/blog-post` instead of `/blog-post.html`).

### Using the included dev server

```bash
npm run serve
# or: node serve.js
```

This serves extensionless files with `Content-Type: text/html` and runs on http://localhost:8000/

### Using Caddy

If you have Caddy installed, use this configuration:

```bash
:8000 {
	root * output
	file_server
	try_files {path} {path}.html {path}/index.html
}
```

## How It Works

1. **Parse Arguments**: Reads `--config` and `--verbose` flags
2. **Load Config**: Loads JSON configuration file
3. **Read Content**: Reads all `.md` files from `content_dir`
4. **Sort by Date**: Processes files in reverse alphabetical order (newest first)
5. **Parse Frontmatter**: Extracts YAML metadata from each file
6. **Convert Markdown**: Converts markdown to HTML using marked
7. **Apply Templates**: Evaluates templates with content and metadata
8. **Generate Feeds**: Creates RSS, Atom, and JSON feeds
9. **Copy Assets**: Copies template assets and data files to output

## Draft Posts

Posts with `draft: true`:
- ✅ HTML file is generated
- ❌ Not included in feeds (RSS/Atom/JSON)
- ❌ Not shown in index page teaser list
- ✅ Counted separately in build output

## File Naming Convention

Use date-prefixed filenames for proper ordering:
- `2024-12_latest-post.md` (processed first)
- `2023-06_older-post.md` (processed later)

Files are sorted reverse-alphabetically, so newer dates appear first in the index and feeds.

## Tips

- Keep the generator simple - it's intentionally a single-file architecture
- Templates and content typically live in your blog repo, not in easto
- Use easto as a dependency (`npm install ../easto` or from git)
- Clean the output directory before each build to avoid stale files

## Example Blog Setup

See the real-world usage in [blog.thomaspuppe.de](https://github.com/thomaspuppe/blog.thomaspuppe.de) repository.

## Testing

Run the test suite:

```bash
npm test
# or: ./test.sh
```

The test script:
- Builds the site with test content
- Verifies all expected files are generated
- Checks that drafts are excluded from feeds/index
- Tests the local server
- Validates HTTP responses and content types

No testing framework required - just a simple bash script.

## Local Development

To work on easto itself:

1. Make changes to `index.js`
2. Build: `npm run build`
3. Test: `npm test`
4. Serve: `npm run serve`
5. Visit http://localhost:8000/

The included `serve.js` dev server correctly handles extensionless files that easto generates.

## License

MIT
