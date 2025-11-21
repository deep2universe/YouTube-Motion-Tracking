// Test Video Selection Logic
// Run this in console to see which video would be selected

console.log('=== VIDEO SELECTION TEST ===\n');

const videos = document.querySelectorAll('video.html5-main-video');
console.log(`Found ${videos.length} video elements\n`);

videos.forEach((video, index) => {
    let score = 0;
    const details = {
        index: index,
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime.toFixed(2),
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        src: video.src.substring(0, 50)
    };
    
    // Score calculation (same as extension)
    if (!video.paused && video.currentTime > 0) score += 1000;
    if (video.videoWidth > 0 && video.videoHeight > 0) score += 100;
    if (video.readyState >= 2) score += 50;
    if (!isNaN(video.duration) && video.duration > 0) score += 25;
    if (video.currentTime > 0) score += 10;
    score += index;
    
    console.log(`Video ${index}:`, details);
    console.log(`  Score: ${score}`);
    console.log(`  Is playing: ${!video.paused && video.currentTime > 0}`);
    console.log('');
});

// Find best video
let bestVideo = null;
let bestScore = -1;
let bestIndex = -1;

videos.forEach((video, index) => {
    let score = 0;
    if (!video.paused && video.currentTime > 0) score += 1000;
    if (video.videoWidth > 0 && video.videoHeight > 0) score += 100;
    if (video.readyState >= 2) score += 50;
    if (!isNaN(video.duration) && video.duration > 0) score += 25;
    if (video.currentTime > 0) score += 10;
    score += index;
    
    if (score > bestScore) {
        bestScore = score;
        bestVideo = video;
        bestIndex = index;
    }
});

console.log(`\n✓ SELECTED: Video ${bestIndex} with score ${bestScore}`);
console.log('This is the video the extension will use.');
