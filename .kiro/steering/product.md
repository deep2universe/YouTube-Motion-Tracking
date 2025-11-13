---
inclusion: always
---

# Product Overview

YouTube Motion Tracking is a Chrome browser extension that adds AI-powered motion animation effects to YouTube videos in real-time.

## Core Functionality

- Detects human poses in YouTube videos using TensorFlow.js MoveNet model
- Overlays 50+ different animation effects that track body movements
- Animations include skeleton visualizations, particle effects, and creative visual overlays
- Effects are rendered on canvas layers positioned over the video player

## Key Features

- Real-time pose detection with 17 keypoints (nose, eyes, ears, shoulders, elbows, wrists, hips, knees, ankles)
- Animation categories: skeleton variations, particle physics, tracking effects, atmospheric effects
- In-player controls for selecting animations
- Random animation mode with configurable intervals
- Animation state persists across videos using Chrome storage API

## Technical Approach

- Content script injection on YouTube watch pages
- Dual canvas system: 2D canvas for drawings, WebGL canvas for particle effects
- Proton particle engine for physics-based animations
- Background service worker monitors URL changes to reinitialize on new videos
