# Horror Video Filters Design Document

## Overview

This design document outlines the implementation of horror video filters for the YouTube Motion Tracking Halloween Edition Chrome extension. The Filter System applies cinematic horror effects to YouTube videos using CSS filters and canvas overlays, working additively with existing Halloween animations. The system includes 6+ horror filter presets, a dedicated UI section, and independent persistence from the animation system.

## Architecture

### System Integration

The Filter System integrates with the existing extension architecture as a parallel, independent subsystem:

```
┌─────────────────────────────────────────────────────┐
│              Content Script (content.js)             │
│  ┌──────────────────┐      ┌───────────────────┐   │
│  │ Animation System │      │   Filter System   │   │
│  │  - Pose detect   │      │  - CSS filters    │   │
│  │  - Canvas render │      │  - Canvas overlay │   │
│  │  - Anim switching│      │  - Filter switch  │   │
│  └──────────────────┘      └───────────────────┘   │
│           │                          │              │
│           └──────────┬───────────────┘              │
│                      │                              │
│              ┌───────▼────────┐                     │
│              │  Video Element │                     │
│              │  + Canvas      │                     │
│              └────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

### Core Components

**New Components:**
- **FilterEnum** (`filterEnum.js`): Defines all horror filters with CSS strings and overlay types
- **FilterManager** (in `content.js`): Handles filter application, switching, and persistence
- **OverlayRenderer** (in `anim.js`): Renders canvas overlays (scanlines, grain, vignette, grid)

**Modified Components:**
- **content.js**: Add filter management, UI section, storage handling
- **content.css**: Add filter section styling
- **anim.js**: Add canvas overlay rendering methods

### Technical Stack

- **CSS Filters**: Native browser filters (contrast, saturate, hue-rotate, blur, sepia, invert, brightness)
- **Canvas 2D API**: For overlay rendering (scanlines, grain, vignette, grid)
- **Chrome Storage API**: Persist filter selection independently from animations
- **Existing Canvas System**: Reuse existing canvas for overlays

## Filter Definitions

### FilterEnum Class Structure

```javascript
class FilterEnum {
    constructor(name, displayName, icon, cssFilter, overlayType = null) {
        this.name = name;
        this.displayName = displayName;
        this.icon = icon;
        this.cssFilter = cssFilter;
        this.overlayType = overlayType;
    }
    
    // Filter definitions
    static none = new FilterEnum('none', 'No Filter', '🚫', '', null);
    
    static vhs = new FilterEnum(
        'vhs',
        'VHS Tape',
        '📼',
        'contrast(1.3) saturate(0.7) hue-rotate(-10deg) blur(0.5px)',
        'scanlines'
    );
    
    static foundFootage = new FilterEnum(
        'foundFootage',
        'Found Footage',
        '📹',
        'contrast(1.4) saturate(0.5) brightness(0.9)',
        'grain'
    );

    
    static xrayLab = new FilterEnum(
        'xrayLab',
        'X-Ray Lab',
        '☢️',
        'contrast(1.6) brightness(1.2) saturate(0.3) hue-rotate(80deg)',
        'grid'
    );
    
    static bloodMoon = new FilterEnum(
        'bloodMoon',
        'Blood Moon',
        '🌕',
        'contrast(1.4) sepia(0.8) hue-rotate(-30deg) brightness(0.85)',
        'vignette'
    );
    
    static noir = new FilterEnum(
        'noir',
        'Film Noir',
        '🎬',
        'grayscale(1) contrast(1.5) brightness(0.9)',
        'grain'
    );
    
    static toxicWaste = new FilterEnum(
        'toxicWaste',
        'Toxic Waste',
        '☣️',
        'contrast(1.3) saturate(1.8) hue-rotate(90deg) brightness(1.1)',
        'glow'
    );
    
    // Utility methods
    static getAllFilters() {
        return [
            FilterEnum.none,
            FilterEnum.vhs,
            FilterEnum.foundFootage,
            FilterEnum.xrayLab,
            FilterEnum.bloodMoon,
            FilterEnum.noir,
            FilterEnum.toxicWaste
        ];
    }
    
