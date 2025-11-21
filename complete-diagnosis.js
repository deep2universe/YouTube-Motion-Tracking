// ============================================
// COMPLETE DIAGNOSIS - Run after video switch
// ============================================

console.clear();
console.log('%c=== COMPLETE EXTENSION DIAGNOSIS ===', 'font-size: 16px; font-weight: bold; color: #ff6600');
console.log('Run this after switching to a new video\n');

// Helper function
function checkElement(name, element) {
    if (element) {
        console.log(`%c✓ ${name}`, 'color: green', element);
        return true;
    } else {
        console.log(`%c✗ ${name}`, 'color: red', 'MISSING');
        return false;
    }
}

// 1. Extension Elements
console.log('%c1. EXTENSION ELEMENTS', 'font-weight: bold; font-size: 14px');
const button = document.getElementById('pose_art');
const canvas2D = document.getElementById('canvasdummy');
const canvasGL = document.getElementById('canvasdummyGL');
const popup = document.querySelector('.posedream-video-popup');

const hasButton = checkElement('Extension Button (#pose_art)', button);
const hasCanvas2D = checkElement('Canvas 2D (#canvasdummy)', canvas2D);
const hasCanvasGL = checkElement('Canvas WebGL (#canvasdummyGL)', canvasGL);
const hasPopup = checkElement('Popup (.posedream-video-popup)', popup);

if (popup) {
    const display = window.getComputedStyle(popup).display;
    console.log(`   Popup display: ${display}`);
    if (display === 'none') {
        console.log('%c   ⚠️ Popup is hidden!', 'color: orange');
    }
}

// 2. Video Elements
console.log('\n%c2. VIDEO ELEMENTS', 'font-weight: bold; font-size: 14px');
const videos = document.querySelectorAll('video.html5-main-video');
console.log(`Found ${videos.length} video element(s)`);

let playingVideo = null;
videos.forEach((video, index) => {
    const isPlaying = !video.paused && video.currentTime > 0;
    const score = (isPlaying ? 1000 : 0) + 
                  (video.videoWidth > 0 ? 100 : 0) + 
                  (video.readyState >= 2 ? 50 : 0);
    
    console.log(`\nVideo ${index} (score: ${score}):`, {
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime.toFixed(2),
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        isPlaying: isPlaying
    });
    
    if (isPlaying) playingVideo = video;
});

// 3. Event Listeners Check
console.log('\n%c3. EVENT LISTENERS', 'font-weight: bold; font-size: 14px');
if (playingVideo) {
    console.log('✓ Playing video found');
    console.log('   Checking if event listeners are attached...');
    
    // We can't directly check event listeners, but we can check if handlers would work
    console.log('   Note: Cannot directly inspect event listeners from console');
    console.log('   Check console for [VIDEO EVENT] messages when video plays');
} else {
    console.log('✗ No playing video found');
}

// 4. Canvas Parent Check
console.log('\n%c4. CANVAS PLACEMENT', 'font-weight: bold; font-size: 14px');
if (canvas2D) {
    const parent = canvas2D.parentElement;
    console.log('Canvas 2D parent:', parent?.className || 'NO PARENT');
    
    if (playingVideo) {
        const videoParent = playingVideo.parentElement;
        const sameParent = parent === videoParent;
        console.log('Same parent as video:', sameParent ? '✓ YES' : '✗ NO');
        
        if (!sameParent) {
            console.log('%c⚠️ Canvas is not in same container as video!', 'color: orange');
            console.log('   This means canvas is attached to old video container');
        }
    }
}

// 5. Popup Parent Check
console.log('\n%c5. POPUP PLACEMENT', 'font-weight: bold; font-size: 14px');
if (popup) {
    const parent = popup.parentElement;
    console.log('Popup parent:', parent?.className || 'NO PARENT');
    
    const playerContainer = document.querySelector('.html5-video-player');
    if (playerContainer) {
        const isInPlayer = playerContainer.contains(popup);
        console.log('Inside video player:', isInPlayer ? '✓ YES' : '✗ NO');
        
        if (!isInPlayer) {
            console.log('%c⚠️ Popup is not in video player!', 'color: orange');
            console.log('   This means popup is attached to old player');
        }
    }
}

// 6. Animation State
console.log('\n%c6. ANIMATION STATE', 'font-weight: bold; font-size: 14px');
if (canvas2D) {
    try {
        const ctx = canvas2D.getContext('2d');
        const imageData = ctx.getImageData(canvas2D.width / 2, canvas2D.height / 2, 1, 1);
        const hasContent = imageData.data.some(v => v !== 0);
        console.log('Canvas has content:', hasContent ? '✓ YES (animations running)' : '✗ NO (blank)');
    } catch (e) {
        console.log('Cannot check canvas content:', e.message);
    }
}

// 7. Problem Summary
console.log('\n%c7. PROBLEM SUMMARY', 'font-weight: bold; font-size: 14px; color: #ff6600');

const problems = [];
const solutions = [];

if (!hasPopup) {
    problems.push('Popup is missing from DOM');
    solutions.push('handleVideoLoaded() was not called');
    solutions.push('Run: document.getElementById("pose_art").click()');
} else if (popup && window.getComputedStyle(popup).display === 'none') {
    problems.push('Popup exists but is hidden');
    solutions.push('Click the extension button to toggle');
    solutions.push('Or run: document.querySelector(".posedream-video-popup").style.display = "block"');
}

if (!hasCanvas2D || !hasCanvasGL) {
    problems.push('Canvas elements are missing');
    solutions.push('handleVideoPlaying() was not called');
}

if (canvas2D && playingVideo) {
    const canvasParent = canvas2D.parentElement;
    const videoParent = playingVideo.parentElement;
    if (canvasParent !== videoParent) {
        problems.push('Canvas is attached to wrong video container');
        solutions.push('cleanup() did not remove old canvas');
        solutions.push('Or new canvas was not created for new video');
    }
}

if (problems.length === 0) {
    console.log('%c✓ No problems detected!', 'color: green; font-weight: bold');
    console.log('Extension should be working correctly.');
} else {
    console.log('%cProblems found:', 'color: red; font-weight: bold');
    problems.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));
    
    console.log('\n%cPossible solutions:', 'color: blue; font-weight: bold');
    solutions.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
}

// 8. Quick Fixes
console.log('\n%c8. QUICK FIXES', 'font-weight: bold; font-size: 14px; color: #0066ff');
console.log('Copy and run these commands:\n');

if (!hasPopup) {
    console.log('// Create popup by clicking button:');
    console.log('document.getElementById("pose_art").click();');
} else if (popup && window.getComputedStyle(popup).display === 'none') {
    console.log('// Show hidden popup:');
    console.log('document.querySelector(".posedream-video-popup").style.display = "block";');
}

console.log('\n// Force re-initialization:');
console.log('location.reload();');

console.log('\n%c=== END DIAGNOSIS ===', 'font-weight: bold; font-size: 16px');
