import Proton, { Emitter, Rate, Span, Mass, Life, Body, Radius, Velocity, Alpha, Color, Scale, Attraction, RandomDrift, Repulsion, CrossZone, Gravity as ProtonGravity, Cyclone, Rotate, Position, RectZone, CircleZone, LineZone, WebGLRenderer, CanvasRenderer, PointZone } from "proton-engine"; // Added named imports
import * as detectUtils from "./detectUtils";
import * as poseDetection from '@tensorflow-models/pose-detection';
import {AnimEnum} from "./animEnum";

/**
 * Helper function to find a keypoint by its name.
 * @param {Array<Object>} keypoints - Array of keypoint objects.
 * @param {string} keypointName - Name of the keypoint to find.
 * @returns {Object|undefined} The keypoint object or undefined if not found.
 */
function getKeypoint(keypoints, keypointName) {
  return keypoints.find(kp => kp.name === keypointName);
}

/**
 * Class to handle animations
 *
 * Main methods:
 *
 * this.setNewAnimation -> set new animation. called from content.js when animation changes (click or random)
 * this.initParticles -> init Proton particle system. called if new animation starts with 'particle'
 * this.updateKeypoint -> get pose detection from tensorflow and update current animation
 * this.updateParticles -> for 'particle' animation update emitter and behaviour
 * this.updateCanvas -> if main video is resized set new width/height for canvas and context
 *
 *
 * @param mainVideo
 * @param canvas
 * @param canvasGL
 * @param ctx
 * @param webGLtx
 * @constructor
 */
