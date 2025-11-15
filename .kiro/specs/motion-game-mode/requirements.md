# Requirements Document

## Introduction

The Motion Game Mode extends the YouTube Motion Tracking extension with an interactive gaming experience. Users watch YouTube videos and play a Ghost Jump Challenge game where a ghost character jumps upward based on movements detected **in the video content itself**. The system analyzes the existing pose detection data from people appearing in the YouTube video (not from a webcam) and counts specific user-defined movements to control the game.

## Glossary

- **Motion Game Mode**: An interactive game mode that uses pose detection from YouTube video content to track specific body movements and translate them into game actions
- **Video Content Detection**: Pose detection performed on people appearing in the YouTube video being watched, using the existing MoveNet model
- **Ghost Character**: A visual character rendered on canvas that jumps vertically in response to detected movements in the video
- **Jump Sequence**: A series of 10 detected movements that, when completed, awards 1 point and resets the ghost to the starting position
- **Motion Detector**: A system component that analyzes keypoint data from video content to recognize specific predefined movements
- **Counting Movement**: The specific movement type selected by the user before game start that will be counted to advance the ghost
- **HUD (Heads-Up Display)**: An overlay interface displaying game statistics (score, jump progress) without obstructing video content
- **Keypoint**: A detected body landmark from the MoveNet pose detection model analyzing video content (17 points including nose, eyes, shoulders, elbows, wrists, hips, knees, ankles)
- **Cooldown Period**: A time interval after movement detection during which subsequent detections are ignored to prevent false positives
- **Time Window Analysis**: A technique that validates movement detection across multiple frames to ensure accuracy
- **Movement Pattern**: A specific geometric relationship between keypoints that defines a recognizable body movement

## Requirements

### Requirement 1: Video Content Detection Source

**User Story:** As a user watching YouTube videos, I want the game to react to movements of people in the video content, so that I can play the game passively while watching without needing a webcam.

#### Acceptance Criteria

1. THE Motion Game Mode System SHALL analyze pose detection data from the YouTube video content only
2. THE Motion Game Mode System SHALL NOT access or require webcam input from the user
3. THE Motion Game Mode System SHALL use the existing MoveNet pose detection pipeline that analyzes video frames
4. THE Motion Game Mode System SHALL detect movements performed by people appearing in the YouTube video
5. WHEN no person is detected in the video content, THE Motion Game Mode System SHALL pause game progression without displaying errors

### Requirement 2: Game Mode Activation

**User Story:** As a user, I want to activate Game Mode from the player controls, so that I can switch between watching animations and playing the interactive game.

#### Acceptance Criteria

1. WHEN the user clicks the Game Mode toggle button, THE Motion Game Mode System SHALL transition from INACTIVE state to SELECTING state
2. WHILE Game Mode is active, THE Motion Game Mode System SHALL display the motion selection panel over the video player
3. THE Motion Game Mode System SHALL persist the game mode state using Chrome storage API
4. WHEN the user deactivates Game Mode, THE Motion Game Mode System SHALL return to INACTIVE state and hide all game UI elements
5. THE Motion Game Mode System SHALL display the toggle button state as "Game Mode: ON" when active and "Game Mode: OFF" when inactive

### Requirement 3: Movement Selection Before Game Start

**User Story:** As a user, I want to choose which body movement to count before starting the game, so that the game tracks only the specific movement type I select.

#### Acceptance Criteria

1. THE Motion Game Mode System SHALL require movement selection before transitioning to PLAYING state
2. THE Motion Game Mode System SHALL provide five selectable movements: Arm Curl, Head Turn, Arm Raise, Squat, and Jumping Jack
3. WHEN the motion selection panel is displayed, THE Motion Game Mode System SHALL show each movement with an icon, display name, and description
4. WHEN the user clicks a movement button, THE Motion Game Mode System SHALL set that movement as the counting movement and transition to PLAYING state
5. THE Motion Game Mode System SHALL hide the motion selection panel after the counting movement is selected

### Requirement 4: Single Movement Counting

**User Story:** As a user who has selected a counting movement, I want the game to count only that specific movement type, so that the ghost advances only when the selected movement is detected in the video.

#### Acceptance Criteria

