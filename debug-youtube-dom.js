// ============================================
// YouTube DOM Debug Script
// Copy and paste this into the browser console on a YouTube video page
// ============================================

console.log('=== YouTube DOM Debug Script ===');
console.log('');

// 1. Find all video elements
console.log('1. VIDEO ELEMENTS:');
const allVideos = document.querySelectorAll('video');
console.log(`   Total video elements found: ${allVideos.length}`);
allVideos.forEach((video, index) => {
    console.log(`   Video ${index + 1}:`, {
        className: video.className,
        id: video.id,
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime.toFixed(2),
        duration: video.duration.toFixed(2),
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        src: video.src.substring(0, 50) + '...'
    });
});

// 2. Find video containers
console.log('');
console.log('2. VIDEO CONTAINERS:');
const containers = [
    '.html5-video-container',
    '.html5-video-player',
    '#movie_player',
    '#player-container',
    '#player'
];
containers.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`   ${selector}: ${elements.length} found`);
    if (elements.length > 0) {
        console.log(`      First element:`, elements[0]);
    }
});

// 3. Find player controls
console.log('');
console.log('3. PLAYER CONTROLS:');
const controls = [
    '.ytp-right-controls',
    '.ytp-chrome-controls',
    '.ytp-left-controls'
];
controls.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`   ${selector}: ${elements.length} found`);
});

// 4. Check for extension elements
console.log('');
console.log('4. EXTENSION ELEMENTS:');
console.log(`   Extension button (#pose_art): ${document.getElementById('pose_art') ? 'EXISTS' : 'NOT FOUND'}`);
console.log(`   2D Canvas (#canvasdummy): ${document.getElementById('canvasdummy') ? 'EXISTS' : 'NOT FOUND'}`);
console.log(`   WebGL Canvas (#canvasdummyGL): ${document.getElementById('canvasdummyGL') ? 'EXISTS' : 'NOT FOUND'}`);
console.log(`   Popup (.posedream-video-popup): ${document.querySelector('.posedream-video-popup') ? 'EXISTS' : 'NOT FOUND'}`);

// 5. Test video finding logic
console.log('');
console.log('5. VIDEO FINDING TEST:');
const selectors = [
    'video.html5-main-video',
    'video.video-stream',
    '.html5-video-player video',
    '#movie_player video',
    'video'
];

let foundVideo = null;
for (const selector of selectors) {
    const videos = document.querySelectorAll(selector);
    if (videos.length > 0) {
        foundVideo = videos[videos.length - 1];
        console.log(`   ✓ Found with selector: "${selector}"`);
        console.log(`     Total matches: ${videos.length}`);
        console.log(`     Using last video (index ${videos.length - 1})`);
        break;
    } else {
        console.log(`   ✗ Not found: "${selector}"`);
    }
}

if (foundVideo) {
    console.log('');
    console.log('   Selected video details:');
    console.log(`     readyState: ${foundVideo.readyState} (0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA)`);
    console.log(`     paused: ${foundVideo.paused}`);
    console.log(`     currentTime: ${foundVideo.currentTime.toFixed(2)}s`);
    console.log(`     duration: ${foundVideo.duration.toFixed(2)}s`);
    console.log(`     videoWidth: ${foundVideo.videoWidth}px`);
    console.log(`     videoHeight: ${foundVideo.videoHeight}px`);
    console.log(`     Is actually playing: ${!foundVideo.paused && foundVideo.currentTime > 0 && foundVideo.duration > 0}`);
} else {
    console.log('   ✗ NO VIDEO FOUND!');
}

// 6. Check for old videoCollection variable
console.log('');
console.log('6. LEGACY VARIABLES:');
try {
    console.log(`   videoCollection: ${typeof videoCollection !== 'undefined' ? videoCollection : 'undefined'}`);
} catch (e) {
    console.log(`   videoCollection: undefined (not in scope)`);
}

// 7. Page info
console.log('');
console.log('7. PAGE INFO:');
console.log(`   URL: ${window.location.href}`);
console.log(`   Is watch page: ${window.location.href.includes('/watch')}`);
console.log(`   Video ID: ${new URLSearchParams(window.location.search).get('v')}`);

console.log('');
console.log('=== Debug Script Complete ===');
console.log('Copy the output above and share it for analysis.');
