# YouTube Motion Tracking - Halloween Edition 🎃👻

![Teaser](assets/teaser.gif)

**YouTube Motion Tracking - Halloween Edition** is a Chrome AI extension that transforms YouTube into a spooky Halloween experience with real-time pose detection, 38 animated effects, horror video filters, and complete UI theming!

## ✨ Key Features

### 🎃 38 Halloween Animations
Transform YouTube videos with AI-powered spooky effects that track body movements in real-time:

- **💀 Skeleton Animations (5)** - Glowing, dancing, X-ray, zombie, and neon skeletons
- **🎃 Pumpkin & Head Effects (3)** - Classic jack-o'-lanterns, evil pumpkins, and floating skulls
- **🦇 Creature Particle Effects (4)** - Bat swarms, ghost trails, spider webs, and floating skulls
- **🔮 Magical Effects (3)** - Witch magic, spell casting, and dark energy vortexes
- **🌫️ Atmospheric Effects (3)** - Creeping fog, haunted lightning, and autumn leaves
- **✨ Mystical Powers (7)** - Soul streams, blood moons, curses, portals, necromancy, vortexes, and runes
- **🔥 Advanced Skeleton Effects (13)** - Flames, frost, lightning, spectral, toxic, inferno, blood, chains, shatter, voodoo, shadow, bones, and mummy

### 🎮 Motion Game Mode
Turn YouTube videos into interactive games! The extension detects movements performed by people in the video and translates them into game actions.

**How to Play:**
1. Click the "👻🎮 Game Mode" button in the player popup
2. Choose one of 5 movements to track:
   - 💪 **Arm Curl** - Bicep curls
   - 🔄 **Head Turn** - Head rotation
   - 🙋 **Arm Raise** - Arms above head
   - 🦵 **Squat** - Complete squat reps
   - 🤸 **Jumping Jack** - Arms and legs spread
3. Watch videos with people performing movements (fitness, dance, sports)
4. Ghost jumps when movement is detected
5. 10 jumps = 1 point!

**Game Features:**
- Real-time movement detection from video content
- Visual feedback with particle effects
- Score tracking and high score persistence
- Smart detection with false-positive prevention
- Works with fitness videos, dance videos, sports content, etc.

### 🎬 Horror Video Filters
Apply cinematic horror effects to any YouTube video:

- **📼 VHS Tape** - Retro analog video with scanlines
- **📹 Found Footage** - Amateur horror film aesthetic with grain
- **☢️ X-Ray Lab** - Medical/scientific green phosphorescent look
- **🌕 Blood Moon** - Dark red ominous atmosphere
- **🎬 Film Noir** - Classic black and white high contrast
- **☣️ Toxic Waste** - Radioactive green glow effect

Filters work additively with animations - combine them for unique effects!

### 🌙 YouTube UI Theme
Transform the entire YouTube interface with Halloween styling:

- **Complete UI Transformation** - Header, sidebar, player, thumbnails, comments, scrollbars
- **3 Intensity Levels** - Low, Medium, High for customizable visual impact
- **Optional Particle Effects** - Animated Halloween emoji floating across the page
- **Persistent Settings** - Your preferences saved across sessions
- **Full Functionality** - All YouTube features work normally with theme active

## 🛠️ Technology Stack

- **TensorFlow.js 4.22.0** - AI-powered pose detection using MoveNet model
- **Proton Engine 5.4.3** - Physics-based particle animations
- **Chrome Extension Manifest V3** - Modern extension architecture
- **Parcel 2.16.0** - Fast, zero-config bundler
- **WebGL + Canvas 2D** - Dual rendering system for optimal performance

## 🚀 Installation