1. THE Motion Detector SHALL analyze only the user-selected counting movement during gameplay
2. THE Motion Detector SHALL ignore all other movement types while in PLAYING state
3. WHEN the selected counting movement is detected in video content, THE Motion Game Mode System SHALL increment the jump counter
4. THE Motion Game Mode System SHALL display the currently selected counting movement in the HUD
5. THE Motion Game Mode System SHALL allow changing the counting movement only by returning to SELECTING state

### Requirement 5: Arm Curl Movement Detection

**User Story:** As a user who selected Arm Curl as the counting movement, I want the system to detect when people in the video bend their arms, so that the ghost jumps in response.

#### Acceptance Criteria

1. WHEN the angle between shoulder, elbow, and wrist keypoints is less than 45 degrees, THE Motion Detector SHALL recognize an Arm Curl movement
2. THE Motion Detector SHALL calculate angles using keypoints 5 or 6 (shoulders), 7 or 8 (elbows), and 9 or 10 (wrists)
3. THE Motion Detector SHALL apply a 500 millisecond cooldown period after each detection
4. THE Motion Detector SHALL validate detection across a 300 millisecond time window
5. THE Motion Detector SHALL detect arm curl movements for either left or right arm independently

### Requirement 6: Head Turn Movement Detection

**User Story:** As a user who selected Head Turn as the counting movement, I want the system to detect when people in the video turn their heads, so that the ghost jumps in response.

#### Acceptance Criteria

1. WHEN the nose keypoint moves more than 30 pixels horizontally from the midpoint between ear keypoints, THE Motion Detector SHALL recognize a Head Turn movement
2. THE Motion Detector SHALL track nose position using keypoint 0 and ear positions using keypoints 3 and 4
3. THE Motion Detector SHALL validate head position across 5 consecutive frames (approximately 150 milliseconds at 30fps)
4. THE Motion Detector SHALL apply a 600 millisecond cooldown period after each detection
5. THE Motion Detector SHALL detect head turns in both left and right directions

### Requirement 7: Arm Raise Movement Detection

**User Story:** As a user who selected Arm Raise as the counting movement, I want the system to detect when people in the video raise their arms, so that the ghost jumps in response.

#### Acceptance Criteria

1. WHEN a wrist keypoint is positioned more than 50 pixels above the corresponding shoulder keypoint, THE Motion Detector SHALL recognize an Arm Raise movement
2. THE Motion Detector SHALL compare vertical positions of keypoints 5 or 6 (shoulders) with keypoints 9 or 10 (wrists)
3. THE Motion Detector SHALL apply a 20 pixel hysteresis threshold to prevent detection flickering
4. THE Motion Detector SHALL apply a 400 millisecond cooldown period after each detection
5. THE Motion Detector SHALL detect arm raises for either left or right arm independently

### Requirement 8: Squat Movement Detection

**User Story:** As a user who selected Squat as the counting movement, I want the system to detect when people in the video perform squats, so that only full repetitions count toward the game.

#### Acceptance Criteria

1. WHEN the angle between hip, knee, and ankle keypoints is less than 100 degrees, THE Motion Detector SHALL recognize the squatting position
2. THE Motion Detector SHALL implement a state machine with STANDING and SQUATTING states
3. THE Motion Detector SHALL count one repetition only when transitioning from SQUATTING state to STANDING state
4. THE Motion Detector SHALL use keypoints 11 or 12 (hips), 13 or 14 (knees), and 15 or 16 (ankles) for angle calculation
5. THE Motion Detector SHALL apply an 800 millisecond cooldown period after each complete repetition

### Requirement 9: Jumping Jack Movement Detection

**User Story:** As a user who selected Jumping Jack as the counting movement, I want the system to detect when people in the video perform jumping jacks, so that only complete motions are recognized.

#### Acceptance Criteria

1. WHEN wrist keypoints are above shoulder height AND ankle keypoints are wider than hip width, THE Motion Detector SHALL recognize a Jumping Jack movement
2. THE Motion Detector SHALL validate both arm and leg conditions simultaneously across 3 consecutive frames
3. THE Motion Detector SHALL use keypoints 5 and 6 (shoulders), 9 and 10 (wrists), 11 and 12 (hips), and 15 and 16 (ankles)
4. THE Motion Detector SHALL apply a 700 millisecond cooldown period after each detection
5. THE Motion Detector SHALL require ankle spread to exceed 1.3 times the hip width

