import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import * as detectUtils from './detectUtils';
import {Anim} from "./anim";
import {AnimEnum} from "./animEnum";

// pose detector from tensorflow
var detector = poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER}).then(console.log("detector created"));

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
var allAnimationIDs = AnimEnum.getNameArray();
var currentAnimation = "skeleton";  // used for resize event to init particles if needed
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
   do {
       videoCollection = document.getElementsByClassName("html5-main-video");
       mainVideo = document.getElementsByClassName("html5-main-video")[videoCollection.length - 1];
   }while (mainVideo === null || mainVideo === undefined);

    readIsAnimDisabled();
    readCurrentAnimationName();

    initButtonInPlayer()

    addOnPlayingEvent();

    addLoadedDataEvent();

    updateAnimDisabledDiv();
    updateSelectedButton(currentAnimation);
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
    if(anim !== null){
        anim.setNewAnimation(animationId);
        currentAnimation=animationId;
        saveCurrentAnimationName(animationId);
    }

}

/**
 * Add popup to video player
 */
function initVideoPlayerPopup(){
    const div = document.createElement('div');

    div.className = 'posedream-video-popup';
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
    <div class="rowButton">
        <div id="` + AnimEnum.skeleton.name +`" class="col-3-Button selectButton"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.skeleton.name +`'} }));">` + AnimEnum.skeleton.icon +`</span></div>
        <div id="` + AnimEnum.skeleton3Times.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.skeleton3Times.name +`'} }));">` + AnimEnum.skeleton3Times.icon +`</span></div>
        <div id="` + AnimEnum.skeleton5Times.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.skeleton5Times.name +`'} }));">` + AnimEnum.skeleton5Times.icon +`</span></div>
        <div id="` + AnimEnum.puppetsPlayer.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.puppetsPlayer.name +`'} }));">` + AnimEnum.puppetsPlayer.icon +`</span></div>
    </div>
    <div class="rowButton">
        <div id="` + AnimEnum.spiderWeb.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.spiderWeb.name +`'} }));">` + AnimEnum.spiderWeb.icon +`</span></div>
        <div id="` + AnimEnum.particleHandsBall.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleHandsBall.name +`'} }));">` + AnimEnum.particleHandsBall.icon +`</span></div>
        <div id="` + AnimEnum.particleRightHandLine.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleRightHandLine.name +`'} }));">` + AnimEnum.particleRightHandLine.icon +`</span></div>
        <div id="` + AnimEnum.particleNoseGravity.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleNoseGravity.name +`'} }));">` + AnimEnum.particleNoseGravity.icon +`</span></div>
    </div>
    <div class="rowButton">
        <div id="` + AnimEnum.particleNoseSupernova.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleNoseSupernova.name +`'} }));">` + AnimEnum.particleNoseSupernova.icon +`</span></div>
        <div id="` + AnimEnum.particleHandsTrackFromBorder.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleHandsTrackFromBorder.name +`'} }));">` + AnimEnum.particleHandsTrackFromBorder.icon +`</span></div>
        <div id="` + AnimEnum.particleUpperBodyGlow.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleUpperBodyGlow.name +`'} }));">` + AnimEnum.particleUpperBodyGlow.icon +`</span></div>
        <div id="` + AnimEnum.particleGlowPainting.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleGlowPainting.name +`'} }));">` + AnimEnum.particleGlowPainting.icon +`</span></div>
    </div>
    <div class="rowButton">
        <div id="` + AnimEnum.particlePainting.name +`" class="col-3-Button"><bspan onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particlePainting.name +`'} }));">` + AnimEnum.particlePainting.icon +`</span></div>
        <div id="` + AnimEnum.particlePaintRandomDrift.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particlePaintRandomDrift.name +`'} }));">` + AnimEnum.particlePaintRandomDrift.icon +`</span></div>
        <div id="` + AnimEnum.particleCometThrower.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleCometThrower.name +`'} }));">` + AnimEnum.particleCometThrower.icon +`</span></div>
        <div id="` + AnimEnum.particleBodyGlow.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleBodyGlow.name +`'} }));">` + AnimEnum.particleBodyGlow.icon +`</span></div>
    </div>
    <div class="rowButton">
        <div id="` + AnimEnum.particleBurningMan.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleBurningMan.name +`'} }));">` + AnimEnum.particleBurningMan.icon +`</span></div>
        <div id="` + AnimEnum.particle2BallHead.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particle2BallHead.name +`'} }));">` + AnimEnum.particle2BallHead.icon +`</span></div>
        <div id="` + AnimEnum.particleCyclone.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleCyclone.name +`'} }));">` + AnimEnum.particleCyclone.icon +`</span></div>
        <div id="` + AnimEnum.particleSun.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleSun.name +`'} }));">` + AnimEnum.particleSun.icon +`</span></div>
    </div>
    <div class="rowButton">
        <div id="` + AnimEnum.particleFireFly.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleFireFly.name +`'} }));">` + AnimEnum.particleFireFly.icon +`</span></div>
        <div id="` + AnimEnum.particleFireFlyColor.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleFireFlyColor.name +`'} }));">` + AnimEnum.particleFireFlyColor.icon +`</span></div>
        <div id="` + AnimEnum.particleSpit.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleSpit.name +`'} }));">` + AnimEnum.particleSpit.icon +`</span></div>
        <div id="` + AnimEnum.particle2BallHeadExp.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particle2BallHeadExp.name +`'} }));">` + AnimEnum.particle2BallHeadExp.icon +`</span></div>
    </div>
    <div class="rowButton">
        <div id="` + AnimEnum.particleMatrix.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleMatrix.name +`'} }));">` + AnimEnum.particleMatrix.icon +`</span></div>
        <div id="` + AnimEnum.particleSnow.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleSnow.name +`'} }));">` + AnimEnum.particleSnow.icon +`</span></div>
        <div id="` + AnimEnum.particleSnowHoriz.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleSnowHoriz.name +`'} }));">` + AnimEnum.particleSnowHoriz.icon +`</span></div>
        <div id="` + AnimEnum.particleLightSab.name +`" class="col-3-Button"><span onclick="document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', { detail: {animationID:'` + AnimEnum.particleLightSab.name +`'} }));">` + AnimEnum.particleLightSab.icon +`</span></div>
    </div>
</div>
    `;

    var html5VideoPlayer = document.getElementsByClassName("html5-video-player");
    html5VideoPlayer[videoCollection.length-1].appendChild(div);
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

    if (detector !== undefined && isAnimDisabled == false) {
        detector.then(function (poseDetector) {

            if (mainVideo === undefined || !location.href.includes("watch")) {
                return;
            }

            poseDetector.estimatePoses(mainVideo).then((pose) => {
                if (mainVideo.paused) {
                    return;
                }
                if (pose !== undefined && pose[0] !== undefined && pose[0].keypoints !== undefined) {

                    let canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, mainVideo, canvas);
                    // update new estimation keypoints for current animation
                    anim.updateKeypoint(pose, canvasPoseCoordinates);

                }
            });
            // redraw particles
            anim.updateProton();
        });
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
    if(isAnimDisabled){
        document.getElementById('animDisabledDiv').className = 'pdAnimButtonRed';
    }else{
        document.getElementById('animDisabledDiv').className = 'pdAnimButtonGreen';
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
    if(el.length >=0){
        el[0].className = 'col-3-Button';
    }
    document.getElementById(selected).className +=' selectButton';
}

/**
 * Called from player control icon to switch display of player popup
 * (Click event of extension logo icon in player)
 */
document.addEventListener('displayPoseDreamPopup', function (e) {
    var playerPopup = document.getElementsByClassName('posedream-video-popup');
    if(showPlayerPopup){
        playerPopup[0].style.display = "none"
    }else{
        playerPopup[0].style.display = "block"
    }
    showPlayerPopup = !showPlayerPopup;
});

/**
 * Event to change the random interval from popup
 */
document.addEventListener('changeRandomInterval', function (e) {
    document.getElementById("randomButton").innerText="Randomly change every " + e.detail.interval +"s";
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
        initVideoPlayerPopup();
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

    let videoContainerDIV = document.getElementsByClassName("html5-video-container")[videoCollection.length - 1];
    videoContainerDIV.appendChild(canvas); // adds the canvas to the body element
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

    let videoContainerDIV = document.getElementsByClassName("html5-video-container")[videoCollection.length - 1];
    videoContainerDIV.appendChild(canvasGL); // adds the canvas to the body element
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
    const buttonAvailableInterval = setInterval(function () {
        var animControlsButton = document.getElementsByClassName("ytp-right-controls");
        if (animControlsButton !== undefined) {
            if (document.getElementById("pose_art") === null || document.getElementById("pose_art") === undefined) {
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
            currentAnimation = "skeleton"
        }else {
            currentAnimation = currentAnim;
        }
    });
}