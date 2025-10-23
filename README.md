# YouTube™ motion tracking
![Teaser](assets/teaser.gif)
Some examples from this [Video source](https://www.youtube.com/watch?v=eRjUmsB9lMk)

![Logo](assets/logo128.png)
_The logo was designed by a 3 year old girl._

YouTube™ motion tracking is a Chrome AI extension for animating motion in videos.

Pose estimation is done with [TensorFlow.js](https://www.tensorflow.org/js)
Particle animation is done with [Proton](https://github.com/drawcall/Proton)

This project is a [Google Chrome](https://www.google.com/intl/en/chrome/) browser extension. That's why you need this browser to try it out.

**Note:** This extension is not publicly available in the Chrome Web Store. Follow the installation instructions below to install it locally.

To see some animations [watch this](https://www.youtube.com/watch?v=P4DzAWm5mqg)

# Features
A new button is available in the player.  
![newIcon](assets/newIcon.png)  

The new button opens the animation selection menu.  
![menu](assets/menu.png)

# How it works.
The Chrome extension becomes active, when you watch a YouTube video.  
![howItWorks](assets/howItWorks.png)


The extension use MoveNet as model.  
Visual representation of the keypoints:  
![keypoints](assets/keypoints.png)  
[Image from tensorflow.js pose-detection model](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection#coco-keypoints-used-in-movenet-and-posenet)  
We use these keypoints to place animations on top of the YouTube™ video.

# Installation

## Prerequisites
- [Google Chrome](https://www.google.com/intl/en/chrome/) browser
- [Node.js](https://nodejs.org/) (for building the extension)
- [Git](https://git-scm.com/) (for cloning the repository)

## Step 1: Download and Build

<a name="clone"></a>
### 1.1 Clone this repository
```shell
git clone https://github.com/deep2universe/YouTube-Motion-Tracking.git
cd YouTube-Motion-Tracking
```

<a name="Build"></a>
### 1.2 Install dependencies
```shell
npm install --legacy-peer-deps
```

### 1.3 Build the extension
This project uses [PARCEL](https://parceljs.org/) as build tool.

For a clean build (recommended for first time or after major changes):
```shell
npm run build:clean
```

Or for a regular build:
```shell
npm run build:parcel
```

This will create a `dist` folder with all the built extension files.

## Step 2: Install in Chrome

<a name="chromeExtension"></a>
### 2.1 Open Chrome extensions page
Open Chrome and navigate to:
```
chrome://extensions
```
Or click the three dots menu → More Tools → Extensions

<a name="enableDevMode"></a>
### 2.2 Enable Developer Mode
In the upper right corner, toggle the **Developer mode** switch to ON.
![developer mode](assets/developerMode.png)

<a name="loadExtension"></a>
### 2.3 Load the extension
1. Click the **"Load unpacked"** button
2. Navigate to the YouTube-Motion-Tracking folder
3. Select the **`dist`** folder
4. Click **"Select Folder"**

The extension should now appear in your extensions list!

<a name="checkChromeSettings"></a>
### 2.4 Configure Chrome settings (Important!)
For optimal performance, enable hardware acceleration:

1. Go to: `chrome://settings/accessibility` or click [here](chrome://settings/accessibility)
2. Scroll to "System settings"
3. Make sure **"Use hardware acceleration when available"** is enabled

![hardware chrome settings](assets/hardware.png)

## Step 3: Verify Installation
1. The extension icon should appear in your Chrome toolbar
2. Open any YouTube video
3. Click the new motion tracking button in the video player
4. Select an animation and enjoy!

---

## Development

### Development Build
For development with automatic rebuilds:
```shell
npm install -g parcel  # Install Parcel globally (optional)
npm run build:parcel   # Build the extension
```

After making changes to the source code:
1. Run the build command again
2. Go to `chrome://extensions`
3. Click the reload icon on the YouTube Motion Tracking extension

### Clean Build
If you encounter issues or need a fresh build:
```shell
npm run build:clean
```

This removes all cached files and builds from scratch.

---

## Building for Distribution

To create a production-ready ZIP package (e.g., for sharing or Chrome Web Store submission):

```shell
./build-for-store.sh
```

This script will:
- Clean old builds and caches
- Install dependencies (if needed)
- Build the extension with production optimizations
- Remove source maps
- Create a versioned ZIP file in the `release/` directory

The output file will be: `release/youtube-motion-tracking-vX.X.X.zip`

For detailed instructions on Chrome Web Store submission, see [CHROME_STORE_UPLOAD.md](CHROME_STORE_UPLOAD.md).

<a name="Usage"></a>
# Usage
Open [YouTube](https://www.youtube.com/)

Watch a video and have fun.

<a name="uninstall"></a>
# Uninstall
Just go to the `chrome://extensions` page and disable or delete the extension.

## License

[Apache License 2.0](LICENSE)

YouTube™ is a trademark of Google Inc.  
Use of this trademark is subject to Google Permissions.  
