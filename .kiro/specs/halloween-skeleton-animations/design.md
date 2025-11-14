# Design Document: Halloween Skeleton Animations with WebGL

## Overview

This design document outlines the implementation of 13 new Halloween-themed skeleton animations for the YouTube Motion Tracking extension, leveraging WebGL for advanced visual effects. The system extends the existing animation framework with a hybrid rendering architecture that supports three rendering modes: WebGL-enhanced (GPU shaders), Hybrid (Canvas 2D + WebGL), and Canvas 2D (optimized performance).

### Design Goals

1. **Visual Excellence**: Create stunning, Halloween-themed effects using modern GPU capabilities
2. **Performance**: Maintain 30+ FPS for WebGL animations and 45+ FPS for Canvas 2D animations
3. **Compatibility**: Graceful fallback to Canvas 2D when WebGL is unavailable
4. **Maintainability**: Modular shader system with reusable components
5. **Resource Efficiency**: Proper GPU memory management and shader caching

### Rendering Architecture

The system uses a three-tier rendering approach:
- **Tier 1 (WebGL)**: Full GPU acceleration with shaders (6 animations)
- **Tier 2 (Hybrid)**: Canvas 2D base with WebGL effects (4 animations)
- **Tier 3 (Canvas 2D)**: Pure 2D rendering for maximum compatibility (3 animations)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Animation System                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Animation Controller (anim.js)          │  │
│  │  - Animation selection and initialization         │  │
│  │  - Rendering mode detection                       │  │
│  │  - Frame loop management                          │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│         ┌────────────────┼────────────────┐             │
│         │                │                │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐     │
│  │   WebGL     │  │   Hybrid    │  │  Canvas2D  │     │
│  │  Renderer   │  │  Renderer   │  │  Renderer  │     │
│  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘     │
│         │                │                │             │
│  ┌──────▼──────────────────────────────────▼──────┐    │
│  │         WebGL Shader System                     │    │
│  │  ┌──────────────┐  ┌──────────────┐            │    │
│  │  │Shader Manager│  │Resource Cache│            │    │
│  │  └──────────────┘  └──────────────┘            │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```


### WebGL Shader System

The shader system provides reusable components for all WebGL-enhanced animations:

**Core Components:**
1. **ShaderManager**: Compiles, links, and caches shader programs
2. **UniformManager**: Manages shader parameters (time, resolution, keypoints)
3. **TextureManager**: Loads and caches textures with automatic resizing
4. **GeometryBuilder**: Creates vertex buffers for skeleton rendering
5. **PostProcessor**: Handles multi-pass effects (bloom, blur, distortion)

**Shader Library:**
- `skeleton.vert`: Base vertex shader for skeleton geometry
- `fire.frag`: Fire material with Perlin noise
- `ice.frag`: Ice material with Fresnel and refraction
- `glass.frag`: Glass material with reflections
- `metal.frag`: Metallic material with environment mapping
- `glow.frag`: Emissive glow shader
- `bloom.frag`: HDR bloom post-processing
- `blur.frag`: Gaussian blur for soft effects
- `distortion.frag`: Heat wave distortion
- `chromatic.frag`: Chromatic aberration

## Components and Interfaces

### 1. WebGL Shader Manager

**Purpose**: Centralized shader compilation, linking, and caching system.

**Interface:**
```javascript
class ShaderManager {
    constructor(gl)
    compileShader(source, type) // Returns WebGLShader
    linkProgram(vertexShader, fragmentShader) // Returns WebGLProgram
    getProgram(name) // Returns cached program or null
    cacheProgram(name, program) // Stores program in cache
    disposeProgram(name) // Deletes program and removes from cache
    disposeAll() // Cleanup all programs
}
```

**Key Methods:**
- `compileShader()`: Compiles GLSL source with error reporting
- `linkProgram()`: Links vertex and fragment shaders
- `getProgram()`: Retrieves cached program by animation name
- `disposeAll()`: Cleanup on animation switch or extension unload

### 2. Uniform Manager

**Purpose**: Manages shader uniform parameters with automatic updates.

**Interface:**
```javascript
class UniformManager {
    constructor(gl, program)
    setFloat(name, value)
    setVec2(name, x, y)
    setVec3(name, x, y, z)
    setVec4(name, x, y, z, w)
    setMat4(name, matrix)
    setTexture(name, texture, unit)
    updateTime(deltaTime)
    updateResolution(width, height)
    updateKeypoints(keypoints)
}
```

**Standard Uniforms:**
- `u_time`: Animation time in seconds
- `u_resolution`: Canvas dimensions (vec2)
- `u_keypoints`: Array of keypoint positions (vec2[17])
- `u_keypointScores`: Array of confidence scores (float[17])

### 3. Geometry Builder

**Purpose**: Creates and manages vertex buffers for skeleton rendering.

**Interface:**
```javascript
class GeometryBuilder {
    constructor(gl)
    createSkeletonGeometry(keypoints) // Returns vertex buffer
    createLineGeometry(start, end, thickness) // Returns vertex buffer
    createQuadGeometry(x, y, width, height) // Returns vertex buffer
    updateVertexBuffer(buffer, data) // Updates existing buffer
    disposeBuffer(buffer) // Deletes buffer
}
```

**Geometry Types:**
- Skeleton lines: Quad strips between keypoints
- Particles: Point sprites or instanced quads
- Post-processing: Full-screen quad


### 4. Post-Processing Pipeline

**Purpose**: Multi-pass rendering for effects like bloom, blur, and distortion.

**Interface:**
```javascript
class PostProcessor {
    constructor(gl, width, height)
    createFramebuffer(width, height) // Returns framebuffer object
    bindFramebuffer(framebuffer) // Set as render target
    unbindFramebuffer() // Render to screen
    applyBloom(sourceTexture, intensity) // Returns processed texture
    applyBlur(sourceTexture, kernelSize) // Returns blurred texture
    applyDistortion(sourceTexture, amount) // Returns distorted texture
    resize(width, height) // Update framebuffer dimensions
    dispose() // Cleanup framebuffers
}
```

**Rendering Pipeline:**
1. Render skeleton to framebuffer
2. Apply post-processing effects
3. Composite to screen

### 5. Animation Renderer Classes

Each rendering mode has a dedicated renderer:

**WebGLSkeletonRenderer:**
```javascript
class WebGLSkeletonRenderer {
    constructor(gl, shaderManager, uniformManager, geometryBuilder)
    initialize(animationName) // Setup shaders and buffers
    render(keypoints, deltaTime) // Main render loop
    dispose() // Cleanup resources
}
```

**HybridSkeletonRenderer:**
```javascript
class HybridSkeletonRenderer {
    constructor(ctx, gl, shaderManager)
    renderCanvas2D(keypoints) // Base skeleton in 2D
    renderWebGLEffects(keypoints, deltaTime) // GPU effects
    dispose()
}
```

**Canvas2DSkeletonRenderer:**
```javascript
class Canvas2DSkeletonRenderer {
    constructor(ctx)
    render(keypoints, deltaTime) // Pure 2D rendering
}
```

## Data Models

### Keypoint Data Structure

```javascript
{
    x: Number,        // Canvas x coordinate
    y: Number,        // Canvas y coordinate
    score: Number,    // Confidence (0.0 to 1.0)
    name: String      // Keypoint name (e.g., "nose", "left_wrist")
}
```

### Shader Program Data

```javascript
{
    name: String,           // Animation name
    program: WebGLProgram,  // Compiled shader program
    uniforms: Object,       // Uniform locations
    attributes: Object,     // Attribute locations
    textures: Array         // Required textures
}
```

### Animation Configuration

```javascript
{
    name: String,           // Animation identifier
    icon: String,           // HTML entity code
    renderingMode: String,  // "webgl", "hybrid", or "canvas2d"
    shaders: {
        vertex: String,     // Vertex shader source
        fragment: String    // Fragment shader source
    },
    uniforms: Object,       // Default uniform values
    textures: Array,        // Texture file paths
    particleCount: Number   // For particle-based effects
}
```


## Animation Implementations

### WebGL-Enhanced Animations

#### 1. Skeleton Flames

**Visual Effect**: Flickering fire along bones with heat distortion

**Shaders:**
- Vertex: `skeleton.vert` (basic bone geometry)
- Fragment: `fire.frag` (Perlin noise fire)
- Post: `distortion.frag` (heat wave)

**Implementation:**
```glsl
// fire.frag (simplified)
uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p) {
    // Perlin noise implementation
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float n = noise(uv * 5.0 + vec2(0.0, u_time * 2.0));
    
    // Fire gradient: yellow -> orange -> red
    vec3 color = mix(
        vec3(1.0, 1.0, 0.0),  // Yellow
        vec3(1.0, 0.0, 0.0),  // Red
        n
    );
    
    gl_FragColor = vec4(color, n * 0.8);
}
```

**Uniforms:**
- `u_time`: Animation time
- `u_resolution`: Canvas size
- `u_noiseScale`: Fire turbulence (default: 5.0)
- `u_fireSpeed`: Flame movement speed (default: 2.0)

#### 2. Skeleton Frost

**Visual Effect**: Crystalline ice with Fresnel glow and refraction

**Shaders:**
- Vertex: `skeleton.vert`
- Fragment: `ice.frag` (Fresnel + refraction)

**Implementation:**
```glsl
// ice.frag (simplified)
uniform vec3 u_cameraPos;
varying vec3 v_normal;
varying vec3 v_position;

