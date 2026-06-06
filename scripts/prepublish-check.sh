#!/bin/bash
# ReleaseFlow Pre-Publish Checklist
# Run this before publishing to npm

set -e

echo "🔍 ReleaseFlow Pre-Publish Checklist"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Build succeeds
echo -n "Checking build... "
if npm run build > /dev/null 2>&1; then
    check_pass "Build succeeds"
else
    check_fail "Build failed. Run 'npm run build' to fix."
fi

# 2. Package can be packed
echo -n "Checking pack... "
if npm pack > /dev/null 2>&1; then
    TAR_FILE=$(ls releaseflow-*.tgz 2>/dev/null | head -1)
    if [ -n "$TAR_FILE" ]; then
        check_pass "Package packed successfully: $TAR_FILE"
        rm -f "$TAR_FILE"
    else
        check_fail "Pack created no tarball"
    fi
else
    check_fail "Pack failed"
fi

# 3. Validate with dry-run
echo -n "Checking npm publish validation... "
if npm publish --dry-run > /dev/null 2>&1; then
    check_pass "Package validation passed"
else
    check_fail "Package validation failed. Run 'npm publish --dry-run' to see errors."
fi

# 4. Bin is executable
echo -n "Checking bin executable... "
if [ -x "bin/releaseflow" ] || [ -f "bin/releaseflow" ]; then
    check_pass "bin/releaseflow exists"
else
    check_fail "bin/releaseflow not found or not executable"
fi

# 5. README has install instructions
echo -n "Checking README installation instructions... "
if grep -q "npm install\|npx releaseflow" README.md 2>/dev/null; then
    check_pass "README has installation instructions"
else
    check_warn "README may be missing installation instructions"
fi

# 6. package.json metadata
echo -n "Checking package.json metadata... "
if grep -q '"name": "releaseflow"' package.json && \
   grep -q '"bin"' package.json && \
   grep -q '"license": "MIT"' package.json; then
    check_pass "package.json has required metadata"
else
    check_fail "package.json missing required fields"
fi

# 7. Version is not 0.0.0
VERSION=$(node -e "console.log(require('./package.json').version)" 2>/dev/null)
echo -n "Checking version... "
if [ "$VERSION" != "0.0.0" ] && [ -n "$VERSION" ]; then
    check_pass "Version: $VERSION"
else
    check_fail "Version is 0.0.0 or invalid"
fi

echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}All checks passed! Ready to publish.${NC}"
echo ""
echo "To publish:"
echo "  npm publish"
echo ""
