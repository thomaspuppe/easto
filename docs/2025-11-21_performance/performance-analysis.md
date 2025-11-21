# Performance Analysis of easto index.js

**Date:** 2025-11-21
**Analyzed by:** Claude Code
**Current Version:** ~168 lines, single-file architecture

## Current Performance Baseline

Measured with test content (3 markdown files):
- **Build time:** 32-34ms (average across 5 runs)
- **Content:** 3 posts (2 published, 1 draft)
- **Total operations:** ~7 file reads, 6 file writes, 2 async copies

**Performance is already quite fast for small blogs, but could be significantly faster at scale.**

---

## Performance Bottlenecks (Ranked by Impact)

### 🔴 **CRITICAL: Synchronous I/O Operations** (Lines 59-114)

**Current implementation:**
```javascript
fs.readdirSync(CONTENT_DIR)  // Blocks
  .forEach(filename => {
    fs.readFileSync(filePath)     // Blocks for EACH file
    fs.writeFileSync(targetPath)  // Blocks for EACH output
  })
```

**Problem:**
- All file operations are synchronous and sequential
- For N posts: N+1 reads + N writes = **2N+1 blocking operations**
- Scalability impact:
  - 10 posts: 21 blocking operations
  - 100 posts: 201 blocking operations
  - 1000 posts: 2001 blocking operations

**Expected speedup:** 2-5x for 10+ posts, 5-10x for 100+ posts

**Recommended solution:**
```javascript
// Use fs.promises with Promise.all() for parallel operations
const files = await fs.promises.readdir(CONTENT_DIR)
const posts = await Promise.all(
  files.map(async filename => {
    const content = await fs.promises.readFile(`${CONTENT_DIR}/${filename}`)
    // ... process content
    return { targetPath, targetContent }
  })
)
await Promise.all(posts.map(p => fs.promises.writeFile(p.targetPath, p.targetContent)))
```

**Philosophy check:** ✅ This is cleaner modern JavaScript, not more complex

---

### 🟠 **HIGH IMPACT: Repeated Template Function Creation** (Lines 84-93)

**Current implementation:**
```javascript
const eval_template = (s, params) => {
  return Function(...Object.keys(params), "return " + s)  // NEW function each call!
  (...Object.values(params))
}

// Called 2 times per post:
const teaserContent = eval_template(templateForIndexTeaser, {...})
const targetContent = eval_template(templateForPost, {...})
```

**Problem:**
- Creates new Function objects for EVERY post (2 per post)
- For 100 posts = 200 Function constructor calls
- Same template compiled repeatedly with identical template strings
- Function constructor is relatively expensive

**Expected speedup:** 10-20% for large blogs

**Recommended solution:**
```javascript
// Pre-compile templates once at startup
const templateCache = new Map()

const eval_template = (templateString, params) => {
  if (!templateCache.has(templateString)) {
    templateCache.set(
      templateString,
      Function(...Object.keys(params), "return " + templateString)
    )
  }
  return templateCache.get(templateString)(...Object.values(params))
}
```

**Alternative solution:** Use a lightweight template engine (Handlebars, EJS) - but this violates "avoid adding dependencies" philosophy

**Philosophy check:** ⚠️ Adds ~10 lines but significant benefit at scale, stays vanilla JavaScript

---

### 🟠 **MEDIUM IMPACT: String Concatenation in Loop** (Line 111)

**Current implementation:**
```javascript
let indexContent = ''
// ... in forEach loop:
indexContent += teaserContent  // Creates new string each time
```

**Problem:**
- JavaScript strings are immutable
- Each `+=` creates a new string, copying all previous content
- For N posts, creates N intermediate string objects
- O(N²) memory allocations in worst case
- For large blogs (100+ posts), this becomes noticeable

**Expected speedup:** 5-15% for 50+ posts

**Recommended solution:**
```javascript
const teasers = []
// ... in loop:
if (!fileContentFrontmatter['draft']) {
  teasers.push(teaserContent)
}
// ... after loop:
const indexContent = teasers.join('')
```

**Philosophy check:** ✅ Simpler, more idiomatic JavaScript

---

### 🟡 **LOW IMPACT: Feed Directory Creation** (Line 125)

**Current implementation:**
```javascript
fs.mkdirSync(`${OUTPUT_DIR}/feed`)  // Crashes if exists
```

**Problem:**
- Not a performance issue but a **reliability issue**
- Will error on second run if output directory isn't cleaned
- Requires `rm -rf ./output/*` before each build

**Expected speedup:** None (bug fix)

**Recommended solution:**
```javascript
fs.mkdirSync(`${OUTPUT_DIR}/feed`, { recursive: true })
```

**Philosophy check:** ✅ One-line fix, prevents crashes

---

### 🟡 **LOW IMPACT: Async Operations Complete After Timer** (Lines 153-162)

**Current implementation:**
```javascript
ncp(`${TEMPLATES_DIR}/assets`, `${OUTPUT_DIR}/assets`, err => {...})  // Async
ncp(DATA_DIR, OUTPUT_DIR, err => {...})                                // Async
console.timeEnd('🚀 Easto')  // Runs BEFORE copy completes!
```

**Problem:**
- Timer shows ~32ms but actual completion might be 50-100ms
- Not a performance issue, but **misleading measurement**
- Copy operations may still be running when script appears "done"

**Expected speedup:** None (measurement accuracy)

**Recommended solution:**
```javascript
// Wrap ncp in promises
const copyAssets = promisify(ncp)
await Promise.all([
  copyAssets(`${TEMPLATES_DIR}/assets`, `${OUTPUT_DIR}/assets`),
  copyAssets(DATA_DIR, OUTPUT_DIR)
])
console.timeEnd('🚀 Easto')
```

