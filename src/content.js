import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';
import * as detectUtils from './detectUtils';
import {Anim, OverlayRenderer} from "./anim";
import {AnimEnum} from "./animEnum";
import {FilterEnum} from "./filterEnum";
import {GameMode} from "./gameMode";

/**
 * Debug flag for content.js
 * Set to true to enable console logging for this file
 * Set to false for production builds (default)
 */
const DEBUG = false;

// pose detector from tensorflow
var detector = null;

// Initialize TensorFlow.js with WebGL backend
async function initDetector() {
    try {
        // Set backend to webgl explicitly and wait for it to be ready
        await tf.setBackend('webgl');
        await tf.ready();
        if (DEBUG) console.log('TensorFlow.js backend initialized:', tf.getBackend());

        // Create detector after backend is ready
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER}
        );
        if (DEBUG) console.log("Pose detector created successfully");
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
// videoCollection removed - we now use findCurrentVideoElement() instead
var anim = null;   // anim.js object
var filterManager = null;  // FilterManager object for horror video filters
var isRequestAnimationFrame = false;   // only request animation frame once

var isVideoPlay = false;  // if true, video is playint, do detection and play animations if not anim disabled
var isAnimDisabled = false; // if true, do not show animations
var isCanvasHidden = false; // if true, canvas overlays are hidden from view

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

// Motion Game Mode System
var gameMode = null;                // GameMode instance
var isGameModeActive = false;       // Track if game mode is active

/**
 * Find the current video element with robust fallback selectors
 * Prioritizes the video that is actually playing or has the most progress
 * @returns {HTMLVideoElement|null} Current video element or null
 */
function findCurrentVideoElement() {
    if (DEBUG) console.log('[VIDEO SEARCH] Searching for current video element...');
    
    // Try multiple selectors in order of preference
    const selectors = [
        'video.html5-main-video',
        'video.video-stream',
        '.html5-video-player video',
        '#movie_player video',
        'video'
    ];
    
    let foundVideos = [];
    
    for (const selector of selectors) {
        const videos = document.querySelectorAll(selector);
        if (videos.length > 0) {
            foundVideos = Array.from(videos);
            if (DEBUG) console.log(`[VIDEO SEARCH] Found ${videos.length} video(s) with selector: ${selector}`);
            break;
        }
    }
    
    if (foundVideos.length === 0) {
        if (DEBUG) console.warn('[VIDEO SEARCH] No video elements found!');
        return null;
    }
    
    // If only one video, return it
    if (foundVideos.length === 1) {
        const video = foundVideos[0];
        if (DEBUG) {
            console.log('[VIDEO SEARCH] Single video found:', {
                readyState: video.readyState,
                paused: video.paused,
                currentTime: video.currentTime,
                duration: video.duration,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight
            });
        }
        return video;
    }
    
    // Multiple videos found - choose the best one
    if (DEBUG) console.log('[VIDEO SEARCH] Multiple videos found, selecting best candidate...');
    
    // Score each video based on multiple criteria
    let bestVideo = null;
    let bestScore = -1;
    
    foundVideos.forEach((video, index) => {
        let score = 0;
        
        // Criteria 1: Video is playing (highest priority)
        if (!video.paused && video.currentTime > 0) {
            score += 1000;
            if (DEBUG) console.log(`[VIDEO SEARCH]   Video ${index}: +1000 (playing)`);
        }
        
        // Criteria 2: Has valid dimensions (loaded)
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            score += 100;
            if (DEBUG) console.log(`[VIDEO SEARCH]   Video ${index}: +100 (has dimensions)`);
        }
        
        // Criteria 3: ReadyState >= 2 (has data)
        if (video.readyState >= 2) {
            score += 50;
            if (DEBUG) console.log(`[VIDEO SEARCH]   Video ${index}: +50 (readyState >= 2)`);
        }
        
        // Criteria 4: Has duration (metadata loaded)
        if (!isNaN(video.duration) && video.duration > 0) {
            score += 25;
            if (DEBUG) console.log(`[VIDEO SEARCH]   Video ${index}: +25 (has duration)`);
        }
        
        // Criteria 5: Has current time (has played)
        if (video.currentTime > 0) {
            score += 10;
            if (DEBUG) console.log(`[VIDEO SEARCH]   Video ${index}: +10 (has currentTime)`);
        }
        
        // Criteria 6: Prefer later videos (YouTube pattern)
        score += index;
        
        if (DEBUG) console.log(`[VIDEO SEARCH]   Video ${index} total score: ${score}`, {
            readyState: video.readyState,
            paused: video.paused,
            currentTime: video.currentTime.toFixed(2),
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
        });
        
        if (score > bestScore) {
            bestScore = score;
            bestVideo = video;
        }
    });
    
    if (DEBUG) console.log(`[VIDEO SEARCH] Selected video with score: ${bestScore}`);
    
    return bestVideo;
}

/**
 * Check if video is actually playing (alternative to readyState check)
 * @param {HTMLVideoElement} video - Video element to check
 * @returns {boolean} True if video is playing
 */
function isVideoActuallyPlaying(video) {
    if (!video) return false;
    
    // Video is playing if:
    // 1. Not paused
    // 2. Has current time > 0 (started playing)
    // 3. Has duration (loaded metadata)
    const isPlaying = !video.paused && video.currentTime > 0 && video.duration > 0;
    
    if (DEBUG && isPlaying) {
        console.log('[VIDEO CHECK] Video is actually playing (alternative check passed)');
    }
    
    return isPlaying;
}

/**
 * Wait for video to be ready with retry mechanism
 * @param {Function} callback - Function to call when video is ready
 * @param {number} maxAttempts - Maximum number of retry attempts
 * @param {number} currentAttempt - Current attempt number (internal)
 */
