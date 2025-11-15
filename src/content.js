import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import * as detectUtils from './detectUtils';
import {Anim, OverlayRenderer} from "./anim";
import {AnimEnum} from "./animEnum";
import {FilterEnum} from "./filterEnum";

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
var filterManager = null;  // FilterManager object for horror video filters
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
var isRandomModeActive=false;       // track if random mode is currently active

var showPlayerPopup=false;          // Player popup initial don't show

// YouTube UI Theme System
var themeStateManager = null;       // Theme state manager instance
var uiControlManager = null;        // UI control manager instance

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
 * FilterManager - Manages horror video filters
 * 
 * Applies CSS filters and canvas overlays to transform video appearance.
 * Works additively with animations - both are visible simultaneously.
 */
class FilterManager {
    constructor(videoElement, canvas, ctx) {
        this.video = videoElement;
        this.canvas = canvas;
        this.ctx = ctx;
        this.currentFilter = FilterEnum.none;
        this.overlayRenderer = new OverlayRenderer(canvas, ctx);
        console.log('FilterManager initialized');
    }

    /**
     * Apply a horror filter to the video
     * @param {string} filterName - Name of filter to apply
     */
    applyFilter(filterName) {
        const filter = FilterEnum.getFilterByName(filterName);
        
        // Apply CSS filter to video element
        this.video.style.filter = filter.cssFilter;
        
        // Update overlay renderer
        this.overlayRenderer.setOverlayType(filter.overlayType);
        
        // Store current filter
        this.currentFilter = filter;
        
        // Persist to Chrome storage
        chrome.storage.sync.set({ currentFilter: filterName });
        
        console.log(`Applied filter: ${filter.displayName} (${filterName})`);
    }

    /**
     * Clear all filters and return to normal video
     */
    clearFilter() {
        this.applyFilter('none');
    }

    /**
     * Render canvas overlay if filter has one
     */
    renderOverlay() {
        if (this.currentFilter.overlayType) {
            this.overlayRenderer.render();
        }
    }

    /**
     * Load saved filter from Chrome storage
     */
    async loadSavedFilter() {
        try {
            const result = await chrome.storage.sync.get('currentFilter');
            const filterName = result.currentFilter || 'none';
            this.applyFilter(filterName);
            console.log(`Loaded saved filter: ${filterName}`);
        } catch (error) {
            console.error('Error loading saved filter:', error);
            this.applyFilter('none');
        }
    }
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
    readRandomSettings(); // Load random mode settings
    
    // Initialize theme system
    initThemeSystem();

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
        stopRandomMode(); // Stop random mode when animation is changed from popup
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

    // Halloween Edition - Generate categorized animation grid for 25 animations
    let animationButtonsHTML = '';
    const allAnimations = AnimEnum.getAllAnimations();

    console.log('Halloween Edition - Total animations loaded:', allAnimations.length);
    
    // Debug: Check for undefined animations
    allAnimations.forEach((anim, index) => {
        if (!anim) {
            console.error('[YT Motion Debug] ERROR: Animation at index', index, 'is undefined');
        } else if (!anim.name) {
            console.error('[YT Motion Debug] ERROR: Animation at index', index, 'has no name:', anim);
        } else if (!anim.icon) {
            console.error('[YT Motion Debug] ERROR: Animation at index', index, 'has no icon:', anim);
        }
    });

    // Define animation categories
    const categories = [
        { name: '💀 Skeletons', start: 0, end: 5 },
        { name: '🎃 Pumpkins', start: 5, end: 8 },
        { name: '🦇 Creatures', start: 8, end: 12 },
        { name: '✨ Magic', start: 12, end: 15 },
        { name: '🌫️ Atmosphere', start: 15, end: 18 },
        { name: '🔮 Mystical Powers', start: 18, end: 25 }
    ];

