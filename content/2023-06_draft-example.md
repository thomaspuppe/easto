---
title: This is a Draft Post
date: 2023-06-20
datelabel: June 20th, 2023
language: en
tags: [drafts, testing]
permalink: draft-post-example
draft: true
description: This draft post demonstrates that posts with draft:true are excluded from feeds and the index page.
---

## Draft Post Behavior

This post has `draft: true` in the frontmatter, which means:

- ✅ An HTML file is still generated at `/output/draft-post-example`
- ❌ It will NOT appear in the index.html teaser list
- ❌ It will NOT be included in RSS/Atom/JSON feeds
- ✅ The counter will show it as a draft in the build output

## When to Use Drafts

Use `draft: true` when:
- You're working on a post but it's not ready for publication
- You want to preview the HTML output locally
- You need the file generated but not publicly listed

## Testing

After building, check:
1. This file exists at `/output/draft-post-example`
2. It does NOT appear in `/output/index.html`
3. It does NOT appear in `/output/feed/rss`, `/output/feed/atom`, or `/output/feed/json`
4. Build output shows: "Wrote X posts and Y drafts" (this increments Y)
