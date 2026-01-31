#!/bin/bash

# Dependency Performance Benchmark Script
# Measures: dependency count, size, install time, build time

set -e

OUTPUT_FILE="$1"
if [ -z "$OUTPUT_FILE" ]; then
  echo "Usage: $0 <output-file>"
  exit 1
fi

echo "=== Dependency Performance Benchmark ===" > "$OUTPUT_FILE"
echo "Date: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 1. Get current package version
echo "## Version Info" >> "$OUTPUT_FILE"
VERSION=$(node -p "require('./package.json').version")
echo "Version: $VERSION" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 2. Count dependencies before install
echo "## Dependencies (package.json)" >> "$OUTPUT_FILE"
echo "\`\`\`json" >> "$OUTPUT_FILE"
cat package.json | grep -A 10 '"dependencies"' >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 3. Clean install and measure time
echo "## npm install Performance" >> "$OUTPUT_FILE"
rm -rf node_modules package-lock.json
echo "Measuring fresh install time..." >> "$OUTPUT_FILE"

START_TIME=$(date +%s%3N)
npm install --silent > /dev/null 2>&1
END_TIME=$(date +%s%3N)
INSTALL_TIME=$((END_TIME - START_TIME))

echo "Install time: ${INSTALL_TIME}ms" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 4. Count total packages installed
echo "## Package Count" >> "$OUTPUT_FILE"
DIRECT_COUNT=$(cat package.json | grep -c '":' | awk '{print $1-1}') || DIRECT_COUNT=0
TOTAL_COUNT=$(npm ls --all 2>/dev/null | grep -c "├\|└" || echo "0")
echo "Direct dependencies: $DIRECT_COUNT" >> "$OUTPUT_FILE"
echo "Total packages (including transitive): $TOTAL_COUNT" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 5. Measure node_modules size
echo "## Disk Usage" >> "$OUTPUT_FILE"
NODE_MODULES_SIZE=$(du -sh node_modules | cut -f1)
echo "node_modules size: $NODE_MODULES_SIZE" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 6. List all packages
echo "## Dependency Tree" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
npm ls --all >> "$OUTPUT_FILE" 2>&1 || true
echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 7. Build performance (5 runs)
echo "## Build Performance (5 runs)" >> "$OUTPUT_FILE"
echo "Measuring build times..." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

TOTAL_BUILD_TIME=0
for i in {1..5}; do
  rm -rf ./output/*
  
  # Capture the actual time from easto's console.timeEnd
  BUILD_OUTPUT=$(npm run build 2>&1)
  BUILD_TIME=$(echo "$BUILD_OUTPUT" | grep "🚀 Easto:" | sed 's/.*: \([0-9.]*\)ms/\1/')
  
  echo "Run $i: ${BUILD_TIME}ms" >> "$OUTPUT_FILE"
  
  # Add to total (convert to integer for calculation)
  BUILD_TIME_INT=$(echo "$BUILD_TIME" | cut -d. -f1)
  TOTAL_BUILD_TIME=$((TOTAL_BUILD_TIME + BUILD_TIME_INT))
done

AVG_BUILD_TIME=$((TOTAL_BUILD_TIME / 5))
echo "" >> "$OUTPUT_FILE"
echo "Average build time: ${AVG_BUILD_TIME}ms" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 8. Package sizes breakdown
echo "## Package Sizes (top 10 largest)" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
du -sh node_modules/* 2>/dev/null | sort -rh | head -10 >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "Benchmark completed! Results saved to: $OUTPUT_FILE"
