// Quick Debug - Run this in console
console.log('=== QUICK DEBUG ===');
console.log('1. Video element:', document.querySelector('video'));
console.log('2. Canvas 2D:', document.getElementById('canvasdummy'));
console.log('3. Canvas WebGL:', document.getElementById('canvasdummyGL'));
console.log('4. Popup:', document.querySelector('.posedream-video-popup'));
console.log('5. Extension button:', document.getElementById('pose_art'));

const video = document.querySelector('video');
if (video) {
    console.log('6. Video details:', {
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
    });
}

// Check if animations are disabled
console.log('7. Check button states in popup');
const animButton = document.getElementById('animDisabledDiv');
if (animButton) {
    console.log('   Animation button class:', animButton.className);
    console.log('   (Green = enabled, Red = disabled)');
}
