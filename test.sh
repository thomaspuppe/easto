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
    "output/feed/rss"
    "output/feed/atom"
    "output/feed/json"
    "output/assets/styles.css"
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

# Index should have 2 posts (not the draft)
POST_COUNT=$(grep -c "class=\"teaser\"" output/index.html)
if [ "$POST_COUNT" -ne 2 ]; then
    echo "❌ Expected 2 posts in index, found $POST_COUNT"
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

# Stop server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "✅ All tests passed!"
