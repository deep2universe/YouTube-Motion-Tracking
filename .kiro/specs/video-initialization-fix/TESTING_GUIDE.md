# Testing Guide - Video Initialization Fix

## 🎯 Purpose
This guide helps you test the video initialization fixes to ensure the extension works reliably in all scenarios.

## 🔧 Setup

### 1. Enable Debug Mode
Open `src/content.js` and set:
```javascript
const DEBUG = true;  // Line ~17
```

### 2. Rebuild Extension
```bash
npm run build:parcel
```

### 3. Reload Extension in Chrome
1. Go to `chrome://extensions/`
2. Find "YouTube Motion Tracking"
3. Click the reload icon 🔄

## 🧪 Test Scenarios

### ✅ Test 1: Fresh Page Load
**Steps:**
1. Open a new tab
2. Navigate to any YouTube video (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
3. Wait for video to start playing
4. Open DevTools Console (F12)
5. Click the extension button (🎃 icon) in the player

**Expected Results:**
- ✅ Console shows: `[BUTTON CLICK] Step 1: Refreshing video element...`
- ✅ Console shows: `[VIDEO SEARCH] Video element found`
- ✅ Console shows: `[BUTTON CLICK] SUCCESS! Popup toggled.`
- ✅ Popup appears with animation controls
- ✅ Skeleton animation starts on video
- ✅ No errors in console

**If it fails:**
- Check console for `[VIDEO WAIT]` messages
- Look for error messages
- Verify video is actually playing

---

### ✅ Test 2: Button Click While Video Loading
**Steps:**
1. Open YouTube video
2. **Immediately** click extension button (before video starts)
3. Watch console logs

**Expected Results:**
- ✅ Console shows: `[VIDEO WAIT] Attempt 1/10 - Waiting for video...`
- ✅ Console shows retry attempts with increasing delays
- ✅ Console shows: `[VIDEO WAIT] Video is ready! Executing callback...`
- ✅ Popup appears after video is ready
- ✅ Animations start

**If it fails:**
- Check if video element was found: `[VIDEO SEARCH]`
- Check retry attempts: `[VIDEO WAIT]`
- Verify max attempts not exceeded

---

### ✅ Test 3: Video Already Playing
**Steps:**
1. Open YouTube video
2. Let it play for 10+ seconds
3. Click extension button

**Expected Results:**
- ✅ Popup appears immediately (< 1 second)
- ✅ Console shows: `[BUTTON CLICK] Step 5: System ready, toggling popup`
- ✅ Animations start immediately
- ✅ No wait/retry messages

---

### ✅ Test 4: Multiple Rapid Clicks
**Steps:**
1. Open YouTube video
2. Click extension button 5 times rapidly
3. Watch console and popup behavior

**Expected Results:**
- ✅ Popup toggles on/off correctly
- ✅ No errors in console
- ✅ No duplicate popups created
- ✅ Animations continue working

---

### ✅ Test 5: Video Switching
**Steps:**
1. Open YouTube video with extension active
2. Animations are running
3. Click to next video (or use autoplay)
4. Wait for new video to load
5. Click extension button on new video

**Expected Results:**
- ✅ Old canvas/popup cleaned up
- ✅ New video element found: `[VIDEO SEARCH]`
- ✅ New popup created
- ✅ Animations work on new video
- ✅ No references to old video

---

### ✅ Test 6: Slow Network Simulation
**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Navigate to YouTube video
5. Click extension button while video is buffering

**Expected Results:**
- ✅ Console shows: `[VIDEO WAIT]` messages
- ✅ Extension waits patiently (up to 10 attempts)
- ✅ Popup appears when video is ready
- ✅ Animations start when video plays
- ✅ No timeout errors

---

### ✅ Test 7: ReadyState === 0 Scenario
**Steps:**
1. Open YouTube video
2. Open console
3. Check video readyState: `document.querySelector('video').readyState`
4. If readyState is 0, click extension button immediately

**Expected Results:**
- ✅ Console shows: `[VIDEO CHECK] Video is actually playing (alternative check passed)`
- ✅ Extension uses alternative checks (`!paused`, `currentTime > 0`)
- ✅ Popup appears despite readyState === 0
- ✅ Animations work

---

### ✅ Test 8: Popup Already Exists
**Steps:**
1. Open YouTube video
2. Click extension button (popup appears)
3. Click button again (popup hides)
4. Click button again (popup appears)
5. Repeat 5 times

**Expected Results:**
- ✅ Popup toggles correctly each time
- ✅ No duplicate popups created
- ✅ Console shows: `[BUTTON CLICK] Step 5: System ready, toggling popup`
- ✅ Animations continue working

---

### ✅ Test 9: Canvas Missing Scenario
**Steps:**
1. Open YouTube video
2. Open console
3. Delete canvas: `document.getElementById('canvasdummy').remove()`
4. Click extension button

**Expected Results:**
- ✅ Console shows: `[BUTTON CLICK] Creating canvas elements...`
- ✅ New canvas created
- ✅ Popup appears
- ✅ Animations work

---

### ✅ Test 10: Different YouTube Pages
**Steps:**
Test on these YouTube page types:
1. Regular video: `youtube.com/watch?v=...`
2. Embedded video: `youtube.com/embed/...`
3. Shorts: `youtube.com/shorts/...`
4. Live stream: `youtube.com/watch?v=... (live)`

**Expected Results:**
- ✅ Extension works on all page types
- ✅ Video element found correctly
- ✅ Animations work
- ✅ No errors

---

## 📊 Console Log Analysis

### Successful Initialization:
```
[BUTTON CLICK] ========================================
[BUTTON CLICK] displayPoseDreamPopup event triggered
[BUTTON CLICK] Step 1: Refreshing video element...
[VIDEO SEARCH] Searching for current video element...
[VIDEO SEARCH] Found 1 video(s) with selector: video.html5-main-video
[VIDEO SEARCH] Video element found: {readyState: 4, paused: false, currentTime: 5.2, ...}
[BUTTON CLICK] Step 2: Video status check: {readyState: 4, paused: false, ...}
[BUTTON CLICK] Step 3: System check: {canvas: true, canvasGL: true, ...}
[BUTTON CLICK] Step 5: System ready, toggling popup
[BUTTON CLICK] ========================================
```

### Initialization with Wait:
```
[BUTTON CLICK] displayPoseDreamPopup event triggered
[BUTTON CLICK] Step 1: Refreshing video element...
[VIDEO SEARCH] Video element found: {readyState: 0, paused: true, ...}
[BUTTON CLICK] Step 2: Video status check: {readyState: 0, paused: true, videoReady: false}
[BUTTON CLICK] Video not ready, waiting...
[VIDEO WAIT] Attempt 1/10 - Waiting for video...
[VIDEO WAIT] Video not ready (readyState: 0), retrying in 100ms...
[VIDEO WAIT] Attempt 2/10 - Waiting for video...
[VIDEO WAIT] Video not ready (readyState: 1), retrying in 150ms...
[VIDEO WAIT] Attempt 3/10 - Waiting for video...
[VIDEO WAIT] Video is ready! Executing callback...
[BUTTON CLICK] displayPoseDreamPopup event triggered
[BUTTON CLICK] SUCCESS! Popup toggled.
```

### Alternative Check Success:
```
[BUTTON CLICK] Step 2: Video status check: {readyState: 0, paused: false, currentTime: 3.5, ...}
[VIDEO CHECK] Video is actually playing (alternative check passed)
[BUTTON CLICK] Step 3: System check: {...}
[BUTTON CLICK] Step 5: System ready, toggling popup
```

## 🚨 Common Issues & Solutions

### Issue 1: "Video not found"
**Symptoms:** Console shows `[VIDEO SEARCH] No video elements found!`

**Solutions:**
1. Check if you're on a YouTube watch page
2. Wait for page to fully load
3. Check if YouTube changed their DOM structure
4. Try refreshing the page

### Issue 2: "Video not ready after 10 attempts"
**Symptoms:** Console shows `[VIDEO WAIT] Failed to find video after 10 attempts`

**Solutions:**
1. Check network connection
2. Verify video is actually loading
3. Try a different video
4. Increase `maxAttempts` in `waitForVideoReady()`

### Issue 3: "Popup still not found after initialization"
**Symptoms:** Console shows `[BUTTON CLICK] ERROR: Popup still not found`

**Solutions:**
1. Check if YouTube player controls exist
2. Verify `initVideoPlayerPopup()` is called
3. Check for JavaScript errors
4. Try reloading extension

### Issue 4: Animations not visible
**Symptoms:** Popup works but no animations on video

**Solutions:**
1. Check if animations are disabled (button state)
2. Verify canvas elements exist: `document.getElementById('canvasdummy')`
3. Check if pose detector initialized
4. Look for TensorFlow.js errors in console

## ✅ Success Checklist

After testing all scenarios, verify:

- [ ] Button click works on fresh page load
- [ ] Button click works while video loading
- [ ] Button click works when video already playing
- [ ] Multiple rapid clicks work correctly
- [ ] Video switching works (new video detection)
- [ ] Slow network doesn't break extension
- [ ] ReadyState === 0 handled correctly
- [ ] Popup toggles correctly
- [ ] Canvas recreation works
- [ ] Works on different YouTube page types
- [ ] No console errors
- [ ] Animations visible and working
- [ ] Debug logs are clear and helpful

## 🎉 Expected Outcome

After all tests pass:
- ✅ Extension is **100% reliable**
- ✅ Button always works when clicked
- ✅ Animations always appear when enabled
- ✅ No more "nothing happens" scenarios
- ✅ Robust error recovery
- ✅ Clear debug information

## 📝 Reporting Issues

If you find issues during testing:

1. **Note the scenario** (which test failed)
2. **Copy console logs** (all `[BUTTON CLICK]`, `[VIDEO SEARCH]`, `[VIDEO WAIT]` messages)
3. **Note video state** (readyState, paused, currentTime)
4. **Note browser/OS** (Chrome version, operating system)
5. **Note YouTube page** (URL, video type)

## 🔄 Disable Debug Mode

After testing, remember to disable debug mode:

```javascript
const DEBUG = false;  // Line ~17 in src/content.js
```

Then rebuild:
```bash
npm run build:parcel
```

This reduces console noise in production.