void main() {
    vec3 viewDir = normalize(u_cameraPos - v_position);
    float fresnel = pow(1.0 - dot(viewDir, v_normal), 3.0);
    
    vec3 iceColor = mix(
        vec3(1.0, 1.0, 1.0),      // White core
        vec3(0.6, 0.8, 1.0),      // Light blue edge
        fresnel
    );
    
    float alpha = 0.7 + fresnel * 0.3;
    gl_FragColor = vec4(iceColor, alpha);
}
```

**Uniforms:**
- `u_cameraPos`: Camera position for Fresnel
- `u_iceColor`: Base ice color
- `u_fresnelPower`: Edge glow intensity (default: 3.0)

#### 3. Skeleton Lightning

**Visual Effect**: Electric arcs with branching and HDR bloom

**Shaders:**
- Vertex: `skeleton.vert`
- Fragment: `lightning.frag` (procedural lightning)
- Post: `bloom.frag` (HDR bloom)

**Implementation:**
```glsl
// lightning.frag (simplified)
uniform float u_time;
uniform vec2 u_keypoints[17];

float lightning(vec2 p, vec2 start, vec2 end) {
    // Generate jagged lightning path
    vec2 dir = end - start;
    float t = dot(p - start, dir) / dot(dir, dir);
    t = clamp(t, 0.0, 1.0);
    
    vec2 closest = start + dir * t;
    float dist = length(p - closest);
    
    // Add random jitter
    float jitter = sin(t * 10.0 + u_time * 20.0) * 0.02;
    dist += jitter;
    
    return 1.0 / (dist * 100.0 + 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy;
    float intensity = 0.0;
    
    // Generate arcs between nearby keypoints
    for(int i = 0; i < 17; i++) {
        for(int j = i + 1; j < 17; j++) {
            float dist = distance(u_keypoints[i], u_keypoints[j]);
            if(dist < 200.0) {
                intensity += lightning(uv, u_keypoints[i], u_keypoints[j]);
            }
        }
    }
    
    vec3 color = vec3(0.8, 0.9, 1.0) * intensity;
    gl_FragColor = vec4(color, min(intensity, 1.0));
}
```

**Uniforms:**
- `u_keypoints`: Array of keypoint positions
- `u_arcThreshold`: Max distance for arcs (default: 200.0)
- `u_bloomIntensity`: Bloom strength (default: 2.5)


#### 4. Skeleton Spectral

**Visual Effect**: Ghostly appearance with chromatic aberration and rim lighting

**Shaders:**
- Vertex: `skeleton.vert`
- Fragment: `spectral.frag` (ghost effect)
- Post: `chromatic.frag` (color separation)

**Implementation:**
```glsl
// spectral.frag (simplified)
uniform float u_time;
varying vec3 v_normal;
varying vec3 v_position;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // Rim lighting
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - v_position);
    float rim = 1.0 - max(dot(viewDir, v_normal), 0.0);
    rim = pow(rim, 2.0);
    
    // Phasing effect
    float phase = sin(u_time * 2.0) * 0.5 + 0.5;
    float alpha = 0.3 + phase * 0.2;
    
    // Add noise for ethereal effect
    vec2 noiseCoord = v_position.xy * 0.1 + u_time * 0.1;
    alpha *= 0.8 + noise(noiseCoord) * 0.4;
    
    vec3 color = vec3(0.9, 0.9, 1.0) * (0.5 + rim * 0.5);
    gl_FragColor = vec4(color, alpha);
}
```

**Uniforms:**
- `u_time`: For phasing animation
- `u_rimPower`: Rim light intensity (default: 2.0)
- `u_chromaticAmount`: Color separation (default: 0.01)

#### 5. Skeleton Toxic

**Visual Effect**: Radioactive glow with bubbles and caustics

**Shaders:**
- Vertex: `skeleton.vert`
- Fragment: `toxic.frag` (emissive + caustics)
- Post: `bloom.frag` (glow)

**Implementation:**
```glsl
// toxic.frag (simplified)
uniform float u_time;
uniform vec2 u_resolution;

