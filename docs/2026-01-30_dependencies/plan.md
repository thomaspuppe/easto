# Plan: Replace Outdated Dependencies

**Date**: 2026-01-30  
**Reason**: Two dependencies (ncp and yaml-front-matter) are unmaintained (2.5 years old) and can be replaced with better alternatives

## Goal

Replace outdated dependencies with modern, well-maintained alternatives (or native Node.js APIs) to reduce dependency count, improve long-term maintenance, and align with easto's minimalist philosophy.

## Changes

### 1. Replace ncp with native fs.cpSync

**Current**: `ncp@2.0.0` (unmaintained since June 2022)  
**New**: Native Node.js `fs.cpSync()` (available since v16.7.0, we're on v24.10.0)

**Benefits**:
- ✅ Zero dependencies (eliminate 1 package)
- ✅ Native Node.js standard library
- ✅ Better performance
- ✅ No security concerns
- ✅ Synchronous (matches current approach)

**Code Changes**:
```javascript
// Before:
import ncp from 'ncp'
ncp.ncp(source, dest, err => {
  if (err) return console.error(err)
  LOG('copied...')
})

// After:
// (already have fs imported)
try {
  fs.cpSync(source, dest, { recursive: true })
  LOG('copied...')
} catch (err) {
  console.error(err)
}
```

**Lines affected in index.js**: 8, 166-171, 172-177

### 2. Replace yaml-front-matter with gray-matter

**Current**: `yaml-front-matter@4.1.1` (unmaintained since June 2022)  
**New**: `gray-matter@4.0.3` (actively maintained, industry standard)

**Benefits**:
- ✅ Battle-tested (Gatsby, Next.js, Astro, etc.)
- ✅ Active maintenance (last update July 2023)
- ✅ Cleaner API
- ✅ Reduces transitive dependencies (~5 fewer packages)
- ✅ Supports multiple frontmatter formats (future flexibility)

**Code Changes**:
```javascript
// Before:
import yaml from 'yaml-front-matter'
let fileContentFrontmatter = yaml.loadFront(fileContent)
// Access: fileContentFrontmatter.__content (body)
//         fileContentFrontmatter.title, etc. (metadata)

// After:
import matter from 'gray-matter'
const { data, content } = matter(fileContent)
data.__content = content  // Map to expected property name
let fileContentFrontmatter = data
// Access: fileContentFrontmatter.__content (body)
//         fileContentFrontmatter.title, etc. (metadata)
```

**Lines affected in index.js**: 7, 73-75

## Implementation Steps

### 1. Update package.json
- Remove: `ncp`, `yaml-front-matter`
- Add: `gray-matter`
- Version bump: `0.8.1` → `0.8.2` (patch version - internal changes only)

### 2. Update index.js imports
- Remove: `import ncp from 'ncp'`
- Remove: `import yaml from 'yaml-front-matter'`
- Add: `import matter from 'gray-matter'`
- (fs already imported)

### 3. Replace ncp usage (2 occurrences)
- Line 166-171: Copy template assets
- Line 172-177: Copy data files
- Replace callback-style with try-catch

### 4. Replace yaml-front-matter usage (1 occurrence)
- Line 73-75: Parse frontmatter
- Map gray-matter output to expected structure

### 5. Install new dependencies
- `npm install gray-matter`
- `npm uninstall ncp yaml-front-matter`

### 6. Test thoroughly
- Clean build test
- Full test suite (npm test)
- Verify output unchanged
- Check dependency tree

### 7. Update documentation
- Update CLAUDE.md version reference
- Create completed.md with results

## Expected Outcome

**Before**:
- Total packages: 13 (5 direct + 8 transitive)
- Outdated: ncp, yaml-front-matter

**After**:
- Total packages: ~7-8 (4 direct + 3-4 transitive)
- All dependencies modern and maintained
- Dependency reduction: ~40%

## Version Bump

This is a **patch version** (0.8.1 → 0.8.2) because:
- ✅ No breaking changes for users
- ✅ Internal implementation only
- ✅ Same API and behavior
- ✅ Bug fix (security/maintenance)

## Risk Assessment

**Risk Level**: Low

**Mitigations**:
- gray-matter is battle-tested and widely used
- fs.cpSync is native Node.js (v16.7.0+, stable)
- Full test suite will catch any issues
- Changes are isolated and straightforward

## Success Criteria

- ✅ All tests pass
- ✅ Build output identical to before
- ✅ Dependency count reduced
- ✅ No outdated dependencies remaining
- ✅ Code simpler (native API for copying)
