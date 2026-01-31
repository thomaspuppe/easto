# Dependency Analysis for Easto

**Date**: 2026-01-30  
**Current total packages**: 13 (5 direct + 8 transitive)

## Current Dependencies

### Direct Dependencies (5)

| Package | Version | Last Updated | Status |
|---------|---------|--------------|--------|
| feed | 5.2.0 | Recent | ✅ Good |
| marked | 17.0.1 | Recent | ✅ Good |
| marked-gfm-heading-id | 4.1.3 | Recent | ✅ Good |
| **ncp** | 2.0.0 | June 2022 (2.5 years) | ⚠️ Outdated |
| **yaml-front-matter** | 4.1.1 | June 2022 (2.5 years) | ⚠️ Outdated |

### Transitive Dependencies (8)

From `yaml-front-matter`:
- js-yaml@3.14.2
- commander@6.2.1
- argparse@1.0.10
- sprintf-js@1.0.3
- esprima@4.0.1

From `feed`:
- xml-js@1.6.11
- sax@1.4.4

From `marked-gfm-heading-id`:
- github-slugger@2.0.0

## Problems Identified

### 1. ncp (2.0.0)
**Problem**: Unmaintained (last update 2.5 years ago)  
**Usage in easto**: Only used for recursive directory copying
```javascript
ncp.ncp(`${TEMPLATES_DIR}/assets`, `${OUTPUT_DIR}/assets`, err => {})
ncp.ncp(DATA_DIR, OUTPUT_DIR, err => {})
```

**Solution**: Replace with native Node.js `fs.cpSync()`
- Available since Node.js v16.7.0 (we're on v24.10.0)
- Zero dependencies
- Synchronous (matches easto's current approach)
- Standard library (no security concerns)

**Migration**:
```javascript
// Before:
import ncp from 'ncp'
ncp.ncp(source, dest, err => {
  if (err) return console.error(err)
})

// After:
import fs from 'fs'
try {
  fs.cpSync(source, dest, { recursive: true })
} catch (err) {
  console.error(err)
}
```

**Impact**: Eliminates 1 dependency entirely

---

### 2. yaml-front-matter (4.1.1)
**Problem**: 
- Unmaintained (last update 2.5 years ago)
- Heavy dependency chain (5 transitive dependencies)
- Includes unnecessary dependencies (commander for CLI, but easto doesn't use CLI features)

**Usage in easto**: Only used for parsing YAML frontmatter
```javascript
let fileContentFrontmatter = yaml.loadFront(fileContent)
```

**Better Alternative**: **gray-matter** (4.0.3)
- More actively maintained (July 2023)
- Battle-tested (used by Gatsby, Next.js, Astro, TinaCMS, etc.)
- Cleaner API
- Fewer dependencies
- Supports multiple formats (YAML, JSON, TOML) for future flexibility

**Migration**:
```javascript
// Before:
import yaml from 'yaml-front-matter'
let fileContentFrontmatter = yaml.loadFront(fileContent)

// After:
import matter from 'gray-matter'
let { data: fileContentFrontmatter, content } = matter(fileContent)
// Note: content is in __content instead of the body, so we'd map it
fileContentFrontmatter.__content = content
```

**Impact**: 
- Reduces transitive dependencies significantly
- More future-proof (active maintenance)
- Actually widely used in similar projects

---

## Recommendations

### High Priority: Replace ncp

**Why**: 
1. Native solution available (fs.cpSync)
2. Eliminates external dependency entirely
3. No migration complexity
4. Better performance (native code)

**Difficulty**: Low  
**Risk**: Very low (native Node.js API)  
**Benefit**: -1 dependency, better long-term maintainability

---

### Medium Priority: Replace yaml-front-matter with gray-matter

**Why**:
1. yaml-front-matter is unmaintained
2. gray-matter is industry standard
3. Better maintained, more features
4. Cleaner dependency tree

**Difficulty**: Low (simple API change)  
**Risk**: Low (gray-matter is very well tested)  
**Benefit**: Fewer transitive deps, better maintenance

**Alternative**: Keep current (works fine, just not ideal long-term)

---

## Keep As-Is (These are Good)

### feed (5.2.0)
- ✅ Well maintained
- ✅ Modern (ESM)
- ✅ Does exactly what we need
- ✅ No better alternatives for RSS/Atom/JSON feeds

### marked (17.0.1) + marked-gfm-heading-id (4.1.3)
- ✅ Industry standard Markdown parser
- ✅ Active development
- ✅ ESM compatible
- ✅ Extension system for heading IDs works well

---

## Proposed Changes Summary

### Option 1: Conservative (Just fix ncp)
**Changes**: Replace ncp with fs.cpSync  
**Impact**: 13 → 12 packages  
**Effort**: 10 minutes  
**Risk**: Very low

### Option 2: Recommended (Fix both issues)
**Changes**: 
1. Replace ncp with fs.cpSync
2. Replace yaml-front-matter with gray-matter

**Impact**: 13 → ~7-8 packages (estimated)  
**Effort**: 30 minutes  
**Risk**: Low

### Option 3: Maximalist (Audit everything)
Could also consider:
- Replacing feed if we manually build RSS/XML (NOT recommended - would add complexity)
- Writing our own YAML parser (NOT recommended - reinventing wheel)

**Verdict**: Not worth it, goes against easto's philosophy

---

## Action Items

If you want to proceed:

1. **ncp → fs.cpSync** (patch version 0.8.1 → 0.8.2)
   - Update index.js to use fs.cpSync
   - Remove ncp from package.json
   - Test builds
   - Very safe change

2. **yaml-front-matter → gray-matter** (minor version 0.8.x → 0.9.0)
   - Update index.js to use gray-matter
   - Replace yaml-front-matter in package.json
   - Adjust code to handle slightly different API
   - Test builds
   - Safe change (gray-matter is well-tested)

Both changes are non-breaking for users of easto (they only affect internals).

---

## Questions to Consider

1. **Do you want to minimize dependencies?** → Yes, replace ncp
2. **Do you care about long-term maintenance?** → Yes, replace yaml-front-matter
3. **Is the current setup working fine?** → Yes, so changes are optional but recommended

## Conclusion

**Recommended action**: Replace both ncp and yaml-front-matter

**Rationale**:
- Aligns with easto's philosophy (simple, minimal, maintainable)
- Reduces attack surface (fewer dependencies)
- Native Node.js features when possible
- More future-proof

**Not urgent**: Current deps work fine, but recommended for long-term health.