    static getFilterByName(name) {
        return FilterEnum.getAllFilters().find(f => f.name === name) || FilterEnum.none;
    }
}
```

### Filter Specifications

#### 1. VHS Tape
- **CSS**: `contrast(1.3) saturate(0.7) hue-rotate(-10deg) blur(0.5px)`
- **Overlay**: Horizontal scanlines (2px spacing, 50% opacity)
- **Effect**: Warm tones, slight blur, analog video quality
- **Color Shift**: Slight red/orange shift

#### 2. Found Footage
- **CSS**: `contrast(1.4) saturate(0.5) brightness(0.9)`
- **Overlay**: Film grain (random noise particles)
- **Effect**: Desaturated, gritty, handheld camera feel
- **Optional**: Timestamp in corner (HH:MM:SS format)

#### 3. X-Ray Lab
- **CSS**: `contrast(1.6) brightness(1.2) saturate(0.3) hue-rotate(80deg)`
- **Overlay**: Grid pattern (20px spacing) + scanning line
- **Effect**: Green phosphorescent glow, medical equipment aesthetic
- **Animation**: Vertical scanning line moves top to bottom

#### 4. Blood Moon
- **CSS**: `contrast(1.4) sepia(0.8) hue-rotate(-30deg) brightness(0.85)`
- **Overlay**: Dark vignette (radial gradient from edges)
- **Effect**: Red/sepia tones, ominous atmosphere
- **Color**: Warm red/orange tones

#### 5. Film Noir
- **CSS**: `grayscale(1) contrast(1.5) brightness(0.9)`
- **Overlay**: Film grain + subtle vignette
- **Effect**: Black and white, high contrast, classic horror
- **Style**: 1940s horror film aesthetic

#### 6. Toxic Waste
- **CSS**: `contrast(1.3) saturate(1.8) hue-rotate(90deg) brightness(1.1)`
- **Overlay**: Green glow effect (radial gradient)
- **Effect**: Toxic green tint, radioactive appearance
- **Color**: Bright green/yellow-green tones

## Component Design

### FilterManager (in content.js)

```javascript
class FilterManager {
    constructor(videoElement, canvas, ctx) {
        this.video = videoElement;
        this.canvas = canvas;
        this.ctx = ctx;
        this.currentFilter = FilterEnum.none;
        this.overlayRenderer = new OverlayRenderer(canvas, ctx);
    }
    
    applyFilter(filterName) {
        const filter = FilterEnum.getFilterByName(filterName);
        
        // Apply CSS filter to video
        this.video.style.filter = filter.cssFilter;
        
        // Update overlay type
        this.overlayRenderer.setOverlayType(filter.overlayType);
        
        // Store current filter
        this.currentFilter = filter;
        
        // Persist to storage
        chrome.storage.sync.set({ currentFilter: filterName });
        
        console.log(`Applied filter: ${filter.displayName}`);
    }
    
    clearFilter() {
        this.applyFilter('none');
    }
    
    renderOverlay() {
        if (this.currentFilter.overlayType) {
            this.overlayRenderer.render();
        }
    }
    