    // Create categorized animation buttons
    categories.forEach((category, catIndex) => {
        animationButtonsHTML += '<div class="categoryHeader">' + category.name + '</div>';
        animationButtonsHTML += '<div class="rowButton">';
        
        for (let i = category.start; i < category.end; i++) {
            const anim = allAnimations[i];
            
            // Safety check for undefined animations
            if (!anim || !anim.name || !anim.icon) {
                console.error('[YT Motion Debug] ERROR: Animation at index', i, 'is invalid:', anim);
                continue;
            }
            
            const isFirst = (i === 0) ? ' selectButton' : '';
            animationButtonsHTML += '<div id="' + anim.name + '" class="col-3-Button' + isFirst + '">';
            animationButtonsHTML += '<span onclick="document.dispatchEvent(new CustomEvent(\'changeVisualizationFromPlayer\', { detail: {animationID:\'' + anim.name + '\'} }));">' + anim.icon + '</span>';
            animationButtonsHTML += '</div>';
        }
        
        animationButtonsHTML += '</div>';
    });

    // Generate filter buttons
    let filterButtonsHTML = '';
    const allFilters = FilterEnum.getAllFilters();
    
    allFilters.forEach((filter, index) => {
        const isNone = filter.name === 'none';
        const activeClass = (index === 0) ? ' active-filter' : '';
        const noneClass = isNone ? ' filter-none' : '';
        filterButtonsHTML += '<button class="filter-button' + noneClass + activeClass + '" data-filter="' + filter.name + '" onclick="document.dispatchEvent(new CustomEvent(\'changeFilter\', { detail: {filterName:\'' + filter.name + '\'} }));">';
        filterButtonsHTML += filter.icon + ' ' + filter.displayName;
        filterButtonsHTML += '</button>';
    });

    div.innerHTML = `
<div class="panelTitle">🎃 Halloween Animations 👻</div>

<div style="padding: 0 15px;">
    <button id="randomButton" class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('runRandomAnimation'));">🎲 Random Mode (` + randomSwitchSec + `s)</button>
    <input type="range" min="2" max="60" value="` + randomSwitchSec + `" id="randomRange" onchange="document.dispatchEvent(new CustomEvent('changeRandomInterval', { detail: {interval:this.value} }));">
</div>

<div style="padding: 0 15px; margin-top: 10px;">
    <button id="animDisabledDiv" class="pdAnimButtonGreen" onclick="document.dispatchEvent(new CustomEvent('changeIsAnimDisabled'));">⏯️ Stop/Play Animation</button>
</div>

<hr class="sep">

<div class="containerButton">
` + animationButtonsHTML + `
</div>

<hr class="sep filter-separator">

<div class="filter-section">
    <div class="filter-section-title">🎬 Horror Filters 🎥</div>
    <div class="filter-buttons-container">
` + filterButtonsHTML + `
    </div>
</div>

<hr class="sep theme-separator">

<div class="theme-section">
    <div class="theme-section-title">🌙 YouTube UI Theme</div>
    
    <button id="themeToggleButton" class="theme-toggle-button" onclick="document.dispatchEvent(new CustomEvent('toggleHalloweenTheme'));">
        🌙 Enable Halloween UI Theme
    </button>
    
    <div class="theme-intensity-container">
        <button class="theme-intensity-btn" data-intensity="low" onclick="document.dispatchEvent(new CustomEvent('setThemeIntensity', { detail: {intensity:'low'} }));">
            🌑 Low
        </button>
        <button class="theme-intensity-btn active-intensity" data-intensity="medium" onclick="document.dispatchEvent(new CustomEvent('setThemeIntensity', { detail: {intensity:'medium'} }));">
            🌓 Medium
        </button>
        <button class="theme-intensity-btn" data-intensity="high" onclick="document.dispatchEvent(new CustomEvent('setThemeIntensity', { detail: {intensity:'high'} }));">
            🌕 High
        </button>
    </div>
    
    <div class="theme-color-section-title">Color Themes</div>
    
    <div class="theme-color-container">
        <button class="theme-color-btn active-color-theme" data-color-theme="halloween" onclick="document.dispatchEvent(new CustomEvent('setColorTheme', { detail: {theme:'halloween'} }));">
            🎃 Halloween
        </button>
        <button class="theme-color-btn" data-color-theme="cyberpunk" onclick="document.dispatchEvent(new CustomEvent('setColorTheme', { detail: {theme:'cyberpunk'} }));">
            🌃 Cyberpunk
        </button>
        <button class="theme-color-btn" data-color-theme="matrix" onclick="document.dispatchEvent(new CustomEvent('setColorTheme', { detail: {theme:'matrix'} }));">
            💚 Matrix
        </button>
    </div>
    
    <div class="theme-color-container">
        <button class="theme-color-btn" data-color-theme="synthwave" onclick="document.dispatchEvent(new CustomEvent('setColorTheme', { detail: {theme:'synthwave'} }));">
            🌆 Synthwave
        </button>
        <button class="theme-color-btn" data-color-theme="deepspace" onclick="document.dispatchEvent(new CustomEvent('setColorTheme', { detail: {theme:'deepspace'} }));">
            🌌 Deep Space
        </button>
        <button class="theme-color-btn" data-color-theme="toxic" onclick="document.dispatchEvent(new CustomEvent('setColorTheme', { detail: {theme:'toxic'} }));">
            ☢️ Toxic
        </button>
    </div>
    
    <button id="particleToggleButton" class="theme-particle-toggle" onclick="document.dispatchEvent(new CustomEvent('toggleParticles'));">
        ✨ Particle Effects: OFF
    </button>
</div>
    `;

