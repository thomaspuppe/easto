# ESM Migration Completed

**Date**: 2026-01-30
**Status**: ✅ COMPLETE

## What Was Done

### 1. Package Configuration
- Added `"type": "module"` to package.json
- Updated `feed` dependency from `^4.2.2` to `^5.2.0`
- Bumped version from `0.7.3` to `0.8.0` (breaking change)

### 2. Code Conversion

#### index.js
- Converted all `require()` statements to `import` statements:
  - `const Feed = require('feed')` → `import { Feed } from 'feed'`
  - `const fs = require('fs')` → `import fs from 'fs'`
  - `const marked = require('marked')` → `import { marked } from 'marked'`
  - `const { gfmHeadingId } = require('marked-gfm-heading-id')` → `import { gfmHeadingId } from 'marked-gfm-heading-id'`
  - `const yaml = require('yaml-front-matter')` → `import yaml from 'yaml-front-matter'`
  - `const ncp = require('ncp').ncp` → `import ncp from 'ncp'`
- Updated Feed instantiation: `new Feed.Feed()` → `new Feed()`
- Updated ncp usage: `ncp()` → `ncp.ncp()`

#### serve.js
- Converted all `require()` statements to `import` statements
- Replaced `__dirname` with ESM equivalent:
  ```javascript
  import { fileURLToPath } from "url";
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  ```

### 3. Testing
All tests passed successfully:
- ✅ File generation
- ✅ Feed generation with correct timestamps
- ✅ Headline IDs
- ✅ Draft handling
- ✅ Server functionality
- ✅ Content-Type headers

### 4. Documentation
Updated CLAUDE.md:
- Added "ES Modules (ESM)" section in Core Architecture
- Updated Key Dependencies with current versions
- Added breaking change notice
- Noted ESM compatibility for each dependency

## Breaking Changes

This is a **breaking change** for projects using easto as a dependency.

### Migration Path for Users

Users of easto v0.7.x (CommonJS) have three options:

1. **Convert to ESM** (recommended):
   - Add `"type": "module"` to package.json
   - Change all `require()` to `import`
   - Update file paths to include `.js` extensions if needed

2. **Use dynamic import**:
   ```javascript
   const easto = await import('easto');
   ```

3. **Stay on v0.7.3**:
   - Pin dependency to `"easto": "^0.7.3"`

## Why ESM?

- `feed@^5.x` is a pure ESM package (cannot be loaded with `require()`)
- `marked@^17.x` is also ESM
- ESM is the Node.js standard since v12
- Keeps easto modern and maintainable
- Aligns with the philosophy of using standard Node.js features

## Results

- ✅ Can now use latest versions of dependencies
- ✅ All existing functionality preserved
- ✅ All tests passing
- ✅ Build time: ~25ms (still fast!)
- ✅ Feed timestamps work correctly
- ✅ Headline IDs work correctly
- ✅ Documentation updated