    async loadSavedFilter() {
        const result = await chrome.storage.sync.get('currentFilter');
        const filterName = result.currentFilter || 'none';
        this.applyFilter(filterName);
    }
}
```

### OverlayRenderer (in anim.js)

```javascript
class OverlayRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.overlayType = null;
        this.animationFrame = 0;
    }
    
    setOverlayType(type) {
        this.overlayType = type;
        this.animationFrame = 0;
    }
    
    render() {
        if (!this.overlayType) return;
        
        switch (this.overlayType) {
            case 'scanlines':
                this.renderScanlines();
                break;
            case 'grain':
                this.renderGrain();
                break;
            case 'grid':
                this.renderGrid();
                break;
            case 'vignette':
                this.renderVignette();
                break;
            case 'glow':
                this.renderGlow();
                break;
        }
        
        this.animationFrame++;
    }
    
    renderScanlines() {
        const { width, height } = this.canvas;
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 1;
        
        for (let y = 0; y < height; y += 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }
    
    renderGrain() {
        const { width, height } = this.canvas;
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() > 0.95) {
                const value = Math.random() * 255;
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
                data[i + 3] = 100;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    renderGrid() {
        const { width, height } = this.canvas;
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        // Scanning line
        const scanY = (this.animationFrame * 2) % height;
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, scanY);
        this.ctx.lineTo(width, scanY);
        this.ctx.stroke();
    }
    
    renderVignette() {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.max(width, height) * 0.7;
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, radius * 0.3,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
    }
    
    renderGlow() {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.max(width, height) * 0.6;
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
    }
}
```


## UI Design

### Filter Section in Player Popup

The filter section will be added to the existing player popup, visually separated from animations:

```
┌─────────────────────────────────────────────────┐
│  🎃 Kiroween Animations 👻                     │
├─────────────────────────────────────────────────┤
│  [Skeleton] [Pumpkin] [Bat] [Ghost] [Spider]   │
│  [Skull] [Witch] [Spell] [Fog] [Lightning]     │
│  ... (existing animations)                      │
├─────────────────────────────────────────────────┤
│  🎬 Horror Filters 🎥                           │
├─────────────────────────────────────────────────┤
│  [🚫 None] [📼 VHS] [📹 Found] [☢️ X-Ray]      │
│  [🌕 Blood] [🎬 Noir] [☣️ Toxic]               │
├─────────────────────────────────────────────────┤
│  [🎲 Random Anim] [⏸️ Stop/Play]               │
│    slider für sekunden (2-60)                         │
└─────────────────────────────────────────────────┘
```

### CSS Styling for Filter Section

```css
/* Filter section container */
.filter-section {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 2px solid rgba(220, 20, 60, 0.5);
}

.filter-section-title {
    font-size: 16px;
    font-weight: bold;
    color: #DC143C;
    text-align: center;
    margin-bottom: 10px;
    text-shadow: 0 0 10px rgba(220, 20, 60, 0.8);
}

/* Filter buttons */
.filter-button {
    background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
    border: 2px solid #DC143C;
    color: white;
    padding: 8px 12px;
    margin: 4px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(220, 20, 60, 0.3);
}

.filter-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(220, 20, 60, 0.6);
    background: linear-gradient(135deg, #DC143C 0%, #FF1493 100%);
}

.filter-button.active {
    border: 3px solid #FFD700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%);
}

/* None/Clear filter button */
.filter-button.none {
    background: linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%);
    border: 2px solid #666;
}

