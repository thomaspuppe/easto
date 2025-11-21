---
title: Markdown Features Test Page
date: 2019-03-22
datelabel: March 22nd, 2019
language: en
tags: [markdown, testing]
permalink: markdown-features-test
draft: false
description: A comprehensive test of markdown rendering including headings, lists, code blocks, and more.
---

# Heading 1

This page tests various markdown features to ensure the marked library is rendering correctly.

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Text Formatting

_Italic text_ and **bold text** work as expected. You can also combine them: **_bold and italic_**.

## Links

External link: [Easto on GitHub](https://github.com/thomaspuppe/easto)

Inline link with title: [marked library](https://marked.js.org/ "Markdown parser")

## Lists

Unordered list:
- First item
- Second item with `inline code`
- Third item with **bold text**
  - Nested item 1
  - Nested item 2

Ordered list:
1. First step
2. Second step
3. Third step
   1. Nested numbered item
   2. Another nested item

## Code

Inline code: `const foo = "bar"`

Code block without language:

```
if (foo.length < 8) {
  return "bar";
}
```

Code block with language (JavaScript):

```javascript
const fs = require('fs')
const marked = require('marked')

fs.readdirSync('content')
  .forEach(filename => {
    const content = fs.readFileSync(`content/${filename}`, 'utf-8')
    const html = marked.parse(content)
    console.log(html)
  })
```

Code block with language (Ruby):

```ruby
if foo.length < 8
  "bar"
end
```

## Blockquotes

> This is a blockquote. It can span multiple lines and contain other markdown elements.
>
> Like **bold text** and [links](https://example.com).

Nested blockquote:

> This is the first level
>> This is nested
>>> This is double nested

## Horizontal Rules

Three ways to create horizontal rules:

---

***

___

## Images

(Markdown image syntax - actual rendering depends on having image files)

![Alt text for image](https://via.placeholder.com/150)

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |

## Escaping

You can escape special characters with backslash: \*not italic\*, \`not code\`

## HTML in Markdown

Markdown also allows inline HTML:

<div style="border: 1px solid #ccc; padding: 10px;">
  This is an HTML div inside markdown content.
</div>

## Summary

This page tests all common markdown features to ensure easto's markdown processing works correctly with the marked library.
