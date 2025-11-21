# Chrome Web Store Upload Guide

This guide explains how to build and upload the YouTube Motion Tracking extension to the Chrome Web Store.

## Prerequisites

- Node.js and npm installed
- Chrome Web Store Developer account ($5 one-time registration fee)
- Project repository cloned locally

## Building for Production

### Automatic Build (Recommended)

Use the provided build script:

```bash
./build-for-store.sh
```

This script will:
1. ✅ Clean old builds
2. ✅ Install dependencies (if needed)
3. ✅ Build the extension with Parcel
4. ✅ Remove source maps (not needed for production)
5. ✅ Create a ZIP file in the `release/` directory
6. ✅ Display package details and next steps

**Output:** `release/youtube-motion-tracking-v{VERSION}.zip`

### Manual Build

If you prefer to build manually:

```bash
# Clean old builds
rm -rf dist
rm -f youtube-motion-tracking-*.zip

# Install dependencies
npm install --legacy-peer-deps

# Build extension
npm run build:parcel

# Remove source maps
find dist -name "*.map" -type f -delete

# Create ZIP
cd dist
zip -r ../youtube-motion-tracking-v1.2.zip . -x "*.map" "*.DS_Store"
cd ..
```

## Chrome Web Store Upload Process

### 1. Access Developer Console

Go to: https://chrome.google.com/webstore/devconsole

**First time users:**
- You'll need to register as a Chrome Web Store developer
- One-time registration fee: $5
- Complete the registration form

### 2. Create New Item or Update Existing

**For new extension:**
- Click "New Item" button
- Upload the ZIP file from `release/` directory
- Click "Upload"

**For updating existing extension:**
- Find your extension in the list
- Click on the extension name
- Go to "Package" tab
- Click "Upload new package"
- Select the new ZIP file

### 3. Fill in Store Listing Details

#### Required Information

**Extension Details:**
- **Name:** YouTube™ Motion Tracking
- **Summary:** AI-powered motion tracking and animation for YouTube videos (max 132 characters)
- **Description:**
```
Transform your YouTube viewing experience with real-time AI-powered pose detection and stunning visual effects!

Features:
• Real-time human pose detection using TensorFlow.js and MoveNet
• 25+ unique animation styles (skeleton, particles, effects)
• WebGL-accelerated rendering for smooth performance
• Easy-to-use player controls integrated into YouTube
• No external servers - all processing happens locally

How it works:
1. Play any YouTube video with people in it
2. Click the extension icon in the video player
3. Choose from various animation styles
4. Watch as AI tracks movements and applies stunning effects

Perfect for:
- Dance and fitness videos
- Sports analysis
- Creative content creation
- Entertainment and fun

Privacy-focused:
- All processing happens in your browser
- No data is sent to external servers
- No tracking or analytics

Technologies:
- TensorFlow.js for AI pose detection
- MoveNet model for accurate tracking
- WebGL for high-performance rendering
- MediaPipe integration for enhanced detection
```

**Category:** Entertainment (or Productivity)

**Language:** English (or your primary language)

**Screenshots:** (Required - at least 1, recommended 3-5)
- 1280x800 or 640x400 pixels
- Show the extension in action on YouTube
- Highlight different animation styles
- Include the popup interface

**Small tile icon:** 128x128 pixels (use `src/images/logo128.png`)

**Promotional images:** (Optional but recommended)
- Marquee: 1400x560 pixels
- Small tile: 440x280 pixels

**YouTube video:** (Optional but highly recommended)
- Create a demo video showing the extension in action
- Upload to YouTube and provide the link

#### Privacy Information

**Single Purpose:**
```
This extension provides AI-powered motion tracking and visual effects for YouTube videos.
```

**Permission Justification:**

- **activeTab, tabs:** Required to inject the extension into YouTube video pages and detect video playback
- **webNavigation:** Needed to detect when users navigate to YouTube watch pages to initialize pose detection
- **storage:** Used to save user preferences (selected animation, enabled/disabled state)
- **host_permissions (youtube.com):** Required to access YouTube video elements and overlay animations