float caustics(vec2 p, float time) {
    // Animated caustics pattern
    vec2 uv = p * 3.0;
    float c = 0.0;
    for(int i = 0; i < 3; i++) {
        float t = time + float(i) * 0.5;
        vec2 offset = vec2(sin(t), cos(t * 0.7));
        c += 1.0 / length(fract(uv + offset) - 0.5);
    }
    return c * 0.1;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    // Base toxic green
    vec3 color = vec3(0.0, 1.0, 0.0);
    
    // Add caustics
    float c = caustics(uv, u_time);
    color += vec3(0.5, 1.0, 0.0) * c;
    
    // Pulsing glow
    float pulse = sin(u_time * 3.0) * 0.5 + 0.5;
    color *= 0.8 + pulse * 0.4;
    
    gl_FragColor = vec4(color, 0.9);
}
```

**Uniforms:**
- `u_time`: Animation time
- `u_glowIntensity`: Emissive strength (default: 1.5)
- `u_bubbleCount`: Number of bubbles (default: 200)

#### 6. Skeleton Inferno

**Visual Effect**: Volumetric hellfire with smoke and embers

**Shaders:**
- Vertex: `skeleton.vert`
- Fragment: `inferno.frag` (volumetric fire)
- Post: `bloom.frag` + `distortion.frag`

**Implementation:**
```glsl
// inferno.frag (simplified)
uniform float u_time;
uniform vec2 u_resolution;

