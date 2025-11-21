// ============================================
// Video Switch Diagnosis Script
// Run this after switching to a new video where panel doesn't appear
// ============================================

console.log('=== VIDEO SWITCH DIAGNOSIS ===\n');

// 1. Check all extension elements
console.log('1. EXTENSION ELEMENTS:');
const button = document.getElementById('pose_art');
const canvas2D = document.getElementById('canvasdummy');
const canvasGL = document.getElementById('canvasdummyGL');
const popup = document.querySelector('.posedream-video-popup');

console.log('   Button:', button ? '✓ EXISTS' : '✗ MISSING');
console.log('   Canvas 2D:', canvas2D ? '✓ EXISTS' : '✗ MISSING');
console.log('   Canvas WebGL:', canvasGL ? '✓ EXISTS' : '✗ MISSING');
console.log('   Popup:', popup ? '✓ EXISTS' : '✗ MISSING');

if (popup) {
    console.log('   Popup display:', window.getComputedStyle(popup).display);
    console.log('   Popup visibility:', window.getComputedStyle(popup).visibility);
    console.log('   Popup parent:', popup.parentElement?.className);
}

// 2. Check video elements
console.log('\n2. VIDEO ELEMENTS:');
const videos = document.querySelectorAll('video.html5-main-video');
console.log(`   Total videos found: ${videos.length}`);

videos.forEach((video, index) => {
    const isPlaying = !video.paused && video.currentTime > 0;
    console.log(`\n   Video ${index}:`, {
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime.toFixed(2),
        duration: video.duration.toFixed(2),
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        isPlaying: isPlaying,
        hasCanvas: video.parentElement?.querySelector('#canvasdummy') ? 'YES' : 'NO'
    });
});

// 3. Check canvas positions
console.log('\n3. CANVAS POSITIONS:');
if (canvas2D) {
    const rect = canvas2D.getBoundingClientRect();
    console.log('   Canvas 2D:', {
        width: canvas2D.width,
        height: canvas2D.height,
        display: window.getComputedStyle(canvas2D).display,
        position: window.getComputedStyle(canvas2D).position,
        top: rect.top,
        left: rect.left,
        parent: canvas2D.parentElement?.className
    });
}

if (canvasGL) {
    const rect = canvasGL.getBoundingClientRect();
    console.log('   Canvas WebGL:', {
        width: canvasGL.width,
        height: canvasGL.height,
        display: window.getComputedStyle(canvasGL).display,
        position: window.getComputedStyle(canvasGL).position,
        top: rect.top,
        left: rect.left,
        parent: canvasGL.parentElement?.className
    });
}

// 4. Check player containers
console.log('\n4. PLAYER CONTAINERS:');
const containers = [
    '.html5-video-player',
    '.html5-video-container',
    '#movie_player',
    '#player-container'
];

containers.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`   ${selector}: ${elements.length} found`);
    if (elements.length > 0) {
        const hasPopup = elements[0].querySelector('.posedream-video-popup');
        const hasCanvas = elements[0].querySelector('#canvasdummy');
        console.log(`      - Has popup: ${hasPopup ? 'YES' : 'NO'}`);
        console.log(`      - Has canvas: ${hasCanvas ? 'YES' : 'NO'}`);
    }
});

// 5. Check button functionality
console.log('\n5. BUTTON CHECK:');
if (button) {
    console.log('   Button onclick:', button.onclick ? 'SET' : 'NOT SET');
    console.log('   Button parent:', button.parentElement?.className);
    console.log('   Button visible:', window.getComputedStyle(button).display !== 'none');
    
    // Test button click
    console.log('\n   Testing button click...');
    try {
        button.click();
        console.log('   ✓ Button clicked successfully');
        
        setTimeout(() => {
            const popupAfterClick = document.querySelector('.posedream-video-popup');
            if (popupAfterClick) {
                console.log('   ✓ Popup exists after click');
                console.log('   Popup display:', window.getComputedStyle(popupAfterClick).display);
            } else {
                console.log('   ✗ Popup still missing after click');
            }
        }, 1000);
    } catch (e) {
        console.log('   ✗ Button click failed:', e.message);
    }
}

// 6. Check for multiple popups (cleanup issue)
console.log('\n6. DUPLICATE CHECK:');
const allPopups = document.querySelectorAll('.posedream-video-popup');
console.log(`   Total popups in DOM: ${allPopups.length}`);
if (allPopups.length > 1) {
    console.log('   ⚠️ WARNING: Multiple popups found! Cleanup may have failed.');
    allPopups.forEach((p, i) => {
        console.log(`   Popup ${i}:`, {
            display: window.getComputedStyle(p).display,
            parent: p.parentElement?.className
        });
    });
}

// 7. Check animation state
console.log('\n7. ANIMATION STATE:');
console.log('   Check if animations are running by looking at canvas content');
if (canvas2D) {
    const ctx = canvas2D.getContext('2d');
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const hasContent = imageData.data.some(v => v !== 0);
    console.log('   Canvas has content:', hasContent ? 'YES (animations running)' : 'NO (blank)');
}

// 8. Recommendations
console.log('\n8. DIAGNOSIS:');
if (!popup) {
    console.log('   ❌ PROBLEM: Popup is missing');
    console.log('   CAUSE: Popup was not created for new video');
    console.log('   FIX: handleVideoLoaded() may not have been called');
} else if (popup && window.getComputedStyle(popup).display === 'none') {
    console.log('   ⚠️ PROBLEM: Popup exists but is hidden');
    console.log('   CAUSE: Popup display is set to "none"');
    console.log('   FIX: Click button to toggle display');
} else {
    console.log('   ✓ Popup should be visible');
}

if (canvas2D && canvasGL) {
    console.log('   ✓ Canvas elements exist (animations can run)');
} else {
    console.log('   ❌ Canvas elements missing (animations cannot run)');
}

console.log('\n=== END DIAGNOSIS ===');
console.log('\nTo manually show popup, run:');
console.log('document.querySelector(".posedream-video-popup").style.display = "block";');
