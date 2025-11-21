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

### Expected Results

**Before optimization (current):**
- 150 posts: ~400-600ms

**After async I/O optimization:**
- 150 posts: ~80-150ms (4-5x faster)

**After all optimizations:**
- 150 posts: ~60-100ms (5-8x faster)

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