float fbm(vec3 p) {
    // Fractal Brownian Motion for volumetric effect
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 4; i++) {
        value += amplitude * abs(sin(p.x) * sin(p.y) * sin(p.z));
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 p = vec3(uv * 5.0, u_time * 0.5);
    
    float density = fbm(p);
    
    // Hellfire colors: black -> red -> orange -> yellow
    vec3 color = vec3(0.0);
    if(density > 0.2) {
        color = mix(
            vec3(0.5, 0.0, 0.0),  // Dark red
            vec3(1.0, 0.5, 0.0),  // Orange
            (density - 0.2) / 0.3
        );
    }
    if(density > 0.5) {
        color = mix(color, vec3(1.0, 1.0, 0.3), (density - 0.5) / 0.5);
    }
    
    gl_FragColor = vec4(color, density);
}
```

**Uniforms:**
- `u_time`: Animation time
- `u_emberCount`: Particle count (default: 400)
- `u_smokeOpacity`: Smoke visibility (default: 0.6)


### Hybrid Animations

#### 7. Skeleton Blood

**Rendering Strategy**: Canvas 2D for skeleton base, WebGL for fluid simulation

**Canvas 2D Component:**
```javascript
drawSkeletonBlood(keypoints) {
    // Draw base skeleton in deep red
    this.ctx.strokeStyle = 'rgb(180, 0, 0)';
    this.ctx.lineWidth = 4;
    this.drawSkeleton(keypoints, 4, 'rgb(180, 0, 0)');
    
    // Pulsating effect
    const pulse = Math.sin(Date.now() / 1000 * 2) * 0.5 + 0.5;
    this.ctx.globalAlpha = 0.7 + pulse * 0.3;
}
```

**WebGL Component:**
- Fluid simulation shader for dripping blood
- GPU particles for droplets
- Metallic shader for wet appearance

#### 8. Skeleton Chains

**Rendering Strategy**: Canvas 2D for chain geometry, WebGL for metallic material

**Canvas 2D Component:**
```javascript
drawSkeletonChains(keypoints) {
    // Draw chain links between major joints
    const chainJoints = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    
    for(let i = 0; i < chainJoints.length - 1; i++) {
        const kp1 = keypoints[chainJoints[i]];
        const kp2 = keypoints[chainJoints[i + 1]];
        
        this.drawChainLink(kp1.x, kp1.y, kp2.x, kp2.y);
    }
}

