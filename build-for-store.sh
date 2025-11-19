#!/bin/bash

# Build and Package Chrome Extension for Chrome Web Store
# This script builds the extension and creates a production-ready ZIP file

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   YouTube Motion Tracking - Chrome Store Build Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Get version from manifest.json
VERSION=$(grep -o '"version": *"[^"]*"' src/manifest.json | cut -d'"' -f4)
echo -e "${GREEN}📦 Building version: ${VERSION}${NC}"
echo ""

# Clean old builds
echo -e "${YELLOW}🧹 Cleaning old builds...${NC}"
rm -rf dist
rm -rf .parcel-cache
rm -f youtube-motion-tracking-*.zip
rm -f release/youtube-motion-tracking-*.zip
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    npm install --legacy-peer-deps
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Build the extension
echo -e "${YELLOW}🔨 Building extension...${NC}"
npm run build:parcel
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: dist directory not found!${NC}"
    exit 1
fi

# Create release directory
RELEASE_DIR="release"
mkdir -p "$RELEASE_DIR"

# Remove source maps from dist (not needed for production)
echo -e "${YELLOW}🗑️  Removing source maps...${NC}"
find dist -name "*.map" -type f -delete
echo -e "${GREEN}✓ Source maps removed${NC}"
echo ""

# Create ZIP file
ZIP_NAME="youtube-motion-tracking-v${VERSION}.zip"
ZIP_PATH="${RELEASE_DIR}/${ZIP_NAME}"

echo -e "${YELLOW}📦 Creating ZIP package...${NC}"
cd dist
zip -r "../${ZIP_PATH}" . -x "*.map" "*.DS_Store"
cd ..

# Check if ZIP was created successfully
if [ -f "$ZIP_PATH" ]; then
    FILE_SIZE=$(du -h "$ZIP_PATH" | cut -f1)
    echo -e "${GREEN}✓ Package created successfully${NC}"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Build Complete!${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}📄 Package Details:${NC}"
    echo -e "   Name:     ${ZIP_NAME}"
    echo -e "   Location: ${RELEASE_DIR}/${ZIP_NAME}"
    echo -e "   Size:     ${FILE_SIZE}"
    echo -e "   Version:  ${VERSION}"
    echo ""
    echo -e "${YELLOW}📤 Next Steps:${NC}"
    echo -e "   1. Go to: https://chrome.google.com/webstore/devconsole"
    echo -e "   2. Click 'New Item' or select existing extension"
    echo -e "   3. Upload: ${RELEASE_DIR}/${ZIP_NAME}"
    echo -e "   4. Fill in store listing details"
    echo -e "   5. Submit for review"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
else
    echo -e "${RED}❌ Error: Failed to create ZIP package!${NC}"
    exit 1
fi
