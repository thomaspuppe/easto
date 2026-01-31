---
title: Frontmatter Edge Cases Test
date: 2025-01-15
datelabel: January 15th, 2025
language: en
tags: [testing, edge-cases, yaml]
permalink: frontmatter-edge-cases
draft: false
description: This post tests edge cases in frontmatter parsing including special characters, quotes, and colons.
special_chars: String with "quotes" and 'apostrophes'
url_with_colon: https://example.com:8080/path
multiword_tag: [web development, static-site generators, unit testing]
---

# Frontmatter Edge Cases Test

This post tests various edge cases that a custom frontmatter parser needs to handle:

## Special Characters in Strings

The frontmatter includes:
- **Quotes in strings**: `special_chars: String with "quotes" and 'apostrophes'`
- **Colons in values**: `url_with_colon: https://example.com:8080/path`
- **Multi-word array items**: `multiword_tag: [web development, static-site generators, unit testing]`

## Date Parsing

The `date: 2025-01-15` should be parsed as a Date object.

## Boolean Values

The `draft: false` should be parsed as boolean `false`, not the string `"false"`.

## Why These Tests Matter

A custom frontmatter parser needs to handle:
1. Quoted strings with special characters
2. Unquoted strings containing colons (like URLs)
3. Arrays with items containing spaces
4. Proper type conversion (dates, booleans)

If this post renders correctly and appears in the index/feeds, the parser is working!