### Requirement 10: Ghost Character Visualization

**User Story:** As a user playing the game, I want to see a ghost character that jumps upward with each detected movement in the video, so that I receive immediate visual feedback.

#### Acceptance Criteria

1. THE Ghost Character SHALL render on a dedicated canvas layer positioned over the video player
2. WHEN a counting movement is detected in video content, THE Ghost Character SHALL animate upward by 60 pixels
3. THE Ghost Character SHALL display its vertical position relative to 10 horizontal jump markers
4. WHEN 10 jumps are completed, THE Ghost Character SHALL animate back to the starting position at the bottom
5. THE Ghost Character animation SHALL complete within 200 milliseconds per jump

### Requirement 11: Jump Progress Visualization

**User Story:** As a user playing the game, I want to see visual markers showing progress toward the next point, so that I know how many more movements need to be detected.

#### Acceptance Criteria

1. THE Jump Markers System SHALL render 10 horizontal lines at 60 pixel intervals on the ghost canvas
2. THE Jump Markers System SHALL display reached markers with 60% opacity and gold color
3. THE Jump Markers System SHALL display unreached markers with 30% opacity and white color
4. THE Jump Markers System SHALL show a number label (1-10) next to each marker
5. THE Jump Markers System SHALL update marker appearance immediately when the ghost reaches each level

### Requirement 12: Heads-Up Display (HUD)

**User Story:** As a user playing the game, I want to see my current score and jump progress, so that I can track performance without interrupting video watching.

#### Acceptance Criteria

1. THE HUD SHALL display in the top-right corner of the video player with semi-transparent background
2. THE HUD SHALL show the current score as a prominent numeric value
3. THE HUD SHALL show jump progress in the format "X/10" where X is the current jump count
4. THE HUD SHALL display the currently selected counting movement with its icon
5. THE HUD SHALL update within 16 milliseconds (60fps) after each movement detection

### Requirement 13: Score Management

**User Story:** As a user playing the game, I want to earn points for completing jump sequences, so that I can measure achievement while watching videos.

#### Acceptance Criteria

1. WHEN the ghost completes 10 jumps, THE Game Mode System SHALL increment the score by 1 point
2. THE Game Mode System SHALL reset the jump counter to 0 after awarding a point
3. THE Game Mode System SHALL persist the current score and high score using Chrome storage API
4. THE Game Mode System SHALL display the high score alongside the current score in the HUD
5. WHEN a new high score is achieved, THE Game Mode System SHALL display a visual celebration effect

### Requirement 14: Performance Optimization

**User Story:** As a user watching videos with game mode active, I want the game to run smoothly without degrading video playback, so that I can enjoy both the game and the video content.

#### Acceptance Criteria

1. THE Motion Detector SHALL analyze pose data from every third frame only
2. THE Motion Game Mode System SHALL add less than 5 milliseconds of processing time per analyzed frame
3. THE Motion Game Mode System SHALL maintain video playback at 30 frames per second during gameplay
4. THE Motion Detector SHALL use simple geometric calculations (angle computation, distance measurement) without additional ML models
5. THE Motion Game Mode System SHALL reduce frame rate degradation to maximum 10% compared to non-game mode

### Requirement 15: False Positive Prevention

**User Story:** As a user watching videos, I want the system to accurately count only clear movements in the video, so that the game progression feels fair and intentional.

#### Acceptance Criteria

1. THE Motion Detector SHALL apply cooldown periods between 400 and 800 milliseconds depending on movement type
2. THE Motion Detector SHALL validate detections across multiple consecutive frames using time window analysis
3. THE Motion Detector SHALL require at least 60% of frames within the time window to show positive detection
4. THE Motion Detector SHALL filter out detections with confidence scores below 0.3
5. THE Motion Detector SHALL ignore frames older than 500 milliseconds in the time window buffer

### Requirement 16: Body Size Normalization

**User Story:** As a user watching videos with people of different sizes and distances from camera, I want movement detection to work consistently, so that the game is fair regardless of video content characteristics.

#### Acceptance Criteria

