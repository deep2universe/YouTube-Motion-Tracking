import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import * as detectUtils from './detectUtils';
import {Anim} from "./anim";
import {AnimEnum} from "./animEnum";

// pose detector from tensorflow
var detector = null;

// Initialize TensorFlow.js with WebGL backend
async function initDetector() {
    try {
        // Set backend to webgl explicitly and wait for it to be ready
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('TensorFlow.js backend initialized:', tf.getBackend());

        // Create detector after backend is ready
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER}
        );
        console.log("Pose detector created successfully");
    } catch (error) {
        console.error("Failed to initialize pose detector:", error);
    }
}

// Start initialization
initDetector();

var mainVideo;  // current watched video
var ctx;        // canvas context 2d
var webGLtx;    // canvas context webGL
var canvas;     // canvas 2d
var canvasGL;   // canvas webGL
var videoCollection;    // collection of main videos from YouTube
var anim = null;   // anim.js object
var isRequestAnimationFrame = false;   // only request animation frame once

var isVideoPlay = false;  // if true, video is playint, do detection and play animations if not anim disabled
var isAnimDisabled = false; // if true, do not show animations

/**
 * Name-IDs of all animations
 * - used as id in player popup
 * - used to identify and change current animation
 * all IDs starting with 'particle' use Proton as animation library
 * @see AnimEnum
 * @type {string[]}
 */
var allAnimationIDs = AnimEnum.getNameArray(); // Halloween Edition - 18 animations
var currentAnimation = "skeletonGlow";  // Halloween Edition default animation
var randomSwitchSec=10;             // sec between animation switch
var randomSwitchIntervalID=null;    // interval for random animation switch

var showPlayerPopup=false;          // Player popup initial don't show

/**
 * Cleanup function to remove old canvas elements and reset state
 */
function cleanup() {
    console.log('Cleaning up old canvas elements and state');
    
    // Disconnect resize observer from old video
    if(mainVideo) {
        try {
            resizeObserver.unobserve(mainVideo);
            console.log('Disconnected resize observer from old video');
        } catch(e) {
            // Ignore errors if observer wasn't attached
        }
    }
    
    // Remove old canvas elements
    const oldCanvas = document.getElementById('canvasdummy');
    if (oldCanvas) {
        oldCanvas.remove();
        console.log('Removed old 2D canvas');
    }
    
    const oldCanvasGL = document.getElementById('canvasdummyGL');
    if (oldCanvasGL) {
        oldCanvasGL.remove();
        console.log('Removed old WebGL canvas');
    }
    
    // Remove old popup
    const oldPopup = document.querySelector('.posedream-video-popup');
    if (oldPopup) {
        oldPopup.remove();
        console.log('Removed old popup');
    }
    
    // Reset canvas variables
    canvas = null;
    canvasGL = null;
    ctx = null;
    webGLtx = null;
    
    // Reset anim object
    if(anim !== null) {
        // Clean up proton emitters if they exist
        if(anim.proton) {
            try {
                anim.proton.destroy();
            } catch(e) {
                console.log('Error destroying proton:', e);
            }
        }
        anim = null;
        console.log('Reset anim object');
    }
    
    // Reset flags
    isVideoPlay = false;
    showPlayerPopup = false;
    isRequestAnimationFrame = false;
}

/**
 * Init function, called from background.js after url change
 * - get current video stream
 * - init buttons in player
 * - add onplay and loadeddata events of video
 * - start motion detection from loadeddata event
 */
function init() {
    console.log('Init called for new video');
    
    // Cleanup old elements first
    cleanup();
    
    // get video element, check if not null and set it to mainVideo
    // because YouTube loads videos dynamically I get a collection
    // the current played video is the last one
    // Try multiple selectors for better compatibility with YouTube updates
   do {
       videoCollection = document.getElementsByClassName("html5-main-video");
       if (!videoCollection || videoCollection.length === 0) {
           // Fallback: try to get video element directly
           const videoElement = document.querySelector('video.video-stream');
           if (videoElement) {
               videoCollection = [videoElement];
           }
       }
       if (!videoCollection || videoCollection.length === 0) {
           // Second fallback: any video element in the page
           const anyVideo = document.querySelector('video');
           if (anyVideo) {
               videoCollection = [anyVideo];
           }
       }
       mainVideo = videoCollection ? videoCollection[videoCollection.length - 1] : null;
   }while (mainVideo === null || mainVideo === undefined);

    console.log('Main video found:', !!mainVideo);

    readIsAnimDisabled();
    readCurrentAnimationName();

    initButtonInPlayer()

    addOnPlayingEvent();

    addLoadedDataEvent();

    // Don't call these here, they will be called in loadeddata event
    // updateAnimDisabledDiv();
    // updateSelectedButton(currentAnimation);
}