.filter-button.none:hover {
    background: linear-gradient(135deg, #3D3D3D 0%, #2A2A2A 100%);
}
```

### Filter Button HTML Structure

```html
<div class="filter-section">
    <div class="filter-section-title">🎬 Horror Filters 🎥</div>
    <div class="filter-buttons-container">
        <button class="filter-button none active" data-filter="none">
            🚫 None
        </button>
        <button class="filter-button" data-filter="vhs">
            📼 VHS
        </button>
        <button class="filter-button" data-filter="foundFootage">
            📹 Found
        </button>
        <button class="filter-button" data-filter="xrayLab">
            ☢️ X-Ray
        </button>
        <button class="filter-button" data-filter="bloodMoon">
            🌕 Blood
        </button>
        <button class="filter-button" data-filter="noir">
            🎬 Noir
        </button>
        <button class="filter-button" data-filter="toxicWaste">
            ☣️ Toxic
        </button>
    </div>
</div>
```

## Integration with Existing System

### Rendering Pipeline

The rendering pipeline integrates filters with animations:

1. **Video Element**: CSS filters applied directly to `<video>` element
2. **Canvas Layer**: Overlays rendered on canvas, then animations on top
3. **Frame Loop**: Both overlay and animation rendering in same `requestAnimationFrame`

```javascript
// In content.js startDetection() function
function renderFrame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    webGLtx.clear(webGLtx.COLOR_BUFFER_BIT);
    
    // 1. Render filter overlay (if active)
    if (filterManager) {
        filterManager.renderOverlay();
    }
    
    // 2. Render animation (existing code)
    if (anim) {
        if (anim.isParticle) {
            anim.updateProton();
        } else {
            anim.updateKeypoint(keypoints);
        }
    }
    
    requestAnimationFrame(renderFrame);
}
```

### Storage Schema

Filters use separate storage key from animations:

```javascript
// Storage structure
{
    currentAnimationName: "skeletonGlow",  // Animation selection
    isAnimDisabled: false,                  // Animation on/off
    currentFilter: "vhs",                   // Filter selection (NEW)
    isFilterDisabled: false                 // Filter on/off (optional)
}
```

### Initialization Flow

```javascript
// In content.js initialization
async function initializeExtension() {
    // 1. Initialize video and canvas (existing)
    const mainVideo = document.querySelector('video');
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    
    // 2. Initialize filter manager (NEW)
    filterManager = new FilterManager(mainVideo, canvas, ctx);
    await filterManager.loadSavedFilter();
    
    // 3. Initialize animation system (existing)
    await initAnimationSystem();
    
    // 4. Create UI with filter section (NEW)
    initVideoPlayerPopup();
}
```

## Data Models

### Filter Definition Model

```typescript
interface FilterDefinition {
    name: string;           // Unique identifier (e.g., 'vhs')
    displayName: string;    // Human-readable name (e.g., 'VHS Tape')
    icon: string;           // Unicode emoji icon
    cssFilter: string;      // CSS filter string
    overlayType: string | null;  // Overlay type or null
}
```

### Filter State Model

```typescript
interface FilterState {
    currentFilter: string;      // Currently active filter name
    isFilterDisabled: boolean;  // Whether filters are disabled
}
```

## Error Handling

### Filter Application Errors

- **Invalid filter name**: Fallback to 'none' filter
- **CSS filter not supported**: Log warning, continue without filter
- **Canvas overlay error**: Skip overlay rendering, maintain CSS filter

### Storage Errors

- **Load failure**: Default to 'none' filter
- **Save failure**: Log error, continue with current filter
- **Corrupted data**: Reset to default 'none' filter

### Performance Degradation

- **Low FPS detected**: Automatically disable canvas overlays
- **Memory limit**: Reduce overlay complexity
- **WebGL unavailable**: Skip glow effects, use simpler overlays

## Testing Strategy

### Unit Testing

- FilterEnum returns correct filter definitions
- FilterManager applies CSS filters correctly
- OverlayRenderer renders each overlay type
- Storage persistence works independently

### Integration Testing

- Filters work alongside animations without interference
- Filter switching doesn't affect animation state
- Animation switching doesn't affect filter state
- UI updates correctly when filters change

### Visual Testing

- Each filter produces expected visual effect
- Overlays are semi-transparent and don't obscure video
- Animations remain visible over filtered video
- UI section is visually distinct from animations

### Performance Testing

- Maintain 30+ FPS with filter + animation active
- CSS filters use GPU acceleration
- Canvas overlays don't cause frame drops
- Memory usage stays within limits

## Performance Considerations

### Optimization Strategies

1. **CSS Filters**: Use GPU-accelerated filters (contrast, saturate, hue-rotate)
2. **Canvas Overlays**: Render at lower frequency if needed (every 2-3 frames)
3. **Grain Effect**: Use sparse random sampling instead of full-screen noise
4. **Vignette/Glow**: Cache gradient objects, reuse across frames
5. **Grid**: Draw once and cache if static

### Performance Targets

- 30+ FPS with filter + animation active
- < 100ms filter switching time
- < 20MB additional memory for filter system
- No impact on video playback performance

## Accessibility

### Visual Considerations

- Filters maintain sufficient contrast for video visibility
- UI buttons have clear labels and icons
- Active filter clearly indicated
- "None" option always available

### User Control

- Easy to disable filters completely
- Filters don't interfere with video controls
- Clear visual feedback for filter selection
- Independent from animation controls

## Browser Compatibility

### CSS Filter Support

- All modern browsers support CSS filters
- Fallback: Skip CSS filters if not supported
- WebGL required for some overlay effects

### Performance Requirements

- Hardware acceleration recommended
- WebGL support for optimal overlay rendering
- Canvas 2D API for basic overlays

## Future Enhancements

- Custom filter creation (user-adjustable parameters)
- Filter intensity slider
- More overlay types (dust, scratches, light leaks)
- Filter presets for specific horror subgenres
- Animated overlays (flickering, glitch effects)
- Sound effects synchronized with filters
- Filter randomization mode (separate from animations)
