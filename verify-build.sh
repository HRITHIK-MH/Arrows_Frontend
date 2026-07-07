#!/bin/bash
# Build verification script for Arrows Frontend
# Run this after `npm run build` to verify chunks are correctly generated

set -e

DIST_DIR="dist"
ASSETS_DIR="$DIST_DIR/assets"

echo "======================================"
echo "Chunk Build Verification"
echo "======================================"
echo ""

# Check if dist folder exists
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ ERROR: dist/ folder not found. Run 'npm run build' first."
    exit 1
fi

echo "✓ dist/ folder exists"

# Check if assets folder exists
if [ ! -d "$ASSETS_DIR" ]; then
    echo "❌ ERROR: dist/assets/ folder not found."
    exit 1
fi

echo "✓ dist/assets/ folder exists"
echo ""

# Count JS files
JS_FILES=$(find "$ASSETS_DIR" -name "*.js" | wc -l)
echo "JavaScript files: $JS_FILES"

if [ "$JS_FILES" -lt 5 ]; then
    echo "⚠️  WARNING: Expected at least 5 JS chunk files (main, vendor, utils, etc.)"
    echo "   Found only: $JS_FILES"
fi

echo ""
echo "Checking for expected chunks:"

EXPECTED_CHUNKS=(
    "index-"
    "react-vendor-"
    "mui-vendor-"
    "chart-vendor-"
    "utils-"
)

FOUND_COUNT=0
for chunk in "${EXPECTED_CHUNKS[@]}"; do
    if find "$ASSETS_DIR" -name "*${chunk}*.js" -exec ls -lh {} \; 2>/dev/null | grep -q .; then
        SIZE=$(find "$ASSETS_DIR" -name "*${chunk}*.js" -exec du -h {} \; | head -1 | awk '{print $1}')
        echo "  ✓ Found: ${chunk}* (Size: $SIZE)"
        ((FOUND_COUNT++))
    else
        echo "  ⚠️  Missing: ${chunk}*"
    fi
done

echo ""
echo "Critical chunks (must exist):"

CRITICAL=(
    "JobOpenings-"
    "Candidates-"
    "Dashboard-"
)

CRITICAL_COUNT=0
for chunk in "${CRITICAL[@]}"; do
    if find "$ASSETS_DIR" -name "*${chunk}*.js" -exec ls -lh {} \; 2>/dev/null | grep -q .; then
        SIZE=$(find "$ASSETS_DIR" -name "*${chunk}*.js" -exec du -h {} \; | head -1 | awk '{print $1}')
        echo "  ✓ Found: ${chunk}* (Size: $SIZE)"
        ((CRITICAL_COUNT++))
    else
        echo "  ❌ MISSING: ${chunk}* - This will cause 404 errors in production!"
    fi
done

echo ""
echo "File size verification:"

# Check for suspiciously small files (empty chunks)
SMALL_FILES=$(find "$ASSETS_DIR" -name "*.js" -size -1k 2>/dev/null | wc -l)
if [ "$SMALL_FILES" -gt 0 ]; then
    echo "⚠️  WARNING: Found $SMALL_FILES JS files smaller than 1KB"
    find "$ASSETS_DIR" -name "*.js" -size -1k -exec ls -lh {} \;
fi

# Show largest JS files
echo ""
echo "Top 5 largest JS files:"
find "$ASSETS_DIR" -name "*.js" -exec du -h {} \; | sort -rh | head -5

echo ""
echo "Total dist size:"
du -sh "$DIST_DIR"

echo ""
echo "======================================"
if [ "$CRITICAL_COUNT" -eq "${#CRITICAL[@]}" ] && [ "$FOUND_COUNT" -ge 4 ]; then
    echo "✓ Build verification PASSED"
    echo "======================================"
    exit 0
else
    echo "❌ Build verification FAILED"
    echo "Some critical chunks are missing."
    echo "Check vite.config.js manualChunks configuration."
    echo "======================================"
    exit 1
fi
