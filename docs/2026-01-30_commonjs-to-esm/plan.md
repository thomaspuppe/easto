# Plan: Convert Easto from CommonJS to ESM

**Date**: 2026-01-30
**Reason**: The `feed` package v5.x is now a pure ESM package and cannot be loaded with CommonJS `require()`

## Research Summary

- **feed v5.2.0**: Pure ESM package (the reason for this migration)
- **marked v17**: Already ESM ✓
- **marked-gfm-heading-id**: Already ESM ✓
- **yaml-front-matter**: CommonJS (ESM can import this) ✓
- **ncp**: CommonJS (ESM can import this) ✓

All dependencies are compatible with ESM!

## Implementation Steps

### 1. Update package.json
- Add `"type": "module"` to enable ESM
- Feed dependency is already at 5.2.0 from earlier update

### 2. Convert index.js (main generator)
Change 6 `require()` statements to `import`:
- `const Feed = require('feed')` → `import { Feed } from 'feed'` (note: named import)
- `const fs = require('fs')` → `import fs from 'fs'`
- `const marked = require('marked')` → `import { marked } from 'marked'`
- `const { gfmHeadingId } = require('marked-gfm-heading-id')` → `import { gfmHeadingId } from 'marked-gfm-heading-id'`
- `const yaml = require('yaml-front-matter')` → `import yaml from 'yaml-front-matter'`
- `const ncp = require('ncp').ncp` → `import ncp from 'ncp'` then `const ncpFunc = ncp.ncp`

### 3. Convert serve.js (dev server)
- Change 3 `require()` statements to `import`
- Replace `__dirname` with ESM equivalent using `import.meta.url`
- `const http = require("http")` → `import http from 'http'`
- `const fs = require("fs")` → `import fs from 'fs'`
- `const path = require("path")` → `import path from 'path'`
- `const OUTPUT_DIR = path.join(__dirname, "output")` → Use `path.dirname(fileURLToPath(import.meta.url))`

### 4. Test everything
- Clean output and run build
- Run test suite (npm test)
- Verify all tests pass including:
  - File generation
  - Feed timestamps
  - Headline IDs
  - Server functionality

### 5. Update documentation
- Update CLAUDE.md "Key Dependencies" section to reflect feed v5.2.0
- Add note about ESM in "Core Architecture" section
- Note: This is a breaking change for anyone using easto as a dependency

## Why This Approach

- **Simple**: Keeps easto as a single-file generator (philosophy preserved)
- **Standard**: ESM is the Node.js standard since v12
- **Future-proof**: Ecosystem is moving to ESM
- **No complexity**: No mixed module systems or dynamic imports

## Breaking Change Notice

This is a **breaking change** for projects that:
- Use easto as a CommonJS dependency
- Require easto directly in CommonJS code

Users will need to either:
- Convert their projects to ESM, or
- Use dynamic `import()` to load easto, or
- Stay on easto v0.7.3