drawChainLink(x1, y1, x2, y2) {
    const linkCount = Math.floor(Math.hypot(x2 - x1, y2 - y1) / 15);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    for(let i = 0; i < linkCount; i++) {
        const t = i / linkCount;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        
        // Draw oval link
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle + (i % 2) * Math.PI / 2);
        this.ctx.strokeStyle = 'rgb(120, 120, 120)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }
}
```

**WebGL Component:**
- Normal mapping for 3D appearance
- Environment mapping for reflections
- Rust texture overlay

#### 9. Skeleton Shatter

**Rendering Strategy**: Canvas 2D for fracture lines, WebGL for glass material

**Canvas 2D Component:**
```javascript
drawSkeletonShatter(keypoints) {
    // Draw fracture lines
    poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet)
        .forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            
            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                this.drawFracturedLine(kp1.x, kp1.y, kp2.x, kp2.y);
            }
        });
}

drawFracturedLine(x1, y1, x2, y2) {
    const segments = 5;
    this.ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    
    for(let i = 1; i < segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 10;
        const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 10;
        this.ctx.lineTo(x, y);
    }
    
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
}
```

**WebGL Component:**
- Voronoi fracture pattern generation
- Glass shader with refraction
- GPU particle system for fragments

#### 10. Skeleton Voodoo

**Rendering Strategy**: Canvas 2D for base and pins, WebGL for mystical effects

**Canvas 2D Component:**
```javascript
drawSkeletonVoodoo(keypoints) {
    // Dark purple skeleton
    this.ctx.strokeStyle = 'rgb(80, 0, 80)';
    this.ctx.lineWidth = 4;
    this.drawSkeleton(keypoints, 4, 'rgb(80, 0, 80)');
    
    // Draw pins through joints
    const majorJoints = [5, 6, 9, 10, 11, 12];
    for(let idx of majorJoints) {
        const kp = keypoints[idx];
        if(kp.score < this.keypointScore) continue;
        
        // Draw 3-5 pins
        for(let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i;
            const pinLength = 20;
            const x2 = kp.x + Math.cos(angle) * pinLength;
            const y2 = kp.y + Math.sin(angle) * pinLength;
            
            this.ctx.strokeStyle = 'rgb(200, 0, 0)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(kp.x, kp.y);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            // Pin head
            this.ctx.fillStyle = 'rgb(255, 0, 0)';
            this.ctx.beginPath();
            this.ctx.arc(x2, y2, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // Puppet strings
    this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    this.ctx.lineWidth = 1;
    [0, 9, 10, 15, 16].forEach(idx => {
        const kp = keypoints[idx];
        if(kp.score >= this.keypointScore) {
            this.ctx.beginPath();
            this.ctx.moveTo(kp.x, 0);
            this.ctx.lineTo(kp.x, kp.y);
            this.ctx.stroke();
        }
    });
}
```

**WebGL Component:**
- Glow shader for mystical symbols
- Distortion effect around symbols
- Dark energy particle system


### Canvas 2D Animations

#### 11. Skeleton Shadow

**Implementation:**
```javascript
drawSkeletonShadow(keypoints) {
    const time = Date.now() / 1000;
    const shadowCount = 5;
    
    // Draw shadow copies
    for(let i = 0; i < shadowCount; i++) {
        const angle = (Math.PI * 2 / shadowCount) * i + time * 0.5;
        const distance = 10 + i * 3;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;
        const alpha = 0.3 - i * 0.05;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(offsetX, offsetY);
        
        // Draw shadow skeleton
        this.ctx.strokeStyle = 'rgb(50, 50, 50)';
        this.ctx.lineWidth = 3;
        this.drawSkeleton(keypoints, 3, 'rgb(50, 50, 50)');
        
        this.ctx.restore();
    }
    
    // Draw main skeleton in white
    this.ctx.globalAlpha = 1.0;
    this.ctx.strokeStyle = 'rgb(240, 240, 240)';
    this.ctx.lineWidth = 4;
    this.drawSkeleton(keypoints, 4, 'rgb(240, 240, 240)');
}
```

#### 12. Skeleton Bones

**Implementation:**
```javascript
drawSkeletonBones(keypoints) {
    // Draw anatomically accurate bones
    poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet)
        .forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            
            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                this.drawBone(kp1.x, kp1.y, kp2.x, kp2.y);
            }
        });
    
    // Draw joints
    for(let kp of keypoints) {
        if(kp.score < this.keypointScore) continue;
        this.drawJoint(kp.x, kp.y);
    }
}