1. THE Motion Detector SHALL normalize distance measurements relative to shoulder width of detected person
2. THE Motion Detector SHALL calculate angle thresholds using relative keypoint positions rather than absolute pixel coordinates
3. THE Motion Detector SHALL adapt detection thresholds based on the detected body size in the video frame
4. THE Motion Detector SHALL maintain detection accuracy across various video framing and camera angles
5. THE Motion Detector SHALL function correctly for detected persons with shoulder widths between 30 and 200 pixels in the frame

### Requirement 17: Visual Feedback Effects

**User Story:** As a user watching the game progress, I want immediate and satisfying visual feedback, so that I feel engaged with the video content.

#### Acceptance Criteria

1. WHEN a counting movement is detected, THE Game Mode System SHALL display visual feedback within 100 milliseconds
2. THE Game Mode System SHALL create particle effects at the ghost position when a jump occurs
3. WHEN a point is awarded, THE Game Mode System SHALL display a "+1" text animation that floats upward and fades out
4. THE Game Mode System SHALL use the existing Proton particle system for jump particle effects
5. THE Game Mode System SHALL display a movement indicator showing the currently selected counting movement

### Requirement 18: Game State Persistence

**User Story:** As a user who switches between videos or closes the browser, I want my game statistics to be saved, so that I can track progress over time.

#### Acceptance Criteria

1. THE Game Mode System SHALL save game state to Chrome local storage after each score update
2. THE Game Mode System SHALL persist high score, total games played, and per-movement statistics
3. WHEN the extension initializes, THE Game Mode System SHALL load the saved game state from Chrome storage
4. THE Game Mode System SHALL track total detection count for each of the five movement types
5. THE Game Mode System SHALL provide default values when no saved game state exists

### Requirement 19: Game Mode Integration

**User Story:** As a user switching between animation mode and game mode, I want the transition to be seamless, so that I can easily switch between different viewing experiences.

#### Acceptance Criteria

1. WHEN Game Mode is activated, THE Motion Game Mode System SHALL pause the current animation rendering
2. WHEN Game Mode is deactivated, THE Motion Game Mode System SHALL resume the previously active animation
3. THE Motion Game Mode System SHALL maintain the existing pose detection loop without reinitialization
4. THE Motion Game Mode System SHALL share the same canvas infrastructure with the animation system
5. THE Motion Game Mode System SHALL integrate detection logic into the existing requestAnimationFrame loop

### Requirement 20: Configuration Parameters

**User Story:** As a developer maintaining the system, I want configurable parameters for game mechanics, so that I can tune the game balance and detection sensitivity.

#### Acceptance Criteria

1. THE Game Mode System SHALL define jumps per point as a configurable parameter (default: 10)
2. THE Game Mode System SHALL define ghost jump height as a configurable parameter (default: 60 pixels)
3. THE Motion Detector SHALL define detection sample rate as a configurable parameter (default: every 3rd frame)
4. THE Motion Detector SHALL define movement-specific angle and distance thresholds as configurable parameters
5. THE Motion Detector SHALL define cooldown periods as configurable parameters for each movement type

### Requirement 21: Error Handling and Robustness

**User Story:** As a user watching various video content, I want the game to handle detection failures gracefully, so that temporary issues don't break the game experience.

#### Acceptance Criteria

1. WHEN pose detection fails for a frame, THE Motion Game Mode System SHALL continue without throwing errors
2. WHEN no person is detected in video content, THE Motion Game Mode System SHALL pause jump counting without resetting progress
3. IF insufficient keypoints are detected for the selected counting movement, THEN THE Motion Detector SHALL skip that frame
4. THE Motion Game Mode System SHALL validate canvas dimensions before rendering
5. THE Motion Game Mode System SHALL handle video player resize events without losing game state

### Requirement 22: UI Responsiveness

**User Story:** As a user with different screen sizes, I want the game UI to adapt to my display, so that all elements are visible and properly positioned.

#### Acceptance Criteria

1. THE Motion Selection Panel SHALL center horizontally and position 80 pixels from the top of the video player
2. THE HUD SHALL position 20 pixels from the top-right corner of the video player
3. THE Ghost Character SHALL scale its base position relative to canvas height
4. THE Jump Markers SHALL maintain consistent spacing regardless of canvas dimensions
5. WHEN the video player is resized, THE Motion Game Mode System SHALL reposition all UI elements within 100 milliseconds
