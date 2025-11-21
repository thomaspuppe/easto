# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Easto is a lightweight static-site generator written in Node.js. It converts Markdown files with YAML frontmatter into HTML pages, generates RSS/Atom/JSON feeds, and is designed to be used as a dependency in blog projects.

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
8. **Copy Assets**: Uses `ncp` to copy template assets and data files to output directory

### Template System
Templates use a custom evaluation system (`eval_template` function at index.js:35-38) that creates a new Function with parameters and evaluates template strings. Templates have access to:
- `blogmeta`: Blog configuration from config JSON
- `meta`: Frontmatter metadata from markdown file
- `content`: Rendered HTML content

Expected template files (in `TEMPLATES_DIR`):
- `post.html`: Template for individual posts
- `index_teaser.html`: Template for post teasers on index page
- `index.html`: Template for the main index page
- `assets/`: Directory containing CSS and other static assets

### Content Format
Markdown files must include YAML frontmatter with:
- `title`: Post title
- `description`: Post description
- `date`: Publication date (Date object in YAML)
- `draft` (optional): Set to true to exclude from feed and index
- `permalink` (optional): Custom output filename (without `.md` extension)

## Commands

### Generate Site
```bash
node index.js --config=path/to/config.json --content=content_dir --output=output_dir --templates=templates_dir --data=data_dir --verbose=true
```

Basic usage (uses defaults from config):
```bash
node index.js --config=path/to/config.json
```

Or use the npm script:
```bash
npm start
```

### Local Development Server
After generating output, serve locally:
```bash
cd output && caddy -port 8000
# Then visit http://localhost:8000/
```

Alternative simple servers (if you have Python/Ruby):
- Python 3: `python -m http.server 8000`
- Ruby: `ruby -un httpd . -p 8000`

### Linting
This project uses ESLint with the Standard style:
```bash
npx eslint index.js
```

## Configuration

The config JSON file (passed via `--config` argument) should contain:
- `content_dir`: Path to markdown content files (default: `content`)
- `output_dir`: Path for generated HTML files (default: `output`)
- `templates_dir`: Path to template files (default: `templates`)
- `data_dir`: Path to static files like images, downloads (commonly named `static`)
- `baseurl`: Base URL for the site (used in feed generation)
- `feed`: Object with feed configuration (title, description, link, author, etc.)

## Directory Structure

```
easto/
├── index.js              # Main generator logic
├── content/              # Example markdown content files
├── templates/            # Example template files
│   ├── index.html        # Index page template
│   ├── index_teaser.html # Post teaser template
│   ├── post.html         # Individual post template
│   └── assets/          # CSS and template assets
├── output/              # Generated HTML output (gitignored for blog content)
└── static/              # Static files to copy to output (images, downloads, etc.)
```

## Key Dependencies

- `marked@^4.1.0`: Markdown to HTML conversion
- `yaml-front-matter@^4.1.1`: Parse YAML frontmatter from markdown
- `feed@^4.2.2`: Generate RSS/Atom/JSON feeds
- `ncp@^2.0.0`: Recursive file copying

## Important Implementation Notes

### File Naming and Ordering
Content files are processed in reverse alphabetical order (newest first). Use date-prefixed filenames (e.g., `2024-03-18-post-title.md`) to control ordering.

### Draft Posts
Posts with `draft: true` in frontmatter are still converted to HTML but excluded from:
- Feed generation (RSS/Atom/JSON)
- Index page teaser list

### Template Evaluation Security
The template system uses `Function()` constructor for evaluation, which means templates have access to the full JavaScript runtime. Only use trusted template files.

### Synchronous I/O
All file operations are currently synchronous. This is acceptable for small to medium blogs but may need optimization for very large sites.

### Feed Directory Creation
The code creates `${OUTPUT_DIR}/feed/` directory without checking if it exists. This will error if the directory already exists. Clean the output directory before running if encountering issues.

## Typical Usage Pattern

Easto is designed to be used as a dependency in separate blog repositories:

```bash
# In your blog repo
rm -rf ./output/* && node ../easto/index.js \
  --config=./config.json \
  --content=./content \
  --data=./static \
  --output=./output \
  --templates=./themes/mytheme \
  --verbose=true
```

Templates and content typically live in the blog repository, not in the easto repository.