/**
 * Get Message from background.js if url change to https://www.youtube.com/watch*
 * Then add button to the video player and start detection
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "intPoseDetection") {
            init();
        }
    }
);

/**
 * Get message from popup.js and update content
 * We have 3 kinds of messages for the animation request. And some that don't fit the scheme
 * - skeleton: show skeleton
 * - img<value>: replace head with image
 * - particle<value>: show particle
 * - puppetsPlayer, spiderWeb
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(randomSwitchIntervalID){
            clearInterval(randomSwitchIntervalID);
        }
        setNewAnimation(request.animation);
    }
);

/**
 * Switch and prepare current animation.
 * @param animationId new animation ID
 */
function setNewAnimation(animationId){
    console.log('content.js setNewAnimation called with:', animationId);
    
    // Validate animation ID - fallback to default if undefined or invalid
    if(!animationId || animationId === 'undefined') {
        console.log('Invalid animation ID, using default: skeletonGlow');
        animationId = 'skeletonGlow';
    }
    
    if(anim !== null){
        anim.setNewAnimation(animationId);
        currentAnimation=animationId;
        saveCurrentAnimationName(animationId);
    } else {
        console.log('WARNING: anim is null, deferring animation switch to:', animationId);
        // Store the desired animation to apply it once anim is initialized
        currentAnimation = animationId;
        saveCurrentAnimationName(animationId);
    }

}

/**
 * Add popup to video player
 */
function initVideoPlayerPopup(){
    // Check if popup already exists
    if (document.querySelector('.posedream-video-popup')) {
        console.log('Popup already exists, skipping creation');
        return;
    }

    const div = document.createElement('div');

    div.className = 'posedream-video-popup';

    // Halloween Edition - Generate categorized animation grid for 18 animations
    let animationButtonsHTML = '';
    const allAnimations = AnimEnum.getAllAnimations();

    console.log('Halloween Edition - Total animations loaded:', allAnimations.length);

    // Define animation categories
    const categories = [
        { name: '💀 Skeletons', start: 0, end: 5 },
        { name: '🎃 Pumpkins', start: 5, end: 8 },
        { name: '🦇 Creatures', start: 8, end: 12 },
        { name: '✨ Magic', start: 12, end: 15 },
        { name: '🌫️ Atmosphere', start: 15, end: 18 }
    ];

    // Create categorized animation buttons
    categories.forEach((category, catIndex) => {
        animationButtonsHTML += '<div class="categoryHeader">' + category.name + '</div>';
        animationButtonsHTML += '<div class="rowButton">';
        
        for (let i = category.start; i < category.end; i++) {
            const anim = allAnimations[i];
            const isFirst = (i === 0) ? ' selectButton' : '';
            animationButtonsHTML += '<div id="' + anim.name + '" class="col-3-Button' + isFirst + '">';
            animationButtonsHTML += '<span onclick="document.dispatchEvent(new CustomEvent(\'changeVisualizationFromPlayer\', { detail: {animationID:\'' + anim.name + '\'} }));">' + anim.icon + '</span>';
            animationButtonsHTML += '</div>';
        }
        
        animationButtonsHTML += '</div>';
    });

    div.innerHTML = `
<div class="panelTitle">🎃 Halloween Animations 👻</div>

<div style="padding: 0 15px;">
    <button id="randomButton" class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('runRandomAnimation'));">🎲 Random Mode (10s)</button>
    <input type="range" min="2" max="60" value="10" id="randomRange" onclick="document.dispatchEvent(new CustomEvent('changeRandomInterval', { detail: {interval:this.value} }));">
</div>

<div style="padding: 0 15px; margin-top: 10px;">
    <button id="animDisabledDiv" class="pdAnimButtonGreen" onclick="document.dispatchEvent(new CustomEvent('changeIsAnimDisabled'));">⏯️ Stop/Play Animation</button>
</div>

<hr class="sep">

<div class="containerButton">
` + animationButtonsHTML + `
</div>
    `;

    // Find video player container with fallback options
    var html5VideoPlayer = document.getElementsByClassName("html5-video-player");
    let playerContainer = html5VideoPlayer && html5VideoPlayer.length > 0
        ? html5VideoPlayer[videoCollection.length-1]
        : null;

    if (!playerContainer) {
        // Fallback: try to find player by other selectors
        playerContainer = document.querySelector('.html5-video-player') ||
                         document.querySelector('#movie_player') ||
                         document.querySelector('#player');
    }

    if (playerContainer) {
        console.log('Appending popup to player container');
        playerContainer.appendChild(div);
        console.log('Popup successfully created and appended');
    } else {
        console.error('Could not find player container to append popup!');
        console.log('Tried selectors: .html5-video-player, #movie_player, #player');
        console.log('videoCollection length:', videoCollection ? videoCollection.length : 'null');
    }
}

