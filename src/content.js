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
 * Init function, called from background.js after url change
 * - get current video stream
 * - init buttons in player
 * - add onplay and loadeddata events of video
 * - start motion detection from loadeddata event
 */
function init() {
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
    if(anim !== null){
        anim.setNewAnimation(animationId);
        currentAnimation=animationId;
        saveCurrentAnimationName(animationId);
    } else {
        console.log('ERROR: anim is null!');
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

    // Halloween Edition - Generate animation grid for 18 animations
    let animationButtonsHTML = '';
    const allAnimations = AnimEnum.getAllAnimations();

    console.log('Halloween Edition - Total animations loaded:', allAnimations.length);

    // Create rows with 5 animations each
    const animsPerRow = 5;
    for (let i = 0; i < allAnimations.length; i++) {
        if (i % animsPerRow === 0) {
            if (i > 0) animationButtonsHTML += '</div>';
            animationButtonsHTML += '<div class="rowButton">';
        }

        const anim = allAnimations[i];
        const isFirst = (i === 0) ? ' selectButton' : '';
        animationButtonsHTML += '<div id="' + anim.name + '" class="col-3-Button' + isFirst + '">';
        animationButtonsHTML += '<span onclick="document.dispatchEvent(new CustomEvent(\'changeVisualizationFromPlayer\', { detail: {animationID:\'' + anim.name + '\'} }));">' + anim.icon + '</span>';
        animationButtonsHTML += '</div>';
    }
    animationButtonsHTML += '</div>';

    div.innerHTML = `
<div>
<button id="randomButton" class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('runRandomAnimation'));">Randomly change every 10s</button>
<input type="range" min="2" max="60" value="10" id="randomRange" onclick="document.dispatchEvent(new CustomEvent('changeRandomInterval', { detail: {interval:this.value} }));">
</div>

<div>
<button id="animDisabledDiv" class="pdAnimButtonGreen" onclick="document.dispatchEvent(new CustomEvent('changeIsAnimDisabled'));">   &#x2318 Stop/Play animation   </button>
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
        playerContainer.appendChild(div);
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
        anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
    }else{
        anim.updateCanvas(mainVideo,canvas, canvasGL, ctx, webGLtx);
    }

    if (detector !== null && detector !== undefined && isAnimDisabled == false) {
        if (mainVideo === undefined || !location.href.includes("watch")) {
            return;
        }

        detector.estimatePoses(mainVideo).then((pose) => {
            if (mainVideo.paused) {
                return;
            }
            if (pose !== undefined && pose[0] !== undefined && pose[0].keypoints !== undefined) {

                let canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, mainVideo, canvas);
                // update new estimation keypoints for current animation
                anim.updateKeypoint(pose, canvasPoseCoordinates);

            }
        }).catch(error => {
            console.error("Pose estimation error:", error);
        });
        // redraw particles
        anim.updateProton();
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
    var playerPopup = document.getElementsByClassName('posedream-video-popup');
    if(playerPopup && playerPopup.length > 0){
        if(showPlayerPopup){
            playerPopup[0].style.display = "none"
        }else{
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
 * Video event listener.
 * If video is playing, start detection interval, create video player popup dialog
 */
function addLoadedDataEvent() {
    mainVideo.addEventListener('loadeddata', (event) => {
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
    });
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
    webGLtx = canvasGL.getContext("experimental-webgl");
}

/**
 * Add onplaying event to main video
 * - create canvas and webGL canvas over main video
 * - add resize observer event to video
 * - create or update animation object with video and canvas information
 */
function addOnPlayingEvent(){
    mainVideo.onplaying = (event) => {
        if (document.getElementById("canvasdummy") === null) {
            createCanvas();
        }

        if (document.getElementById("canvasdummyGL") === null) {
            createCanvasWebGL();
        }

        resizeObserver.observe(mainVideo);

        if(anim === null){
            anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
        }else{
            anim.updateCanvas(mainVideo,canvas, canvasGL, ctx, webGLtx);
        }

    }
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
                        }
                    }
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
        if(currentAnim === undefined){
            currentAnimation = "skeletonGlow" // Halloween Edition default
        }else {
            currentAnimation = currentAnim;
        }
    });
}