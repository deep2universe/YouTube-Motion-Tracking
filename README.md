# YouTube™ motion tracking
![Teaser](assets/teaser.gif)  
Some examples from this [Video source](https://www.youtube.com/watch?v=eRjUmsB9lMk)    

![Logo](assets/logo128.png)  
_The logo was designed by a 3 year old girl._

YouTube™ motion tracking is a Chrome AI extension for animating motion in videos.

Pose estimation is done with [TensorFlow.js](https://www.tensorflow.org/js)  
Particle animation is done with [Proton](https://github.com/drawcall/Proton)

This project is a [Google Chrome](https://www.google.com/intl/en/chrome/) browser extension. That's why you need this browser to try it out.

You can install the extension from the Chrome Web Store:  
[Link YouTube™ motion tracking](https://chrome.google.com/webstore/detail/youtube-motion-tracking/cpjloofnnmchhbdbdchjnhfoclnjliga)  

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
<a name="clone"></a>
## Download this repository
```shell
git clone https://github.com/deep2universe/YouTube-Motion-Tracking.git
```

<a name="Build"></a>
## Development
I use [PARCEL](https://parceljs.org/) as build tool and install it globally with
```shell
# install PARCEL
npm install -g parcel
```

Build local
```shell
# install dependencies
npm install

# build dist folder
npm run build:parcel
```

## Building for Chrome Web Store

To create a production-ready ZIP package for uploading to the Chrome Web Store:

```shell
# Run the build script
./build-for-store.sh
```

This will:
- Clean old builds
- Install dependencies (if needed)
- Build the extension
- Remove source maps
- Create a ZIP file in `release/` directory

The output ZIP file will be ready for upload to the Chrome Web Store.

For detailed instructions on uploading to Chrome Web Store, see [CHROME_STORE_UPLOAD.md](CHROME_STORE_UPLOAD.md).

```

<a name="chromeExtension"></a>
## Open Chrome extensions
Open this URL
```
chrome://extensions
```
<a name="enableDevMode"></a>
## Enable developer mode
In the upper right corner you have to activate the developer mode.  
![developer mode](assets/developerMode.png)
<a name="loadExtension"></a>
## Load extension
Load the build ```dist``` Folder from this repository.  

<a name="checkChromeSettings"></a>
## Check Chrome settings
Go to this [URL](chrome://settings/accessibility)
```
chrome://settings/accessibility
```
In the System settings make sure to enable this:    
![hardware chrome settings](assets/hardware.png)

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