/**
 * Start pose detection and request animation frame
 *
 */
function startDetection() {
    if (!isVideoPlay) {
        return;
    }

    // create or update animation object
    if(anim === null){
        // Only create anim if canvas elements exist
        if(canvas && canvasGL && ctx && webGLtx) {
            console.log('Creating Anim object in startDetection');
            anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
            
            // Apply the current animation after anim object is created
            if(currentAnimation && currentAnimation !== 'undefined') {
                console.log('Applying current animation in startDetection:', currentAnimation);
                anim.setNewAnimation(currentAnimation);
            } else {
                console.log('No current animation set in startDetection, using default: skeletonGlow');
                currentAnimation = 'skeletonGlow';
                anim.setNewAnimation(currentAnimation);
            }
        } else {
            console.log('Canvas elements not ready yet, skipping anim creation');
        }
    }else{
        anim.updateCanvas(mainVideo,canvas, canvasGL, ctx, webGLtx);
    }

    if (detector !== null && detector !== undefined && isAnimDisabled == false && anim !== null) {
        if (mainVideo === undefined || !location.href.includes("watch")) {
            return;
        }

        // Check if video has valid dimensions before attempting pose detection
        if (mainVideo.videoWidth === 0 || mainVideo.videoHeight === 0) {
            // Video not ready yet, skip this frame
            requestAnimationFrame(startDetection);
            return;
        }

        detector.estimatePoses(mainVideo).then((pose) => {
            if (mainVideo.paused) {
                return;
            }
            if (pose !== undefined && pose[0] !== undefined && pose[0].keypoints !== undefined) {

                let canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, mainVideo, canvas);
                // update new estimation keypoints for current animation
                if(anim !== null) {
                    anim.updateKeypoint(pose, canvasPoseCoordinates);
                }

            }
        }).catch(error => {
            console.error("Pose estimation error:", error);
        });
        // redraw particles
        if(anim !== null) {
            anim.updateProton();
        }
    }
    // create animationframe
    requestAnimationFrame(startDetection);
}

/**
 * Called from player popup to change animation.
 * (Click event of animal icons)
 */
document.addEventListener('changeVisualizationFromPlayer', function (e) {
    updateSelectedButton(e.detail.animationID)
    clearRandomSwitchInterval();
    setNewAnimation(e.detail.animationID)
});

document.addEventListener('changeIsAnimDisabled', function (e) {
    clearRandomSwitchInterval();
    isAnimDisabled = !isAnimDisabled;
    saveIsAnimDisabled(isAnimDisabled);

    updateAnimDisabledDiv();
});

function updateAnimDisabledDiv(){
    const animDisabledDiv = document.getElementById('animDisabledDiv');
    if (animDisabledDiv) {
        if(isAnimDisabled){
            animDisabledDiv.className = 'pdAnimButtonRed';
        }else{
            animDisabledDiv.className = 'pdAnimButtonGreen';
        }
    }
}

