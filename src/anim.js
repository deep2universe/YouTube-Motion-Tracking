import Proton from "proton-engine";
import * as detectUtils from "./detectUtils";
import * as poseDetection from '@tensorflow-models/pose-detection';
import {AnimEnum} from "./animEnum";

/**
 * Halloween Edition - Animation Engine
 * 
 * Handles all Halloween-themed animations including:
 * - Skeleton animations (canvas-based)
 * - Pumpkin/Head effects (canvas-based)
 * - Particle effects (Proton-based)
 *
 * Main methods:
 * - setNewAnimation: Switch between Halloween animations
 * - initParticles: Initialize Proton particle system
 * - updateKeypoint: Update animation based on pose detection
 * - updateParticles: Update particle emitter positions
 * - updateCanvas: Handle video resize events
 */
function Anim(mainVideo, canvas, canvasGL, ctx, webGLtx) {

    this.mainVideo = mainVideo;
    this.canvas = canvas;
    this.canvasGL = canvasGL;
    this.ctx = ctx;
    this.webGLtx = webGLtx;

    this.proton = null;
    this.protonEmitterArray = [];
    this.particleID = AnimEnum.particleBatSwarm.id; // Default Halloween particle
    this.attractionBehaviour = null;
    this.attractionBehaviours = [];
    this.repulsionBehaviour = null;
    this.nosePosition = {
        x: 400,
        y: 200
    };
    this.leftHandPosition = {
        x: 400,
        y: 200
    };
    this.rightHandPosition = {
        x: 400,
        y: 200
    };

    this.crossZoneBehaviour = null;
    this.conf = {radius: 170, tha: 0};
    this.rendererGL;
    this.startParticleInit = true;
    this.currentAnimation = AnimEnum.skeletonGlow.name; // Default Halloween animation
    this.keypointArcSize = 1;
    this.keypointScore = 0.5; // Keypoint confidence threshold

    this.PARTICLE = "particle";

    /**
     * Switch and prepare current Halloween animation
     *
     * @param animationId new animation ID
     */
    this.setNewAnimation = function (animationId) {
        console.log('Halloween Edition - setNewAnimation called with:', animationId);
        this.clearWebGL();

        // ========== SKELETON ANIMATIONS (Canvas) ==========
        if (animationId === AnimEnum.skeletonGlow.name) {
            this.currentAnimation = AnimEnum.skeletonGlow.name;

        } else if (animationId === AnimEnum.skeletonDance.name) {
            this.currentAnimation = AnimEnum.skeletonDance.name;

        } else if (animationId === AnimEnum.skeletonXRay.name) {
            this.currentAnimation = AnimEnum.skeletonXRay.name;

        } else if (animationId === AnimEnum.skeletonZombie.name) {
            this.currentAnimation = AnimEnum.skeletonZombie.name;

        } else if (animationId === AnimEnum.skeletonNeon.name) {
            this.currentAnimation = AnimEnum.skeletonNeon.name;

        // ========== PUMPKIN/HEAD EFFECTS (Canvas) ==========
        } else if (animationId === AnimEnum.pumpkinClassic.name) {
            this.currentAnimation = AnimEnum.pumpkinClassic.name;

        } else if (animationId === AnimEnum.pumpkinEvil.name) {
            this.currentAnimation = AnimEnum.pumpkinEvil.name;

        } else if (animationId === AnimEnum.skullHead.name) {
            this.currentAnimation = AnimEnum.skullHead.name;

        // ========== PARTICLE EFFECTS - CREATURES ==========
        } else if (animationId === AnimEnum.particleBatSwarm.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleBatSwarm.id;

        } else if (animationId === AnimEnum.particleGhostTrail.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleGhostTrail.id;

        } else if (animationId === AnimEnum.particleSpiderWeb.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleSpiderWeb.id;

        } else if (animationId === AnimEnum.particleFloatingSkulls.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleFloatingSkulls.id;

        // ========== PARTICLE EFFECTS - MAGICAL ==========
        } else if (animationId === AnimEnum.particleWitchMagic.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleWitchMagic.id;

        } else if (animationId === AnimEnum.particleSpellCast.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleSpellCast.id;

        } else if (animationId === AnimEnum.particleDarkEnergy.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleDarkEnergy.id;

        // ========== PARTICLE EFFECTS - ATMOSPHERIC ==========
        } else if (animationId === AnimEnum.particleFog.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleFog.id;

        } else if (animationId === AnimEnum.particleLightning.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleLightning.id;

        } else if (animationId === AnimEnum.particleAutumnLeaves.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleAutumnLeaves.id;

        // ========== PARTICLE EFFECTS - MYSTICAL POWERS ==========
        } else if (animationId === AnimEnum.mysticSoulStream.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.mysticSoulStream.id;

        } else if (animationId === AnimEnum.mysticBloodMoon.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.mysticBloodMoon.id;

        } else if (animationId === AnimEnum.mysticCurse.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.mysticCurse.id;

        } else if (animationId === AnimEnum.mysticPortal.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.mysticPortal.id;

        } else if (animationId === AnimEnum.mysticNecromancy.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.mysticNecromancy.id;

        } else if (animationId === AnimEnum.mysticVortex.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.mysticVortex.id;

        } else if (animationId === AnimEnum.mysticRunes.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.mysticRunes.id;
        }

        // Initialize particle system if particle animation selected
        if(this.currentAnimation === this.PARTICLE){
            this.initParticles();
        }
    }

    /**
     * Initialize Halloween particle system
     */
    this.initParticles = function () {
        if (!this.currentAnimation.startsWith(this.PARTICLE)) {
            return;
        }
        this.startParticleInit = true;

        if(this.proton !== null){
            this.proton.destroy();
        }
        this.protonEmitterArray = [];

        // Clear canvas2D content
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Initialize Halloween particle animations
        if (this.particleID === AnimEnum.particleBatSwarm.id) {
            this.cParticleBatSwarm();

        } else if (this.particleID === AnimEnum.particleGhostTrail.id) {
            this.cParticleGhostTrail();

        } else if (this.particleID === AnimEnum.particleSpiderWeb.id) {
            this.cParticleSpiderWeb();

        } else if (this.particleID === AnimEnum.particleFloatingSkulls.id) {
            this.cParticleFloatingSkulls();

        } else if (this.particleID === AnimEnum.particleWitchMagic.id) {
            this.cParticleWitchMagic();

        } else if (this.particleID === AnimEnum.particleSpellCast.id) {
            this.cParticleSpellCast();

        } else if (this.particleID === AnimEnum.particleDarkEnergy.id) {
            this.cParticleDarkEnergy();

        } else if (this.particleID === AnimEnum.particleFog.id) {
            this.cParticleFog();

        } else if (this.particleID === AnimEnum.particleLightning.id) {
            this.cParticleLightning();

        } else if (this.particleID === AnimEnum.particleAutumnLeaves.id) {
            this.cParticleAutumnLeaves();

        // ========== MYSTICAL POWERS ==========
        } else if (this.particleID === AnimEnum.mysticSoulStream.id) {
            this.cMysticSoulStream();

        } else if (this.particleID === AnimEnum.mysticBloodMoon.id) {
            this.cMysticBloodMoon();

        } else if (this.particleID === AnimEnum.mysticCurse.id) {
            this.cMysticCurse();

        } else if (this.particleID === AnimEnum.mysticPortal.id) {
            this.cMysticPortal();

        } else if (this.particleID === AnimEnum.mysticNecromancy.id) {
            this.cMysticNecromancy();

        } else if (this.particleID === AnimEnum.mysticVortex.id) {
            this.cMysticVortex();

        } else if (this.particleID === AnimEnum.mysticRunes.id) {
            this.cMysticRunes();
        }

        this.startParticleInit = false;
    }

    /**
     * Update keypoints after pose detection and render Halloween animation
     *
     * @param pose raw keypoints from tensorflow estimation
     * @param canvasPoseCoordinates rescaled keypoints from estimation
     */
    this.updateKeypoint = function (pose, canvasPoseCoordinates) {

        // Handle particle animations
        if (this.currentAnimation === this.PARTICLE) {
            this.updateParticles(canvasPoseCoordinates);
            return;
        }

        // Clear canvas for new frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // ========== SKELETON ANIMATIONS ==========
        if (this.currentAnimation === AnimEnum.skeletonGlow.name) {
            this.drawSkeletonGlow(canvasPoseCoordinates);

        } else if (this.currentAnimation === AnimEnum.skeletonDance.name) {
            this.drawSkeletonDance(canvasPoseCoordinates);

        } else if (this.currentAnimation === AnimEnum.skeletonXRay.name) {
            this.drawSkeletonXRay(canvasPoseCoordinates);

        } else if (this.currentAnimation === AnimEnum.skeletonZombie.name) {
            this.drawSkeletonZombie(canvasPoseCoordinates);

        } else if (this.currentAnimation === AnimEnum.skeletonNeon.name) {
            this.drawSkeletonNeon(canvasPoseCoordinates);

        // ========== PUMPKIN/HEAD EFFECTS ==========
        } else if (this.currentAnimation === AnimEnum.pumpkinClassic.name) {
            this.drawPumpkinHead(canvasPoseCoordinates, 'classic');

        } else if (this.currentAnimation === AnimEnum.pumpkinEvil.name) {
            this.drawPumpkinHead(canvasPoseCoordinates, 'evil');

        } else if (this.currentAnimation === AnimEnum.skullHead.name) {
            this.drawSkullHead(canvasPoseCoordinates);
        }
    }

    /**
     * Update Halloween particle emitter positions based on keypoints
     *
     * Keypoint mapping:
     * 0: nose, 1: left_eye, 2: right_eye, 3: left_ear, 4: right_ear
     * 5: left_shoulder, 6: right_shoulder, 7: left_elbow, 8: right_elbow
     * 9: left_wrist, 10: right_wrist, 11: left_hip, 12: right_hip
     * 13: left_knee, 14: right_knee, 15: left_ankle, 16: right_ankle
     *
     * @param keypoints from detector
     */
    this.updateParticles = function (keypoints) {
        if (keypoints === undefined) {
            return;
        }

        if (this.startParticleInit === true) {
            return;
        }

        if (this.protonEmitterArray.length === 0) {
            return;
        }

        // Reinit if video changed
        if(this.protonEmitterArray[0].p === null){
            this.initParticles();
        }

        switch (this.particleID) {
            case AnimEnum.particleBatSwarm.id:
                // Bats emit from both hands
                this.protonEmitterArray[0].p.x = keypoints[9].x;  // left wrist
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[10].x; // right wrist
                this.protonEmitterArray[1].p.y = keypoints[10].y;
                break;

            case AnimEnum.particleGhostTrail.id:
                // Ghosts follow all major body points
                for(let i = 0; i < 12; i++) {
                    const kpIndex = [9,7,5,6,8,10,11,13,15,12,14,16][i];
                    this.protonEmitterArray[i].p.x = keypoints[kpIndex].x;
                    this.protonEmitterArray[i].p.y = keypoints[kpIndex].y;
                }
                break;

            case AnimEnum.particleSpiderWeb.id:
                // Spiders from wrists
                this.protonEmitterArray[0].p.x = keypoints[9].x;
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[10].x;
                this.protonEmitterArray[1].p.y = keypoints[10].y;
                break;

            case AnimEnum.particleFloatingSkulls.id:
                // Skulls orbit around nose
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.attractionBehaviour.reset(this.nosePosition, 20, 400);
                break;

            case AnimEnum.particleWitchMagic.id:
                // Magic from hands
                this.protonEmitterArray[0].p.x = keypoints[9].x;
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[10].x;
                this.protonEmitterArray[1].p.y = keypoints[10].y;
                break;

            case AnimEnum.particleSpellCast.id:
                // Spell casting from wrists
                this.protonEmitterArray[0].p.x = keypoints[9].x;
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[10].x;
                this.protonEmitterArray[1].p.y = keypoints[10].y;
                break;

            case AnimEnum.particleDarkEnergy.id:
                // Dark energy from all body points
                for(let i = 0; i < 12; i++) {
                    const kpIndex = [9,7,5,6,8,10,11,13,15,12,14,16][i];
                    this.protonEmitterArray[i].p.x = keypoints[kpIndex].x;
                    this.protonEmitterArray[i].p.y = keypoints[kpIndex].y;
                }
                break;

            case AnimEnum.particleFog.id:
                // Fog repelled by nose
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 30, 200);
                break;

            case AnimEnum.particleLightning.id:
                // Lightning from 8 keypoints
                for(let i = 0; i < 8; i++) {
                    const kpIndex = [9, 10, 7, 8, 5, 6, 11, 12][i];
                    this.protonEmitterArray[i].p.x = keypoints[kpIndex].x;
                    this.protonEmitterArray[i].p.y = keypoints[kpIndex].y;
                }
                break;

            case AnimEnum.particleAutumnLeaves.id:
                // Leaves repelled by nose
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 35, 220);
                break;

            // ========== MYSTICAL POWERS ==========
            case AnimEnum.mysticSoulStream.id:
                // Soul streams from all body points
                for(let i = 0; i < 8; i++) {
                    const kpIndex = [0, 5, 6, 9, 10, 11, 12, 15][i]; // nose, shoulders, wrists, hips, left ankle
                    this.protonEmitterArray[i].p.x = keypoints[kpIndex].x;
                    this.protonEmitterArray[i].p.y = keypoints[kpIndex].y;
                }
                break;

            case AnimEnum.mysticBloodMoon.id:
                // Blood moon orbits around head
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.attractionBehaviour.reset(this.nosePosition, 15, 300);
                break;

            case AnimEnum.mysticCurse.id:
                // Curse symbols from hands
                this.protonEmitterArray[0].p.x = keypoints[9].x;
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[10].x;
                this.protonEmitterArray[1].p.y = keypoints[10].y;
                break;

            case AnimEnum.mysticPortal.id:
                // Portal at torso center
                const torsoX = (keypoints[5].x + keypoints[6].x + keypoints[11].x + keypoints[12].x) / 4;
                const torsoY = (keypoints[5].y + keypoints[6].y + keypoints[11].y + keypoints[12].y) / 4;
                this.protonEmitterArray[0].p.x = torsoX;
                this.protonEmitterArray[0].p.y = torsoY;
                break;

            case AnimEnum.mysticNecromancy.id:
                // Necromancy from hands with attraction to head
                this.protonEmitterArray[0].p.x = keypoints[9].x;
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[10].x;
                this.protonEmitterArray[1].p.y = keypoints[10].y;
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.attractionBehaviour.reset(this.nosePosition, 25, 350);
                break;

            case AnimEnum.mysticVortex.id:
                // Vortex from torso
                const vortexX = (keypoints[11].x + keypoints[12].x) / 2;
                const vortexY = (keypoints[11].y + keypoints[12].y) / 2;
                this.protonEmitterArray[0].p.x = vortexX;
                this.protonEmitterArray[0].p.y = vortexY;
                break;

            case AnimEnum.mysticRunes.id:
                // Runes from shoulders and hips
                this.protonEmitterArray[0].p.x = keypoints[5].x;  // left shoulder
                this.protonEmitterArray[0].p.y = keypoints[5].y;
                this.protonEmitterArray[1].p.x = keypoints[6].x;  // right shoulder
                this.protonEmitterArray[1].p.y = keypoints[6].y;
                this.protonEmitterArray[2].p.x = keypoints[11].x; // left hip
                this.protonEmitterArray[2].p.y = keypoints[11].y;
                this.protonEmitterArray[3].p.x = keypoints[12].x; // right hip
                this.protonEmitterArray[3].p.y = keypoints[12].y;
                break;

            default:
                break;
        }
    }

    /**
     * Update canvas and context references
     *
     * @param mainVideo watched video
     * @param canvas 2d canvas
     * @param canvasGL webGL canvas
     * @param ctx 2d canvas context
     * @param webGLtx webGL canvas context
     */
    this.updateCanvas = function (mainVideo, canvas, canvasGL, ctx, webGLtx){
        this.mainVideo = mainVideo;
        this.canvas = canvas;
        this.canvasGL = canvasGL;
        this.ctx = ctx;
        this.webGLtx = webGLtx;
    }

    /**
     * Update particle animation frame
     */
    this.updateProton = function () {
        if(!this.currentAnimation.startsWith(this.PARTICLE)){
            return;
        }
        if(this.proton !== null){
            this.proton.update();
        }
    }

    /**
     * Draw circles at every keypoint
     * @param keypoints
     */
    this.drawKeyPoints = function(keypoints) {
        for (let keypoint of keypoints) {
            if(keypoint.score < this.keypointScore){
                continue;
            }
            this.ctx.beginPath();
            this.ctx.arc(keypoint.x, keypoint.y, 2 * this.keypointArcSize, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#FF6600'; // Halloween orange
            this.ctx.fill();
        }
    }

    /**
     * Draw skeleton lines between keypoints
     * @param keypoints
     * @param lineWidth
     * @param color
     */
    this.drawSkeleton = function(keypoints, lineWidth, color) {
        this.ctx.strokeStyle = color || '#FF6600';
        this.ctx.lineWidth = lineWidth;

        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            const score1 = kp1.score != null ? kp1.score : 1;
            const score2 = kp2.score != null ? kp2.score : 1;

            if (score1 >= this.keypointScore && score2 >= this.keypointScore) {
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });
    }

    /**
     * Helper function to draw line
     */
    this.drawLine = function (startX, startY, endX, endY) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }


    // ========== SKELETON CANVAS ANIMATIONS ==========

    /**
     * Draw glowing skeleton with pulsating energy rings
     * Features: Pulsating rings around joints, energy connections, varying line thickness
     */
    this.drawSkeletonGlow = function(keypoints) {
        const time = Date.now() / 1000;
        const pulse = (Math.sin(time * 3) + 1) / 2; // 0 to 1
        
        // Draw energy rings around major joints
        const majorJoints = [0, 5, 6, 9, 10, 11, 12]; // nose, shoulders, wrists, hips
        for (let i of majorJoints) {
            const kp = keypoints[i];
            if(kp.score < this.keypointScore) continue;
            
            // Multiple pulsating rings
            for(let ring = 0; ring < 3; ring++) {
                const ringSize = 15 + ring * 10 + pulse * 8;
                const ringAlpha = (1 - ring * 0.3) * (0.3 + pulse * 0.4);
                
                this.ctx.strokeStyle = `rgba(0, 255, 0, ${ringAlpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#00FF00';
                this.ctx.beginPath();
                this.ctx.arc(kp.x, kp.y, ringSize, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
        }

        // Draw skeleton with varying thickness
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#FF6600';
        
        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                // Vary thickness: face thin, torso thick, limbs medium
                let thickness = 3;
                if(i <= 4 || j <= 4) thickness = 1.5; // Face connections - thin
                else if((i === 5 || i === 6) && (j === 11 || j === 12)) thickness = 6; // Torso - thick
                else if(i >= 5 && i <= 10 && j >= 5 && j <= 10) thickness = 4; // Arms - medium
                
                this.ctx.strokeStyle = `rgba(255, 102, 0, ${0.7 + pulse * 0.3})`;
                this.ctx.lineWidth = thickness;
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });

        // Draw glowing core keypoints
        for (let keypoint of keypoints) {
            if(keypoint.score < this.keypointScore) continue;
            
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#00FF00';
            this.ctx.fillStyle = `rgba(255, 255, 0, ${0.8 + pulse * 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        this.ctx.shadowBlur = 0;
    }

    /**
     * Draw dancing skeleton with trailing afterimages and rhythm-based movement
     * Features: Multiple ghost trails, rhythmic scaling, face triangle connection
     */
    this.drawSkeletonDance = function(keypoints) {
        const time = Date.now() / 1000;
        const beat = Math.sin(time * 4); // Fast rhythm
        const jitterAmount = 2 + Math.abs(beat) * 3;
        
        // Draw 3 afterimage trails
        for(let trail = 0; trail < 3; trail++) {
            const trailAlpha = 0.15 - trail * 0.05;
            const trailOffset = trail * 8;
            
            this.ctx.strokeStyle = `rgba(139, 0, 255, ${trailAlpha})`;
            this.ctx.lineWidth = 3 - trail * 0.5;
            
            poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
                const kp1 = keypoints[i];
                const kp2 = keypoints[j];
                if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(kp1.x - trailOffset, kp1.y);
                    this.ctx.lineTo(kp2.x - trailOffset, kp2.y);
                    this.ctx.stroke();
                }
            });
        }
        
        // Draw main skeleton with jitter
        const jitteredKeypoints = keypoints.map(kp => ({
            ...kp,
            x: kp.x + (Math.random() - 0.5) * jitterAmount,
            y: kp.y + (Math.random() - 0.5) * jitterAmount
        }));

        // Draw face triangle (nose to ears)
        if(keypoints[0].score >= this.keypointScore && 
           keypoints[3].score >= this.keypointScore && 
           keypoints[4].score >= this.keypointScore) {
            this.ctx.strokeStyle = '#FF00FF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(jitteredKeypoints[0].x, jitteredKeypoints[0].y); // nose
            this.ctx.lineTo(jitteredKeypoints[3].x, jitteredKeypoints[3].y); // left ear
            this.ctx.lineTo(jitteredKeypoints[4].x, jitteredKeypoints[4].y); // right ear
            this.ctx.closePath();
            this.ctx.stroke();
        }

        // Draw main skeleton with rhythm-based colors
        const colorShift = Math.floor((beat + 1) * 127);
        this.ctx.strokeStyle = `rgb(${colorShift}, 0, ${255 - colorShift})`;
        this.ctx.lineWidth = 4;

        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
            const kp1 = jitteredKeypoints[i];
            const kp2 = jitteredKeypoints[j];
            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });

        // Draw pulsating keypoints
        for (let kp of jitteredKeypoints) {
            if(kp.score < this.keypointScore) continue;
            const size = 4 + Math.abs(beat) * 3;
            this.ctx.fillStyle = '#FF6600';
            this.ctx.beginPath();
            this.ctx.arc(kp.x, kp.y, size, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    /**
     * Draw X-ray skeleton with bone structure and medical scan lines
     * Features: Thick bones, thin joints, scanning effect, medical grid
     */
    this.drawSkeletonXRay = function(keypoints) {
        const time = Date.now() / 1000;
        
        // Dark background overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw scanning line effect
        const scanY = (time * 100) % this.canvas.height;
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.fillRect(0, scanY - 50, this.canvas.width, 100);
        
        // Draw medical grid
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
        this.ctx.lineWidth = 1;
        for(let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for(let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Draw bones with varying thickness (thicker = bone, thinner = joint)
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00FF00';
        
        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                // Bone thickness varies by body part
                let thickness = 2;
                if(i <= 4 || j <= 4) thickness = 1; // Face - very thin
                else if((i >= 5 && i <= 6) || (j >= 5 && j <= 6)) thickness = 8; // Shoulders - thick
                else if((i >= 7 && i <= 10) || (j >= 7 && j <= 10)) thickness = 5; // Arms - medium
                else if((i >= 11 && i <= 12) || (j >= 11 && j <= 12)) thickness = 7; // Hips - thick
                else if((i >= 13 && i <= 16) || (j >= 13 && j <= 16)) thickness = 6; // Legs - thick
                
                // Draw bone with gradient effect
                const gradient = this.ctx.createLinearGradient(kp1.x, kp1.y, kp2.x, kp2.y);
                gradient.addColorStop(0, '#00FF00');
                gradient.addColorStop(0.5, '#00DD00');
                gradient.addColorStop(1, '#00FF00');
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = thickness;
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });

        // Draw glowing joints with size variation
        for (let i = 0; i < keypoints.length; i++) {
            const kp = keypoints[i];
            if(kp.score < this.keypointScore) continue;
            
            // Joint size varies
            let jointSize = 3;
            if(i <= 4) jointSize = 2; // Face - small
            else if(i >= 5 && i <= 6) jointSize = 6; // Shoulders - large
            else if(i >= 11 && i <= 12) jointSize = 6; // Hips - large
            else jointSize = 4; // Others - medium
            
            this.ctx.fillStyle = '#00FF00';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(kp.x, kp.y, jointSize, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        this.ctx.shadowBlur = 0;
    }

    /**
     * Draw zombie skeleton caught in spider web with external control lines
     * Features: Web lines from edges, trapped effect, dripping decay, irregular movement
     */
    this.drawSkeletonZombie = function(keypoints) {
        const time = Date.now() / 1000;
        
        // Draw spider web control lines from canvas edges to keypoints
        const controlPoints = [
            {x: 0, y: 0}, // top-left
            {x: this.canvas.width, y: 0}, // top-right
            {x: 0, y: this.canvas.height}, // bottom-left
            {x: this.canvas.width, y: this.canvas.height}, // bottom-right
            {x: this.canvas.width / 2, y: 0}, // top-center
            {x: this.canvas.width / 2, y: this.canvas.height}, // bottom-center
        ];
        
        // Draw web lines to major joints (shoulders, wrists, hips, ankles)
        const trappedJoints = [5, 6, 9, 10, 11, 12, 15, 16];
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        this.ctx.lineWidth = 1;
        
        for(let jointIdx of trappedJoints) {
            const kp = keypoints[jointIdx];
            if(kp.score < this.keypointScore) continue;
            
            // Connect to nearest control point
            const nearestControl = controlPoints.reduce((nearest, cp) => {
                const dist = Math.sqrt(Math.pow(cp.x - kp.x, 2) + Math.pow(cp.y - kp.y, 2));
                return dist < nearest.dist ? {cp, dist} : nearest;
            }, {cp: controlPoints[0], dist: Infinity}).cp;
            
            // Draw web line with slight wave
            const wave = Math.sin(time * 2 + jointIdx) * 5;
            this.ctx.beginPath();
            this.ctx.moveTo(nearestControl.x, nearestControl.y);
            this.ctx.quadraticCurveTo(
                (nearestControl.x + kp.x) / 2 + wave,
                (nearestControl.y + kp.y) / 2 + wave,
                kp.x, kp.y
            );
            this.ctx.stroke();
        }

        // Draw main skeleton with irregular, decaying appearance
        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                // Irregular line width for decay effect
                const irregularity = Math.random() * 2;
                this.ctx.lineWidth = 4 + irregularity;
                
                // Alternating purple/green for zombie effect
                const colorMix = Math.sin(time + i + j);
                const r = 139 + colorMix * 50;
                const g = colorMix > 0 ? 205 : 0;
                const b = colorMix < 0 ? 255 : 50;
                this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                
                // Draw with slight jitter
                const jitter = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x + (Math.random() - 0.5) * jitter, kp1.y + (Math.random() - 0.5) * jitter);
                this.ctx.lineTo(kp2.x + (Math.random() - 0.5) * jitter, kp2.y + (Math.random() - 0.5) * jitter);
                this.ctx.stroke();
            }
        });

        // Draw dripping decay effect from joints
        for (let i = 0; i < keypoints.length; i++) {
            const kp = keypoints[i];
            if(kp.score < this.keypointScore) continue;
            
            // Main joint with pulsating glow
            const pulse = Math.sin(time * 3 + i) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(50, 205, 50, ${pulse})`;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#32CD32';
            this.ctx.beginPath();
            this.ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
            this.ctx.fill();

            // Random dripping effect
            if(Math.random() > 0.6) {
                const dripLength = 15 + Math.random() * 20;
                const dripAlpha = 0.3 + Math.random() * 0.3;
                this.ctx.fillStyle = `rgba(50, 205, 50, ${dripAlpha})`;
                this.ctx.shadowBlur = 0;
                this.ctx.fillRect(kp.x - 2, kp.y + 5, 3, dripLength);
                
                // Drip droplet at end
                this.ctx.beginPath();
                this.ctx.arc(kp.x, kp.y + 5 + dripLength, 2, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
        
        this.ctx.shadowBlur = 0;
    }

    /**
     * Draw neon skeleton with electric arcs and lightning connections
     * Features: Electric arcs between joints, neon tubes, face connections, crackling energy
     */
    this.drawSkeletonNeon = function(keypoints) {
        const time = Date.now() / 1000;
        const colors = ['#FF00FF', '#00FFFF', '#FF6600', '#FFFF00'];
        
        // Draw electric arcs between random nearby keypoints
        for(let i = 0; i < keypoints.length; i++) {
            const kp1 = keypoints[i];
            if(kp1.score < this.keypointScore) continue;
            
            // Randomly connect to nearby keypoints with electric arcs
            if(Math.random() > 0.7) {
                for(let j = i + 1; j < keypoints.length; j++) {
                    const kp2 = keypoints[j];
                    if(kp2.score < this.keypointScore) continue;
                    
                    const dist = Math.sqrt(Math.pow(kp2.x - kp1.x, 2) + Math.pow(kp2.y - kp1.y, 2));
                    if(dist < 150) { // Only connect nearby points
                        const color = colors[Math.floor(Math.random() * colors.length)];
                        this.ctx.strokeStyle = color;
                        this.ctx.shadowColor = color;
                        this.ctx.shadowBlur = 20;
                        this.ctx.lineWidth = 1 + Math.random() * 2;
                        
                        // Draw jagged lightning arc
                        this.ctx.beginPath();
                        this.ctx.moveTo(kp1.x, kp1.y);
                        
                        const segments = 3;
                        for(let s = 1; s <= segments; s++) {
                            const t = s / segments;
                            const x = kp1.x + (kp2.x - kp1.x) * t + (Math.random() - 0.5) * 20;
                            const y = kp1.y + (kp2.y - kp1.y) * t + (Math.random() - 0.5) * 20;
                            this.ctx.lineTo(x, y);
                        }
                        this.ctx.lineTo(kp2.x, kp2.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
        
        // Draw face connections (nose to eyes to ears)
        if(keypoints[0].score >= this.keypointScore) {
            this.ctx.strokeStyle = '#FFFF00';
            this.ctx.shadowColor = '#FFFF00';
            this.ctx.shadowBlur = 25;
            this.ctx.lineWidth = 2;
            
            // Nose to eyes
            if(keypoints[1].score >= this.keypointScore) {
                this.ctx.beginPath();
                this.ctx.moveTo(keypoints[0].x, keypoints[0].y);
                this.ctx.lineTo(keypoints[1].x, keypoints[1].y);
                this.ctx.stroke();
            }
            if(keypoints[2].score >= this.keypointScore) {
                this.ctx.beginPath();
                this.ctx.moveTo(keypoints[0].x, keypoints[0].y);
                this.ctx.lineTo(keypoints[2].x, keypoints[2].y);
                this.ctx.stroke();
            }
            
            // Eyes to ears
            if(keypoints[1].score >= this.keypointScore && keypoints[3].score >= this.keypointScore) {
                this.ctx.beginPath();
                this.ctx.moveTo(keypoints[1].x, keypoints[1].y);
                this.ctx.lineTo(keypoints[3].x, keypoints[3].y);
                this.ctx.stroke();
            }
            if(keypoints[2].score >= this.keypointScore && keypoints[4].score >= this.keypointScore) {
                this.ctx.beginPath();
                this.ctx.moveTo(keypoints[2].x, keypoints[2].y);
                this.ctx.lineTo(keypoints[4].x, keypoints[4].y);
                this.ctx.stroke();
            }
        }

        // Draw main skeleton with neon tube effect
        this.ctx.shadowBlur = 30;
        
        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j], index) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                const color = colors[index % colors.length];
                const pulse = Math.sin(time * 5 + index) * 0.3 + 0.7;
                
                // Outer glow
                this.ctx.strokeStyle = color;
                this.ctx.shadowColor = color;
                this.ctx.lineWidth = 8;
                this.ctx.globalAlpha = 0.3 * pulse;
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
                
                // Inner bright line
                this.ctx.lineWidth = 3;
                this.ctx.globalAlpha = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });

        // Draw crackling neon keypoints
        for (let i = 0; i < keypoints.length; i++) {
            const kp = keypoints[i];
            if(kp.score < this.keypointScore) continue;
            
            const color = colors[i % colors.length];
            const pulse = Math.sin(time * 6 + i) * 0.4 + 0.6;
            
            // Outer glow
            this.ctx.fillStyle = color;
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 25;
            this.ctx.globalAlpha = 0.5 * pulse;
            this.ctx.beginPath();
            this.ctx.arc(kp.x, kp.y, 12, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Inner bright core
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }

    // ========== PUMPKIN/HEAD CANVAS ANIMATIONS ==========

    /**
     * Helper: Calculate head position and size from keypoints
     */
    this.calculateHeadTransform = function(keypoints) {
        const nose = keypoints[0];
        const leftEar = keypoints[3];
        const rightEar = keypoints[4];
        const leftShoulder = keypoints[5];
        const rightShoulder = keypoints[6];

        // Head center (nose position)
        const centerX = nose.x;
        const centerY = nose.y;

        // Head size (ear-to-ear distance)
        const earDistance = Math.sqrt(
            Math.pow(rightEar.x - leftEar.x, 2) + 
            Math.pow(rightEar.y - leftEar.y, 2)
        );
        const size = earDistance * 2; // Scale up for full head coverage

        // Head rotation (shoulder angle)
        const shoulderAngle = Math.atan2(
            rightShoulder.y - leftShoulder.y,
            rightShoulder.x - leftShoulder.x
        );

        return { centerX, centerY, size, angle: shoulderAngle };
    }

    /**
     * Draw pumpkin head overlay (classic or evil variant)
     */
    this.drawPumpkinHead = function(keypoints, variant) {
        const head = this.calculateHeadTransform(keypoints);
        
        // Save context
        this.ctx.save();
        this.ctx.translate(head.centerX, head.centerY);
        // Rotate 180 degrees (Math.PI) to flip vertically
        this.ctx.rotate(head.angle + Math.PI);

        // Draw pumpkin body
        const pumpkinColor = variant === 'evil' ? '#CC5500' : '#FF8C00';
        this.ctx.fillStyle = pumpkinColor;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, head.size / 2, head.size / 1.8, 0, 0, 2 * Math.PI);
        this.ctx.fill();

        // Draw pumpkin ridges
        this.ctx.strokeStyle = '#CC6600';
        this.ctx.lineWidth = 2;
        for(let i = -2; i <= 2; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * head.size / 8, -head.size / 2);
            this.ctx.lineTo(i * head.size / 8, head.size / 2);
            this.ctx.stroke();
        }

        // Draw eyes
        const eyeColor = variant === 'evil' ? '#DC143C' : '#FFD700';
        this.ctx.fillStyle = eyeColor;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = eyeColor;
        
        // Left eye (triangle)
        this.ctx.beginPath();
        this.ctx.moveTo(-head.size / 6, -head.size / 8);
        this.ctx.lineTo(-head.size / 8, head.size / 12);
        this.ctx.lineTo(-head.size / 4, head.size / 12);
        this.ctx.closePath();
        this.ctx.fill();

        // Right eye (triangle)
        this.ctx.beginPath();
        this.ctx.moveTo(head.size / 6, -head.size / 8);
        this.ctx.lineTo(head.size / 4, head.size / 12);
        this.ctx.lineTo(head.size / 8, head.size / 12);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw mouth (jagged smile)
        this.ctx.beginPath();
        this.ctx.moveTo(-head.size / 4, head.size / 4);
        for(let i = 0; i < 6; i++) {
            const x = -head.size / 4 + (i * head.size / 10);
            const y = head.size / 4 + (i % 2 === 0 ? 0 : head.size / 20);
            this.ctx.lineTo(x, y);
        }
        this.ctx.fill();

        // Flickering candle effect
        if(Math.random() > 0.3) {
            const flicker = 0.8 + Math.random() * 0.4;
            this.ctx.globalAlpha = flicker;
        }

        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }

    /**
     * Draw floating skull head
     */
    this.drawSkullHead = function(keypoints) {
        const head = this.calculateHeadTransform(keypoints);
        
        this.ctx.save();
        this.ctx.translate(head.centerX, head.centerY);
        // Rotate 180 degrees (Math.PI) to flip vertically
        this.ctx.rotate(head.angle + Math.PI);

        // Draw skull (bone white)
        this.ctx.fillStyle = '#FFFACD';
        this.ctx.strokeStyle = '#8B8B8B';
        this.ctx.lineWidth = 2;

        // Skull shape (simplified)
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, head.size / 2, head.size / 1.7, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        // Eye sockets (glowing)
        this.ctx.fillStyle = '#000000';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#FF6600';
        
        // Left eye socket
        this.ctx.beginPath();
        this.ctx.ellipse(-head.size / 6, -head.size / 10, head.size / 12, head.size / 8, 0, 0, 2 * Math.PI);
        this.ctx.fill();

        // Right eye socket
        this.ctx.beginPath();
        this.ctx.ellipse(head.size / 6, -head.size / 10, head.size / 12, head.size / 8, 0, 0, 2 * Math.PI);
        this.ctx.fill();

        // Nose cavity (triangle)
        this.ctx.beginPath();
        this.ctx.moveTo(0, head.size / 12);
        this.ctx.lineTo(-head.size / 20, head.size / 5);
        this.ctx.lineTo(head.size / 20, head.size / 5);
        this.ctx.closePath();
        this.ctx.fill();

        // Jaw (moves with head tilt)
        const jawOffset = Math.sin(head.angle) * 5;
        this.ctx.fillStyle = '#FFFACD';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.ellipse(0, head.size / 2.5 + jawOffset, head.size / 3, head.size / 6, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        // Teeth
        this.ctx.fillStyle = '#FFFFFF';
        for(let i = -3; i <= 3; i++) {
            this.ctx.fillRect(i * head.size / 20, head.size / 3 + jawOffset, head.size / 25, head.size / 15);
        }

        this.ctx.restore();
    }


    // ========== PARTICLE ANIMATIONS - CREATURES ==========

    /**
     * Bat swarm from hands - simple circles with high initial alpha that fades
     */
    this.cParticleBatSwarm = function() {
        this.proton = new Proton();
        
        // Create 2 emitters (left and right hands)
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(15, 25), 0.2);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(8, 15));
            emitter.addInitialize(new Proton.Life(2, 4));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(3, 6), new Proton.Span(0, 360), 'polar'));
            
            // Black bats with purple glow - high initial alpha that fades to dark
            emitter.addBehaviour(new Proton.Color('#000000', '#8B00FF'));
            emitter.addBehaviour(new Proton.Alpha(1.0, 0)); // Start at full opacity (1.0), fade to 0
            emitter.addBehaviour(new Proton.Scale(1.5, 0.3));
            emitter.addBehaviour(new Proton.RandomDrift(40, 40, 0.08)); // Erratic flight
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    /**
     * Ghost trail following body
     */
    this.cParticleGhostTrail = function() {
        this.proton = new Proton();
        
        // Create 12 emitters for major body points
        for(let i = 0; i < 12; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(5, 8), 0.2); // Reduced rate for less density
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(12, 20)); // Smaller particles
            emitter.addInitialize(new Proton.Life(2, 4)); // Shorter life
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.3, 1.0), new Proton.Span(0, 360), 'polar'));
            
            // Much more translucent white/blue ghosts - reduced alpha significantly
            emitter.addBehaviour(new Proton.Color('#FFFFFF', '#E0F6FF'));
            emitter.addBehaviour(new Proton.Alpha(0.15, 0)); // Changed from 0.7 to 0.15 for transparency
            emitter.addBehaviour(new Proton.Scale(1.5, 0.3)); // Smaller scale
            emitter.addBehaviour(new Proton.Gravity(-0.3)); // Slight upward drift
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    /**
     * Spiders with web trails from wrists
     */
    this.cParticleSpiderWeb = function() {
        this.proton = new Proton();
        
        // Create 2 emitters for wrists
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(10, 15), 0.3);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(6, 12));
            emitter.addInitialize(new Proton.Life(4, 8));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(60, 120), 'polar'));
            
            // Gray/white spiders
            emitter.addBehaviour(new Proton.Color('#4D4D4D', '#CCCCCC'));
            emitter.addBehaviour(new Proton.Alpha(0.8, 0.2));
            emitter.addBehaviour(new Proton.Scale(1, 0.5));
            emitter.addBehaviour(new Proton.Gravity(2)); // Spiders fall
            emitter.addBehaviour(new Proton.RandomDrift(15, 5, 0.04));
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    /**
     * Floating skulls orbiting around body
     */
    this.cParticleFloatingSkulls = function() {
        this.proton = new Proton();
        
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(30, 50), 0.5);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(10, 20));
        emitter.addInitialize(new Proton.Life(6, 10));
        emitter.addInitialize(new Proton.Position(new Proton.RectZone(0, 0, this.canvas.width, this.canvas.height)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.5, 1.5), new Proton.Span(0, 360), 'polar'));
        
        // Bone-white skulls
        emitter.addBehaviour(new Proton.Color('#FFFACD', '#F5F5DC'));
        emitter.addBehaviour(new Proton.Alpha(0.8, 0.3));
        emitter.addBehaviour(new Proton.Scale(1.2, 0.8));
        emitter.addBehaviour(new Proton.Rotate()); // Slow rotation
        
        // Attraction to nose (orbit effect)
        this.nosePosition = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.attractionBehaviour = new Proton.Attraction(this.nosePosition, 20, 400);
        emitter.addBehaviour(this.attractionBehaviour);
        
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        
        this.tryWebGLRendererInit();
    }

    // ========== PARTICLE ANIMATIONS - MAGICAL ==========

    /**
     * Witch magic spirals from hands
     */
    this.cParticleWitchMagic = function() {
        this.proton = new Proton();
        
        // Create 2 emitters for hands
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(25, 35), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(8, 16));
            emitter.addInitialize(new Proton.Life(1.5, 3));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(2, 4), new Proton.Span(0, 360), 'polar'));
            
            // Purple/green magic
            emitter.addBehaviour(new Proton.Color('#9400D3', '#32CD32'));
            emitter.addBehaviour(new Proton.Alpha(0.9, 0));
            emitter.addBehaviour(new Proton.Scale(2, 0.1));
            emitter.addBehaviour(new Proton.Cyclone(2, 80)); // Spiral pattern
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    /**
     * Spell casting - explosive fire-like bursts
     */
    this.cParticleSpellCast = function() {
        this.proton = new Proton();
        
        // Create 2 emitters for wrists
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(40, 60), 0.15);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(6, 14));
            emitter.addInitialize(new Proton.Life(1, 2.5));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(5, 9), new Proton.Span(0, 360), 'polar'));
            
            // Orange to red fire colors
            emitter.addBehaviour(new Proton.Color('#FF6600', '#DC143C'));
            emitter.addBehaviour(new Proton.Alpha(1, 0));
            emitter.addBehaviour(new Proton.Scale(2, 0));
            emitter.addBehaviour(new Proton.Gravity(-1)); // Upward drift
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    /**
     * Dark energy - black/purple smoke from body (tiny particles)
     */
    this.cParticleDarkEnergy = function() {
        this.proton = new Proton();
        
        // Create 12 emitters for body points
        for(let i = 0; i < 12; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(10, 15), 0.25); // Reduced rate
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(4, 8)); // Much smaller: was 20-40, now 4-8
            emitter.addInitialize(new Proton.Life(2, 4)); // Shorter life
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 2), new Proton.Span(0, 360), 'polar'));
            
            // Black/purple smoke - more transparent
            emitter.addBehaviour(new Proton.Color('#000000', '#6A0DAD'));
            emitter.addBehaviour(new Proton.Alpha(0.3, 0)); // Reduced from 0.6 to 0.3
            emitter.addBehaviour(new Proton.Scale(1.5, 0.3)); // Much smaller scale: was 3, now 1.5
            emitter.addBehaviour(new Proton.Cyclone(1, 50)); // Swirling vortex
            emitter.addBehaviour(new Proton.RandomDrift(20, 20, 0.03));
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    // ========== PARTICLE ANIMATIONS - ATMOSPHERIC ==========

    /**
     * Creeping fog across bottom of screen
     */
    this.cParticleFog = function() {
        this.proton = new Proton();
        
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(30, 50), 0.4);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(30, 60));
        emitter.addInitialize(new Proton.Life(5, 10));
        emitter.addInitialize(new Proton.Position(
            new Proton.RectZone(0, this.canvas.height * 0.7, this.canvas.width, this.canvas.height * 0.3)
        ));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.3, 0.8), new Proton.Span(0, 360), 'polar'));
        
        // Gray fog with purple tint
        emitter.addBehaviour(new Proton.Color('#CCCCCC', '#EEEEEE'));
        emitter.addBehaviour(new Proton.Alpha(0.3, 0));
        emitter.addBehaviour(new Proton.Scale(2, 3));
        emitter.addBehaviour(new Proton.RandomDrift(15, 10, 0.02));
        
        // Repulsion from nose
        this.nosePosition = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.repulsionBehaviour = new Proton.Repulsion(this.nosePosition, 30, 200);
        emitter.addBehaviour(this.repulsionBehaviour);
        
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        
        this.tryWebGLRendererInit();
    }

    /**
     * Lightning arcs from keypoints
     */
    this.cParticleLightning = function() {
        this.proton = new Proton();
        
        // Create 8 emitters for hands, elbows, shoulders, hips
        for(let i = 0; i < 8; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(20, 30), 0.05);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(3, 8));
            emitter.addInitialize(new Proton.Life(0.1, 0.3)); // Very short for flash effect
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(5, 10), new Proton.Span(0, 360), 'polar'));
            
            // White/cyan electric
            emitter.addBehaviour(new Proton.Color('#FFFFFF', '#00FFFF'));
            emitter.addBehaviour(new Proton.Alpha(1, 0));
            emitter.addBehaviour(new Proton.Scale(2, 0));
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    /**
     * Falling autumn leaves
     */
    this.cParticleAutumnLeaves = function() {
        this.proton = new Proton();
        
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(40, 60), 0.5);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(8, 16));
        emitter.addInitialize(new Proton.Life(6, 12));
        emitter.addInitialize(new Proton.Position(new Proton.LineZone(0, 0, this.canvas.width, 0)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 2), new Proton.Span(85, 95), 'polar'));
        
        // Autumn colors
        emitter.addBehaviour(new Proton.Color(['#FF4500', '#FFD700', '#8B4513', '#FF6347', '#CD853F']));
        emitter.addBehaviour(new Proton.Alpha(0.8, 0));
        emitter.addBehaviour(new Proton.Scale(1, 0.5));
        emitter.addBehaviour(new Proton.Gravity(1));
        emitter.addBehaviour(new Proton.Rotate()); // Tumbling leaves
        emitter.addBehaviour(new Proton.RandomDrift(40, 20, 0.04));
        
        // Repulsion from nose
        this.nosePosition = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.repulsionBehaviour = new Proton.Repulsion(this.nosePosition, 35, 220);
        emitter.addBehaviour(this.repulsionBehaviour);
        
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        
        this.tryWebGLRendererInit();
    }

    // ========== HELPER METHODS ==========

    /**
     * Helper: Update left and right wrist emitter positions
     */
    this.leftRightWristUpdate = function (keypoints) {
        this.protonEmitterArray[0].p.x = keypoints[9].x;
        this.protonEmitterArray[0].p.y = keypoints[9].y;
        this.protonEmitterArray[1].p.x = keypoints[10].x;
        this.protonEmitterArray[1].p.y = keypoints[10].y;
    }

    // ========== MYSTICAL POWERS ANIMATIONS ==========

    /**
     * Soul Stream - Ethereal souls flowing from body in spirals
     */
    this.cMysticSoulStream = function() {
        this.proton = new Proton();
        
        // Create 8 emitters for major body points
        for(let i = 0; i < 8; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(15, 25), 0.2); // Reduced rate
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(10, 18));
            emitter.addInitialize(new Proton.Life(2, 4));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(0, 360), 'polar'));
            
            // Ghostly white/cyan souls - much more transparent
            emitter.addBehaviour(new Proton.Color('#FFFFFF', '#00FFFF'));
            emitter.addBehaviour(new Proton.Alpha(0.25, 0)); // Reduced from 0.8 to 0.25
            emitter.addBehaviour(new Proton.Scale(1.8, 0.2));
            emitter.addBehaviour(new Proton.Cyclone(1.5, 60)); // Spiral upward
            emitter.addBehaviour(new Proton.Gravity(-0.8)); // Float upward
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    /**
     * Blood Moon - Red orbs orbiting around head
     */
    this.cMysticBloodMoon = function() {
        this.proton = new Proton();
        
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(25, 35), 0.3);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(12, 20));
        emitter.addInitialize(new Proton.Life(4, 6));
        emitter.addInitialize(new Proton.Position(new Proton.CircleZone(this.canvas.width / 2, this.canvas.height / 2, 100)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.5, 1.5), new Proton.Span(0, 360), 'polar'));
        
        // Blood red with dark red
        emitter.addBehaviour(new Proton.Color('#DC143C', '#8B0000'));
        emitter.addBehaviour(new Proton.Alpha(0.9, 0.2));
        emitter.addBehaviour(new Proton.Scale(1.5, 0.8));
        emitter.addBehaviour(new Proton.Rotate());
        
        // Attraction to create orbit
        this.nosePosition = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.attractionBehaviour = new Proton.Attraction(this.nosePosition, 15, 300);
        emitter.addBehaviour(this.attractionBehaviour);
        
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        
        this.tryWebGLRendererInit();
    }

    /**
     * Curse - Dark purple symbols spiraling from hands
     */
    this.cMysticCurse = function() {
        this.proton = new Proton();
        
        // Create 2 emitters for hands
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(30, 40), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(6, 12));
            emitter.addInitialize(new Proton.Life(1.5, 2.5));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(2, 4), new Proton.Span(0, 360), 'polar'));
            
            // Dark purple/black curse
            emitter.addBehaviour(new Proton.Color('#4B0082', '#000000'));
            emitter.addBehaviour(new Proton.Alpha(1.0, 0));
            emitter.addBehaviour(new Proton.Scale(2.5, 0.1));
            emitter.addBehaviour(new Proton.Cyclone(3, 90)); // Fast spiral
            emitter.addBehaviour(new Proton.RandomDrift(20, 20, 0.05));
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    /**
     * Portal - Swirling vortex at torso center
     */
    this.cMysticPortal = function() {
        this.proton = new Proton();
        
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(40, 60), 0.1);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(8, 16));
        emitter.addInitialize(new Proton.Life(2, 3));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(3, 6), new Proton.Span(0, 360), 'polar'));
        
        // Purple/blue portal colors
        emitter.addBehaviour(new Proton.Color(['#8B00FF', '#4169E1', '#00CED1']));
        emitter.addBehaviour(new Proton.Alpha(0.9, 0));
        emitter.addBehaviour(new Proton.Scale(2, 0.1));
        emitter.addBehaviour(new Proton.Cyclone(4, 100)); // Strong vortex
        
        emitter.p.x = this.canvas.width / 2;
        emitter.p.y = this.canvas.height / 2;
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        
        this.tryWebGLRendererInit();
    }

    /**
     * Necromancy - Green death energy from hands attracted to head
     */
    this.cMysticNecromancy = function() {
        this.proton = new Proton();
        
        // Create 2 emitters for hands
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(25, 35), 0.15);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(10, 18));
            emitter.addInitialize(new Proton.Life(2.5, 4));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(1.5, 3), new Proton.Span(0, 360), 'polar'));
            
            // Toxic green/black necromancy
            emitter.addBehaviour(new Proton.Color('#00FF00', '#006400'));
            emitter.addBehaviour(new Proton.Alpha(0.85, 0));
            emitter.addBehaviour(new Proton.Scale(1.8, 0.3));
            emitter.addBehaviour(new Proton.Cyclone(2, 70));
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        // Attraction to head
        this.nosePosition = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.attractionBehaviour = new Proton.Attraction(this.nosePosition, 25, 350);
        this.protonEmitterArray[0].addBehaviour(this.attractionBehaviour);
        this.protonEmitterArray[1].addBehaviour(this.attractionBehaviour);
        
        this.tryWebGLRendererInit();
    }

    /**
     * Vortex - Massive swirling energy from torso
     */
    this.cMysticVortex = function() {
        this.proton = new Proton();
        
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(35, 50), 0.12); // Reduced rate
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(6, 14));
        emitter.addInitialize(new Proton.Life(1.5, 2.5));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(4, 7), new Proton.Span(0, 360), 'polar'));
        
        // Multi-colored vortex - much more transparent
        emitter.addBehaviour(new Proton.Color(['#FF00FF', '#00FFFF', '#FFFF00', '#FF6600']));
        emitter.addBehaviour(new Proton.Alpha(0.3, 0)); // Reduced from 0.95 to 0.3
        emitter.addBehaviour(new Proton.Scale(2.2, 0.1));
        emitter.addBehaviour(new Proton.Cyclone(5, 120)); // Very strong spiral
        
        emitter.p.x = this.canvas.width / 2;
        emitter.p.y = this.canvas.height / 2;
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        
        this.tryWebGLRendererInit();
    }

    /**
     * Runes - Mystical symbols from shoulders and hips
     */
    this.cMysticRunes = function() {
        this.proton = new Proton();
        
        // Create 4 emitters for shoulders and hips
        for(let i = 0; i < 4; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(12, 20), 0.25); // Reduced rate
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(12, 20));
            emitter.addInitialize(new Proton.Life(3, 5));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.8, 2), new Proton.Span(0, 360), 'polar'));
            
            // Golden/orange runes - much more transparent
            emitter.addBehaviour(new Proton.Color('#FFD700', '#FF8C00'));
            emitter.addBehaviour(new Proton.Alpha(0.3, 0)); // Reduced from 0.9 to 0.3
            emitter.addBehaviour(new Proton.Scale(1.5, 0.5));
            emitter.addBehaviour(new Proton.Cyclone(1, 50)); // Gentle spiral
            emitter.addBehaviour(new Proton.Rotate()); // Rotating symbols
            
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        
        this.tryWebGLRendererInit();
    }

    // ========== HELPER METHODS ==========

    /**
     * Try WebGL renderer, fallback to Canvas if unavailable
     */
    this.tryWebGLRendererInit = function (removeOtherRenderer = false) {
        try {
            this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
            this.rendererGL.blendFunc("SRC_ALPHA", "ONE");
            this.proton.addRenderer(this.rendererGL);
        } catch (e) {
            console.log('WebGL not available, using Canvas renderer');
            const renderer = new Proton.CanvasRenderer(this.canvas);
            this.proton.addRenderer(renderer);
        }
    }

    /**
     * Clear WebGL canvas and destroy particles
     */
    this.clearWebGL = function() {
        if(this.protonEmitterArray !== undefined){
            for(var i = 0; i < this.protonEmitterArray.length; i++){
                this.protonEmitterArray[i].removeAllParticles();
                this.protonEmitterArray[i].destroy();
            }
        }

        // Check if webGLtx exists before trying to clear
        if(this.webGLtx && this.webGLtx.clear) {
            this.webGLtx.clear(
                this.webGLtx.DEPTH_BUFFER_BIT | 
                this.webGLtx.COLOR_BUFFER_BIT | 
                this.webGLtx.STENCIL_BUFFER_BIT
            );
        }
    }
}

/**
 * OverlayRenderer - Canvas Overlay Effects for Horror Filters
 * 
 * Renders semi-transparent overlay effects on canvas to enhance horror filters:
 * - scanlines: VHS-style horizontal lines
 * - grain: Film grain noise
 * - grid: Medical/lab grid pattern with scanning line
 * - vignette: Dark edges effect
 * - glow: Radioactive glow effect
 */
class OverlayRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.overlayType = null;
        this.animationFrame = 0;
    }

    /**
     * Set the overlay type to render
     * @param {string|null} type - Overlay type or null to disable
     */
    setOverlayType(type) {
        this.overlayType = type;
        this.animationFrame = 0;
    }

    /**
     * Main render method - calls appropriate overlay renderer
     */
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

    /**
     * Render VHS-style horizontal scanlines
     */
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

    /**
     * Render film grain noise effect
     */
    renderGrain() {
        const { width, height } = this.canvas;
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;

        // Sparse random sampling (5% density)
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() > 0.95) {
                const value = Math.random() * 255;
                data[i] = value;     // R
                data[i + 1] = value; // G
                data[i + 2] = value; // B
                data[i + 3] = 100;   // A (semi-transparent)
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Render medical/lab grid pattern with animated scanning line
     */
    renderGrid() {
        const { width, height } = this.canvas;
        
        // Draw grid
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

        // Animated scanning line
        const scanY = (this.animationFrame * 2) % height;
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, scanY);
        this.ctx.lineTo(width, scanY);
        this.ctx.stroke();
    }

    /**
     * Render dark vignette effect (darkened edges)
     */
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

    /**
     * Render radioactive glow effect
     */
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

export {Anim, OverlayRenderer}
