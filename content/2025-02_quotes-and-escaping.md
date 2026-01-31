---
title: "Testing Quoted Title: With Colon"
date: 2025-02-01
datelabel: February 1st, 2025
language: de
tags: [quotes, escaping]
permalink: quotes-and-escaping-test
draft: true
description: "A description with: colons and \"nested quotes\" to test parsing"
empty_array: []
single_tag: [solo]
---

# Quotes and Escaping Test (Draft)

This is a **draft post** (`draft: true`) that tests additional edge cases:

## Frontmatter Features Tested

1. **Quoted title with colon**: `title: "Testing Quoted Title: With Colon"`
2. **Quoted description with special chars**: `description: "A description with: colons and \"nested quotes\" to test parsing"`
3. **Empty array**: `empty_array: []`
4. **Single-item array**: `single_tag: [solo]`
5. **Draft status**: `draft: true` (boolean true)
6. **German language code**: `language: de`

## Expected Behavior

Since this is a draft:
- ✅ HTML file should be generated
- ❌ Should NOT appear in index.html
- ❌ Should NOT appear in feeds
- ✅ Should be counted in "Wrote X posts and Y drafts"

## Parser Requirements

The custom parser must handle:
- Quoted strings preserving special characters
- Empty arrays `[]`
- Arrays with one item `[solo]`
- Proper boolean parsing for `draft: true`