/**
 * Add border to selected animal icon in player
 * Remove previous selected animation icon
 *
 * @param selected name of current animation
 */
function updateSelectedButton(selected){
    let el = document.getElementsByClassName('selectButton')
    if(el && el.length > 0){
        el[0].className = 'col-3-Button';
    }
    const selectedElement = document.getElementById(selected);
    if (selectedElement) {
        selectedElement.className +=' selectButton';
    }
}

/**
 * Called from player control icon to switch display of player popup
 * (Click event of extension logo icon in player)
 */
document.addEventListener('displayPoseDreamPopup', function (e) {
    console.log('displayPoseDreamPopup event triggered');
    var playerPopup = document.getElementsByClassName('posedream-video-popup');
    console.log('Found popup elements:', playerPopup.length);
    
    if(playerPopup && playerPopup.length > 0){
        if(showPlayerPopup){
            console.log('Hiding popup');
            playerPopup[0].style.display = "none"
        }else{
            console.log('Showing popup');
            playerPopup[0].style.display = "block"
        }
        showPlayerPopup = !showPlayerPopup;
    } else {
        console.warn('Popup element not found. Please wait for video to load.');
    }
});

/**
 * Event to change the random interval from popup
 */
document.addEventListener('changeRandomInterval', function (e) {
    const randomButton = document.getElementById("randomButton");
    if (randomButton) {
        randomButton.innerText="Randomly change every " + e.detail.interval +"s";
    }
    randomSwitchSec= e.detail.interval;
});

/**
 * Remove random animation switch interval
 */
function clearRandomSwitchInterval(){
    if(randomSwitchIntervalID){
        clearInterval(randomSwitchIntervalID);
    }
}

/**
 * Event to start the random animation
 */
document.addEventListener('runRandomAnimation', function (e) {

    clearRandomSwitchInterval();

    randomSwitchIntervalID = setInterval(function (){
        let rndNum = Math.floor(Math.random() * allAnimationIDs.length);
        updateSelectedButton(allAnimationIDs[rndNum]);
        setNewAnimation(allAnimationIDs[rndNum]);
    }, 1000*randomSwitchSec);
});

/**
 * Handler for loadeddata event
 */
function handleVideoLoaded(event) {
    console.log('Video loadeddata event triggered');
    isVideoPlay = true;

    // Wait a bit for YouTube's player to fully initialize
    setTimeout(() => {
        initVideoPlayerPopup();
        updateAnimDisabledDiv();
        updateSelectedButton(currentAnimation);
    }, 500);

    if(isRequestAnimationFrame==false){
        isRequestAnimationFrame=true;
        startDetection();
    }
}

/**
 * Video event listener.
 * If video is playing, start detection interval, create video player popup dialog
 */
function addLoadedDataEvent() {
    // Remove old event listener if it exists
    mainVideo.removeEventListener('loadeddata', handleVideoLoaded);
    
    // Add new event listener
    mainVideo.addEventListener('loadeddata', handleVideoLoaded);
}

/**
 * Check resize event for video.
 * Calc new width/height and update animation object
 *
 * @type {ResizeObserver}
 */
const resizeObserver = new ResizeObserver(entries => {
    mainVideo = document.getElementsByClassName("html5-main-video")[videoCollection.length - 1];
    setCanvasStyle(canvas);
    canvas.width = entries[0].target.clientWidth;
    canvas.height = entries[0].target.clientHeight;
    ctx.width = entries[0].target.clientWidth;
    ctx.height = entries[0].target.clientHeight;

    setCanvasStyle(canvasGL);
    canvasGL.width = entries[0].target.clientWidth;
    canvasGL.height = entries[0].target.clientHeight;
    webGLtx.width = entries[0].target.clientWidth;
    webGLtx.height = entries[0].target.clientHeight;

    if(anim === null){
        anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
    }else{
        anim.updateCanvas(mainVideo,canvas, canvasGL, ctx, webGLtx);
        // use new size and init animations
        anim.setNewAnimation(currentAnimation);
    }

});