    // Find video player container with fallback options
    var html5VideoPlayer = document.getElementsByClassName("html5-video-player");
    let playerContainer = html5VideoPlayer && html5VideoPlayer.length > 0
        ? html5VideoPlayer[html5VideoPlayer.length-1]
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
                
                // Render filter overlay first (before animations)
                if(filterManager !== null) {
                    filterManager.renderOverlay();
                }
                
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
    stopRandomMode(); // Stop random mode when user manually selects animation
    setNewAnimation(e.detail.animationID)
});

document.addEventListener('changeIsAnimDisabled', function (e) {
    stopRandomMode(); // Stop random mode when animations are disabled
    isAnimDisabled = !isAnimDisabled;
    saveIsAnimDisabled(isAnimDisabled);

    updateAnimDisabledDiv();
});

/**
 * Called from player popup to change horror filter
 * (Click event of filter buttons)
 */
document.addEventListener('changeFilter', function (e) {
    const filterName = e.detail.filterName;
    console.log('Filter change requested:', filterName);
    
    if(filterManager !== null) {
        filterManager.applyFilter(filterName);
        updateSelectedFilterButton(filterName);
    } else {
        console.error('FilterManager not initialized');
    }
});

/**
 * Update active filter button styling
 * @param {string} filterName - Name of selected filter
 */