function waitForVideoReady(callback, maxAttempts = 10, currentAttempt = 1) {
    if (DEBUG) console.log(`[VIDEO WAIT] Attempt ${currentAttempt}/${maxAttempts} - Waiting for video...`);
    
    // Refresh video element
    mainVideo = findCurrentVideoElement();
    
    if (!mainVideo) {
        if (currentAttempt < maxAttempts) {
            const delay = Math.min(100 * Math.pow(1.5, currentAttempt), 2000); // Exponential backoff
            if (DEBUG) console.log(`[VIDEO WAIT] Video not found, retrying in ${delay}ms...`);
            setTimeout(() => waitForVideoReady(callback, maxAttempts, currentAttempt + 1), delay);
        } else {
            console.error('[VIDEO WAIT] Failed to find video after', maxAttempts, 'attempts');
        }
        return;
    }
    
    // Check if video is ready (either readyState >= 2 OR actually playing)
    const isReady = mainVideo.readyState >= 2 || isVideoActuallyPlaying(mainVideo);
    
    if (isReady) {
        if (DEBUG) console.log('[VIDEO WAIT] Video is ready! Executing callback...');
        callback();
    } else if (currentAttempt < maxAttempts) {
        const delay = Math.min(100 * Math.pow(1.5, currentAttempt), 2000); // Exponential backoff
        if (DEBUG) console.log(`[VIDEO WAIT] Video not ready (readyState: ${mainVideo.readyState}), retrying in ${delay}ms...`);
        setTimeout(() => waitForVideoReady(callback, maxAttempts, currentAttempt + 1), delay);
    } else {
        console.error('[VIDEO WAIT] Video not ready after', maxAttempts, 'attempts. ReadyState:', mainVideo?.readyState);
    }
}

/**
 * Cleanup function to remove old canvas elements and reset state
 */
function cleanup() {
    if (DEBUG) console.log('Cleaning up old canvas elements and state');
    
    // Disconnect resize observer from old video
    if(mainVideo) {
        try {
            resizeObserver.unobserve(mainVideo);
            if (DEBUG) console.log('Disconnected resize observer from old video');
        } catch(e) {
            // Ignore errors if observer wasn't attached
        }
    }
    
    // Remove old canvas elements
    const oldCanvas = document.getElementById('canvasdummy');
    if (oldCanvas) {
        oldCanvas.remove();
        if (DEBUG) console.log('Removed old 2D canvas');
    }
    
    const oldCanvasGL = document.getElementById('canvasdummyGL');
    if (oldCanvasGL) {
        oldCanvasGL.remove();
        if (DEBUG) console.log('Removed old WebGL canvas');
    }
    
    // Remove ALL old popups (there might be multiple from different players)
    const oldPopups = document.querySelectorAll('.posedream-video-popup');
    if (oldPopups.length > 0) {
        if (DEBUG) console.log(`Removing ${oldPopups.length} old popup(s)`);
        oldPopups.forEach(popup => popup.remove());
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
                if (DEBUG) console.log('Error destroying proton:', e);
            }
        }
        anim = null;
        if (DEBUG) console.log('Reset anim object');
    }
    
    // Clean up Game Mode UI elements
    const motionPanel = document.getElementById('motionSelectionPanel');
    if (motionPanel) {
        motionPanel.remove();
        if (DEBUG) console.log('Removed old motion selection panel');
    }
    
    const gameHUD = document.getElementById('gameHUD');
    if (gameHUD) {
        gameHUD.remove();
        if (DEBUG) console.log('Removed old game HUD');
    }
    
    // Reset game mode
    if (gameMode) {
        try {
            gameMode.deactivate();
        } catch(e) {
            if (DEBUG) console.log('Error deactivating game mode:', e);
        }
        gameMode = null;
        if (DEBUG) console.log('Reset game mode object');
    }
    
    // Reset game mode flag
    isGameModeActive = false;
    
    // Reset flags
    isVideoPlay = false;
    showPlayerPopup = false; // Reset to false so popup will be created fresh
    isRequestAnimationFrame = false;
    
    if (DEBUG) console.log('Cleanup complete - all elements reset');
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
        if (DEBUG) console.log('FilterManager initialized');
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
        
        if (DEBUG) console.log(`Applied filter: ${filter.displayName} (${filterName})`);
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
            if (DEBUG) console.log(`Loaded saved filter: ${filterName}`);
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
    if (DEBUG) console.log('Init called for new video');
    
    // Cleanup old elements first
    cleanup();
    
    // FORCE GAME MODE RESET ON VIDEO CHANGE
    // Note: Game mode is reset, but normal animations persist across videos
    if (DEBUG) console.log('[VIDEO CHANGE] Forcing game mode reset');
    isGameModeActive = false;
    
    // Clear game mode from storage
    chrome.storage.sync.set({ gameModeActive: false }, function() {
        if (DEBUG) console.log('[VIDEO CHANGE] Game mode cleared from storage');
    });
    
    // Note: currentAnimation will be loaded from storage in readCurrentAnimationName()
    // This allows animations to persist across video changes
    // Only game mode gets reset to skeleton
    
    // Ensure animations are enabled (not disabled)
    isAnimDisabled = false;
    saveIsAnimDisabled(false);
    
    // Use the new robust video finding function
    mainVideo = findCurrentVideoElement();
    
    // If video not found, wait for it
    if (!mainVideo) {
        if (DEBUG) console.log('[INIT] Video not found immediately, waiting...');
        waitForVideoReady(() => {
            if (DEBUG) console.log('[INIT] Video found after wait, continuing initialization...');
            // Continue with rest of init
            readIsAnimDisabled();
            readCurrentAnimationName();
            readRandomSettings();
            readCanvasHiddenState();
            initThemeSystem();
            initButtonInPlayer();
            addOnPlayingEvent();
            addLoadedDataEvent();
        });
        return; // Exit early, will continue after video is found
    }

    if (DEBUG) console.log('[INIT] Main video found:', {
        readyState: mainVideo.readyState,
        paused: mainVideo.paused,
        currentTime: mainVideo.currentTime
    });

    readIsAnimDisabled();
    readCurrentAnimationName();
    readRandomSettings(); // Load random mode settings
    readCanvasHiddenState(); // Load canvas pause state
    // NOTE: readGameModeState() is called AFTER canvas creation in handleVideoPlaying()
    
    // Initialize theme system
    initThemeSystem();

    initButtonInPlayer()

    addOnPlayingEvent();

    addLoadedDataEvent();
    
    // CRITICAL FIX: If video is already loaded/playing, trigger handlers immediately
    // This happens when init() is called after video has already started
    if (mainVideo) {
        if (DEBUG) console.log('[INIT] Checking if video already loaded/playing...');
        if (DEBUG) console.log('[INIT] Video readyState:', mainVideo.readyState, 'paused:', mainVideo.paused);
        
        // If video is already playing, trigger both handlers
        if (!mainVideo.paused && mainVideo.readyState >= 2) {
            if (DEBUG) console.log('[INIT] Video already playing! Triggering handlers immediately...');
            setTimeout(() => {
                handleVideoPlaying();
                handleVideoLoaded();
            }, 100);
        }
        // If video is loaded but paused, at least create the UI
        else if (mainVideo.readyState >= 2) {
            if (DEBUG) console.log('[INIT] Video loaded but paused. Creating UI...');
            setTimeout(() => {
                handleVideoPlaying();
                handleVideoLoaded();
            }, 100);
        }
        // ALWAYS create popup even if video not ready yet
        // This ensures popup exists for button clicks
        else {
            if (DEBUG) console.log('[INIT] Video not ready yet, but creating popup proactively...');
            setTimeout(() => {
                // Only create popup, canvas will be created when video plays
                initVideoPlayerPopup();
                updateAnimDisabledDiv();
                updateCanvasPauseButton();
                updateGameModeButton();
                updateSelectedButton(currentAnimation);
                
                if (uiControlManager) {
                    uiControlManager.updateAll();
                }
            }, 500);
        }
    }

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
            // Send response to acknowledge message received
            sendResponse({status: "initialized"});
        }
        // Return true to indicate we will send a response (even if synchronously)
        return true;
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
        if (request.animation) {
            stopRandomMode(); // Stop random mode when animation is changed from popup
            setNewAnimation(request.animation);
            // Send response to acknowledge animation changed
            sendResponse({status: "animation_changed", animation: request.animation});
        }
        // Return true to indicate we will send a response
        return true;
    }
);