function Anim(mainVideo, canvas, canvasGL, ctx, webGLtx) {

    this.mainVideo = mainVideo;
    this.canvas = canvas;
    this.canvasGL = canvasGL;
    this.ctx = ctx;
    this.webGLtx = webGLtx;

    this.proton = null;
    this.protonEmitterArray = [];
    this.particleID = AnimEnum.particle2BallHeadExp.id; // set default anim id for particles
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
    this.startParticleInit = true; //
    this.currentAnimation = AnimEnum.skeleton.name;
    this.keypointArcSize=1;
    this.keypointScore=0.5; // keypoint score, must be >=

    this.PARTICLE = "particle";

    /**
     * Switch and prepare current animation.
     *
     * @param animationId new animation ID
     */
    this.setNewAnimation = function (animationId) {
        this.clearWebGL();
        if (animationId === AnimEnum.skeleton.name) {
            this.currentAnimation = AnimEnum.skeleton.name;

        } else if (animationId === AnimEnum.skeleton3Times.name) {
            this.currentAnimation = AnimEnum.skeleton3Times.name;

        } else if (animationId === AnimEnum.skeleton5Times.name) {
            this.currentAnimation = AnimEnum.skeleton5Times.name;

        } else if (animationId === AnimEnum.puppetsPlayer.name) {
            this.currentAnimation = AnimEnum.puppetsPlayer.name;

        } else if (animationId === AnimEnum.spiderWeb.name) {
            this.currentAnimation = AnimEnum.spiderWeb.name;

        } else if (animationId === AnimEnum.particleHandsBall.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleHandsBall.id;

        } else if (animationId === AnimEnum.particle2BallHead.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particle2BallHead.id;

        } else if (animationId === AnimEnum.particleRightHandLine.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleRightHandLine.id;

        } else if (animationId === AnimEnum.particleNoseGravity.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleNoseGravity.id;

        } else if (animationId === AnimEnum.particleNoseSupernova.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleNoseSupernova.id;

        } else if (animationId === AnimEnum.particleHandsTrackFromBorder.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleHandsTrackFromBorder.id;

        } else if (animationId === AnimEnum.particleUpperBodyGlow.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleUpperBodyGlow.id;

        } else if (animationId === AnimEnum.particleGlowPainting.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleGlowPainting.id;

        } else if (animationId === AnimEnum.particlePainting.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particlePainting.id;

        } else if (animationId === AnimEnum.particlePaintRandomDrift.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particlePaintRandomDrift.id;

        } else if (animationId === AnimEnum.particleCometThrower.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleCometThrower.id;

        } else if (animationId === AnimEnum.particleBodyGlow.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleBodyGlow.id;

        } else if (animationId === AnimEnum.particleBurningMan.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleBurningMan.id;

        }else if (animationId === AnimEnum.particleCyclone.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleCyclone.id;

        }else if (animationId === AnimEnum.particleSun.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleSun.id;

        }else if (animationId === AnimEnum.particleFireFly.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleFireFly.id;

        }else if (animationId === AnimEnum.particleFireFlyColor.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleFireFlyColor.id;

        }else if (animationId === AnimEnum.particleSpit.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleSpit.id;

        }else if (animationId === AnimEnum.particle2BallHeadExp.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particle2BallHeadExp.id;

        }else if (animationId === AnimEnum.particleMatrix.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleMatrix.id;
        }else if (animationId === AnimEnum.particleSnow.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleSnow.id;
        }else if (animationId === AnimEnum.particleSnowHoriz.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleSnowHoriz.id;
        }else if (animationId === AnimEnum.particleLightSab.name){
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleLightSab.id;
        }

        if(this.currentAnimation === this.PARTICLE){
            this.initParticles();
        }
    }

    /**
     * Prepare particle system
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

        // clear canvas2D content
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.particleID === AnimEnum.particleHandsBall.id) {
            this.cParticleHandsBall();

        } else if (this.particleID === AnimEnum.particle2BallHead.id) {
            this.cParticle2BallHead();

        } else if (this.particleID === AnimEnum.particleRightHandLine.id) {
            this.cParticleRightHandLine();

        } else if (this.particleID === AnimEnum.particleNoseGravity.id) {
            this.cParticleNoseGravity();

        } else if (this.particleID === AnimEnum.particleNoseSupernova.id) {
            this.cParticleNoseSupernova();

        } else if (this.particleID === AnimEnum.particleHandsTrackFromBorder.id) {
            this.cParticleHandsTrackFromBorder();

        } else if (this.particleID === AnimEnum.particleUpperBodyGlow.id) {
            this.cParticleUpperBodyGlow();

        } else if (this.particleID === AnimEnum.particleGlowPainting.id) {
            this.cParticleGlowPainting();

        } else if (this.particleID === AnimEnum.particlePainting.id) {
            this.cParticlePainting();

        } else if (this.particleID === AnimEnum.particlePaintRandomDrift.id) {
            this.cParticlePaintRandomDrift();

        } else if (this.particleID === AnimEnum.particleCometThrower.id) {
            this.cParticleCometThrower();

        } else if (this.particleID === AnimEnum.particleBodyGlow.id) {
            this.cParticleBodyGlow();

        } else if (this.particleID === AnimEnum.particleBurningMan.id) {
            this.cParticleBurningMan();

        }else if (this.particleID === AnimEnum.particleCyclone.id){
            this.cParticleCyclone();

        }else if (this.particleID === AnimEnum.particleSun.id){
            this.cParticleSun();

        }else if (this.particleID === AnimEnum.particleFireFly.id){
            this.cParticleFireFly();

        }else if (this.particleID === AnimEnum.particleFireFlyColor.id){
            this.cParticleFireFlyColor();

        }else if (this.particleID === AnimEnum.particleSpit.id){
            this.cParticleSpit();

        }else if (this.particleID === AnimEnum.particle2BallHeadExp.id) {
            this.cParticle2BallHeadExp();

        }else if (this.particleID === AnimEnum.particleMatrix.id) {
            this.cParticleMatrix();

        }else if (this.particleID === AnimEnum.particleSnow.id) {
            this.cParticleSnow();

        }else if (this.particleID === AnimEnum.particleSnowHoriz.id) {
            this.cParticleSnowHoriz();

        }else if (this.particleID === AnimEnum.particleLightSab.id) {
            this.cParticleLightSab();

        }

        this.startParticleInit = false;

    }

    /**
     * Update keypoints after pose detector estimation from tensorflow
     *
     * @param pose raw keypoints from tensorflow estimation
     * @param canvasPoseCoordinates rescaled keypoints from estimation
     */
    this.updateKeypoint = function (pose, canvasPoseCoordinates) {

        if (this.currentAnimation === AnimEnum.skeleton.name) {

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,1);

        }else if (this.currentAnimation === this.PARTICLE) {

            this.updateParticles(canvasPoseCoordinates);

        }else if (this.currentAnimation === AnimEnum.skeleton3Times.name) {

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,1);

            canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, this.mainVideo, this.canvas, 0.5, 0.5);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,2);

            canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, this.mainVideo, this.canvas, 1.5, 1.5);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,5);

        }else if (this.currentAnimation === AnimEnum.skeleton5Times.name) {

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,1);

            canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, this.mainVideo, this.canvas, 0.5, 0.5);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,3);

            canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, this.mainVideo, this.canvas, 0.5, 0.5, this.canvas.width / 2, this.canvas.height / 2);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,3);

            canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, this.mainVideo, this.canvas, 0.5, 0.5, this.canvas.width / 2);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,3);

            canvasPoseCoordinates = detectUtils.transformKeypointsForRender(pose[0].keypoints, this.mainVideo, this.canvas, 0.5, 0.5, 0, this.canvas.height / 2);
            this.drawKeyPoints(canvasPoseCoordinates);
            this.drawSkeleton(canvasPoseCoordinates,3);

        }else if (this.currentAnimation === AnimEnum.puppetsPlayer.name) {

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawPuppets(canvasPoseCoordinates);

        }else if (this.currentAnimation === AnimEnum.spiderWeb.name) {

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawSpiderWeb(canvasPoseCoordinates);
        }
    }

    /**
     * Update particles emitter position on specific keypoints.
     *
     * Mapping emitter to pos in keypoints-array
     *                  0: nose
     *                  1: left_eye
     *                  2: right_eye
     *                  3: left_ear
     *                  4: right_ear
     *                  5: left_shoulder
     *                  6: right_shoulder
     *                  7: left_elbow
     *                  8: right_elbow
     *                  9: left_wrist
     *                  10: right_wrist
     *                  11: left_hip
     *                  12: right_hip
     *                  13: left_knee
     *                  14: right_knee
     *                  15: left_ankle
     *                  16: right_ankle
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

        // in case of new video reinit current particle effect
        if(this.protonEmitterArray[0].p === null){
            this.initParticles();
        }

        switch (this.particleID) {
            case AnimEnum.particleHandsBall.id:
                {
                    const rightWrist = getKeypoint(keypoints, 'right_wrist');
                    const leftWrist = getKeypoint(keypoints, 'left_wrist');
                    if (rightWrist) {
                        this.protonEmitterArray[0].p.x = rightWrist.x;
                        this.protonEmitterArray[0].p.y = rightWrist.y;
                    }
                    if (leftWrist) {
                        this.protonEmitterArray[1].p.x = leftWrist.x;
                        this.protonEmitterArray[1].p.y = leftWrist.y;
                    }
                }
                break;
            case AnimEnum.particle2BallHead.id: // circle head effect. center is nose
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.protonEmitterArray[0].p.x = nose.x + this.conf.radius * Math.sin(Math.PI / 2 + this.conf.tha);
                        this.protonEmitterArray[0].p.y = nose.y + this.conf.radius * Math.cos(Math.PI / 2 + this.conf.tha);
                        this.protonEmitterArray[1].p.x = nose.x + this.conf.radius * Math.sin(-Math.PI / 2 + this.conf.tha);
                        this.protonEmitterArray[1].p.y = nose.y + this.conf.radius * Math.cos(-Math.PI / 2 + this.conf.tha);
                        this.conf.tha += .1;
                    }
                }
                break;
            case AnimEnum.particleRightHandLine.id:
                {
                    const rightWrist = getKeypoint(keypoints, 'right_wrist');
                    if (rightWrist) {
                        this.protonEmitterArray[0].p.x = rightWrist.x;
                        this.protonEmitterArray[0].p.y = rightWrist.y;
                    }
                }
                break;
            case AnimEnum.particleNoseGravity.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.nosePosition.x = nose.x;
                        this.nosePosition.y = nose.y;
                        this.protonEmitterArray[0].p.x = nose.x;
                        this.protonEmitterArray[0].p.y = nose.y;
                    }
                }
                break;
            case AnimEnum.particleNoseSupernova.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.protonEmitterArray[0].p.x = nose.x;
                        this.protonEmitterArray[0].p.y = nose.y;
                    }
                }
                break;
            case AnimEnum.particleHandsTrackFromBorder.id:
                {
                    const leftWrist = getKeypoint(keypoints, 'left_wrist');
                    const rightWrist = getKeypoint(keypoints, 'right_wrist');
                    if (leftWrist) {
                        this.leftHandPosition.x = leftWrist.x;
                        this.leftHandPosition.y = leftWrist.y;
                    }
                    if (rightWrist) {
                        this.rightHandPosition.x = rightWrist.x;
                        this.rightHandPosition.y = rightWrist.y;
                    }
                }
                break;
            case AnimEnum.particleUpperBodyGlow.id:
                {
                    const leftWrist = getKeypoint(keypoints, 'left_wrist');
                    const leftElbow = getKeypoint(keypoints, 'left_elbow');
                    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
                    const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
                    const rightElbow = getKeypoint(keypoints, 'right_elbow');
                    const rightWrist = getKeypoint(keypoints, 'right_wrist');

                    if (leftWrist) { this.protonEmitterArray[0].p.x = leftWrist.x; this.protonEmitterArray[0].p.y = leftWrist.y; }
                    if (leftElbow) { this.protonEmitterArray[1].p.x = leftElbow.x; this.protonEmitterArray[1].p.y = leftElbow.y; }
                    if (leftShoulder) { this.protonEmitterArray[2].p.x = leftShoulder.x; this.protonEmitterArray[2].p.y = leftShoulder.y; }
                    if (rightShoulder) { this.protonEmitterArray[3].p.x = rightShoulder.x; this.protonEmitterArray[3].p.y = rightShoulder.y; }
                    if (rightElbow) { this.protonEmitterArray[4].p.x = rightElbow.x; this.protonEmitterArray[4].p.y = rightElbow.y; }
                    if (rightWrist) { this.protonEmitterArray[5].p.x = rightWrist.x; this.protonEmitterArray[5].p.y = rightWrist.y; }
                }
                break;
            case AnimEnum.particleGlowPainting.id:
                this.leftRightWristUpdate(keypoints);
                break;
            case AnimEnum.particlePainting.id:
                this.leftRightWristUpdate(keypoints);
                break;
            case AnimEnum.particlePaintRandomDrift.id:
                this.leftRightWristUpdate(keypoints);
                break;
            case AnimEnum.particleCometThrower.id:
                this.leftRightWristUpdate(keypoints);
                break;
            case AnimEnum.particleBodyGlow.id:
                {
                    const kptsToUse = ['left_wrist', 'left_elbow', 'left_shoulder', 'right_shoulder', 'right_elbow', 'right_wrist', 'left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'];
                    kptsToUse.forEach((name, index) => {
                        const kp = getKeypoint(keypoints, name);
                        if (kp) {
                            this.protonEmitterArray[index].p.x = kp.x;
                            this.protonEmitterArray[index].p.y = kp.y;
                        }
                    });
                }
                break;
            case AnimEnum.particleBurningMan.id:
                {
                    const bodyParts = [
                        'left_wrist', 'left_elbow', 'left_shoulder', 'right_shoulder', 'right_elbow', 'right_wrist', // 0-5
                        'left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle',         // 6-11
                        'left_shoulder', 'right_shoulder', // 12-13 (additional for shoulders)
                        'left_ankle', 'right_ankle',       // 14-15 (additional for ankles)
                        'nose', 'left_ear', 'right_ear'    // 16-18
                    ];
                    bodyParts.forEach((name, index) => {
                        const kp = getKeypoint(keypoints, name);
                        if (kp && this.protonEmitterArray[index]) {
                            this.protonEmitterArray[index].p.x = kp.x;
                            this.protonEmitterArray[index].p.y = kp.y;
                        }
                    });
                }
                break;
            case AnimEnum.particleCyclone.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.protonEmitterArray[0].p.x = nose.x;
                        this.protonEmitterArray[0].p.y = nose.y;
                    }
                }
                break;
            case AnimEnum.particleSun.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.protonEmitterArray[0].p.x = nose.x;
                        this.protonEmitterArray[0].p.y = nose.y - 150;
                    }
                }
                break;
            case AnimEnum.particleFireFly.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.nosePosition.x = nose.x;
                        this.nosePosition.y = nose.y;
                        this.repulsionBehaviour.reset(this.nosePosition, 10, 150);
                    }
                }
                break;
            case AnimEnum.particleFireFlyColor.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.nosePosition.x = nose.x;
                        this.nosePosition.y = nose.y;
                        this.repulsionBehaviour.reset(this.nosePosition, 20, 250);
                    }
                }
                break;
            case AnimEnum.particleSpit.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.protonEmitterArray[0].p.x = nose.x;
                        this.protonEmitterArray[0].p.y = nose.y - 100;
                    }
                }
                break;
            case AnimEnum.particle2BallHeadExp.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.protonEmitterArray[0].p.x = nose.x + this.conf.radius * Math.sin(Math.PI / 2 + this.conf.tha);
                        this.protonEmitterArray[0].p.y = nose.y + this.conf.radius * Math.cos(Math.PI / 2 + this.conf.tha);
                        this.protonEmitterArray[1].p.x = nose.x + this.conf.radius * Math.sin(-Math.PI / 2 + this.conf.tha);
                        this.protonEmitterArray[1].p.y = nose.y + this.conf.radius * Math.cos(-Math.PI / 2 + this.conf.tha);
                        this.conf.tha += .1;
                    }
                }
                break;
            case AnimEnum.particleMatrix.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.nosePosition.x = nose.x;
                        this.nosePosition.y = nose.y;
                        this.repulsionBehaviour.reset(this.nosePosition, 45, 160);
                    }
                }
                break;
            case AnimEnum.particleSnow.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.nosePosition.x = nose.x;
                        this.nosePosition.y = nose.y;
                        this.repulsionBehaviour.reset(this.nosePosition, 45, 160);
                    }
                }
                break;
            case AnimEnum.particleSnowHoriz.id:
                {
                    const nose = getKeypoint(keypoints, 'nose');
                    if (nose) {
                        this.nosePosition.x = nose.x;
                        this.nosePosition.y = nose.y;
                        this.repulsionBehaviour.reset(this.nosePosition, 45, 160);
                    }
                }
                break;
            case AnimEnum.particleLightSab.id:
                {
                    const rightWrist = getKeypoint(keypoints, 'right_wrist');
                    if (rightWrist) {
                        this.protonEmitterArray[0].p.x = rightWrist.x;
                        this.protonEmitterArray[0].p.y = rightWrist.y;
                    }
                }
                break;
            default:
                break;

        }
    }

    /**
     * Get update about video and canvas from content.js
     * Need this for calculation of the animations
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
     * Particle animation frame
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
     * Draw cicle at every keypoint from detector
     * @param keypoints
     */
    this.drawKeyPoints = function(keypoints) {
        for (let keypoint of keypoints) {
            if(keypoint.score < this.keypointScore){
                continue;
            }
            this.ctx.beginPath();
            this.ctx.arc(keypoint.x, keypoint.y, 2 * this.keypointArcSize, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'blue';
            this.ctx.fill();
        }
    }

    /**
     * Draw lines between all keypoints in the order
     * @param keypoints
     */
    this.drawSkeleton = function(keypoints, lineWidth) {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = lineWidth;

        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            // If score is null, just show the keypoint.
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
     * Draw lines from top to some keypoints
     * @param keypoints
     */
    this.drawPuppets = function (keypoints) {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 2;

        const rightWrist = getKeypoint(keypoints, 'right_wrist');
        const leftWrist = getKeypoint(keypoints, 'left_wrist');
        const nose = getKeypoint(keypoints, 'nose');
        const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
        const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
        const leftAnkle = getKeypoint(keypoints, 'left_ankle');
        const rightAnkle = getKeypoint(keypoints, 'right_ankle');

        if (rightWrist) this.drawLine(rightWrist.x, rightWrist.y, rightWrist.x, 0);
        if (leftWrist) this.drawLine(leftWrist.x, leftWrist.y, leftWrist.x, 0);
        if (nose) this.drawLine(nose.x, nose.y, nose.x, 0);
        if (rightShoulder) this.drawLine(rightShoulder.x, rightShoulder.y, rightShoulder.x, 0);
        if (leftShoulder) this.drawLine(leftShoulder.x, leftShoulder.y, leftShoulder.x, 0);
        if (leftAnkle) this.drawLine(leftAnkle.x, leftAnkle.y, leftAnkle.x, 0);
        if (rightAnkle) this.drawLine(rightAnkle.x, rightAnkle.y, rightAnkle.x, 0);
    }

    /**
     * Helper function to draw line
     * @param startX
     * @param startY
     * @param endX
     * @param endY
     */
    this.drawLine = function (startX, startY, endX, endY) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    /**
     * Draw lines from the border to all keypoints from the detector
     * @param keypoints
     */
    this.drawSpiderWeb = function (keypoints) {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = 2;

        const nose = getKeypoint(keypoints, 'nose');
        const leftEye = getKeypoint(keypoints, 'left_eye');
        const leftEar = getKeypoint(keypoints, 'left_ear');
        const rightEye = getKeypoint(keypoints, 'right_eye');
        const rightEar = getKeypoint(keypoints, 'right_ear');
        const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
        const rightElbow = getKeypoint(keypoints, 'right_elbow');
        const leftWrist = getKeypoint(keypoints, 'left_wrist');
        const rightWrist = getKeypoint(keypoints, 'right_wrist');
        const rightHip = getKeypoint(keypoints, 'right_hip');
        const rightKnee = getKeypoint(keypoints, 'right_knee');
        const rightAnkle = getKeypoint(keypoints, 'right_ankle');
        const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
        const leftElbow = getKeypoint(keypoints, 'left_elbow');
        const leftHip = getKeypoint(keypoints, 'left_hip');
        const leftKnee = getKeypoint(keypoints, 'left_knee');
        const leftAnkle = getKeypoint(keypoints, 'left_ankle');

        if (nose) this.drawLine(nose.x, nose.y, this.canvas.width / 2, 0);
        if (leftEye) this.drawLine(leftEye.x, leftEye.y, this.canvas.width / 2 * (1 + 0.25), 0);
        if (leftEar) this.drawLine(leftEar.x, leftEar.y, this.canvas.width / 2 * (1 + 0.5), 0);

        if (rightEye) this.drawLine(rightEye.x, rightEye.y, this.canvas.width / 2 * (1 - 0.25), 0);
        if (rightEar) this.drawLine(rightEar.x, rightEar.y, this.canvas.width / 2 * (1 - 0.5), 0);

        if (rightShoulder) this.drawLine(rightShoulder.x, rightShoulder.y, 0, this.canvas.height / 2 * (1 - 0.5));
        if (rightElbow) this.drawLine(rightElbow.x, rightElbow.y, 0, this.canvas.height / 2 * (1 - 0.25));

        if (leftWrist) this.drawLine(leftWrist.x, leftWrist.y, this.canvas.width, this.canvas.height / 2);
        if (rightWrist) this.drawLine(rightWrist.x, rightWrist.y, 0, this.canvas.height / 2);

        if (rightHip) this.drawLine(rightHip.x, rightHip.y, 0, this.canvas.height / 2 * (1 + 0.3));
        if (rightKnee) this.drawLine(rightKnee.x, rightKnee.y, 0, this.canvas.height / 2 * (1 + 0.6));
        if (rightAnkle) this.drawLine(rightAnkle.x, rightAnkle.y, 0, this.canvas.height / 2 * (1 + 0.9));

        if (leftShoulder) this.drawLine(leftShoulder.x, leftShoulder.y, this.canvas.width, this.canvas.height / 2 * (1 - 0.5));
        if (leftElbow) this.drawLine(leftElbow.x, leftElbow.y, this.canvas.width, this.canvas.height / 2 * (1 - 0.25));

        if (leftHip) this.drawLine(leftHip.x, leftHip.y, this.canvas.width, this.canvas.height / 2 * (1 + 0.3));
        if (leftKnee) this.drawLine(leftKnee.x, leftKnee.y, this.canvas.width, this.canvas.height / 2 * (1 + 0.6));
        if (leftAnkle) this.drawLine(leftAnkle.x, leftAnkle.y, this.canvas.width, this.canvas.height / 2 * (1 + 0.9));
    }


    this.cParticleHandsBall = function (){
        this.proton = new Proton();
        var emitter = new Emitter(); // Changed
        // right hand
        emitter.addInitialize(new Mass(10)); // Changed
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Body(particleImage)); // Changed
        }
        emitter.addInitialize(new Life(.1, .4)); // Changed
        emitter.rate = new Rate(new Span(20, 20), .1); // Changed
        emitter.addInitialize(new Velocity(new Span(3, 5), new Span(0, 360), 'polar')); // Changed
        emitter.addBehaviour(new Alpha(1, 0)); // Changed
        emitter.addBehaviour(new Color("#3366b2", "#1155b2")); // Changed
        emitter.addBehaviour(new Scale(new Span(1, 1.6), new Span(0, .1))); // Changed
        emitter.p.x = this.canvasGL.width / 2;
        emitter.p.y = this.canvasGL.height / 2;
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray[0] = emitter;
        // left hand
        emitter = new Emitter(); // Changed
        emitter.addInitialize(new Mass(10)); // Changed
        let particleImage2 = new Image();
        particleImage2.src = chrome.runtime.getURL("/images/particle.png");
        particleImage2.onload = () => {
            emitter.addInitialize(new Body(particleImage2)); // Changed
        }
        emitter.addInitialize(new Life(.1, .4)); // Changed
        emitter.rate = new Rate(new Span(20, 20), .1); // Changed
        emitter.addInitialize(new Velocity(new Span(3, 5), new Span(0, 360), 'polar')); // Changed
        emitter.addBehaviour(new Alpha(1, 0)); // Changed
        emitter.addBehaviour(new Color("#fdf753", "#f63a3f")); // Changed
        emitter.addBehaviour(new Scale(new Span(1, 1.6), new Span(0, .1))); // Changed
        emitter.p.x = this.canvasGL.width / 2;
        emitter.p.y = this.canvasGL.height / 2;
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray[1] = emitter;

        this.tryWebGLRendererInit();

    }

    this.cParticle2BallHead = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = this.createImageEmitter(this.canvas.width / 2 + this.conf.radius, this.canvas.height / 2, '#4F1500', '#0029FF', 3.5);
        this.protonEmitterArray[1] = this.createImageEmitter(this.canvas.width / 2 - this.conf.radius, this.canvas.height / 2, '#004CFE', '#6600FF', 3.5);

        this.tryWebGLRendererInit();
    }

    this.cParticleRightHandLine = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed
        this.protonEmitterArray[0].rate = new Rate(new Span(100)); // Changed
        this.protonEmitterArray[0].addInitialize(new Radius(2, 10)); // Changed
        this.protonEmitterArray[0].addInitialize(new Life(4, 10)); // Changed
        this.protonEmitterArray[0].addBehaviour(new Color('random')); // Changed
        this.protonEmitterArray[0].addBehaviour(new RandomDrift(10, 0, .035)); // Changed
        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleLightSab = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed
        this.protonEmitterArray[0].rate = new Rate(new Span(100)); // Changed
        this.protonEmitterArray[0].addInitialize(new Radius(2, 7)); // Changed
        this.protonEmitterArray[0].addInitialize(new Mass(-1)); // Changed
        this.protonEmitterArray[0].addInitialize(new Life(4, 10)); // Changed
        this.protonEmitterArray[0].addBehaviour(new Color('random')); // Changed
        this.protonEmitterArray[0].addBehaviour(new RandomDrift(10, -100, .035)); // Changed
        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }
    this.cParticleNoseGravity = function (){
        this.proton = new Proton();

        this.protonEmitterArray[0] = new Emitter(); // Changed
        this.protonEmitterArray[0].damping = 0.0075;
        this.protonEmitterArray[0].rate = new Rate(300); // Changed

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Body(particleImage, 128, 128)); // Changed
        }

        this.protonEmitterArray[0].addInitialize(new Mass(1), new Radius(new Span(5, 10))); // Changed
        this.protonEmitterArray[0].addInitialize(new Velocity(new Span(1, 3), new Span(0, 360), 'polar')); // Changed

        this.nosePosition = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.attractionBehaviour = new Attraction(this.nosePosition, 10, 1000); // Changed
        this.protonEmitterArray[0].addBehaviour(this.attractionBehaviour, new Color('random')); // Changed
        this.protonEmitterArray[0].addBehaviour(new Scale(new Span(.1, .7))); // Changed

        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit('once');
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleNoseSupernova = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed
        this.protonEmitterArray[0].rate = new Rate(new Span(5, 10), new Span(.05, .2)); // Changed

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle2.png");
        // Note: 'image' below was undefined, assuming it should be particleImage
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Body(particleImage)); // Changed
        }
        // this.protonEmitterArray[0].addInitialize(new Proton.Body(image)); // This line was problematic, `image` is not defined here. Assuming the above onload is sufficient or it was a typo.
        this.protonEmitterArray[0].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[0].addInitialize(new Life(2, 4)); // Changed
        this.protonEmitterArray[0].addInitialize(new Velocity(new Span(0.5, 1.5), new Span(0, 360), 'polar')); // Changed

        this.protonEmitterArray[0].addBehaviour(new Alpha(1, [.7, 1])); // Changed
        var scale = new Scale(1, 0); // Changed
        this.protonEmitterArray[0].addBehaviour(scale);
        this.protonEmitterArray[0].addBehaviour(new Color('random', 'random', Infinity, Proton.easeInSine)); // Changed, Proton.easeInSine is a static member if it exists

        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleHandsTrackFromBorder = function (){
        this.proton = new Proton(4000);

        this.createEmitter(this.canvas.width + 50, this.canvas.height / 2, 0, '#fdf753', this.rightHandPosition, 0);
        this.createEmitter(this.canvas.width - 50, this.canvas.height / 2, 180, '#f80610', this.leftHandPosition, 1);
        let renderer = new CanvasRenderer(this.canvas); // Changed
        this.proton.addRenderer(renderer);
    }

    this.cParticleUpperBodyGlow = function (){
        this.proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.createEmitterPointGlow(0, "#4F1500", "#e7af22", 90, particleImage);
            this.createEmitterPointGlow(1, "#4F1500", "#0029FF", 65, particleImage);
            this.createEmitterPointGlow(2, "#4F1500", "#6974f8", 0, particleImage);
            this.createEmitterPointGlow(3, "#4F1500", "#59b9e3", 0, particleImage);
            this.createEmitterPointGlow(4, "#4F1500", "#aa40e0", -65, particleImage);
            this.createEmitterPointGlow(5, "#4F1500", "#32fd16", -90, particleImage);
        }

        this.tryWebGLRendererInit();
    }

    this.cParticleGlowPainting = function (){
        this.proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.createEmitterDrawGlow(0, "#4F1500", "#e7af22", 90, particleImage);
            this.createEmitterDrawGlow(1, "#4F1500", "#0029FF", -90, particleImage);

        }

        this.tryWebGLRendererInit();
    }

    this.cParticlePainting = function (){
        this.proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.createEmitterPointDraw(0, "#4F1500", "#e7af22", 90, particleImage);
            this.createEmitterPointDraw(1, "#4F1500", "#0029FF", -90, particleImage);

        }

        this.tryWebGLRendererInit();
    }

    this.cParticlePaintRandomDrift = function (){
        this.proton = new Proton();
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.createEmitterPointDrawRandomDrift(0, "#4F1500", "#e7af22", 90, particleImage);
            this.createEmitterPointDrawRandomDrift(1, "#4F1500", "#0029FF", -90, particleImage);

        }

        this.tryWebGLRendererInit();
    }

    this.cParticleCometThrower = function (){
        this.proton = new Proton();

        let imageComet1 = new Image();
        imageComet1.src = chrome.runtime.getURL("/images/Comet_1.png");
        imageComet1.onload = () => {
            this.createEmitterCometThrower(0, imageComet1);
        }

        let imageComet2 = new Image();
        imageComet2.src = chrome.runtime.getURL("/images/Comet_2.png");
        imageComet2.onload = () => {
            this.createEmitterCometThrower(1, imageComet2);
        }

        let renderer = new CanvasRenderer(this.canvas); // Changed
        this.proton.addRenderer(renderer);
    }

    this.cParticleBodyGlow = function (){
        this.proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.createEmitterPointGlow(0, "#4F1500", "#e7af22", 90, particleImage);
            this.createEmitterPointGlow(1, "#4F1500", "#0029FF", 65, particleImage);
            this.createEmitterPointGlow(2, "#4F1500", "#6974f8", 0, particleImage);
            this.createEmitterPointGlow(3, "#4F1500", "#59b9e3", 0, particleImage);
            this.createEmitterPointGlow(4, "#4F1500", "#aa40e0", -65, particleImage);
            this.createEmitterPointGlow(5, "#4F1500", "#32fd16", -90, particleImage);

            this.createEmitterPointGlow(6, "#031a17", "#e7af22", 90, particleImage);
            this.createEmitterPointGlow(7, "#44011b", "#0029FF", 65, particleImage);
            this.createEmitterPointGlow(8, "#493b01", "#6974f8", 0, particleImage);

            this.createEmitterPointGlow(9, "#0e0601", "#5cff24", -90, particleImage);
            this.createEmitterPointGlow(10, "#054b01", "#aa40e0", -65, particleImage);
            this.createEmitterPointGlow(11, "#1e012c", "#32fd16", 0, particleImage);
        }

        this.tryWebGLRendererInit();
    }

    this.cParticleBurningMan = function (){
        this.proton = new Proton;
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.createEmitterPointGlow(0, "#C97024", "#290000", 90, particleImage);
            this.createEmitterPointGlow(1, "#C97024", "#290000", 65, particleImage);
            this.createEmitterPointGlow(2, "#C97024", "#290000", 0, particleImage);
            this.createEmitterPointGlow(3, "#C97024", "#290000", 0, particleImage);
            this.createEmitterPointGlow(4, "#C97024", "#290000", -65, particleImage);
            this.createEmitterPointGlow(5, "#C97024", "#290000", -90, particleImage);

            this.createEmitterPointGlow(6, "#C97024", "#290000", 90, particleImage);
            this.createEmitterPointGlow(7, "#C97024", "#290000", 65, particleImage);
            this.createEmitterPointGlow(8, "#C97024", "#290000", 0, particleImage);

            this.createEmitterPointGlow(9, "#C97024", "#290000", -90, particleImage);
            this.createEmitterPointGlow(10, "#C97024", "#290000", -65, particleImage);
            this.createEmitterPointGlow(11, "#C97024", "#290000", 0, particleImage);

            this.createEmitterPointGlow(12, "#C97024", "#290000", 225, particleImage);
            this.createEmitterPointGlow(13, "#C97024", "#290000", -225, particleImage);

            this.createEmitterPointGlow(14, "#C97024", "#290000", -65, particleImage);
            this.createEmitterPointGlow(15, "#C97024", "#290000", 65, particleImage);

            this.createEmitterPointGlow(16, "#C97024", "#290000", 0, particleImage);
            this.createEmitterPointGlow(17, "#C97024", "#290000", 65, particleImage);
            this.createEmitterPointGlow(18, "#C97024", "#290000", -65, particleImage);

        }

        this.tryWebGLRendererInit();
    }

    this.cParticleCyclone = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed
        this.protonEmitterArray[0].rate = new Rate( // Changed
            new Span(6, 15), // Changed
            new Span(0.1, 0.25) // Changed
        );
        this.protonEmitterArray[0].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[0].addInitialize(new Radius(2, 8)); // Changed
        this.protonEmitterArray[0].addInitialize(new Life(2, 4)); // Changed
        this.protonEmitterArray[0].addInitialize(
            new Velocity( // Changed
                new Span(2, 3.3), // Changed
                new Span(-10, 10), // Changed
                "polar"
            )
        );

        //emitter.addBehaviour(new RandomDrift(10, 10, 0.05)); // Changed
        this.protonEmitterArray[0].addBehaviour(new Cyclone(new Span(-2, 2), 5)); // Changed
        this.protonEmitterArray[0].addBehaviour(
            new Color("ff0000", "random", Infinity, Proton.easeOutQuart) // Changed, Proton.easeOutQuart is static
        );
        this.protonEmitterArray[0].addBehaviour(new Scale(1, 0.7)); // Changed

        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2 + 200;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleSun = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed
        this.protonEmitterArray[0].rate = new Rate(new Span(30, 50), .1); // Changed

        this.protonEmitterArray[0].addInitialize(new Mass(1)); // Changed
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Body(particleImage)); // Changed
        }
        //this.protonEmitterArray[0].addInitialize(new Body(image)); // Changed
        //emitter.addInitialize(new P(new PointZone(canvas.width / 2, canvas.height / 2))); // Changed
        this.protonEmitterArray[0].addInitialize(new Life(.5, 1)); // Changed
        this.protonEmitterArray[0].addInitialize(new Velocity(new Span(3, 5), new Span(0, 360), 'polar')); // Changed

        this.protonEmitterArray[0].addBehaviour(new Color('#ff0000', '#ffff00')); // Changed
        // let attractionForce = new Attraction(mouseObj, 10, 200); // Changed
        // this.protonEmitterArray[0].addBehaviour(attractionForce);
        this.protonEmitterArray[0].addBehaviour(new Scale(new Span(1, 1.6), new Span(0, .1))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Alpha(1, .2)); // Changed

        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleFireFly = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed

        this.protonEmitterArray[0].damping = 0.0075;
        this.protonEmitterArray[0].rate = new Rate(1480); // Changed

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Body(particleImage, 64)); // Changed
        }

        this.protonEmitterArray[0].addInitialize(new Position(new RectZone(0, 0, this.canvas.width, this.canvas.height))); // Changed
        this.protonEmitterArray[0].addInitialize(new Mass(1), new Radius(new Span(5, 10))); // Changed

        this.nosePosition = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.repulsionBehaviour = new Repulsion(this.nosePosition, 0, 0); // Changed
        let crossZoneBehaviour = new CrossZone(new RectZone(-2, 0, this.canvas.width, this.canvas.height), 'cross'); // Changed
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour, crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Scale(new Span(.1, .4))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Alpha(.5)); // Changed
        this.protonEmitterArray[0].addBehaviour(new RandomDrift(10, 10, .2)); // Changed

        this.protonEmitterArray[0].addBehaviour({
            initialize: function(particle) {
                particle.tha = Math.random() * Math.PI;
                particle.thaSpeed = 0.015 * Math.random() + 0.005;
            },

            applyBehaviour: function(particle) {
                particle.tha += particle.thaSpeed;
                particle.alpha = Math.abs(Math.cos(particle.tha));
            }
        });

        this.protonEmitterArray[0].emit('once');
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleFireFlyColor = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed

        this.protonEmitterArray[0].damping = 0.0075;
        this.protonEmitterArray[0].rate = new Rate(1480); // Changed

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Body(particleImage, 64)); // Changed
        }

        this.protonEmitterArray[0].addInitialize(new Position(new RectZone(0, 0, this.canvas.width, this.canvas.height))); // Changed
        this.protonEmitterArray[0].addInitialize(new Mass(1), new Radius(new Span(5, 10))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Color('rgba(255,200,0,0.16)', '#ffff00')); // Changed

        this.nosePosition = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.repulsionBehaviour = new Repulsion(this.nosePosition, 0, 0); // Changed
        let crossZoneBehaviour = new CrossZone(new RectZone(-2, 0, this.canvas.width, this.canvas.height), 'cross'); // Changed
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour, crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Scale(new Span(.1, 3.4))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Alpha(.5)); // Changed
        this.protonEmitterArray[0].addBehaviour(new RandomDrift(10, 10, .2)); // Changed

        this.protonEmitterArray[0].addBehaviour({
            initialize: function(particle) {
                particle.tha = Math.random() * Math.PI;
                particle.thaSpeed = 0.015 * Math.random() + 0.005;
            },

            applyBehaviour: function(particle) {
                particle.tha += particle.thaSpeed;
                particle.alpha = Math.abs(Math.cos(particle.tha));
            }
        });

        this.protonEmitterArray[0].emit('once');
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleSpit = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed

        //this.protonEmitterArray[0].damping = 0.0075;
        this.protonEmitterArray[0].rate = new Rate(new Span(10, 15), new Span(.05, .1)); // Changed

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Body(particleImage)); // Changed
        }

        this.protonEmitterArray[0].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[0].addInitialize(new Life(1, 3)); // Changed
        this.protonEmitterArray[0].addInitialize(new Position(new CircleZone(0, 0, 20))); // Changed
        this.protonEmitterArray[0].addInitialize(new Velocity(new Span(5, 8), new Span(-15, 15), 'polar')); // Changed
        this.protonEmitterArray[0].addBehaviour(new RandomDrift(10, 10, .05)); // Changed

        this.protonEmitterArray[0].addBehaviour(new Alpha(0.1, 1)); // Changed
        this.protonEmitterArray[0].addBehaviour(new Scale(new Span(2, 3.5), 0)); // Changed
        this.protonEmitterArray[0].addBehaviour(new ProtonGravity(6)); // Changed from Proton.G
        this.protonEmitterArray[0].addBehaviour(new Color('#FF0026', ['#ffff00', '#ffff11'], Infinity, Proton.easeOutSine)); // Changed, Proton.easeOutSine is static

        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2 + 150;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticle2BallHeadExp = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = this.createImageEmitter(this.canvas.width / 2 + this.conf.radius, this.canvas.height / 2, '#9b2c03', '#ffd500', 1);
        this.protonEmitterArray[1] = this.createImageEmitter(this.canvas.width / 2 - this.conf.radius, this.canvas.height / 2, '#8c00fe', '#ff2600', 1);

        this.tryWebGLRendererInit();

    }

    this.cParticleMatrix = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed

        let img0 = new Image();
        img0.src = chrome.runtime.getURL("/images/0.png");
        // img0.onload = () => {
        //     this.protonEmitterArray[0].addInitialize(new Body(img0)); // Changed
        // }

        let img1 = new Image();
        img1.src = chrome.runtime.getURL("/images/1.png");
        // img1.onload = () => {
        //     this.protonEmitterArray[0].addInitialize(new Body(img1)); // Changed
        // }
        this.protonEmitterArray[0].addInitialize(new Body([img0, img1])); // Changed

        this.protonEmitterArray[0].rate = new Rate(35, new Span(0.2, 0.5)); // Changed
        this.protonEmitterArray[0].damping = 0;
        this.protonEmitterArray[0].addInitialize(new Life(4)); // Changed
        this.protonEmitterArray[0].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[0].addInitialize(new Radius(4, 70)); // Changed
        this.protonEmitterArray[0].addInitialize(
            new Velocity(new Span(3, 6), new Span(180), "polar") // Changed
        );
        this.protonEmitterArray[0].addInitialize(new Body([img0, img1])); // Changed

        this.protonEmitterArray[0].addInitialize(
            new Position(new LineZone(0, -50, this.canvas.width, -50)) // Changed
        );

        const dis = 150;
        this.crossZoneBehaviour = new CrossZone( // Changed
            new RectZone( // Changed
                0 - dis,
                0 - dis,
                this.canvas.width + 2 * dis,
                this.canvas.height + 2 * dis
            ),
            "dead"
        );
        this.protonEmitterArray[0].addBehaviour(this.crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Alpha(new Span(0.1, 0.7))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Scale(new Span(0.2, 0.7))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Alpha(new Span(0.1, 0.7))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Scale(new Span(0.2, 0.7))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Alpha(new Span(0.1, 0.7))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Scale(new Span(0.2, 0.7))); // Changed
        this.repulsionBehaviour = new Repulsion({ x: 0, y: 0 }, 0, 0); // Changed
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour);
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleSnow = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed

        let img0 = new Image();
        img0.src = chrome.runtime.getURL("/images/particle.png");
        img0.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Body(img0)); // Changed
        }

        this.protonEmitterArray[0].rate = new Rate(60, new Span(0.2, 0.3)); // Changed
        this.protonEmitterArray[0].damping = 0;
        this.protonEmitterArray[0].addInitialize(new Life(4)); // Changed
        this.protonEmitterArray[0].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[0].addInitialize(new Radius(4, 70)); // Changed
        this.protonEmitterArray[0].addInitialize(
            new Velocity(new Span(3, 6), new Span(180), "polar") // Changed
        );

        this.protonEmitterArray[0].addInitialize(
            new Position(new LineZone(0, -50, this.canvas.width, -50)) // Changed
        );

        const dis = 150;
        this.crossZoneBehaviour = new CrossZone( // Changed
            new RectZone( // Changed
                0 - dis,
                0 - dis,
                this.canvas.width + 2 * dis,
                this.canvas.height + 2 * dis
            ),
            "dead"
        );
        this.protonEmitterArray[0].addBehaviour(this.crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Alpha(getSpan(0.1, 0.7))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Scale(getSpan(0.2, 0.7))); // Changed
        this.repulsionBehaviour = new Repulsion({ x: 0, y: 0 }, 0, 0); // Changed
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour);
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleSnowHoriz = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Emitter(); // Changed

        let img0 = new Image();
        img0.src = chrome.runtime.getURL("/images/particle.png");
        img0.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Body(img0)); // Changed
        }

        this.protonEmitterArray[0].rate = new Rate(110, new Span(0.2, 0.3)); // Changed
        this.protonEmitterArray[0].damping = 0;
        this.protonEmitterArray[0].addInitialize(new Life(4)); // Changed
        this.protonEmitterArray[0].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[0].addInitialize(new Radius(4, 70)); // Changed
        this.protonEmitterArray[0].addInitialize(
            new Velocity(new Span(3, 6), new Span(205), "polar") // Changed
        );

        this.protonEmitterArray[0].addInitialize(
            new Position(new LineZone(0, -50, this.canvas.width *2, -50)) // Changed
        );

        //this.protonEmitterArray[0].rotation = -33;

        const dis = 300;
        this.crossZoneBehaviour = new CrossZone( // Changed
            new RectZone( // Changed
                0 - dis,
                0 - dis,
                this.canvas.width + 2 * dis,
                this.canvas.height + 2 * dis
            ),
            "dead"
        );
        this.protonEmitterArray[0].addBehaviour(this.crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Alpha(getSpan(0.1, 0.7))); // Changed
        this.protonEmitterArray[0].addBehaviour(new Scale(getSpan(0.2, 0.7))); // Changed
        this.repulsionBehaviour = new Repulsion({ x: 0, y: 0 }, 0, 0); // Changed
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour);
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }


    this.createImageEmitter = function (x, y, color1, color2, scaleStart) {
        var emitter = new Emitter(); // Changed
        emitter.rate = new Rate(new Span(5, 7), new Span(.01, .02)); // Changed

        emitter.addInitialize(new Mass(1)); // Changed
        emitter.addInitialize(new Life(1)); // Changed
        var particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Body(particleImage, 32)); // Changed
        }
        emitter.addInitialize(new Radius(40)); // Changed

        emitter.addBehaviour(new Alpha(1, 0)); // Changed
        emitter.addBehaviour(new Color(color1, color2)); // Changed
        emitter.addBehaviour(new Scale(scaleStart, 0.1)); // Changed
        emitter.addBehaviour(new CrossZone(new RectZone(0, 0, this.canvas.width, this.canvas.height), 'dead')); // Changed
        var attractionBehaviour = new Attraction(this.nosePosition, 0, 0); // Changed
        this.attractionBehaviours.push(attractionBehaviour);
        emitter.addBehaviour(attractionBehaviour);

        emitter.p.x = x;
        emitter.p.y = y;
        emitter.emit();
        this.proton.addEmitter(emitter);

        return emitter;
    }

    /**
     * Help function to create particle system with image for 'cometThrower'
     *
     * @param emitterIndex index of the emitter
     * @param image image to use for this emiter
     */
    this.createEmitterCometThrower = function (emitterIndex, image) {
        this.protonEmitterArray[emitterIndex] = new Emitter(); // Changed
        this.protonEmitterArray[emitterIndex].rate = new Rate(new Span(2, 5), .05); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Body(image, 20, 40)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Life(1.5, 2.2)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Velocity(2, new Span(0, 360), 'polar')); // Changed

        this.protonEmitterArray[emitterIndex].addBehaviour(new Rotate()); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new ProtonGravity(3)); // Changed from Proton.Gravity
        this.protonEmitterArray[emitterIndex].addBehaviour(new Alpha(0.6, 1)); // Changed
        // protonEmitterArray[emitterIndex].addBehaviour(new CrossZone(new RectZone(0, 0, canvas.width, canvas.height), 'bound')); // Changed

        this.protonEmitterArray[emitterIndex].p.x = this.canvas.width / 2;
        this.protonEmitterArray[emitterIndex].p.y = this.canvas.height / 2;
        this.proton.addEmitter(this.protonEmitterArray[emitterIndex]);
        this.protonEmitterArray[emitterIndex].emit();
    }

    /**
     * Help function to create particle system with different angel and colors for 'pointDrawRandomDrift'
     *
     * @param emitterIndex index of the emitter
     * @param colorT
     * @param colorE
     * @param angle angle for the emission of the particle
     * @param image particle image to use
     */
    this.createEmitterPointDrawRandomDrift= function (emitterIndex, colorT, colorE, angle, image) {
        this.protonEmitterArray[emitterIndex] = new Emitter(); // Changed
        this.protonEmitterArray[emitterIndex].rate = new Rate(new Span(.1, .2), new Span(.01, .015)); // Changed

        this.protonEmitterArray[emitterIndex].addInitialize(new Mass(10)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Life(1, 2)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Body(image, 4)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Radius(2)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Velocity(new Span(1, 2), angle, 'polar')); // Changed

        this.protonEmitterArray[emitterIndex].addBehaviour(new Alpha(0.8, 0)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new RandomDrift(30, 30, 0)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Color(colorT, colorE)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Scale(1, 0)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new CrossZone(new RectZone(0, 0, this.canvasGL.width, this.canvasGL.height), 'dead')); // Changed

        this.protonEmitterArray[emitterIndex].p.x = this.canvasGL.width / 2;
        this.protonEmitterArray[emitterIndex].p.y = this.canvasGL.height / 2;
        this.protonEmitterArray[emitterIndex].emit();
        this.proton.addEmitter(this.protonEmitterArray[emitterIndex]);
    }

    /**
     * Help function to create particle system with different angel and colors for 'pointDraw'
     *
     * @param emitterIndex
     * @param colorT
     * @param colorE
     * @param angle
     * @param image
     */
    this.createEmitterPointDraw = function (emitterIndex, colorT, colorE, angle, image) {
        this.protonEmitterArray[emitterIndex] = new Emitter(); // Changed
        this.protonEmitterArray[emitterIndex].rate = new Rate(new Span(.1, .2), new Span(.01, .015)); // Changed

        this.protonEmitterArray[emitterIndex].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Life(1, 50)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Body(image, 4)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Radius(2)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Velocity(new Span(1, 2), angle, 'polar')); // Changed

        this.protonEmitterArray[emitterIndex].addBehaviour(new Alpha(0.8, 0)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Color(colorT, colorE)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Scale(1, 0.1)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new CrossZone(new RectZone(0, 0, this.canvasGL.width, this.canvasGL.height), 'dead')); // Changed

        this.protonEmitterArray[emitterIndex].p.x = this.canvasGL.width / 2;
        this.protonEmitterArray[emitterIndex].p.y = this.canvasGL.height / 2;
        this.protonEmitterArray[emitterIndex].emit();
        this.proton.addEmitter(this.protonEmitterArray[emitterIndex]);
    }

    /**
     * Help function to create particle system with different angel and colors for 'pointGlow'
     *
     * @param emitterIndex
     * @param colorT
     * @param colorE
     * @param angle
     * @param image
     */
    this.createEmitterPointGlow = function (emitterIndex, colorT, colorE, angle, image) {
        this.protonEmitterArray[emitterIndex] = new Emitter(); // Changed
        this.protonEmitterArray[emitterIndex].rate = new Rate(new Span(.1, .2), new Span(.01, .015)); // Changed

        this.protonEmitterArray[emitterIndex].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Life(1, 2)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Body(image, 32)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Radius(2)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Velocity(new Span(1, 2), angle, 'polar')); // Changed

        this.protonEmitterArray[emitterIndex].addBehaviour(new Alpha(0.1, 0)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Color(colorT, colorE)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Scale(3, 0.1)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new CrossZone(new RectZone(0, 0, this.canvasGL.width, this.canvasGL.height), 'dead')); // Changed

        this.protonEmitterArray[emitterIndex].p.x = this.canvasGL.width / 2;
        this.protonEmitterArray[emitterIndex].p.y = this.canvasGL.height / 2;
        this.protonEmitterArray[emitterIndex].emit();
        this.proton.addEmitter(this.protonEmitterArray[emitterIndex]);
    }

    /**
     * Help function to create particle system with different angel and colors for 'drawGlow'
     *
     * @param emitterIndex
     * @param colorT
     * @param colorE
     * @param angle
     * @param image
     */
    this.createEmitterDrawGlow = function (emitterIndex, colorT, colorE, angle, image) {
        this.protonEmitterArray[emitterIndex] = new Emitter(); // Changed
        this.protonEmitterArray[emitterIndex].rate = new Rate(new Span(.1, .2), new Span(.01, .015)); // Changed

        this.protonEmitterArray[emitterIndex].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Life(1, 50)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Body(image, 32)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Radius(2)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Velocity(new Span(1, 2), angle, 'polar')); // Changed

        this.protonEmitterArray[emitterIndex].addBehaviour(new Alpha(0.08, 0)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Color(colorT, colorE)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Scale(3, 0.1)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new CrossZone(new RectZone(0, 0, this.canvasGL.width, this.canvasGL.height), 'dead')); // Changed

        this.protonEmitterArray[emitterIndex].p.x = this.canvasGL.width / 2;
        this.protonEmitterArray[emitterIndex].p.y = this.canvasGL.height / 2;
        this.protonEmitterArray[emitterIndex].emit();
        this.proton.addEmitter(this.protonEmitterArray[emitterIndex]);
    }

    /**
     * Try WebGLRender. If not posssible fallback to Canvas renderer
     *
     * @param removeOtherRenderer
     */
    this.tryWebGLRendererInit= function (removeOtherRenderer = false) {

        try {
            this.rendererGL = new WebGLRenderer(this.canvasGL); // Changed
            this.rendererGL.blendFunc("SRC_ALPHA", "ONE");
            //this.rendererGL.gl.blendFuncSeparate(this.rendererGL.gl.SRC_ALPHA, this.rendererGL.gl.ONE, this.rendererGL.gl.ONE, this.rendererGL.gl.ONE_MINUS_SRC_ALPHA);
            this.proton.addRenderer(this.rendererGL);
        } catch (e) {
            const renderer = new CanvasRenderer(this.canvas); // Changed
            this.proton.addRenderer(renderer);
        }
    }

    /**
     * Create emitter for hand tracking from border
     *
     * @param x
     * @param y
     * @param angle
     * @param color
     * @param handPos
     * @param emitterIndex
     */
    this.createEmitter = function (x, y, angle, color, handPos, emitterIndex) {
        this.protonEmitterArray[emitterIndex] = new Emitter(); // Changed
        this.protonEmitterArray[emitterIndex].rate = new Rate(new Span(10, 30), new Span(.1)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Mass(1)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Life(3, 6)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Radius(4, 0.1)); // Changed
        this.protonEmitterArray[emitterIndex].addInitialize(new Velocity(new Span(0.5, 1), new Span(90, 10, true), 'polar')); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Alpha(1, 0)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Color(color)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new Attraction(handPos, 10, 1500)); // Changed
        this.protonEmitterArray[emitterIndex].addBehaviour(new CrossZone(new RectZone(0, 0, this.canvas.width, this.canvas.height), 'cross')); // Changed
        this.protonEmitterArray[emitterIndex].p.x = x;
        this.protonEmitterArray[emitterIndex].p.y = y;
        this.protonEmitterArray[emitterIndex].emit();
        this.protonEmitterArray[emitterIndex].rotation = angle;
        this.proton.addEmitter(this.protonEmitterArray[emitterIndex]);
    }



    /**
     * Update proton emitter position for left/right wrist from keypoint detection
     */
    this.leftRightWristUpdate= function (keypoints) {
        const leftWrist = getKeypoint(keypoints, 'left_wrist');
        const rightWrist = getKeypoint(keypoints, 'right_wrist');

        if (leftWrist && this.protonEmitterArray[0] && this.protonEmitterArray[0].p) {
            this.protonEmitterArray[0].p.x = leftWrist.x;
            this.protonEmitterArray[0].p.y = leftWrist.y;
        }
        if (rightWrist && this.protonEmitterArray[1] && this.protonEmitterArray[1].p) {
            this.protonEmitterArray[1].p.x = rightWrist.x;
            this.protonEmitterArray[1].p.y = rightWrist.y;
        }
    }


    /**
     * Clear WebGLCanvas and remove particles and destroy emitters
     */
     this.clearWebGL = function() {
        // clear WebGLCanvas and particles

        if(this.protonEmitterArray !== undefined){
            for(var i =0; i < this.protonEmitterArray.length; i++){
                this.protonEmitterArray[i].removeAllParticles();
                this.protonEmitterArray[i].destroy();
            }
        }

        this.webGLtx.clear(this.webGLtx.DEPTH_BUFFER_BIT | this.webGLtx.COLOR_BUFFER_BIT | this.webGLtx.STENCIL_BUFFER_BIT);
    }

}

export {Anim}