/**
 * Create canvas and 2d canvas context
 */
function createCanvas() {
    canvas = document.createElement('canvas'); // creates new canvas element
    canvas.id = 'canvasdummy'; // gives canvas id
    if (mainVideo.length !== 0) {
        canvas.height = mainVideo.clientHeight; //get original canvas height
        canvas.width = mainVideo.clientWidth; // get original canvas width
    } else {
        canvas.height = 600;
        canvas.width = 600;
    }

    // Find video container with fallback options
    let videoContainerDIV = document.getElementsByClassName("html5-video-container")[videoCollection.length - 1];
    if (!videoContainerDIV) {
        // Fallback: try to find container by other selectors
        videoContainerDIV = document.querySelector('.html5-video-container') ||
                           document.querySelector('#player-container') ||
                           document.querySelector('#movie_player') ||
                           mainVideo.parentElement;
    }
    if (videoContainerDIV) {
        videoContainerDIV.appendChild(canvas); // adds the canvas to the body element
    }
    setCanvasStyle(canvas);
    ctx = canvas.getContext('2d');
}

/**
 * Create canvas and webGL canvas context
 */
function createCanvasWebGL() {
    canvasGL = document.createElement('canvas'); // creates new canvas element
    canvasGL.id = 'canvasdummyGL'; // gives canvas id
    if (mainVideo.length !== 0) {
        canvasGL.height = mainVideo.clientHeight; //get original canvas height
        canvasGL.width = mainVideo.clientWidth; // get original canvas width
    } else {
        canvasGL.height = 600;
        canvasGL.width = 600;
    }

    // Find video container with fallback options
    let videoContainerDIV = document.getElementsByClassName("html5-video-container")[videoCollection.length - 1];
    if (!videoContainerDIV) {
        // Fallback: try to find container by other selectors
        videoContainerDIV = document.querySelector('.html5-video-container') ||
                           document.querySelector('#player-container') ||
                           document.querySelector('#movie_player') ||
                           mainVideo.parentElement;
    }
    if (videoContainerDIV) {
        videoContainerDIV.appendChild(canvasGL); // adds the canvas to the body element
    }
    setCanvasStyle(canvasGL);
    
    // Try to get WebGL context with fallbacks
    webGLtx = canvasGL.getContext("webgl") || 
              canvasGL.getContext("experimental-webgl") ||
              canvasGL.getContext("webgl2");
    
    if (!webGLtx) {
        console.warn('WebGL not available, particle animations may not work');
    } else {
        console.log('WebGL context created successfully');
    }
}

/**
 * Handler for onplaying event
 */
function handleVideoPlaying(event) {
    console.log('Video onplaying event triggered');
    
    if (document.getElementById("canvasdummy") === null) {
        createCanvas();
    }

    if (document.getElementById("canvasdummyGL") === null) {
        createCanvasWebGL();
    }

    // Only observe if not already observing
    try {
        resizeObserver.observe(mainVideo);
    } catch(e) {
        // Already observing, ignore
    }

    // Verify canvas elements are ready
    if(!canvas || !canvasGL || !ctx) {
        console.error('Canvas elements not properly created!');
        return;
    }
    
    if(anim === null){
        console.log('Creating new Anim object');
        console.log('Canvas ready:', !!canvas, 'CanvasGL ready:', !!canvasGL, 'ctx ready:', !!ctx, 'webGLtx ready:', !!webGLtx);
        anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
        
        // Apply the current animation after anim object is created
        if(currentAnimation && currentAnimation !== 'undefined') {
            console.log('Applying current animation to new anim object:', currentAnimation);
            anim.setNewAnimation(currentAnimation);
        } else {
            console.log('No current animation set, using default: skeletonGlow');
            currentAnimation = 'skeletonGlow';
            anim.setNewAnimation(currentAnimation);
        }
    }else{
        console.log('Updating existing Anim object canvas');
        anim.updateCanvas(mainVideo,canvas, canvasGL, ctx, webGLtx);
    }
}

/**
 * Add onplaying event to main video
 * - create canvas and webGL canvas over main video
 * - add resize observer event to video
 * - create or update animation object with video and canvas information
 */