/**
 * Switch and prepare current animation.
 * @param animationId new animation ID
 */
function setNewAnimation(animationId){
    if (DEBUG) console.log('content.js setNewAnimation called with:', animationId);
    
    // Auto-resume canvas if it was paused
    if (isCanvasHidden) {
        resumeCanvas();
    }
    
    // Validate animation ID - fallback to default if undefined or invalid
    if(!animationId || animationId === 'undefined') {
        if (DEBUG) console.log('Invalid animation ID, using default: skeletonGlow');
        animationId = 'skeletonGlow';
    }
    
    if(anim !== null){
        anim.setNewAnimation(animationId);
        currentAnimation=animationId;
        saveCurrentAnimationName(animationId);
    } else {
        if (DEBUG) console.log('WARNING: anim is null, deferring animation switch to:', animationId);
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
        if (DEBUG) console.log('Popup already exists, skipping creation');
        return;
    }

    const div = document.createElement('div');

    div.className = 'posedream-video-popup';

    // Halloween Edition - Generate categorized animation grid for 38 animations
    let animationButtonsHTML = '';
    const allAnimations = AnimEnum.getAllAnimations();

    if (DEBUG) console.log('Halloween Edition - Total animations loaded:', allAnimations.length);
    
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
        { name: '🔮 Mystical Powers', start: 18, end: 25 },
        { name: '🔥 Skeleton Effects', start: 25, end: 38 }
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
    <button id="canvasPauseButton" class="pdAnimButtonRed" onclick="document.dispatchEvent(new CustomEvent('toggleCanvasPause'));">👁️ Hide Effects</button>
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
        🌙 Enable UI Theme
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

<hr class="sep">

<div style="padding: 0 15px; margin-bottom: 15px;">
    <button id="gameModeToggleButton" class="pdVideoButton" onclick="document.dispatchEvent(new CustomEvent('toggleGameMode'));">👻🎮 Game Mode: OFF</button>
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
        if (DEBUG) console.log('Appending popup to player container');
        playerContainer.appendChild(div);
        if (DEBUG) console.log('Popup successfully created and appended');
    } else {
        console.error('Could not find player container to append popup!');
        if (DEBUG) console.log('Tried selectors: .html5-video-player, #movie_player, #player');
        if (DEBUG) console.log('mainVideo exists:', !!mainVideo);
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

    // Skip rendering if canvas is hidden
    if (isCanvasHidden) {
        requestAnimationFrame(startDetection);
        return;
    }

    // create or update animation object
    if(anim === null){
        // Only create anim if canvas elements exist
        if(canvas && canvasGL && ctx && webGLtx) {
            if (DEBUG) console.log('Creating Anim object in startDetection');
            anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
            
            // Apply the current animation after anim object is created
            if(currentAnimation && currentAnimation !== 'undefined') {
                if (DEBUG) console.log('Applying current animation in startDetection:', currentAnimation);
                anim.setNewAnimation(currentAnimation);
            } else {
                if (DEBUG) console.log('No current animation set in startDetection, using default: skeletonGlow');
                currentAnimation = 'skeletonGlow';
                anim.setNewAnimation(currentAnimation);
            }
        } else {
            if (DEBUG) console.log('Canvas elements not ready yet, skipping anim creation');
        }
    }else{
        anim.updateCanvas(mainVideo,canvas, canvasGL, ctx, webGLtx);
    }

    // Run detection if detector exists AND (animations enabled OR game mode active)
    const shouldRunDetection = detector !== null && detector !== undefined && 
                               (isAnimDisabled == false || (gameMode && gameMode.state === 'PLAYING'));
    
    if (shouldRunDetection) {
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
                
                // Game Mode Logic - takes priority over animations
                if(gameMode && gameMode.state === 'PLAYING') {
                    // Update and render game mode
                    gameMode.update(pose[0].keypoints);
                    gameMode.render();
                } else {
                    // Normal animation mode
                    // update new estimation keypoints for current animation
                    if(anim !== null) {
                        anim.updateKeypoint(pose, canvasPoseCoordinates);
                    }
                }

            }
        }).catch(error => {
            console.error("Pose estimation error:", error);
        });
        // redraw particles (only if not in game mode)
        if(anim !== null && (!gameMode || gameMode.state !== 'PLAYING')) {
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
 * Event handler: Toggle canvas pause
 */
document.addEventListener('toggleCanvasPause', function (e) {
    if (isCanvasHidden) {
        resumeCanvas();
    } else {
        pauseCanvas();
    }
});

/**
 * Force initialization of all systems
 * This ensures canvas, detector, and all components are ready
 */
function forceInitialization() {
    if (DEBUG) console.log('[INIT] Force initialization triggered');
    
    // 1. Ensure video is found using robust method
    if (!mainVideo) {
        if (DEBUG) console.log('[INIT] Finding video element...');
        mainVideo = findCurrentVideoElement();
        if (DEBUG) console.log('[INIT] Video found:', !!mainVideo);
    } else {
        // Refresh video element to ensure it's current
        if (DEBUG) console.log('[INIT] Refreshing video element...');
        mainVideo = findCurrentVideoElement();
    }
    
    // 2. Create canvas if not exists
    if (!canvas && mainVideo) {
        if (DEBUG) console.log('[INIT] Creating canvas...');
        createCanvas();
        if (DEBUG) console.log('[INIT] Canvas created:', !!canvas, !!ctx);
    }
    
    // 3. Create WebGL canvas if not exists
    if (!canvasGL && mainVideo) {
        if (DEBUG) console.log('[INIT] Creating WebGL canvas...');
        createCanvasWebGL();
        if (DEBUG) console.log('[INIT] WebGL canvas created:', !!canvasGL, !!webGLtx);
    }
    
    // 4. Create detector if not exists
    if (!detector) {
        if (DEBUG) console.log('[INIT] Creating pose detector...');
        createDetector().then(() => {
            if (DEBUG) console.log('[INIT] Detector created successfully');
        }).catch(err => {
            console.error('[INIT] Failed to create detector:', err);
        });
    }
    
    // 5. Create anim if not exists
    if (!anim && canvas && canvasGL && ctx && webGLtx) {
        if (DEBUG) console.log('[INIT] Creating Anim object...');
        anim = new Anim(canvas, canvasGL, ctx, webGLtx);
        anim.setNewAnimation(currentAnimation);
        if (DEBUG) console.log('[INIT] Anim created with animation:', currentAnimation);
    }
    
    // 6. Start detection if not running
    if (mainVideo && !isVideoPlay) {
        if (DEBUG) console.log('[INIT] Starting detection loop...');
        isVideoPlay = true;
        startDetection();
    }
    
    return canvas && ctx && canvasGL && webGLtx;
}

/**
 * Toggle Game Mode on/off
 * This is the MASTER TRIGGER that ensures everything is initialized
 */
document.addEventListener('toggleGameMode', function (e) {
    if (DEBUG) console.log('[GAME MODE] ========================================');
    if (DEBUG) console.log('[GAME MODE] Toggle event triggered');
    if (DEBUG) console.log('[GAME MODE] Current state:', isGameModeActive);
    if (DEBUG) console.log('[GAME MODE] Canvas:', !!canvas, 'Ctx:', !!ctx);
    if (DEBUG) console.log('[GAME MODE] Video:', !!mainVideo, 'Detector:', !!detector);
    if (DEBUG) console.log('[GAME MODE] ========================================');
    
    isGameModeActive = !isGameModeActive;
    
    if (isGameModeActive) {
        // FORCE INITIALIZATION OF EVERYTHING
        if (DEBUG) console.log('[GAME MODE] Forcing full initialization...');
        const initialized = forceInitialization();
        
        if (!initialized) {
            console.error('[GAME MODE] Initialization failed! Retrying in 1 second...');
            setTimeout(() => {
                forceInitialization();
                // Try again after forced init
                if (canvas && ctx) {
                    if (!gameMode) {
                        gameMode = new GameMode(canvas, ctx);
                    }
                    if (gameMode) {
                        gameMode.activate();
                        stopRandomMode();
                        isAnimDisabled = true;
                    }
                }
            }, 1000);
            updateGameModeButton();
            return;
        }
        
        // Wait a moment for everything to settle
        setTimeout(() => {
            if (DEBUG) console.log('[GAME MODE] Initialization complete. Creating GameMode...');
            if (DEBUG) console.log('[GAME MODE] Final check - Canvas:', !!canvas, 'Ctx:', !!ctx);
            
            // Initialize game mode if not exists
            if (!gameMode && canvas && ctx) {
                if (DEBUG) console.log('[GAME MODE] Creating new GameMode instance');
                try {
                    gameMode = new GameMode(canvas, ctx);
                    if (DEBUG) console.log('[GAME MODE] GameMode created successfully');
                } catch (error) {
                    console.error('[GAME MODE] Failed to create GameMode:', error);
                    return;
                }
            }
            
            if (gameMode) {
                if (DEBUG) console.log('[GAME MODE] Activating game mode');
                try {
                    gameMode.activate();
                    if (DEBUG) console.log('[GAME MODE] Game mode activated. State:', gameMode.state);
                    
                    // Stop random mode and animations when game mode is active
                    stopRandomMode();
                    isAnimDisabled = true;
                    
                    // Check if panel was created
                    setTimeout(() => {
                        const panel = document.getElementById('motionSelectionPanel');
                        if (DEBUG) console.log('[GAME MODE] Panel check - exists:', !!panel);
                        if (panel) {
                            if (DEBUG) console.log('[GAME MODE] Panel display:', window.getComputedStyle(panel).display);
                            if (DEBUG) console.log('[GAME MODE] Panel visibility:', window.getComputedStyle(panel).visibility);
                        }
                    }, 100);
                    
                } catch (error) {
                    console.error('[GAME MODE] Failed to activate:', error);
                }
            } else {
                console.error('[GAME MODE] GameMode instance is null!');
            }
            
            updateGameModeButton();
            updateAnimDisabledDiv();
        }, 500); // Give 500ms for everything to initialize
        
    } else {
        if (DEBUG) console.log('[GAME MODE] Deactivating game mode');
        if (gameMode) {
            gameMode.deactivate();
            isAnimDisabled = false;
        }
        updateGameModeButton();
        updateAnimDisabledDiv();
    }
    
    // Save state
    chrome.storage.sync.set({ gameModeActive: isGameModeActive });
});

/**
 * Called from player popup to change horror filter
 * (Click event of filter buttons)
 */
document.addEventListener('changeFilter', function (e) {
    const filterName = e.detail.filterName;
    if (DEBUG) console.log('Filter change requested:', filterName);
    
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
 * Update game mode button text and style
 */
function updateGameModeButton(){
    const gameModeButton = document.getElementById('gameModeToggleButton');
    if (gameModeButton) {
        if(isGameModeActive){
            gameModeButton.textContent = '👻🎮 Game Mode: ON';
        }else{
            gameModeButton.textContent = '👻🎮 Game Mode: OFF';
        }
    }
}

/**
 * Pause canvas - hide overlays and clear content
 */
function pauseCanvas() {
    isCanvasHidden = true;
    
    // Clear canvas content
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (webGLtx && canvasGL) {
        webGLtx.clear(webGLtx.COLOR_BUFFER_BIT);
    }
    
    // Hide canvas elements
    if (canvas) {
        canvas.style.display = 'none';
    }
    if (canvasGL) {
        canvasGL.style.display = 'none';
    }
    
    // Stop random mode if active
    if (isRandomModeActive) {
        stopRandomMode();
    }
    
    // Save state
    saveCanvasHiddenState(true);
    
    // Update button
    updateCanvasPauseButton();
    
    if (DEBUG) console.log('Canvas paused and hidden');
}

/**
 * Resume canvas - show overlays and resume rendering
 */
function resumeCanvas() {
    isCanvasHidden = false;
    
    // Show canvas elements
    if (canvas) {
        canvas.style.display = 'block';
    }
    if (canvasGL) {
        canvasGL.style.display = 'block';
    }
    
    // Save state
    saveCanvasHiddenState(false);
    
    // Update button
    updateCanvasPauseButton();
    
    if (DEBUG) console.log('Canvas resumed and visible');
}

/**
 * Update pause button appearance
 */
function updateCanvasPauseButton() {
    const pauseButton = document.getElementById('canvasPauseButton');
    if (pauseButton) {
        if (isCanvasHidden) {
            pauseButton.textContent = '👁️ Show Effects';
            pauseButton.className = 'pdAnimButtonGreen';
        } else {
            pauseButton.textContent = '👁️ Hide Effects';
            pauseButton.className = 'pdAnimButtonRed';
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
/**
 * Try to find and create popup if it doesn't exist
 * Returns true if popup was found or created
 */
function ensurePopupExists() {
    let playerPopup = document.getElementsByClassName('posedream-video-popup');
    
    if (playerPopup && playerPopup.length > 0) {
        return true; // Popup exists
    }
    
    // Popup doesn't exist, try to create it
    if (DEBUG) console.log('[POPUP] Popup not found, attempting to create...');
    
    // Find video container with multiple fallback selectors
    let playerContainer = document.querySelector('.html5-video-container');
    if (!playerContainer) {
        playerContainer = document.querySelector('#movie_player');
    }
    if (!playerContainer) {
        playerContainer = document.querySelector('.html5-video-player');
    }
    if (!playerContainer) {
        playerContainer = document.querySelector('#player-container');
    }
    
    if (!playerContainer) {
        if (DEBUG) console.warn('[POPUP] Could not find video container');
        return false;
    }
    
    // Check if video is actually loaded
    const video = playerContainer.querySelector('video');
    if (!video || video.readyState < 2) {
        if (DEBUG) console.warn('[POPUP] Video not ready yet (readyState:', video?.readyState, ')');
        return false;
    }
    
    if (DEBUG) console.log('[POPUP] Creating popup now...');
    try {
        initButtonInPlayer(); // This creates the popup
        playerPopup = document.getElementsByClassName('posedream-video-popup');
        return playerPopup && playerPopup.length > 0;
    } catch (error) {
        console.error('[POPUP] Error creating popup:', error);
        return false;
    }
}

document.addEventListener('displayPoseDreamPopup', function (e) {
    if (DEBUG) console.log('[BUTTON CLICK] Button clicked');
    
    // Simple approach: Find or create popup, then toggle
    let popup = document.querySelector('.posedream-video-popup');
    
    // If popup doesn't exist, create it
    if (!popup) {
        if (DEBUG) console.log('[BUTTON CLICK] Popup not found, creating...');
        initVideoPlayerPopup();
        updateAnimDisabledDiv();
        updateCanvasPauseButton();
        updateGameModeButton();
        updateSelectedButton(currentAnimation);
        if (uiControlManager) {
            uiControlManager.updateAll();
        }
        popup = document.querySelector('.posedream-video-popup');
    }
    
    // Toggle popup visibility
    if (popup) {
        if (showPlayerPopup) {
            popup.style.display = 'none';
            showPlayerPopup = false;
            if (DEBUG) console.log('[BUTTON CLICK] Popup hidden');
        } else {
            popup.style.display = 'block';
            showPlayerPopup = true;
            if (DEBUG) console.log('[BUTTON CLICK] Popup shown');
        }
    } else {
        console.error('[BUTTON CLICK] Failed to create popup');
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
    
    if (DEBUG) console.log('Random mode started with interval:', randomSwitchSec);
}

/**
 * Stop random animation mode
 */
function stopRandomMode() {
    clearRandomSwitchInterval();
    isRandomModeActive = false;
    saveRandomSettings(randomSwitchSec, false);
    if (DEBUG) console.log('Random mode stopped');
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
    if (DEBUG) console.log('[VIDEO EVENT] loadeddata event triggered');
    
    // Refresh video element
    mainVideo = findCurrentVideoElement();
    
    if (!mainVideo) {
        console.error('[VIDEO EVENT] No video element found in handleVideoLoaded!');
        return;
    }
    
    if (DEBUG) console.log('[VIDEO EVENT] Video loaded:', {
        readyState: mainVideo.readyState,
        duration: mainVideo.duration,
        videoWidth: mainVideo.videoWidth,
        videoHeight: mainVideo.videoHeight
    });
    
    isVideoPlay = true;

    // Wait a bit for YouTube's player to fully initialize
    setTimeout(() => {
        if (DEBUG) console.log('[VIDEO EVENT] Creating popup and updating UI...');
        initVideoPlayerPopup();
        updateAnimDisabledDiv();
        updateCanvasPauseButton();
        updateGameModeButton();
        updateSelectedButton(currentAnimation);
        
        // Update theme UI controls after popup is created
        if (uiControlManager) {
            uiControlManager.updateAll();
        }
        
        if (DEBUG) console.log('[VIDEO EVENT] Popup and UI initialization complete');
        
        // CRITICAL FIX: Create canvas elements here (when video is loaded)
        // instead of waiting for video to start playing
        if (DEBUG) console.log('[VIDEO EVENT] Creating canvas elements...');
        
        if (document.getElementById("canvasdummy") === null) {
            if (DEBUG) console.log('[VIDEO EVENT] Creating 2D canvas...');
            createCanvas();
        }

        if (document.getElementById("canvasdummyGL") === null) {
            if (DEBUG) console.log('[VIDEO EVENT] Creating WebGL canvas...');
            createCanvasWebGL();
        }

        // Only observe if not already observing
        try {
            resizeObserver.observe(mainVideo);
        } catch(e) {
            // Already observing, ignore
        }

        // Verify canvas elements are ready
        if(!canvas || !canvasGL || !ctx || !webGLtx) {
            console.error('[VIDEO EVENT] Canvas elements not properly created!', {
                canvas: !!canvas,
                canvasGL: !!canvasGL,
                ctx: !!ctx,
                webGLtx: !!webGLtx
            });
            
            // Try to create missing elements
            if (!canvas || !ctx) {
                if (DEBUG) console.log('[VIDEO EVENT] Retrying canvas creation...');
                createCanvas();
            }
            if (!canvasGL || !webGLtx) {
                if (DEBUG) console.log('[VIDEO EVENT] Retrying WebGL canvas creation...');
                createCanvasWebGL();
            }
            
            // Check again after retry
            if(!canvas || !canvasGL || !ctx || !webGLtx) {
                console.error('[VIDEO EVENT] Failed to create canvas elements after retry!');
                return;
            }
        }
        
        // Create Anim object now that canvas is ready
        if(anim === null){
            if (DEBUG) console.log('[VIDEO EVENT] Creating new Anim object');
            anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
            
            // Apply the current animation after anim object is created
            if(currentAnimation && currentAnimation !== 'undefined') {
                if (DEBUG) console.log('[VIDEO EVENT] Applying current animation:', currentAnimation);
                anim.setNewAnimation(currentAnimation);
            } else {
                if (DEBUG) console.log('[VIDEO EVENT] No current animation set, using default: skeletonGlow');
                currentAnimation = 'skeletonGlow';
                anim.setNewAnimation(currentAnimation);
            }
        }else{
            if (DEBUG) console.log('[VIDEO EVENT] Updating existing Anim object canvas');
            anim.updateCanvas(mainVideo,canvas, canvasGL, ctx, webGLtx);
        }
        
        // Initialize FilterManager if not already created
        if(filterManager === null) {
            if (DEBUG) console.log('[VIDEO EVENT] Creating new FilterManager object');
            filterManager = new FilterManager(mainVideo, canvas, ctx);
            // Load saved filter from storage
            filterManager.loadSavedFilter();
        }
        
        if (DEBUG) console.log('[VIDEO EVENT] Canvas and animation setup complete');
    }, 500);

    // NOTE: startDetection() is still called from handleVideoPlaying() when video starts
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
    
    // If video is already loaded, trigger the handler immediately
    if (mainVideo.readyState >= 2) {
        if (DEBUG) console.log('[INIT] Video already loaded (readyState: ' + mainVideo.readyState + '), triggering handler immediately');
        // Use longer delay to ensure YouTube player is fully ready
        setTimeout(() => {
            if (DEBUG) console.log('[INIT] Executing delayed handleVideoLoaded');
            handleVideoLoaded();
        }, 1000);
    }
}

/**
 * Check resize event for video.
 * Calc new width/height and update animation object
 *
 * @type {ResizeObserver}
 */
const resizeObserver = new ResizeObserver(entries => {
    // Refresh video element to ensure we have the current one
    mainVideo = findCurrentVideoElement();
    
    if (!mainVideo) {
        if (DEBUG) console.warn('[RESIZE] No video element found during resize');
        return;
    }
    
    if (!canvas || !canvasGL || !ctx || !webGLtx) {
        if (DEBUG) console.warn('[RESIZE] Canvas elements not ready during resize');
        return;
    }
    
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
    
    // Update game mode if active
    if(gameMode && gameMode.state === 'PLAYING') {
        // Update ghost position for new canvas size
        gameMode.ghost.x = canvas.width / 2;
        gameMode.ghost.baseY = canvas.height - 100;
        // Recalculate current position based on jumps
        gameMode.ghost.y = gameMode.ghost.baseY - (gameMode.ghost.currentJump * gameMode.config.ghostJumpHeight);
        gameMode.ghost.targetY = gameMode.ghost.y;
    }

});

/**
 * Create canvas and 2d canvas context
 */
function createCanvas() {
    if (DEBUG) console.log('[CANVAS] Creating 2D canvas...');
    
    canvas = document.createElement('canvas'); // creates new canvas element
    canvas.id = 'canvasdummy'; // gives canvas id
    
    // Check if mainVideo exists and has dimensions
    if (mainVideo && mainVideo.clientHeight && mainVideo.clientWidth) {
        canvas.height = mainVideo.clientHeight;
        canvas.width = mainVideo.clientWidth;
        if (DEBUG) console.log('[CANVAS] Canvas size from video:', canvas.width, 'x', canvas.height);
    } else {
        canvas.height = 600;
        canvas.width = 600;
        if (DEBUG) console.log('[CANVAS] Using default canvas size: 600x600');
    }

    // Find video container with fallback options
    let videoContainerDIV = document.querySelector('.html5-video-container');
    
    if (!videoContainerDIV) {
        videoContainerDIV = document.querySelector('#player-container');
    }
    if (!videoContainerDIV) {
        videoContainerDIV = document.querySelector('#movie_player');
    }
    if (!videoContainerDIV && mainVideo) {
        videoContainerDIV = mainVideo.parentElement;
    }
    
    if (videoContainerDIV) {
        videoContainerDIV.appendChild(canvas);
        if (DEBUG) console.log('[CANVAS] Canvas appended to container');
    } else {
        console.error('[CANVAS] Could not find video container to append canvas!');
        return;
    }
    
    setCanvasStyle(canvas);
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (DEBUG) console.log('[CANVAS] 2D canvas created successfully');
}

/**
 * Create canvas and webGL canvas context
 */
function createCanvasWebGL() {
    if (DEBUG) console.log('[CANVAS] Creating WebGL canvas...');
    
    canvasGL = document.createElement('canvas'); // creates new canvas element
    canvasGL.id = 'canvasdummyGL'; // gives canvas id
    
    // Check if mainVideo exists and has dimensions
    if (mainVideo && mainVideo.clientHeight && mainVideo.clientWidth) {
        canvasGL.height = mainVideo.clientHeight;
        canvasGL.width = mainVideo.clientWidth;
        if (DEBUG) console.log('[CANVAS] WebGL canvas size from video:', canvasGL.width, 'x', canvasGL.height);
    } else {
        canvasGL.height = 600;
        canvasGL.width = 600;
        if (DEBUG) console.log('[CANVAS] Using default WebGL canvas size: 600x600');
    }

    // Find video container with fallback options
    let videoContainerDIV = document.querySelector('.html5-video-container');
    
    if (!videoContainerDIV) {
        videoContainerDIV = document.querySelector('#player-container');
    }
    if (!videoContainerDIV) {
        videoContainerDIV = document.querySelector('#movie_player');
    }
    if (!videoContainerDIV && mainVideo) {
        videoContainerDIV = mainVideo.parentElement;
    }
    
    if (videoContainerDIV) {
        videoContainerDIV.appendChild(canvasGL);
        if (DEBUG) console.log('[CANVAS] WebGL canvas appended to container');
    } else {
        console.error('[CANVAS] Could not find video container to append WebGL canvas!');
        return;
    }
    
    setCanvasStyle(canvasGL);
    
    // Try to get WebGL context with fallbacks
    webGLtx = canvasGL.getContext("webgl") || 
              canvasGL.getContext("experimental-webgl") ||
              canvasGL.getContext("webgl2");
    
    if (!webGLtx) {
        console.warn('[CANVAS] WebGL not available, particle animations may not work');
    } else {
        if (DEBUG) console.log('[CANVAS] WebGL context created successfully');
    }
}

/**
 * Handler for onplaying event
 */
function handleVideoPlaying(event) {
    if (DEBUG) console.log('[VIDEO EVENT] ========================================');
    if (DEBUG) console.log('[VIDEO EVENT] onplaying event triggered');
    
    // Set video play flag
    isVideoPlay = true;
    
    // Refresh video element to ensure we have the current one
    mainVideo = findCurrentVideoElement();
    
    if (!mainVideo) {
        console.error('[VIDEO EVENT] No video element found in handleVideoPlaying!');
        return;
    }
    
    if (DEBUG) console.log('[VIDEO EVENT] Video status:', {
        readyState: mainVideo.readyState,
        paused: mainVideo.paused,
        currentTime: mainVideo.currentTime,
        videoWidth: mainVideo.videoWidth,
        videoHeight: mainVideo.videoHeight
    });
    
    // Canvas should already be created in handleVideoLoaded
    // But create it here as fallback if it doesn't exist
    if (document.getElementById("canvasdummy") === null) {
        if (DEBUG) console.log('[VIDEO EVENT] Canvas missing, creating 2D canvas as fallback...');
        createCanvas();
    }

    if (document.getElementById("canvasdummyGL") === null) {
        if (DEBUG) console.log('[VIDEO EVENT] Canvas missing, creating WebGL canvas as fallback...');
        createCanvasWebGL();
    }

    // Verify canvas elements are ready
    if(!canvas || !canvasGL || !ctx || !webGLtx) {
        console.error('[VIDEO EVENT] Canvas elements not ready in handleVideoPlaying!', {
            canvas: !!canvas,
            canvasGL: !!canvasGL,
            ctx: !!ctx,
            webGLtx: !!webGLtx
        });
        return;
    }
    
    // Anim object should already be created in handleVideoLoaded
    // But create it here as fallback if it doesn't exist
    if(anim === null){
        if (DEBUG) console.log('[VIDEO EVENT] Anim missing, creating as fallback...');
        anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
        
        // Apply the current animation after anim object is created
        if(currentAnimation && currentAnimation !== 'undefined') {
            if (DEBUG) console.log('[VIDEO EVENT] Applying current animation:', currentAnimation);
            anim.setNewAnimation(currentAnimation);
        } else {
            if (DEBUG) console.log('[VIDEO EVENT] No current animation set, using default: skeletonGlow');
            currentAnimation = 'skeletonGlow';
            anim.setNewAnimation(currentAnimation);
        }
    }
    
    // Start detection loop now that video is playing
    if(isRequestAnimationFrame==false){
        isRequestAnimationFrame=true;
        if (DEBUG) console.log('[VIDEO EVENT] Starting detection loop from handleVideoPlaying');
        startDetection();
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
    
    // If video is already playing, trigger the handler immediately
    if (!mainVideo.paused && mainVideo.readyState >= 2) {
        if (DEBUG) console.log('[INIT] Video already playing (paused: ' + mainVideo.paused + ', readyState: ' + mainVideo.readyState + '), triggering handler immediately');
        // Use longer delay to ensure YouTube player is fully ready
        setTimeout(() => {
            if (DEBUG) console.log('[INIT] Executing delayed handleVideoPlaying');
            handleVideoPlaying();
        }, 1000);
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
    tmpCanvas.style.left = "0px";
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
                            if (DEBUG) console.log('Halloween button added to player controls');
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

function saveCanvasHiddenState(value){
    chrome.storage.sync.set({isCanvasHidden: value}, function() {
        if (DEBUG) console.log('Canvas hidden state saved:', value);
    });
}

function readCanvasHiddenState(){
    chrome.storage.sync.get(['isCanvasHidden'], function (result) {
        isCanvasHidden = result.isCanvasHidden || false;
        if (DEBUG) console.log('Canvas hidden state loaded:', isCanvasHidden);
        
        // Apply state if canvas exists
        if (isCanvasHidden && canvas && canvasGL) {
            canvas.style.display = 'none';
            canvasGL.style.display = 'none';
            if (DEBUG) console.log('Applied hidden state to canvas elements');
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
            if (DEBUG) console.log('No saved animation found, using default: skeletonGlow');
        }else {
            currentAnimation = currentAnim;
            if (DEBUG) console.log('Loaded saved animation:', currentAnimation);
        }
        
        // If anim object exists, apply the loaded animation
        if(anim !== null) {
            if (DEBUG) console.log('Applying loaded animation to anim object:', currentAnimation);
            anim.setNewAnimation(currentAnimation);
        }
    });
}

function saveRandomSettings(interval, isActive){
    chrome.storage.sync.set({
        randomSwitchSec: interval,
        isRandomModeActive: isActive
    }, function() {
        if (DEBUG) console.log('Random settings saved:', interval, 'sec, active:', isActive);
    });
}

function readRandomSettings(){
    chrome.storage.sync.get(['randomSwitchSec', 'isRandomModeActive'], function (result) {
        if(result.randomSwitchSec !== undefined){
            randomSwitchSec = result.randomSwitchSec;
            if (DEBUG) console.log('Loaded random interval:', randomSwitchSec);
            
            // Update UI if button exists
            const randomButton = document.getElementById("randomButton");
            if (randomButton) {
                randomButton.innerText = "Randomly change every " + randomSwitchSec + "s";
            }
        }
        
        if(result.isRandomModeActive === true){
            isRandomModeActive = true;
            if (DEBUG) console.log('Random mode was active, restarting...');
            // Restart random mode
            startRandomMode();
        }
    });
}

/**
 * Load game mode state from storage
 */
function readGameModeState(){
    chrome.storage.sync.get(['gameModeActive'], function (result) {
        if(result.gameModeActive === true){
            isGameModeActive = true;
            if (DEBUG) console.log('[GAME MODE] Game mode was active, restoring...');
            if (DEBUG) console.log('[GAME MODE] Canvas ready:', !!canvas, 'Ctx ready:', !!ctx);
            
            // Initialize and activate if canvas is ready
            if (canvas && ctx) {
                if (!gameMode) {
                    if (DEBUG) console.log('[GAME MODE] Creating GameMode instance from saved state');
                    gameMode = new GameMode(canvas, ctx);
                }
                if (gameMode) {
                    if (DEBUG) console.log('[GAME MODE] Activating game mode from saved state');
                    gameMode.activate();
                    stopRandomMode();
                    isAnimDisabled = true;
                }
            }
            
            updateGameModeButton();
            updateAnimDisabledDiv();
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
        if (DEBUG) console.log('Particle overlay created with', this.PARTICLE_COUNT, 'particles');
    }
    
    /**
     * Remove particle overlay from DOM
     */
    static removeOverlay() {
        const existing = document.getElementById(this.OVERLAY_ID);
        if (existing) {
            existing.remove();
            if (DEBUG) console.log('Particle overlay removed');
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
            
            if (DEBUG) console.log('Theme settings loaded:', this.state);
            
            // Apply loaded settings
            if (this.state.enabled) {
                this.applyTheme();
            }
            if (this.state.particlesEnabled) {
                ParticleManager.createOverlay();
            }
        } catch (error) {
            if (DEBUG) console.warn('Failed to load theme settings:', error);
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
        if (DEBUG) console.log('Theme applied:', themeClass, 'with intensity:', this.state.intensity);
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
        if (DEBUG) console.log('Theme removed');
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
            if (DEBUG) console.warn('Invalid intensity level:', level);
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
        
        if (DEBUG) console.log('Theme intensity set to:', level);
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
            if (DEBUG) console.warn('Invalid color theme:', themeName);
            return;
        }
        
        if (DEBUG) console.log('setColorTheme called:', themeName, 'enabled:', this.state.enabled);
        
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
            if (DEBUG) console.log('Adding theme class:', themeClass);
            document.body.classList.add(themeClass);
            // Re-apply intensity
            document.body.classList.add(`theme-intensity-${this.state.intensity}`);
            if (DEBUG) console.log('Body classes after add:', document.body.className);
        } else {
            if (DEBUG) console.log('Theme not enabled, not applying class');
        }
        
        if (DEBUG) console.log('Color theme set to:', themeName);
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
            if (DEBUG) console.log('Theme state saved:', this.state);
        } catch (error) {
            if (DEBUG) console.warn('Failed to save theme state:', error);
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
        if (DEBUG) console.log('ThemeStateManager initialized');
    }
    
    // Create UI control manager
    if (uiControlManager === null) {
        uiControlManager = new UIControlManager(themeStateManager);
        if (DEBUG) console.log('UIControlManager initialized');
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
