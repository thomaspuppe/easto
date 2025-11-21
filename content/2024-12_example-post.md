---
title: Example Blog Post with Full Frontmatter
date: 2024-12-15
datelabel: December 15th, 2024
language: en
tags: [web development, static-site generators]
permalink: example-post-full-frontmatter
draft: false
description: This is an example blog post demonstrating all the frontmatter fields that easto templates expect.
---

This is an example blog post that demonstrates how easto processes markdown content with complete YAML frontmatter.

## Why This Example Matters

This content file includes all the frontmatter fields that the real blog templates expect:
- `title`: The post title
- `date`: Publication date in YAML date format
- `datelabel`: Human-readable date string for display
- `language`: Content language (en, de, etc.)
- `tags`: Array of tags/categories
- `permalink`: Custom URL slug
- `draft`: Boolean to exclude from feeds and index
- `description`: Short summary for teasers and meta tags

## Markdown Features

You can use standard markdown features:

**Bold text** and _italic text_ work as expected.

### Lists

Unordered lists:
- First item
- Second item
- Third item

Ordered lists:
1. First step
2. Second step
3. Third step

### Links and Code

Check out [the easto repository](https://github.com/thomaspuppe/easto) for more information.

Inline code: `const foo = "bar"`

Code blocks:

```javascript
const marked = require('marked')
const html = marked.parse(markdown)
console.log(html)
```

### Blockquotes

> This is a blockquote. Easto processes these correctly using the marked library.

## Testing Feed Generation

Since this post has `draft: false`, it will appear in:
- The index.html teaser list
- RSS feed
- Atom feed
- JSON feed
