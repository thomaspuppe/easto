#!/bin/bash

# Simple test script for easto
# Tests that output is generated correctly and can be served

set -e  # Exit on any error

echo "🧪 Running easto tests..."
echo ""

# Clean and build
echo "1️⃣  Building site..."
rm -rf ./output/*
node index.js --config=test_config.json > /dev/null 2>&1

# Check expected files exist
echo "2️⃣  Checking output files..."
FILES=(
    "output/index.html"
    "output/example-post-full-frontmatter"
    "output/markdown-features-test"
    "output/draft-post-example"
    "output/frontmatter-edge-cases"
    "output/quotes-and-escaping-test"
    "output/feed/rss"
    "output/feed/atom"
    "output/feed/json"
    "output/assets/styles.css"
    "output/assets/microlighter/microlighter.min.js"
    "output/assets/microlighter/grammars/javascript.js"
    "output/assets/microlighter/themes/github.css"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing file: $file"
        exit 1
    fi
done
echo "   ✅ All expected files exist"

# Check file contents
echo "3️⃣  Checking content..."

# Index should have 3 posts (not the drafts)
POST_COUNT=$(grep -c "class=\"teaser\"" output/index.html)
if [ "$POST_COUNT" -ne 3 ]; then
    echo "❌ Expected 3 posts in index, found $POST_COUNT"
    exit 1
fi
echo "   ✅ Index has correct number of posts"

# Draft should NOT be in index
if grep -q "draft-post-example" output/index.html; then
    echo "❌ Draft post should not appear in index"
    exit 1
fi
echo "   ✅ Draft not in index"

# Draft should NOT be in feeds
if grep -q "draft-post-example" output/feed/json; then
    echo "❌ Draft post should not appear in JSON feed"
    exit 1
fi
echo "   ✅ Draft not in feeds"

# Check localhost URLs are used
if ! grep -q "http://localhost:8000" output/index.html; then
    echo "❌ Index should contain localhost URLs"
    exit 1
fi
echo "   ✅ URLs point to localhost"

# Check that headline IDs are generated (marked-gfm-heading-id)
if ! grep -q '<h2 id="why-this-example-matters">' output/example-post-full-frontmatter; then
    echo "❌ Headline IDs not generated correctly (missing id attribute)"
    exit 1
fi
if ! grep -q '<h3 id="lists">' output/example-post-full-frontmatter; then
    echo "❌ Headline IDs not generated for h3 elements"
    exit 1
fi
echo "   ✅ Headline IDs generated correctly"

# Check that code blocks carry the language class microlighter needs
if ! grep -q '<pre><code class="language-javascript">' output/markdown-features-test; then
    echo "❌ Code block with language should have class=\"language-javascript\""
    exit 1
fi
if ls output/assets/microlighter/*.d.ts > /dev/null 2>&1; then
    echo "❌ TypeScript declarations should not be copied to output"
    exit 1
fi
echo "   ✅ Syntax highlighting assets and markup in place"

# Check that feed timestamps match most recent post date (not current build time)
# Most recent non-draft post is 2025-01-15, so feeds should have that date
if ! grep -q '<lastBuildDate>Wed, 15 Jan 2025 00:00:00 GMT</lastBuildDate>' output/feed/rss; then
    echo "❌ RSS feed lastBuildDate should match most recent post date (2025-01-15)"
    exit 1
fi
if ! grep -q '<updated>2025-01-15T00:00:00.000Z</updated>' output/feed/atom; then
    echo "❌ Atom feed updated should match most recent post date (2025-01-15)"
    exit 1
fi
echo "   ✅ Feed timestamps match most recent post"

# Test frontmatter parsing edge cases
echo "   Testing frontmatter parser edge cases..."

# Check that edge case post with draft: false is in index
if ! grep -q "frontmatter-edge-cases" output/index.html; then
    echo "❌ Edge cases post (draft: false) should appear in index"
    exit 1
fi

# Check that quotes-and-escaping post with draft: true is NOT in index
if grep -q "quotes-and-escaping-test" output/index.html; then
    echo "❌ Quotes test post (draft: true) should not appear in index"
    exit 1
fi

# Verify special characters are parsed correctly in frontmatter-edge-cases file
# Note: Quotes get HTML-escaped by marked (&quot; and &#39;)
if ! grep -q 'String with &quot;quotes&quot; and' output/frontmatter-edge-cases; then
    echo "❌ Special characters in strings not parsed correctly"
    exit 1
fi

# Verify URL with colon is parsed correctly
if ! grep -q 'https://example.com:8080/path' output/frontmatter-edge-cases; then
    echo "❌ URLs with colons not parsed correctly"
    exit 1
fi

echo "   ✅ Frontmatter parser handles edge cases correctly"

# Test serving
echo "4️⃣  Testing local server..."

# Start server in background
node serve.js > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 1

# Test HTTP requests
if ! curl -s -f http://localhost:8000/ > /dev/null; then
    echo "❌ Could not fetch index page"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo "   ✅ Index page serves correctly"

# Test extensionless file
if ! curl -s -f http://localhost:8000/example-post-full-frontmatter > /dev/null; then
    echo "❌ Could not fetch extensionless file"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo "   ✅ Extensionless files serve correctly"

# Test content type for extensionless file
CONTENT_TYPE=$(curl -s -I http://localhost:8000/example-post-full-frontmatter | grep -i "content-type" | cut -d: -f2 | tr -d ' \r')
if [[ "$CONTENT_TYPE" != "text/html" ]]; then
    echo "❌ Wrong content type for HTML: $CONTENT_TYPE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo "   ✅ Content-Type correct for HTML"

# Test CSS
CONTENT_TYPE=$(curl -s -I http://localhost:8000/assets/styles.css | grep -i "content-type" | cut -d: -f2 | tr -d ' \r')
if [[ "$CONTENT_TYPE" != "text/css" ]]; then
    echo "❌ Wrong content type for CSS: $CONTENT_TYPE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo "   ✅ Content-Type correct for CSS"

# Test JS (module scripts need a JavaScript MIME type)
CONTENT_TYPE=$(curl -s -I http://localhost:8000/assets/microlighter/microlighter.min.js | grep -i "content-type" | cut -d: -f2 | tr -d ' \r')
if [[ "$CONTENT_TYPE" != "text/javascript" ]]; then
    echo "❌ Wrong content type for JS: $CONTENT_TYPE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo "   ✅ Content-Type correct for JS"

# Stop server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null || true  # killed server exits with 143, which would trip set -e

echo ""
echo "✅ All tests passed!"