**Data Usage:**
```
This extension does not collect, transmit, or store any user data externally. All pose detection and processing happens locally in the user's browser using TensorFlow.js. User preferences (animation selection, enabled/disabled state) are stored locally using Chrome's storage API.
```

### 4. Privacy Policy

You'll need to provide a privacy policy URL. Here's a template:

**Privacy Policy for YouTube Motion Tracking Extension**

```markdown
# Privacy Policy

Last updated: [Current Date]

## Data Collection
YouTube Motion Tracking does not collect, store, or transmit any personal data or user information.

## Local Processing
All pose detection and video analysis is performed locally in your browser using TensorFlow.js. No video data, frames, or detection results are sent to external servers.

## Stored Data
The extension only stores user preferences locally:
- Selected animation style
- Animation enabled/disabled state

This data is stored using Chrome's storage API and remains on your device only.

## Third-Party Services
This extension does not use any third-party analytics, tracking, or data collection services.

## Permissions
The extension requires the following permissions:
- Access to YouTube pages: To display animations over videos
- Storage: To save your preferences
- Tab information: To detect when you're watching YouTube videos

## Changes to Privacy Policy
We may update this privacy policy from time to time. We will notify you of any changes by updating the "Last updated" date.

## Contact
For questions about this privacy policy, please contact: [Your Email]
```

Host this on GitHub Pages, your website, or a service like GitHub Gist.

### 5. Distribution Options

**Visibility:**
- **Public:** Listed in Chrome Web Store (recommended)
- **Unlisted:** Only accessible via direct link
- **Private:** Only for specific users/groups

**Pricing:**
- **Free** (recommended for this extension)
- **Paid:** Set a price (requires Google Payments merchant account)

### 6. Submit for Review

1. Review all information carefully
2. Check "I confirm that..." checkbox
3. Click "Submit for Review"

**Review process:**
- Typically takes 1-3 business days
- You'll receive email notifications about review status
- May be rejected if issues are found (you can fix and resubmit)

## After Approval

### Publishing
- Once approved, click "Publish" to make it live
- Extension will be available in Chrome Web Store within a few hours

### Updates
To release updates:
1. Update version in `src/manifest.json`
2. Run `./build-for-store.sh` to create new ZIP
3. Upload new package in Developer Console
4. Update "What's new" section with changelog
5. Submit for review again

### Monitoring
- Check the Developer Dashboard regularly
- Monitor user reviews and ratings
- Respond to user feedback
- Track installation statistics

## Version Management

### Updating Version Number

Before building a new version:

1. Edit `src/manifest.json`:
```json
{
  "version": "1.3"
}
```

2. Update `CHANGELOG.md` with changes

3. Run build script - version is automatically detected

### Version Numbering Guidelines

Follow semantic versioning:
- **Major.Minor** (e.g., 1.2)
- Major: Breaking changes or major feature additions
- Minor: New features, improvements, bug fixes

Chrome Web Store requires version format: `X.Y` or `X.Y.Z` or `X.Y.Z.W`

## Troubleshooting

### Build Issues

**Error: "dist directory not found"**
```bash
npm run build:parcel
```

**Error: "module not found"**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Upload Issues

**"Package is invalid"**
- Check manifest.json syntax
- Ensure all required icons exist
- Verify file structure (manifest.json must be in root)

**"Package size too large"**
- Maximum size: 20 MB (ours is ~689 KB, well within limit)
- If needed, optimize images and remove unnecessary files

**"Permissions warning"**
- Be prepared to justify each permission in review
- Remove unnecessary permissions from manifest.json

### Review Rejection

Common reasons:
- Missing or unclear privacy policy
- Insufficient permission justifications
- Poor quality screenshots
- Misleading description

**Fix and resubmit:**
1. Address the issues mentioned in rejection email
2. Update the package if needed
3. Click "Resubmit" in Developer Console

## Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Chrome Web Store Review Process](https://developer.chrome.com/docs/webstore/review-process/)
- [Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/devguide/)

## Support

For issues with this extension:
- GitHub Issues: [Your Repository URL]
- Email: [Your Email]

For Chrome Web Store questions:
- [Chrome Web Store Support](https://support.google.com/chrome_webstore/)