function addOnPlayingEvent(){
    // Remove old event listener if it exists
    if(mainVideo.onplaying) {
        mainVideo.removeEventListener('playing', handleVideoPlaying);
    }
    
    // Add new event listener
    mainVideo.addEventListener('playing', handleVideoPlaying);
}

/**
 * Helper function to style the canvas.
 * We have one canvas for 'normal' paintings and another for WebGL
 * @param tmpCanvas canvas to style/position
 */
function setCanvasStyle(tmpCanvas) {
    tmpCanvas.style.position = "absolute";
    tmpCanvas.style.top = "0px";
    tmpCanvas.style.right = "0px";
    tmpCanvas.style.left = mainVideo.style.cssText.split("; ")[2].split(": ")[1]
    tmpCanvas.style.bottom = "0px";
}

/**
 * Since it sometimes takes a while to construct the gui,
 * new player buttons are added in an interval if the 'ytp-right-controls' are available
 */
function initButtonInPlayer() {
    let attempts = 0;
    const maxAttempts = 50; // Try for up to 5 seconds (50 * 100ms)

    const buttonAvailableInterval = setInterval(function () {
        attempts++;

        // Try multiple selectors to find the controls container
        var animControlsButton = document.getElementsByClassName("ytp-right-controls");
        if (!animControlsButton || animControlsButton.length === 0) {
            animControlsButton = document.querySelectorAll('.ytp-right-controls, .ytp-chrome-controls, [class*="player-controls"]');
        }

        if ((animControlsButton && animControlsButton.length > 0) || attempts >= maxAttempts) {
            if (animControlsButton && animControlsButton.length > 0 &&
                (document.getElementById("pose_art") === null || document.getElementById("pose_art") === undefined)) {
                var button = document.createElement('button');
                button.id = "pose_art";
                button.className = 'ytp-button it-player-button';
                button.dataset.title = "Pose art";
                button.onclick = function(){document.dispatchEvent(new CustomEvent('displayPoseDreamPopup', { detail: {animationID:'skeleton'} }));}

                let playerImage = new Image();
                playerImage.src = chrome.runtime.getURL("/images/logo48.png");
                playerImage.onload = () => {
                    var imgTag = document.createElement('img');
                    imgTag.src = playerImage.src;
                    imgTag.style.width = '24px';
                    imgTag.style.height = '24px';
                    button.appendChild(imgTag);

                    for (let i = 0; i < animControlsButton.length; i++) {
                        if(animControlsButton[i] !== undefined){
                            animControlsButton[i].insertBefore(button, animControlsButton[i].childNodes[0]);
                            console.log('Halloween button added to player controls');
                        }
                    }
                }
                
                playerImage.onerror = () => {
                    console.error('Failed to load Halloween button image');
                }
            }
            clearInterval(buttonAvailableInterval);
        }
    }, 100);
}

function saveIsAnimDisabled(value){
    chrome.storage.sync.set({isAnimDisabled: value}, function() {
    });
}

function readIsAnimDisabled(){
    chrome.storage.sync.get(['isAnimDisabled'], function (result) {
        let status = result.isAnimDisabled;
        if(status === undefined){
            isAnimDisabled = false;
        }else {
            isAnimDisabled = status;
        }
    });
}

function saveCurrentAnimationName(value){
    chrome.storage.sync.set({currentAnimationName: value}, function() {
    });
}

function readCurrentAnimationName(){
    chrome.storage.sync.get(['currentAnimationName'], function (result) {
        let currentAnim = result.currentAnimationName;
        if(currentAnim === undefined || currentAnim === 'undefined' || currentAnim === null){
            currentAnimation = "skeletonGlow"; // Halloween Edition default
            console.log('No saved animation found, using default: skeletonGlow');
        }else {
            currentAnimation = currentAnim;
            console.log('Loaded saved animation:', currentAnimation);
        }
        
        // If anim object exists, apply the loaded animation
        if(anim !== null) {
            console.log('Applying loaded animation to anim object:', currentAnimation);
            anim.setNewAnimation(currentAnimation);
        }
    });
}