drawBone(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const length = Math.hypot(x2 - x1, y2 - y1);
    
    this.ctx.save();
    this.ctx.translate(x1, y1);
    this.ctx.rotate(angle);
    
    // Bone shape (wider at ends, narrow in middle)
    const gradient = this.ctx.createLinearGradient(0, 0, length, 0);
    gradient.addColorStop(0, 'rgb(245, 245, 220)');
    gradient.addColorStop(0.5, 'rgb(235, 235, 210)');
    gradient.addColorStop(1, 'rgb(245, 245, 220)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -6);
    this.ctx.quadraticCurveTo(length / 2, -3, length, -6);
    this.ctx.lineTo(length, 6);
    this.ctx.quadraticCurveTo(length / 2, 3, 0, 6);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Bone texture lines
    this.ctx.strokeStyle = 'rgba(200, 200, 180, 0.5)';
    this.ctx.lineWidth = 1;
    for(let i = 0; i < 8; i++) {
        const x = (length / 8) * i;
        this.ctx.beginPath();
        this.ctx.moveTo(x, -4);
        this.ctx.lineTo(x, 4);
        this.ctx.stroke();
    }
    
    // Marrow core
    this.ctx.fillStyle = 'rgba(200, 180, 160, 0.6)';
    this.ctx.fillRect(length * 0.2, -2, length * 0.6, 4);
    
    this.ctx.restore();
}

drawJoint(x, y) {
    // Joint socket
    this.ctx.fillStyle = 'rgb(245, 245, 220)';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
}
```

#### 13. Skeleton Mummy

**Implementation:**
```javascript
drawSkeletonMummy(keypoints) {
    const time = Date.now() / 1000;
    
    // Draw bandage-wrapped skeleton
    poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet)
        .forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            
            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                this.drawBandagedBone(kp1.x, kp1.y, kp2.x, kp2.y);
            }
        });
    
    // Draw unwrapping trails
    for(let kp of keypoints) {
        if(kp.score < this.keypointScore) continue;
        if(Math.random() > 0.3) {
            this.drawUnwrappingBandage(kp.x, kp.y, time);
        }
    }
}

drawBandagedBone(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const length = Math.hypot(x2 - x1, y2 - y1);
    const wrapCount = Math.floor(length / 10);
    
    this.ctx.save();
    this.ctx.translate(x1, y1);
    this.ctx.rotate(angle);
    
    // Draw bandage strips
    for(let i = 0; i < wrapCount; i++) {
        const x = (length / wrapCount) * i;
        const offset = (i % 2) * 3;
        
        this.ctx.fillStyle = 'rgb(230, 200, 160)';
        this.ctx.fillRect(x, -5 + offset, length / wrapCount - 2, 8);
        
        // Hieroglyphic symbols
        if(Math.random() > 0.7) {
            this.ctx.fillStyle = 'rgb(100, 80, 60)';
            this.ctx.fillRect(x + 2, -2, 3, 4);
        }
    }
    
    this.ctx.restore();
}

drawUnwrappingBandage(x, y, time) {
    const length = 30 + Math.sin(time + x) * 20;
    const angle = time + y * 0.01;
    
    this.ctx.strokeStyle = 'rgba(230, 200, 160, 0.6)';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    
    for(let i = 0; i < 5; i++) {
        const t = i / 5;
        const bx = x + Math.cos(angle + t * Math.PI) * length * t;
        const by = y + length * t + Math.sin(angle + t * Math.PI * 2) * 10;
        this.ctx.lineTo(bx, by);
    }
    
    this.ctx.stroke();
}
```


## Error Handling

### WebGL Context Loss

**Problem**: WebGL context can be lost due to GPU driver issues or resource constraints.

**Solution:**
```javascript
canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('WebGL context lost, attempting recovery...');
    this.webglContextLost = true;
    this.stopRendering();
});