### Prerequisites
- [Google Chrome](https://www.google.com/intl/en/chrome/) browser
- [Node.js](https://nodejs.org/) (for building the extension)
- [Git](https://git-scm.com/) (for cloning the repository)

### Step 1: Clone and Build

```bash
# Clone the repository
git clone https://github.com/deep2universe/YouTube-Motion-Tracking.git
cd YouTube-Motion-Tracking

# Install dependencies
npm install --legacy-peer-deps

# Build the extension (clean build recommended for first time)
npm run build:clean

# Or for regular build
npm run build:parcel
```

This creates a `dist` folder with the built extension.

### Step 2: Load in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in upper right corner)
3. Click **"Load unpacked"**
4. Select the `dist` folder from the project directory
5. The extension should now appear in your extensions list!

### Step 3: Configure Chrome (Important!)

For optimal performance, enable hardware acceleration:

1. Go to `chrome://settings/accessibility`
2. Scroll to "System settings"
3. Ensure **"Use hardware acceleration when available"** is enabled

![Hardware Settings](assets/hardware.png)

## 📖 Usage

1. Open [YouTube](https://www.youtube.com/)
2. Play any video
3. Click the Halloween button in the video player
4. Choose from 38 spooky animations, apply horror filters, or enable UI theme
5. Try Game Mode with fitness or dance videos
6. Have a frightfully fun time! 👻🦇🎃

## 🎨 How It Works

The extension uses TensorFlow.js MoveNet model to detect 17 body keypoints in real-time:

![Keypoints](assets/keypoints.png)

These keypoints track:
- Nose, eyes, ears
- Shoulders, elbows, wrists
- Hips, knees, ankles

Animations are rendered on dual canvas layers (2D + WebGL) positioned over the video player, creating seamless integration with YouTube's interface.

## 🔧 Development

### Development Build
```bash
npm run build:parcel
```

After making changes:
1. Run the build command
2. Go to `chrome://extensions`
3. Click the reload icon on the extension

### Clean Build
If you encounter issues:
```bash
npm run build:clean
```

This removes all cached files and builds from scratch.

### Build for Distribution
Create a production-ready ZIP package:
```bash
./build-for-store.sh
```

This script:
- Cleans old builds and caches
- Installs dependencies (if needed)
- Builds with production optimizations
- Removes source maps
- Creates a versioned ZIP in `release/` directory

Output: `release/youtube-motion-tracking-v2.2.0.zip`

## 📁 Project Structure

```
├── src/
│   ├── content.js          # Main orchestrator (pose detection, UI)
│   ├── background.js       # Service worker (URL monitoring)
│   ├── anim.js             # Animation engine (2300+ lines)
│   ├── animEnum.js         # Animation definitions (38 animations)
│   ├── filterEnum.js       # Horror filter definitions (7 filters)
│   ├── gameMode.js         # Game state machine
│   ├── motionDetector.js   # Motion detection algorithms
│   ├── ghostCharacter.js   # Ghost rendering
│   ├── detectUtils.js      # Pose detection utilities
│   ├── popup.js/html       # Extension popup
│   ├── options.js/html     # Options page
│   ├── content.css         # Injected UI styles
│   ├── manifest.json       # Extension manifest
│   └── themes/             # Halloween theme CSS
│       ├── youtube-theme.css
│       ├── youtube-theme-particles.css
│       ├── youtube-theme-variables.css
│       └── youtube-theme-colors.css
├── dist/                   # Built extension (generated)
├── release/                # Production packages (generated)
├── assets/                 # Documentation images
└── dev_docs/               # Developer documentation
```

## 🎯 Performance

- Maintains 30+ FPS with all animations
- <5ms additional latency per frame in Game Mode
- Animation switching completes within 500ms
- Memory usage remains stable during extended use
- WebGL renderer with Canvas fallback

## 🌐 Browser Compatibility

- Google Chrome (latest stable version)
- Chromium-based browsers (Edge, Brave, Opera)
- Requires WebGL support for particle effects
- Requires hardware acceleration for optimal performance

## 📝 Version History

### Version 2.2.0 - Motion Game Mode (2024-11-16)
- Added interactive Motion Game Mode with 5 detectable movements
- Ghost jump challenge with scoring system
- Particle burst effects and visual feedback
- Smart detection with false-positive prevention
- High score persistence

### Version 2.1.0 - Halloween Skeleton Effects (2024-11-15)
- Added 13 new skeleton-themed animations
- 10 particle-based effects (flames, frost, lightning, etc.)
- 3 canvas-based effects (shadow, bones, mummy)
- Total animation count: 38

### Version 2.0.0 - Halloween Edition (2024-11-13)
- Complete Halloween transformation
- 18 curated spooky animations
- Halloween-themed UI with orange/purple color scheme
- Skeleton, pumpkin, creature, magical, and atmospheric effects

### Version 1.4 - Original Edition
- 50+ general motion tracking animations
- Various skeleton, particle, and visual effects

## 🔮 Future Plans

- Christmas Edition (winter-themed animations)
- Animation intensity controls
- Sound effects for Halloween animations
- Custom pumpkin face designs
- Animation recording/export feature
- Multiplayer/collaborative animations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[Apache License 2.0](LICENSE)

## ⚠️ Disclaimer

YouTube™ is a trademark of Google Inc. Use of this trademark is subject to Google Permissions.

This extension is not publicly available in the Chrome Web Store. Follow the installation instructions above to install it locally.

## 🎬 Demo

To see the Halloween animations in action, [watch this demo](https://www.youtube.com/watch?v=P4DzAWm5mqg)

---

**Happy Halloween! 🎃👻🦇**

Made with 💀 and TensorFlow.js
