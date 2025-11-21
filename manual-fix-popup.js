// ============================================
// Manual Fix for Missing Popup
// Run this if popup doesn't appear after video switch
// ============================================

console.log('=== MANUAL POPUP FIX ===\n');

// Check current state
const popup = document.querySelector('.posedream-video-popup');
const button = document.getElementById('pose_art');

if (!popup) {
    console.log('❌ Popup does not exist in DOM');
    console.log('This means handleVideoLoaded() was not called.');
    console.log('\nAttempting to trigger initialization...\n');
    
    // Try to trigger the button click event which should initialize everything
    if (button) {
        console.log('Clicking extension button...');
        button.click();
        
        setTimeout(() => {
            const newPopup = document.querySelector('.posedream-video-popup');
            if (newPopup) {
                console.log('✓ Popup created successfully!');
                newPopup.style.display = 'block';
                console.log('✓ Popup is now visible');
            } else {
                console.log('✗ Popup still not created');
                console.log('\nManual creation required. Run this:');
                console.log('// Reload the page or extension');
            }
        }, 1500);
    } else {
        console.log('✗ Extension button not found');
        console.log('Extension may not be loaded properly');
    }
} else {
    console.log('✓ Popup exists in DOM');
    
    const currentDisplay = window.getComputedStyle(popup).display;
    console.log(`Current display: ${currentDisplay}`);
    
    if (currentDisplay === 'none') {
        console.log('\nShowing popup...');
        popup.style.display = 'block';
        console.log('✓ Popup is now visible');
    } else {
        console.log('✓ Popup is already visible');
    }
}

console.log('\n=== FIX COMPLETE ===');