canvas.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored');
    this.webglContextLost = false;
    this.reinitializeWebGL();
    this.startRendering();
});
```

### Shader Compilation Errors

**Problem**: Shader compilation can fail due to syntax errors or unsupported features.

**Solution:**
```javascript
compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        const info = this.gl.getShaderInfoLog(shader);
        const lines = source.split('\n');
        const errorMatch = info.match(/ERROR: \d+:(\d+)/);
        
        if (errorMatch) {
            const lineNum = parseInt(errorMatch[1]);
            console.error(`Shader compilation error at line ${lineNum}:`);
            console.error(lines[lineNum - 1]);
        }
        
        console.error('Full shader log:', info);
        this.gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}
```

### Fallback to Canvas 2D

**Problem**: WebGL may not be available or may fail to initialize.

**Solution:**
```javascript
initializeRendering() {
    // Try WebGL first
    try {
        this.gl = this.canvasGL.getContext('webgl') || 
                  this.canvasGL.getContext('experimental-webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        this.renderingMode = 'webgl';
        this.initializeWebGL();
        
    } catch (error) {
        console.warn('WebGL initialization failed, falling back to Canvas 2D:', error);
        this.renderingMode = 'canvas2d';
        this.gl = null;
    }
}
```

### Resource Cleanup

**Problem**: GPU resources must be properly disposed to prevent memory leaks.

**Solution:**
```javascript
dispose() {
    // Dispose shaders
    if (this.shaderManager) {
        this.shaderManager.disposeAll();
    }
    
    // Dispose buffers
    if (this.geometryBuilder) {
        this.geometryBuilder.disposeAll();
    }
    
    // Dispose textures
    if (this.textureManager) {
        this.textureManager.disposeAll();
    }
    
    // Dispose framebuffers
    if (this.postProcessor) {
        this.postProcessor.dispose();
    }
    
    // Lose context intentionally for cleanup
    if (this.gl) {
        const loseContext = this.gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
            loseContext.loseContext();
        }
    }
}
```

## Testing Strategy

### Unit Tests

**Shader Compilation Tests:**
```javascript
describe('ShaderManager', () => {
    test('should compile valid vertex shader', () => {
        const source = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        const shader = shaderManager.compileShader(source, gl.VERTEX_SHADER);
        expect(shader).not.toBeNull();
    });
    
    test('should handle shader compilation errors', () => {
        const source = `invalid shader code`;
        const shader = shaderManager.compileShader(source, gl.VERTEX_SHADER);
        expect(shader).toBeNull();
    });
});
```

**Geometry Tests:**
```javascript
describe('GeometryBuilder', () => {
    test('should create skeleton geometry from keypoints', () => {
        const keypoints = generateMockKeypoints();
        const buffer = geometryBuilder.createSkeletonGeometry(keypoints);
        expect(buffer).toBeDefined();
        expect(gl.isBuffer(buffer)).toBe(true);
    });
});
```

### Integration Tests

**Animation Rendering Tests:**
```javascript
describe('Animation Rendering', () => {
    test('should render skeleton flames animation', async () => {
        const anim = new Anim(video, canvas, canvasGL, ctx, webGLtx);
        anim.setNewAnimation('skeletonFlames');
        
        const keypoints = generateMockKeypoints();
        anim.updateKeypoint(null, keypoints);
        
        // Verify WebGL state
        expect(gl.getParameter(gl.CURRENT_PROGRAM)).not.toBeNull();
    });
    
    test('should fallback to Canvas 2D when WebGL fails', () => {
        // Simulate WebGL failure
        jest.spyOn(canvasGL, 'getContext').mockReturnValue(null);
        
        const anim = new Anim(video, canvas, canvasGL, ctx, webGLtx);
        anim.setNewAnimation('skeletonFlames');
        
        expect(anim.renderingMode).toBe('canvas2d');
    });
});
```

### Performance Tests

**Frame Rate Monitoring:**
```javascript
describe('Performance', () => {
    test('should maintain 30+ FPS for WebGL animations', async () => {
        const anim = new Anim(video, canvas, canvasGL, ctx, webGLtx);
        anim.setNewAnimation('skeletonFlames');
        
        const frameTimes = [];
        let lastTime = performance.now();
        
        for (let i = 0; i < 100; i++) {
            const keypoints = generateMockKeypoints();
            anim.updateKeypoint(null, keypoints);
            anim.updateProton();
            
            const currentTime = performance.now();
            frameTimes.push(currentTime - lastTime);
            lastTime = currentTime;
        }
        
        const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
        const fps = 1000 / avgFrameTime;
        
        expect(fps).toBeGreaterThanOrEqual(30);
    });
});
```

### Visual Regression Tests

**Screenshot Comparison:**
```javascript
describe('Visual Regression', () => {
    test('skeleton flames should match reference', async () => {
        const anim = new Anim(video, canvas, canvasGL, ctx, webGLtx);
        anim.setNewAnimation('skeletonFlames');
        
        const keypoints = loadFixtureKeypoints('standing-pose.json');
        anim.updateKeypoint(null, keypoints);
        
        const screenshot = canvas.toDataURL();
        const reference = loadReferenceImage('skeleton-flames-standing.png');
        
        const diff = compareImages(screenshot, reference);
        expect(diff).toBeLessThan(0.05); // 5% difference threshold
    });
});
```

## Performance Optimization

### Shader Optimization

1. **Minimize Texture Lookups**: Cache texture samples when possible
2. **Use Lower Precision**: Use `mediump` instead of `highp` for mobile
3. **Reduce Branching**: Minimize `if` statements in fragment shaders
4. **Precompute Values**: Move calculations to vertex shader when possible

### Geometry Optimization

1. **Instanced Rendering**: Use instancing for particles
2. **Buffer Reuse**: Update existing buffers instead of creating new ones
3. **LOD System**: Reduce detail for distant or small skeletons
4. **Culling**: Skip rendering for off-screen keypoints

### Memory Optimization

1. **Texture Atlases**: Combine multiple textures into single atlas
2. **Texture Compression**: Use compressed texture formats when available
3. **Resource Pooling**: Reuse framebuffers and buffers
4. **Lazy Loading**: Load shaders and textures on demand

### CPU Optimization

1. **Batch Updates**: Update all uniforms in single pass
2. **Minimize State Changes**: Group draw calls by shader program
3. **Use TypedArrays**: Use Float32Array for vertex data
4. **Avoid Garbage**: Reuse objects instead of creating new ones

## Browser Compatibility

### Supported Browsers

- Chrome 90+ (full WebGL support)
- Edge 90+ (full WebGL support)
- Firefox 88+ (full WebGL support)
- Safari 14+ (limited WebGL support)

### Feature Detection

```javascript
function detectWebGLFeatures() {
    const features = {
        webgl: false,
        floatTextures: false,
        depthTexture: false,
        instancedArrays: false,
        vertexArrayObject: false
    };
    
    try {
        const gl = canvas.getContext('webgl');
        if (!gl) return features;
        
        features.webgl = true;
        features.floatTextures = !!gl.getExtension('OES_texture_float');
        features.depthTexture = !!gl.getExtension('WEBGL_depth_texture');
        features.instancedArrays = !!gl.getExtension('ANGLE_instanced_arrays');
        features.vertexArrayObject = !!gl.getExtension('OES_vertex_array_object');
        
    } catch (error) {
        console.warn('WebGL feature detection failed:', error);
    }
    
    return features;
}
```

### Graceful Degradation

1. **No WebGL**: Fall back to Canvas 2D for all animations
2. **No Float Textures**: Use lower precision for post-processing
3. **No Instancing**: Use standard draw calls for particles
4. **Low Performance**: Automatically reduce particle count and effects quality

## Security Considerations

### Shader Injection Prevention

All shader sources are embedded in the extension code, not loaded from external sources.

### Resource Limits

- Maximum texture size: 2048x2048
- Maximum particle count: 500
- Maximum shader complexity: 100 instructions
- Maximum framebuffer count: 4

### Content Security Policy

The extension manifest includes appropriate CSP directives:
```json
{
    "content_security_policy": {
        "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
    }
}
```