function updateSelectedFilterButton(filterName) {
    // Remove active class from all filter buttons
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(btn => {
        btn.classList.remove('active-filter');
    });
    
    // Add active class to selected filter button
    const selectedButton = document.querySelector(`.filter-button[data-filter="${filterName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active-filter');
    }
}

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
    randomSwitchSec = e.detail.interval;
    
    // Save the new interval
    saveRandomSettings(randomSwitchSec, isRandomModeActive);
    
    // If random mode is active, restart with new interval
    if(isRandomModeActive) {
        startRandomMode();
    }
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
 * Start random animation mode
 */
function startRandomMode() {
    clearRandomSwitchInterval();
    
    isRandomModeActive = true;
    saveRandomSettings(randomSwitchSec, true);
    
    randomSwitchIntervalID = setInterval(function (){
        let rndNum = Math.floor(Math.random() * allAnimationIDs.length);
        updateSelectedButton(allAnimationIDs[rndNum]);
        setNewAnimation(allAnimationIDs[rndNum]);
    }, 1000*randomSwitchSec);
    
    console.log('Random mode started with interval:', randomSwitchSec);
}

/**
 * Stop random animation mode
 */
function stopRandomMode() {
    clearRandomSwitchInterval();
    isRandomModeActive = false;
    saveRandomSettings(randomSwitchSec, false);
    console.log('Random mode stopped');
}

/**
 * Event to start the random animation
 */
document.addEventListener('runRandomAnimation', function (e) {
    startRandomMode();
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
        
        // Update theme UI controls after popup is created
        if (uiControlManager) {
            uiControlManager.updateAll();
        }
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
    ctx = canvas.getContext('2d', { willReadFrequently: true });
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
    
    // Initialize FilterManager if not already created
    if(filterManager === null) {
        console.log('Creating new FilterManager object');
        filterManager = new FilterManager(mainVideo, canvas, ctx);
        // Load saved filter from storage
        filterManager.loadSavedFilter();
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

function saveRandomSettings(interval, isActive){
    chrome.storage.sync.set({
        randomSwitchSec: interval,
        isRandomModeActive: isActive
    }, function() {
        console.log('Random settings saved:', interval, 'sec, active:', isActive);
    });
}

function readRandomSettings(){
    chrome.storage.sync.get(['randomSwitchSec', 'isRandomModeActive'], function (result) {
        if(result.randomSwitchSec !== undefined){
            randomSwitchSec = result.randomSwitchSec;
            console.log('Loaded random interval:', randomSwitchSec);
            
            // Update UI if button exists
            const randomButton = document.getElementById("randomButton");
            if (randomButton) {
                randomButton.innerText = "Randomly change every " + randomSwitchSec + "s";
            }
        }
        
        if(result.isRandomModeActive === true){
            isRandomModeActive = true;
            console.log('Random mode was active, restarting...');
            // Restart random mode
            startRandomMode();
        }
    });
}


// ============================================
// YouTube UI Theme System - ParticleManager
// ============================================

/**
 * ParticleManager - Static class for managing Halloween particle overlay
 * Creates and removes animated emoji particles that fall across the screen
 */
class ParticleManager {
    static PARTICLE_EMOJIS = ['🦇', '🍂', '🍁', '👻', '🕷️'];
    static PARTICLE_COUNT = 12;
    static OVERLAY_ID = 'halloween-particle-overlay';
    
    /**
     * Create particle overlay with animated Halloween emojis
     */
    static createOverlay() {
        // Remove any existing overlay first
        this.removeOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = this.OVERLAY_ID;
        overlay.className = 'halloween-particle-overlay';
        overlay.setAttribute('aria-hidden', 'true'); // Decorative only
        
        // Generate particles with random properties
        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
            const particle = document.createElement('div');
            particle.className = 'halloween-particle';
            
            // Random emoji selection
            const randomEmoji = this.PARTICLE_EMOJIS[Math.floor(Math.random() * this.PARTICLE_EMOJIS.length)];
            particle.textContent = randomEmoji;
            
            // Random horizontal position (0-100%)
            particle.style.left = `${Math.random() * 100}%`;
            
            // Random animation delay (0-8s)
            particle.style.animationDelay = `${Math.random() * 8}s`;
            
            // Random animation duration (8-12s)
            particle.style.animationDuration = `${8 + Math.random() * 4}s`;
            
            overlay.appendChild(particle);
        }
        
        document.body.appendChild(overlay);
        console.log('Particle overlay created with', this.PARTICLE_COUNT, 'particles');
    }
    
    /**
     * Remove particle overlay from DOM
     */
    static removeOverlay() {
        const existing = document.getElementById(this.OVERLAY_ID);
        if (existing) {
            existing.remove();
            console.log('Particle overlay removed');
        }
    }
    
    /**
     * Check if particle overlay exists
     * @returns {boolean} True if overlay exists
     */
    static exists() {
        return document.getElementById(this.OVERLAY_ID) !== null;
    }
}


// ============================================
// YouTube UI Theme System - ThemeStateManager
// ============================================

/**
 * ThemeStateManager - Manages Halloween theme state and persistence
 * Handles theme toggle, intensity levels, and particle effects
 */
class ThemeStateManager {
    constructor() {
        this.state = {
            enabled: false,
            intensity: 'medium',
            particlesEnabled: false,
            colorTheme: 'halloween'
        };
    }
    
    /**
     * Load theme settings from Chrome Storage
     * @returns {Promise<void>}
     */
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'halloweenThemeEnabled',
                'themeIntensity',
                'particlesEnabled',
                'colorTheme'
            ]);
            
            this.state.enabled = result.halloweenThemeEnabled || false;
            this.state.intensity = result.themeIntensity || 'medium';
            this.state.particlesEnabled = result.particlesEnabled || false;
            this.state.colorTheme = result.colorTheme || 'halloween';
            
            console.log('Theme settings loaded:', this.state);
            
            // Apply loaded settings
            if (this.state.enabled) {
                this.applyTheme();
            }
            if (this.state.particlesEnabled) {
                ParticleManager.createOverlay();
            }
        } catch (error) {
            console.warn('Failed to load theme settings:', error);
            // Continue with default state
        }
    }
    
    /**
     * Apply theme to document body
     */
    applyTheme() {
        // Apply color theme class
        const themeClass = this.state.colorTheme === 'halloween' ? 'halloween-theme' : `theme-${this.state.colorTheme}`;
        document.body.classList.add(themeClass);
        document.body.classList.add(`theme-intensity-${this.state.intensity}`);
        console.log('Theme applied:', themeClass, 'with intensity:', this.state.intensity);
    }
    
    /**
     * Remove theme from document body
     */
    removeTheme() {
        // Remove all theme classes
        document.body.classList.remove('halloween-theme');
        document.body.classList.remove('theme-cyberpunk');
        document.body.classList.remove('theme-matrix');
        document.body.classList.remove('theme-synthwave');
        document.body.classList.remove('theme-deepspace');
        document.body.classList.remove('theme-toxic');
        document.body.classList.remove('theme-intensity-low');
        document.body.classList.remove('theme-intensity-medium');
        document.body.classList.remove('theme-intensity-high');
        console.log('Theme removed');
    }
    
    /**
     * Toggle theme on/off
     */
    toggleTheme() {
        this.state.enabled = !this.state.enabled;
        
        if (this.state.enabled) {
            this.applyTheme();
        } else {
            this.removeTheme();
            // Also remove particles when theme is disabled
            if (this.state.particlesEnabled) {
                ParticleManager.removeOverlay();
                this.state.particlesEnabled = false;
            }
        }
        
        this.saveState();
    }
    
    /**
     * Set theme intensity level
     * @param {string} level - 'low', 'medium', or 'high'
     */
    setIntensity(level) {
        if (!['low', 'medium', 'high'].includes(level)) {
            console.warn('Invalid intensity level:', level);
            return;
        }
        
        // Remove old intensity class
        document.body.classList.remove('theme-intensity-low');
        document.body.classList.remove('theme-intensity-medium');
        document.body.classList.remove('theme-intensity-high');
        
        // Add new intensity class
        this.state.intensity = level;
        if (this.state.enabled) {
            document.body.classList.add(`theme-intensity-${level}`);
        }
        
        console.log('Theme intensity set to:', level);
        this.saveState();
    }
    
    /**
     * Toggle particle effects on/off
     */
    toggleParticles() {
        this.state.particlesEnabled = !this.state.particlesEnabled;
        
        if (this.state.particlesEnabled) {
            ParticleManager.createOverlay();
        } else {
            ParticleManager.removeOverlay();
        }
        
        this.saveState();
    }
    
    /**
     * Set color theme
     * @param {string} themeName - 'halloween', 'cyberpunk', 'matrix', 'synthwave', 'deepspace', 'toxic'
     */
    setColorTheme(themeName) {
        const validThemes = ['halloween', 'cyberpunk', 'matrix', 'synthwave', 'deepspace', 'toxic'];
        if (!validThemes.includes(themeName)) {
            console.warn('Invalid color theme:', themeName);
            return;
        }
        
        console.log('setColorTheme called:', themeName, 'enabled:', this.state.enabled);
        
        // Remove old theme class
        document.body.classList.remove('halloween-theme');
        document.body.classList.remove('theme-cyberpunk');
        document.body.classList.remove('theme-matrix');
        document.body.classList.remove('theme-synthwave');
        document.body.classList.remove('theme-deepspace');
        document.body.classList.remove('theme-toxic');
        
        // Update state
        this.state.colorTheme = themeName;
        
        // If theme is enabled, apply the new color theme immediately
        if (this.state.enabled) {
            const themeClass = themeName === 'halloween' ? 'halloween-theme' : `theme-${themeName}`;
            console.log('Adding theme class:', themeClass);
            document.body.classList.add(themeClass);
            // Re-apply intensity
            document.body.classList.add(`theme-intensity-${this.state.intensity}`);
            console.log('Body classes after add:', document.body.className);
        } else {
            console.log('Theme not enabled, not applying class');
        }
        
        console.log('Color theme set to:', themeName);
        this.saveState();
    }
    
    /**
     * Save current state to Chrome Storage
     * @returns {Promise<void>}
     */
    async saveState() {
        try {
            await chrome.storage.sync.set({
                halloweenThemeEnabled: this.state.enabled,
                themeIntensity: this.state.intensity,
                particlesEnabled: this.state.particlesEnabled,
                colorTheme: this.state.colorTheme
            });
            console.log('Theme state saved:', this.state);
        } catch (error) {
            console.warn('Failed to save theme state:', error);
            // Continue - theme still works for current session
        }
    }
    
    /**
     * Get current state
     * @returns {Object} Current theme state
     */
    getState() {
        return { ...this.state };
    }
}


// ============================================
// YouTube UI Theme System - UIControlManager
// ============================================

/**
 * UIControlManager - Manages theme control UI elements and user interactions
 * Updates button states and handles visual feedback
 */
class UIControlManager {
    constructor(themeStateManager) {
        this.stateManager = themeStateManager;
        this.elements = {
            toggleButton: null,
            intensityButtons: [],
            particleButton: null,
            colorThemeButtons: []
        };
    }
    
    /**
     * Cache references to UI elements
     */
    cacheElements() {
        this.elements.toggleButton = document.getElementById('themeToggleButton');
        this.elements.intensityButtons = Array.from(document.querySelectorAll('.theme-intensity-btn'));
        this.elements.particleButton = document.getElementById('particleToggleButton');
        this.elements.colorThemeButtons = Array.from(document.querySelectorAll('.theme-color-btn'));
    }
    
    /**
     * Update toggle button appearance based on theme state
     * @param {boolean} enabled - Whether theme is enabled
     */
    updateToggleButton(enabled) {
        if (!this.elements.toggleButton) {
            this.cacheElements();
        }
        
        if (this.elements.toggleButton) {
            if (enabled) {
                this.elements.toggleButton.textContent = '🌙 Disable Halloween UI Theme';
                this.elements.toggleButton.classList.add('theme-active');
            } else {
                this.elements.toggleButton.textContent = '🌙 Enable Halloween UI Theme';
                this.elements.toggleButton.classList.remove('theme-active');
            }
        }
    }
    
    /**
     * Update intensity button states
     * @param {string} level - Active intensity level ('low', 'medium', 'high')
     */
    updateIntensityButtons(level) {
        if (this.elements.intensityButtons.length === 0) {
            this.cacheElements();
        }
        
        this.elements.intensityButtons.forEach(btn => {
            const btnLevel = btn.getAttribute('data-intensity');
            if (btnLevel === level) {
                btn.classList.add('active-intensity');
            } else {
                btn.classList.remove('active-intensity');
            }
        });
    }
    
    /**
     * Update particle button text and appearance
     * @param {boolean} enabled - Whether particles are enabled
     */
    updateParticleButton(enabled) {
        if (!this.elements.particleButton) {
            this.cacheElements();
        }
        
        if (this.elements.particleButton) {
            if (enabled) {
                this.elements.particleButton.textContent = '✨ Particle Effects: ON';
                this.elements.particleButton.classList.add('particles-active');
            } else {
                this.elements.particleButton.textContent = '✨ Particle Effects: OFF';
                this.elements.particleButton.classList.remove('particles-active');
            }
        }
    }
    
    /**
     * Update color theme button states
     * @param {string} themeName - Active color theme name
     */
    updateColorThemeButtons(themeName) {
        if (this.elements.colorThemeButtons.length === 0) {
            this.cacheElements();
        }
        
        this.elements.colorThemeButtons.forEach(btn => {
            const btnTheme = btn.getAttribute('data-color-theme');
            if (btnTheme === themeName) {
                btn.classList.add('active-color-theme');
            } else {
                btn.classList.remove('active-color-theme');
            }
        });
    }
    
    /**
     * Update all UI elements based on current state
     */
    updateAll() {
        const state = this.stateManager.getState();
        this.updateToggleButton(state.enabled);
        this.updateIntensityButtons(state.intensity);
        this.updateParticleButton(state.particlesEnabled);
        this.updateColorThemeButtons(state.colorTheme);
    }
}


// ============================================
// YouTube UI Theme System - Initialization & Event Handlers
// ============================================

/**
 * Initialize theme system
 * Creates manager instances and loads saved settings
 */
async function initThemeSystem() {
    // Create theme state manager
    if (themeStateManager === null) {
        themeStateManager = new ThemeStateManager();
        await themeStateManager.loadSettings();
        console.log('ThemeStateManager initialized');
    }
    
    // Create UI control manager
    if (uiControlManager === null) {
        uiControlManager = new UIControlManager(themeStateManager);
        console.log('UIControlManager initialized');
    }
}

/**
 * Event handler: Toggle Halloween theme
 */
document.addEventListener('toggleHalloweenTheme', function(e) {
    if (themeStateManager) {
        themeStateManager.toggleTheme();
        
        // Update UI controls
        if (uiControlManager) {
            uiControlManager.updateAll();
        }
    }
});

/**
 * Event handler: Set theme intensity
 */
document.addEventListener('setThemeIntensity', function(e) {
    const intensity = e.detail.intensity;
    
    if (themeStateManager) {
        themeStateManager.setIntensity(intensity);
        
        // Update UI controls
        if (uiControlManager) {
            uiControlManager.updateIntensityButtons(intensity);
        }
    }
});

/**
 * Event handler: Toggle particle effects
 */
document.addEventListener('toggleParticles', function(e) {
    if (themeStateManager) {
        themeStateManager.toggleParticles();
        
        // Update UI controls
        if (uiControlManager) {
            uiControlManager.updateParticleButton(themeStateManager.getState().particlesEnabled);
        }
    }
});

/**
 * Event handler: Set color theme
 */
document.addEventListener('setColorTheme', function(e) {
    const themeName = e.detail.theme;
    
    if (themeStateManager) {
        themeStateManager.setColorTheme(themeName);
        
        // Update UI controls
        if (uiControlManager) {
            uiControlManager.updateColorThemeButtons(themeName);
        }
    }
});
