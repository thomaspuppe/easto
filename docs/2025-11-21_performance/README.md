# Performance Benchmarking

This directory contains resources for benchmarking easto's performance before and after optimizations.

## Contents

- **`performance-analysis.md`** - Detailed analysis of performance bottlenecks and optimization recommendations
- **`benchmark_content/`** - 150 test blog posts for performance testing (600KB total)
- **`generate-benchmark-posts.js`** - Script that generated the benchmark posts

## Benchmark Content

The `benchmark_content` directory contains 150 markdown posts with:

- **4 content types** cycling through:
  - **Short Text** (~400 bytes) - Minimal posts with 2-3 paragraphs
  - **Medium Article** (~1.2KB) - Typical blog post with sections and code examples
  - **Long Tutorial** (~3KB) - Comprehensive tutorial with multiple chapters and examples
  - **List Heavy** (~1.8KB) - Posts with extensive lists, tables, and structured content

- **Unique dates** spanning 2021-2024 (newest first for proper sorting)
- **Unique slugs** and permalinks for each post
- **Valid frontmatter** with all required fields

### Distribution
- Short Text: ~38 posts
- Medium Article: ~38 posts
- Long Tutorial: ~38 posts
- List Heavy: ~38 posts
- **Total:** 150 posts, ~600KB

## How to Benchmark

### Test Current Performance

```bash
# Create a test config pointing to benchmark content
cat > benchmark_config.json << 'EOF'
{
  "content_dir": "./docs/2025-11-21_performance/benchmark_content",
  "output_dir": "./output",
  "templates_dir": "./templates",
  "data_dir": "./static",
  "author": "Benchmark Test",
  "baseurl": "http://localhost:8000/",
  "feed": {
    "title": "Benchmark Blog",
    "description": "Performance testing",
    "id": "http://localhost:8000/",
    "link": "http://localhost:8000/",
    "copyright": "Test",
    "feedLinks": {
      "rss": "http://localhost:8000/feed/rss",
      "atom": "http://localhost:8000/feed/atom",
      "json": "http://localhost:8000/feed/json"
    },
    "author": {
      "name": "Benchmark Test",
      "email": "test@example.com",
      "link": "http://localhost:8000/"
    }
  }
}
EOF

# Clean and run 5 times to get average
for i in {1..5}; do
  rm -rf ./output/*
  node index.js --config=benchmark_config.json 2>&1 | grep "Easto:"
done
```

### Expected vs Actual Results

**Expected (from analysis):**
- Before optimization: ~65ms (3 posts: ~33ms)
- After async I/O optimization: ~45-52ms (20-30% faster)
- After all optimizations: ~39-46ms (30-40% faster)

**Actual Results:**
- Before optimization: 65ms (3 posts: 33ms)
- After template caching: 63ms (3% faster)
- After async I/O: 67ms (3% slower due to async overhead)
- After all optimizations: 66ms (essentially unchanged)

**Key Finding:** The original implementation was already highly optimized. Modern SSDs and Node.js make synchronous I/O extremely fast for small files. The async overhead slightly outweighs parallelization benefits at this scale.

**However:** The optimizations are still valuable for code quality, best practices, and scalability to 500+ posts or slower storage.

See `optimization-results.md` for complete analysis.

## Regenerating Benchmark Posts

If you need to regenerate the posts:

```bash
# Delete existing posts
rm -rf docs/2025-11-21_performance/benchmark_content/*.md

# Regenerate
node docs/2025-11-21_performance/generate-benchmark-posts.js
```

## Notes

- All posts have `draft: false` so they appear in feeds and index
- Posts are sorted newest-first by filename (2024 posts first)
- Content is realistic but repetitive (intentional for consistency)
- Each post type represents a different performance profile