**Alternative (Node 16.7+):**
```javascript
await Promise.all([
  fs.promises.cp(`${TEMPLATES_DIR}/assets`, `${OUTPUT_DIR}/assets`, { recursive: true }),
  fs.promises.cp(DATA_DIR, OUTPUT_DIR, { recursive: true })
])
```

**Philosophy check:** ✅ Cleaner code, accurate timing, no new dependencies

---

## Minor Optimizations (Negligible Impact)

### ✅ Template Loading (Lines 55-56)
**Current:** Already optimal - templates loaded once before loop
```javascript
const templateForPost = fs.readFileSync(`${TEMPLATES_DIR}/post.html`, 'utf-8')
const templateForIndexTeaser = fs.readFileSync(`${TEMPLATES_DIR}/index_teaser.html`, 'utf-8')
```

### Date Formatting (Line 82)
**Current:** `.toISOString().substring(0, 10)` for each post
**Impact:** < 1% - date operations are fast enough, not worth optimizing

---

## Recommended Implementation Priority

### Phase 1: Async I/O ⭐⭐⭐⭐⭐
**Expected speedup:** 2-5x for 10+ posts, 5-10x for 100+ posts

1. Convert to async/await with `fs.promises`
2. Use `Promise.all()` for parallel file reading
3. Use `Promise.all()` for parallel file writing
4. Properly await async copy operations

**Effort:** Medium (requires restructuring main loop to async)
**Benefit:** Massive for real-world blogs
**LOC change:** ~30-40 lines modified

---

### Phase 2: Template Caching ⭐⭐⭐
**Expected speedup:** 10-20% for large blogs

1. Pre-compile templates at startup
2. Cache compiled template functions in a Map

**Effort:** Low (~10 lines added)
**Benefit:** Moderate, scales with blog size
**LOC change:** ~10 lines added

---

### Phase 3: Array Join ⭐⭐
**Expected speedup:** 5-15% for 50+ posts

1. Replace string concatenation with array + join

**Effort:** Trivial (2 lines changed)
**Benefit:** Small but free performance win
**LOC change:** ~3 lines modified

---

### Phase 4: Polish ⭐
**Expected speedup:** None (bug fixes, accuracy)

1. Fix feed directory creation (`{ recursive: true }`)
2. Accurate timing measurement (await all operations)

**Effort:** Trivial (2 lines changed)
**Benefit:** Better reliability and measurement
**LOC change:** ~2 lines modified

---

## Expected Performance Results

### Small Blog (10 posts)
- **Current estimate:** ~50-100ms
- **After optimization:** ~20-30ms
- **Speedup:** 2-3x faster

### Medium Blog (50 posts)
- **Current estimate:** ~200-300ms
- **After optimization:** ~40-80ms
- **Speedup:** 3-5x faster

### Large Blog (200 posts)
- **Current estimate:** ~800-1200ms
- **After optimization:** ~100-200ms
- **Speedup:** 5-8x faster

### Very Large Blog (1000 posts)
- **Current estimate:** ~4-6 seconds
- **After optimization:** ~400-800ms
- **Speedup:** 8-10x faster

---

## Philosophy Considerations

From CLAUDE.md:
> "This project values simplicity and pragmatism over complexity."
> "Keep it fast and understandable - this is a ~168 line generator, not an enterprise application."
> "Prefer simple, straightforward solutions over frameworks and abstractions"

### ✅ Recommended (Aligns with Philosophy)
- **Async I/O:** Modern JavaScript standard, cleaner code
- **Array join:** Simpler, more idiomatic
- **Directory fix:** One-line bug fix
- **Accurate timing:** Better measurement

### ⚠️ Consider (Minor complexity trade-off)
- **Template caching:** Adds ~10 lines but significant benefit at scale
- Stays vanilla JavaScript, no dependencies
- Could be added when needed (YAGNI principle)

### ❌ Avoid (Against Philosophy)
- Adding template engine dependencies
- Complex build systems or transpilers
- Over-engineering for hypothetical scale

---

## Implementation Notes

### Code Structure After Optimization
The optimized version would:
- Still be a single file
- Stay under ~200 lines
- Use modern async/await (Node 14+)
- No new dependencies
- Remain readable and maintainable

### Breaking Changes
Converting to async/await requires:
- Top-level await (Node 14.8+) OR wrapping in async IIFE
- Changing function signatures to async
- Using `await` throughout

### Backward Compatibility
- No API changes (still runs with `node index.js --config=...`)
- Output format remains identical
- Configuration format unchanged

---

## Benchmark Methodology

To validate these improvements, create a larger test dataset:

```bash
# Create 100 test posts
for i in {1..100}; do
  cp content/2024-12_example-post.md content/2024-${i}_test-post.md
done

# Benchmark current version
time node index.js --config=test_config.json

# Benchmark optimized version
time node index-optimized.js --config=test_config.json

# Clean up
rm content/2024-*_test-post.md
```

---

## Conclusion

**Easto is already fast for small blogs (~30ms for 3 posts), but the suggested optimizations would:**

1. Scale much better for real-world blogs (50-200+ posts)
2. Use modern JavaScript best practices
3. Remain simple and readable
4. Stay true to the "no frameworks, no complexity" philosophy

**The async I/O refactor alone would provide 5-10x speedup for typical blogs while making the code more maintainable.**

**Total estimated effort:** 2-3 hours for all optimizations
**Total estimated LOC change:** ~50 lines (still well under 200 total)
