import Proton from "proton-engine";
import * as detectUtils from "./detectUtils";
import * as poseDetection from '@tensorflow-models/pose-detection';
import {AnimEnum} from "./animEnum";

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
        console.log('setNewAnimation called with:', animationId);
        console.log('AnimEnum check - skeleton7Times.name:', AnimEnum.skeleton7Times.name);
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

        // NEW CANVAS ANIMATIONS
        } else if (animationId === AnimEnum.skeleton7Times.name) {
            this.currentAnimation = AnimEnum.skeleton7Times.name;
        } else if (animationId === AnimEnum.skeletonMirror.name) {
            this.currentAnimation = AnimEnum.skeletonMirror.name;
        } else if (animationId === AnimEnum.skeletonRainbow.name) {
            this.currentAnimation = AnimEnum.skeletonRainbow.name;
        } else if (animationId === AnimEnum.connectingDots.name) {
            this.currentAnimation = AnimEnum.connectingDots.name;
        } else if (animationId === AnimEnum.geometricShapes.name) {
            this.currentAnimation = AnimEnum.geometricShapes.name;

        // NEW PARTICLE ANIMATIONS - Tracking
        } else if (animationId === AnimEnum.particleAllJoints.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleAllJoints.id;
        } else if (animationId === AnimEnum.particleFeetTrail.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleFeetTrail.id;
        } else if (animationId === AnimEnum.particleKneeCircles.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleKneeCircles.id;
        } else if (animationId === AnimEnum.particleShoulderWaves.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleShoulderWaves.id;

        // NEW PARTICLE ANIMATIONS - Physics
        } else if (animationId === AnimEnum.particleBodyMagnet.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleBodyMagnet.id;
        } else if (animationId === AnimEnum.particleWaveField.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleWaveField.id;
        } else if (animationId === AnimEnum.particleVortex.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleVortex.id;
        } else if (animationId === AnimEnum.particleElectric.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleElectric.id;

        // NEW PARTICLE ANIMATIONS - Visual Effects
        } else if (animationId === AnimEnum.particleRainbowTrail.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleRainbowTrail.id;
        } else if (animationId === AnimEnum.particleStarField.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleStarField.id;
        } else if (animationId === AnimEnum.particleBubbles.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleBubbles.id;
        } else if (animationId === AnimEnum.particleFireworks.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleFireworks.id;
        } else if (animationId === AnimEnum.particleNeonGlow.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleNeonGlow.id;

        // NEW PARTICLE ANIMATIONS - Atmospheric
        } else if (animationId === AnimEnum.particleAurora.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleAurora.id;
        } else if (animationId === AnimEnum.particleFog.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleFog.id;
        } else if (animationId === AnimEnum.particleRain.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleRain.id;
        } else if (animationId === AnimEnum.particleLeaves.name) {
            this.currentAnimation = this.PARTICLE;
            this.particleID = AnimEnum.particleLeaves.id;
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

        // NEW PARTICLE ANIMATIONS
        } else if (this.particleID === AnimEnum.particleAllJoints.id) {
            console.log('Initializing particleAllJoints with ID:', this.particleID);
            this.cParticleAllJoints();
        } else if (this.particleID === AnimEnum.particleFeetTrail.id) {
            this.cParticleFeetTrail();
        } else if (this.particleID === AnimEnum.particleKneeCircles.id) {
            this.cParticleKneeCircles();
        } else if (this.particleID === AnimEnum.particleShoulderWaves.id) {
            this.cParticleShoulderWaves();
        } else if (this.particleID === AnimEnum.particleBodyMagnet.id) {
            this.cParticleBodyMagnet();
        } else if (this.particleID === AnimEnum.particleWaveField.id) {
            this.cParticleWaveField();
        } else if (this.particleID === AnimEnum.particleVortex.id) {
            this.cParticleVortex();
        } else if (this.particleID === AnimEnum.particleElectric.id) {
            this.cParticleElectric();
        } else if (this.particleID === AnimEnum.particleRainbowTrail.id) {
            this.cParticleRainbowTrail();
        } else if (this.particleID === AnimEnum.particleStarField.id) {
            this.cParticleStarField();
        } else if (this.particleID === AnimEnum.particleBubbles.id) {
            this.cParticleBubbles();
        } else if (this.particleID === AnimEnum.particleFireworks.id) {
            this.cParticleFireworks();
        } else if (this.particleID === AnimEnum.particleNeonGlow.id) {
            this.cParticleNeonGlow();
        } else if (this.particleID === AnimEnum.particleAurora.id) {
            this.cParticleAurora();
        } else if (this.particleID === AnimEnum.particleFog.id) {
            this.cParticleFog();
        } else if (this.particleID === AnimEnum.particleRain.id) {
            this.cParticleRain();
        } else if (this.particleID === AnimEnum.particleLeaves.id) {
            this.cParticleLeaves();
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

        // NEW CANVAS ANIMATIONS
        }else if (this.currentAnimation === AnimEnum.skeleton7Times.name) {
            console.log('Drawing skeleton7Times animation');
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawSkeleton7Times(pose, canvasPoseCoordinates);

        }else if (this.currentAnimation === AnimEnum.skeletonMirror.name) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawSkeletonMirror(pose, canvasPoseCoordinates);

        }else if (this.currentAnimation === AnimEnum.skeletonRainbow.name) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawSkeletonRainbow(canvasPoseCoordinates);

        }else if (this.currentAnimation === AnimEnum.connectingDots.name) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawConnectingDots(canvasPoseCoordinates);

        }else if (this.currentAnimation === AnimEnum.geometricShapes.name) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawGeometricShapes(canvasPoseCoordinates);
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
                this.protonEmitterArray[0].p.x = keypoints[10].x;
                this.protonEmitterArray[0].p.y = keypoints[10].y;

                this.protonEmitterArray[1].p.x = keypoints[9].x;
                this.protonEmitterArray[1].p.y = keypoints[9].y;
                break;
            case AnimEnum.particle2BallHead.id: // circle head effect. center is nose
                this.protonEmitterArray[0].p.x = keypoints[0].x + this.conf.radius * Math.sin(Math.PI / 2 + this.conf.tha);
                this.protonEmitterArray[0].p.y = keypoints[0].y + this.conf.radius * Math.cos(Math.PI / 2 + this.conf.tha);
                this.protonEmitterArray[1].p.x = keypoints[0].x + this.conf.radius * Math.sin(-Math.PI / 2 + this.conf.tha);
                this.protonEmitterArray[1].p.y = keypoints[0].y + this.conf.radius * Math.cos(-Math.PI / 2 + this.conf.tha);
                this.conf.tha += .1;
                break;
            case AnimEnum.particleRightHandLine.id:
                this.protonEmitterArray[0].p.x = keypoints[10].x;
                this.protonEmitterArray[0].p.y = keypoints[10].y;
                break;
            case AnimEnum.particleNoseGravity.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.protonEmitterArray[0].p.x = keypoints[0].x;
                this.protonEmitterArray[0].p.y = keypoints[0].y;
                break;
            case AnimEnum.particleNoseSupernova.id:
                this.protonEmitterArray[0].p.x = keypoints[0].x;
                this.protonEmitterArray[0].p.y = keypoints[0].y;
                break;
            case AnimEnum.particleHandsTrackFromBorder.id:
                this.leftHandPosition.x = keypoints[9].x;
                this.leftHandPosition.y = keypoints[9].y;
                this.rightHandPosition.x = keypoints[10].x;
                this.rightHandPosition.y = keypoints[10].y
                break;
            case AnimEnum.particleUpperBodyGlow.id:
                this.protonEmitterArray[0].p.x = keypoints[9].x;
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[7].x;
                this.protonEmitterArray[1].p.y = keypoints[7].y;
                this.protonEmitterArray[2].p.x = keypoints[5].x;
                this.protonEmitterArray[2].p.y = keypoints[5].y;
                this.protonEmitterArray[3].p.x = keypoints[6].x;
                this.protonEmitterArray[3].p.y = keypoints[6].y;
                this.protonEmitterArray[4].p.x = keypoints[8].x;
                this.protonEmitterArray[4].p.y = keypoints[8].y;
                this.protonEmitterArray[5].p.x = keypoints[10].x;
                this.protonEmitterArray[5].p.y = keypoints[10].y;
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
                this.protonEmitterArray[0].p.x = keypoints[9].x;
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[7].x;
                this.protonEmitterArray[1].p.y = keypoints[7].y;
                this.protonEmitterArray[2].p.x = keypoints[5].x;
                this.protonEmitterArray[2].p.y = keypoints[5].y;
                this.protonEmitterArray[3].p.x = keypoints[6].x;
                this.protonEmitterArray[3].p.y = keypoints[6].y;
                this.protonEmitterArray[4].p.x = keypoints[8].x;
                this.protonEmitterArray[4].p.y = keypoints[8].y;
                this.protonEmitterArray[5].p.x = keypoints[10].x;
                this.protonEmitterArray[5].p.y = keypoints[10].y;

                this.protonEmitterArray[6].p.x = keypoints[11].x;
                this.protonEmitterArray[6].p.y = keypoints[11].y;
                this.protonEmitterArray[7].p.x = keypoints[13].x;
                this.protonEmitterArray[7].p.y = keypoints[13].y;
                this.protonEmitterArray[8].p.x = keypoints[15].x;
                this.protonEmitterArray[8].p.y = keypoints[15].y;
                this.protonEmitterArray[9].p.x = keypoints[12].x;
                this.protonEmitterArray[9].p.y = keypoints[12].y;
                this.protonEmitterArray[10].p.x = keypoints[14].x;
                this.protonEmitterArray[10].p.y = keypoints[14].y;
                this.protonEmitterArray[11].p.x = keypoints[16].x;
                this.protonEmitterArray[11].p.y = keypoints[16].y;
                break;
            case AnimEnum.particleBurningMan.id:
                this.protonEmitterArray[0].p.x = keypoints[9].x;
                this.protonEmitterArray[0].p.y = keypoints[9].y;
                this.protonEmitterArray[1].p.x = keypoints[7].x;
                this.protonEmitterArray[1].p.y = keypoints[7].y;
                this.protonEmitterArray[2].p.x = keypoints[5].x;
                this.protonEmitterArray[2].p.y = keypoints[5].y;
                this.protonEmitterArray[3].p.x = keypoints[6].x;
                this.protonEmitterArray[3].p.y = keypoints[6].y;
                this.protonEmitterArray[4].p.x = keypoints[8].x;
                this.protonEmitterArray[4].p.y = keypoints[8].y;
                this.protonEmitterArray[5].p.x = keypoints[10].x;
                this.protonEmitterArray[5].p.y = keypoints[10].y;

                this.protonEmitterArray[6].p.x = keypoints[11].x;
                this.protonEmitterArray[6].p.y = keypoints[11].y;
                this.protonEmitterArray[7].p.x = keypoints[13].x;
                this.protonEmitterArray[7].p.y = keypoints[13].y;
                this.protonEmitterArray[8].p.x = keypoints[15].x;
                this.protonEmitterArray[8].p.y = keypoints[15].y;
                this.protonEmitterArray[9].p.x = keypoints[12].x;
                this.protonEmitterArray[9].p.y = keypoints[12].y;
                this.protonEmitterArray[10].p.x = keypoints[14].x;
                this.protonEmitterArray[10].p.y = keypoints[14].y;
                this.protonEmitterArray[11].p.x = keypoints[16].x;
                this.protonEmitterArray[11].p.y = keypoints[16].y;

                this.protonEmitterArray[12].p.x = keypoints[5].x;
                this.protonEmitterArray[12].p.y = keypoints[5].y;
                this.protonEmitterArray[13].p.x = keypoints[6].x;
                this.protonEmitterArray[13].p.y = keypoints[6].y;

                this.protonEmitterArray[14].p.x = keypoints[15].x;
                this.protonEmitterArray[14].p.y = keypoints[15].y;
                this.protonEmitterArray[15].p.x = keypoints[16].x;
                this.protonEmitterArray[15].p.y = keypoints[16].y;

                this.protonEmitterArray[16].p.x = keypoints[0].x;
                this.protonEmitterArray[16].p.y = keypoints[0].y;
                this.protonEmitterArray[17].p.x = keypoints[3].x;
                this.protonEmitterArray[17].p.y = keypoints[3].y;
                this.protonEmitterArray[18].p.x = keypoints[4].x;
                this.protonEmitterArray[18].p.y = keypoints[4].y;
                break;
            case AnimEnum.particleCyclone.id:
                this.protonEmitterArray[0].p.x = keypoints[0].x;
                this.protonEmitterArray[0].p.y = keypoints[0].y;
                break;
            case AnimEnum.particleSun.id:
                this.protonEmitterArray[0].p.x = keypoints[0].x;
                this.protonEmitterArray[0].p.y = keypoints[0].y-150;
                break;
            case AnimEnum.particleFireFly.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 10, 150);
                break;
            case AnimEnum.particleFireFlyColor.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 20, 250);
                break;
            case AnimEnum.particleSpit.id:
                this.protonEmitterArray[0].p.x = keypoints[0].x;
                this.protonEmitterArray[0].p.y = keypoints[0].y-100;
                break;
            case AnimEnum.particle2BallHeadExp.id:
                this.protonEmitterArray[0].p.x = keypoints[0].x + this.conf.radius * Math.sin(Math.PI / 2 + this.conf.tha);
                this.protonEmitterArray[0].p.y = keypoints[0].y + this.conf.radius * Math.cos(Math.PI / 2 + this.conf.tha);
                this.protonEmitterArray[1].p.x = keypoints[0].x + this.conf.radius * Math.sin(-Math.PI / 2 + this.conf.tha);
                this.protonEmitterArray[1].p.y = keypoints[0].y + this.conf.radius * Math.cos(-Math.PI / 2 + this.conf.tha);
                this.conf.tha += .1;
                break;
            case AnimEnum.particleMatrix.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 45, 160);
                break;
            case AnimEnum.particleSnow.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 45, 160);
                break;
            case AnimEnum.particleSnowHoriz.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 45, 160);
                break;
            case AnimEnum.particleLightSab.id:
                this.protonEmitterArray[0].p.x = keypoints[10].x;
                this.protonEmitterArray[0].p.y = keypoints[10].y;
                break;

            // NEW PARTICLE ANIMATIONS
            case AnimEnum.particleAllJoints.id:
                for(let i = 0; i < 17; i++) {
                    this.protonEmitterArray[i].p.x = keypoints[i].x;
                    this.protonEmitterArray[i].p.y = keypoints[i].y;
                }
                break;
            case AnimEnum.particleFeetTrail.id:
                this.protonEmitterArray[0].p.x = keypoints[15].x;
                this.protonEmitterArray[0].p.y = keypoints[15].y;
                this.protonEmitterArray[1].p.x = keypoints[16].x;
                this.protonEmitterArray[1].p.y = keypoints[16].y;
                break;
            case AnimEnum.particleKneeCircles.id:
                this.protonEmitterArray[0].p.x = keypoints[13].x + 50 * Math.sin(this.conf.tha);
                this.protonEmitterArray[0].p.y = keypoints[13].y + 50 * Math.cos(this.conf.tha);
                this.protonEmitterArray[1].p.x = keypoints[14].x + 50 * Math.sin(-this.conf.tha);
                this.protonEmitterArray[1].p.y = keypoints[14].y + 50 * Math.cos(-this.conf.tha);
                this.conf.tha += .15;
                break;
            case AnimEnum.particleShoulderWaves.id:
                this.protonEmitterArray[0].p.x = keypoints[5].x;
                this.protonEmitterArray[0].p.y = keypoints[5].y;
                this.protonEmitterArray[1].p.x = keypoints[6].x;
                this.protonEmitterArray[1].p.y = keypoints[6].y;
                break;
            case AnimEnum.particleBodyMagnet.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.attractionBehaviour.reset(this.nosePosition, 20, 400);
                break;
            case AnimEnum.particleWaveField.id:
                for(let i = 0; i < 6; i++) {
                    this.protonEmitterArray[i].p.x = keypoints[i < 3 ? 5 : 6].x;
                    this.protonEmitterArray[i].p.y = keypoints[i < 3 ? 5 : 6].y;
                }
                break;
            case AnimEnum.particleVortex.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                break;
            case AnimEnum.particleElectric.id:
                for(let i = 0; i < 8; i++) {
                    const kpIndex = [9, 10, 7, 8, 5, 6, 11, 12][i];
                    this.protonEmitterArray[i].p.x = keypoints[kpIndex].x;
                    this.protonEmitterArray[i].p.y = keypoints[kpIndex].y;
                }
                break;
            case AnimEnum.particleRainbowTrail.id:
                this.leftRightWristUpdate(keypoints);
                break;
            case AnimEnum.particleStarField.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.attractionBehaviour.reset(this.nosePosition, 5, 300);
                break;
            case AnimEnum.particleBubbles.id:
                this.leftRightWristUpdate(keypoints);
                break;
            case AnimEnum.particleFireworks.id:
                this.leftRightWristUpdate(keypoints);
                break;
            case AnimEnum.particleNeonGlow.id:
                for(let i = 0; i < 12; i++) {
                    const kpIndex = [9,7,5,6,8,10,11,13,15,12,14,16][i];
                    this.protonEmitterArray[i].p.x = keypoints[kpIndex].x;
                    this.protonEmitterArray[i].p.y = keypoints[kpIndex].y;
                }
                break;
            case AnimEnum.particleAurora.id:
                this.protonEmitterArray[0].p.x = keypoints[0].x;
                this.protonEmitterArray[0].p.y = keypoints[0].y - 200;
                break;
            case AnimEnum.particleFog.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 30, 200);
                break;
            case AnimEnum.particleRain.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 40, 180);
                break;
            case AnimEnum.particleLeaves.id:
                this.nosePosition.x = keypoints[0].x;
                this.nosePosition.y = keypoints[0].y;
                this.repulsionBehaviour.reset(this.nosePosition, 35, 220);
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

        this.drawLine(keypoints[10].x, keypoints[10].y, keypoints[10].x, 0);
        this.drawLine(keypoints[9].x, keypoints[9].y, keypoints[9].x, 0);
        this.drawLine(keypoints[0].x, keypoints[0].y, keypoints[0].x, 0);
        this.drawLine(keypoints[6].x, keypoints[6].y, keypoints[6].x, 0);
        this.drawLine(keypoints[5].x, keypoints[5].y, keypoints[5].x, 0);
        this.drawLine(keypoints[15].x, keypoints[15].y, keypoints[15].x, 0);
        this.drawLine(keypoints[16].x, keypoints[16].y, keypoints[16].x, 0);

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

        this.drawLine(keypoints[0].x, keypoints[0].y, this.canvas.width / 2, 0);
        this.drawLine(keypoints[1].x, keypoints[1].y, this.canvas.width / 2 * (1 + 0.25), 0);
        this.drawLine(keypoints[3].x, keypoints[3].y, this.canvas.width / 2 * (1 + 0.5), 0);

        this.drawLine(keypoints[2].x, keypoints[2].y, this.canvas.width / 2 * (1 - 0.25), 0);
        this.drawLine(keypoints[4].x, keypoints[4].y, this.canvas.width / 2 * (1 - 0.5), 0);

        this.drawLine(keypoints[6].x, keypoints[6].y, 0, this.canvas.height / 2 * (1 - 0.5));
        this.drawLine(keypoints[8].x, keypoints[8].y, 0, this.canvas.height / 2 * (1 - 0.25));

        this.drawLine(keypoints[9].x, keypoints[9].y, this.canvas.width, this.canvas.height / 2);
        this.drawLine(keypoints[10].x, keypoints[10].y, 0, this.canvas.height / 2);

        this.drawLine(keypoints[12].x, keypoints[12].y, 0, this.canvas.height / 2 * (1 + 0.3));
        this.drawLine(keypoints[14].x, keypoints[14].y, 0, this.canvas.height / 2 * (1 + 0.6));
        this.drawLine(keypoints[16].x, keypoints[16].y, 0, this.canvas.height / 2 * (1 + 0.9));

        this.drawLine(keypoints[5].x, keypoints[5].y, this.canvas.width, this.canvas.height / 2 * (1 - 0.5));
        this.drawLine(keypoints[7].x, keypoints[7].y, this.canvas.width, this.canvas.height / 2 * (1 - 0.25));

        this.drawLine(keypoints[11].x, keypoints[11].y, this.canvas.width, this.canvas.height / 2 * (1 + 0.3));
        this.drawLine(keypoints[13].x, keypoints[13].y, this.canvas.width, this.canvas.height / 2 * (1 + 0.6));
        this.drawLine(keypoints[15].x, keypoints[15].y, this.canvas.width, this.canvas.height / 2 * (1 + 0.9));

    }


    this.cParticleHandsBall = function (){
        this.proton = new Proton();
        var emitter = new Proton.Emitter();
        // right hand
        emitter.addInitialize(new Proton.Mass(10));
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Proton.Body(particleImage));
        }
        emitter.addInitialize(new Proton.Life(.1, .4));
        emitter.rate = new Proton.Rate(new Proton.Span(20, 20), .1);
        emitter.addInitialize(new Proton.V(new Proton.Span(3, 5), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Alpha(1, 0));
        emitter.addBehaviour(new Proton.Color("#3366b2", "#1155b2"));
        emitter.addBehaviour(new Proton.Scale(Proton.getSpan(1, 1.6), Proton.getSpan(0, .1)));
        emitter.p.x = this.canvasGL.width / 2;
        emitter.p.y = this.canvasGL.height / 2;
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray[0] = emitter;
        // left hand
        emitter = new Proton.Emitter();
        emitter.addInitialize(new Proton.Mass(10));
        let particleImage2 = new Image();
        particleImage2.src = chrome.runtime.getURL("/images/particle.png");
        particleImage2.onload = () => {
            emitter.addInitialize(new Proton.Body(particleImage2));
        }
        emitter.addInitialize(new Proton.Life(.1, .4));
        emitter.rate = new Proton.Rate(new Proton.Span(20, 20), .1);
        emitter.addInitialize(new Proton.V(new Proton.Span(3, 5), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Alpha(1, 0));
        emitter.addBehaviour(new Proton.Color("#fdf753", "#f63a3f"));
        emitter.addBehaviour(new Proton.Scale(Proton.getSpan(1, 1.6), Proton.getSpan(0, .1)));
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
        this.protonEmitterArray[0] = new Proton.Emitter();
        this.protonEmitterArray[0].rate = new Proton.Rate(new Proton.Span(100));
        this.protonEmitterArray[0].addInitialize(new Proton.Radius(2, 10));
        this.protonEmitterArray[0].addInitialize(new Proton.Life(4, 10));
        this.protonEmitterArray[0].addBehaviour(new Proton.Color('random'));
        this.protonEmitterArray[0].addBehaviour(new Proton.RandomDrift(10, 0, .035));
        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleLightSab = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Proton.Emitter();
        this.protonEmitterArray[0].rate = new Proton.Rate(new Proton.Span(100));
        this.protonEmitterArray[0].addInitialize(new Proton.Radius(2, 7));
        this.protonEmitterArray[0].addInitialize(new Proton.Mass(-1));
        this.protonEmitterArray[0].addInitialize(new Proton.Life(4, 10));
        this.protonEmitterArray[0].addBehaviour(new Proton.Color('random'));
        this.protonEmitterArray[0].addBehaviour(new Proton.RandomDrift(10, -100, .035));
        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }
    this.cParticleNoseGravity = function (){
        this.proton = new Proton();

        this.protonEmitterArray[0] = new Proton.Emitter();
        this.protonEmitterArray[0].damping = 0.0075;
        this.protonEmitterArray[0].rate = new Proton.Rate(300);

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Proton.Body(particleImage, 128, 128));
        }

        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1), new Proton.Radius(Proton.getSpan(5, 10)));
        this.protonEmitterArray[0].addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(0, 360), 'polar'));

        this.nosePosition = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.attractionBehaviour = new Proton.Attraction(this.nosePosition, 10, 1000);
        this.protonEmitterArray[0].addBehaviour(this.attractionBehaviour, new Proton.Color('random'));
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(.1, .7)));

        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit('once');
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleNoseSupernova = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Proton.Emitter();
        this.protonEmitterArray[0].rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.05, .2));

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle2.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Proton.Body(particleImage));
        }

        this.protonEmitterArray[0].addInitialize(new Proton.Body(image));
        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[0].addInitialize(new Proton.Life(2, 4));
        this.protonEmitterArray[0].addInitialize(new Proton.V(new Proton.Span(0.5, 1.5), new Proton.Span(0, 360), 'polar'));

        this.protonEmitterArray[0].addBehaviour(new Proton.Alpha(1, [.7, 1]));
        var scale = new Proton.Scale(1, 0);
        this.protonEmitterArray[0].addBehaviour(scale);
        this.protonEmitterArray[0].addBehaviour(new Proton.Color('random', 'random', Infinity, Proton.easeInSine));

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
        let renderer = new Proton.CanvasRenderer(this.canvas);
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

        let renderer = new Proton.CanvasRenderer(this.canvas);
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
        this.protonEmitterArray[0] = new Proton.Emitter();
        this.protonEmitterArray[0].rate = new Proton.Rate(
            new Proton.Span(6, 15),
            new Proton.Span(0.1, 0.25)
        );
        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[0].addInitialize(new Proton.Radius(2, 8));
        this.protonEmitterArray[0].addInitialize(new Proton.Life(2, 4));
        this.protonEmitterArray[0].addInitialize(
            new Proton.Velocity(
                new Proton.Span(2, 3.3),
                new Proton.Span(-10, 10),
                "polar"
            )
        );

        //emitter.addBehaviour(new Proton.RandomDrift(10, 10, 0.05));
        this.protonEmitterArray[0].addBehaviour(new Proton.Cyclone(Proton.getSpan(-2, 2), 5));
        this.protonEmitterArray[0].addBehaviour(
            new Proton.Color("ff0000", "random", Infinity, Proton.easeOutQuart)
        );
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(1, 0.7));

        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2 + 200;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleSun = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Proton.Emitter();
        this.protonEmitterArray[0].rate = new Proton.Rate(new Proton.Span(30, 50), .1);

        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1));
        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Proton.Body(particleImage));
        }
        //this.protonEmitterArray[0].addInitialize(new Proton.Body(image));
        //emitter.addInitialize(new Proton.P(new Proton.PointZone(canvas.width / 2, canvas.height / 2)));
        this.protonEmitterArray[0].addInitialize(new Proton.Life(.5, 1));
        this.protonEmitterArray[0].addInitialize(new Proton.V(new Proton.Span(3, 5), new Proton.Span(0, 360), 'polar'));

        this.protonEmitterArray[0].addBehaviour(new Proton.Color('#ff0000', '#ffff00'));
        // let attractionForce = new Proton.Attraction(mouseObj, 10, 200);
        // this.protonEmitterArray[0].addBehaviour(attractionForce);
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(1, 1.6), Proton.getSpan(0, .1)));
        this.protonEmitterArray[0].addBehaviour(new Proton.Alpha(1, .2));

        this.protonEmitterArray[0].p.x = this.canvas.width / 2;
        this.protonEmitterArray[0].p.y = this.canvas.height / 2;
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleFireFly = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Proton.Emitter();

        this.protonEmitterArray[0].damping = 0.0075;
        this.protonEmitterArray[0].rate = new Proton.Rate(1480);

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Proton.Body(particleImage, 64));
        }

        this.protonEmitterArray[0].addInitialize(new Proton.Position(new Proton.RectZone(0, 0, this.canvas.width, this.canvas.height)));
        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1), new Proton.Radius(Proton.getSpan(5, 10)));

        this.nosePosition = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.repulsionBehaviour = new Proton.Repulsion(this.nosePosition, 0, 0);
        let crossZoneBehaviour = new Proton.CrossZone(new Proton.RectZone(-2, 0, this.canvas.width, this.canvas.height), 'cross');
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour, crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(.1, .4)));
        this.protonEmitterArray[0].addBehaviour(new Proton.Alpha(.5));
        this.protonEmitterArray[0].addBehaviour(new Proton.RandomDrift(10, 10, .2));

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
        this.protonEmitterArray[0] = new Proton.Emitter();

        this.protonEmitterArray[0].damping = 0.0075;
        this.protonEmitterArray[0].rate = new Proton.Rate(1480);

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Proton.Body(particleImage, 64));
        }

        this.protonEmitterArray[0].addInitialize(new Proton.Position(new Proton.RectZone(0, 0, this.canvas.width, this.canvas.height)));
        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1), new Proton.Radius(Proton.getSpan(5, 10)));
        this.protonEmitterArray[0].addBehaviour(new Proton.Color('rgba(255,200,0,0.16)', '#ffff00'));

        this.nosePosition = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.repulsionBehaviour = new Proton.Repulsion(this.nosePosition, 0, 0);
        let crossZoneBehaviour = new Proton.CrossZone(new Proton.RectZone(-2, 0, this.canvas.width, this.canvas.height), 'cross');
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour, crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(.1, 3.4)));
        this.protonEmitterArray[0].addBehaviour(new Proton.Alpha(.5));
        this.protonEmitterArray[0].addBehaviour(new Proton.RandomDrift(10, 10, .2));

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
        this.protonEmitterArray[0] = new Proton.Emitter();

        //this.protonEmitterArray[0].damping = 0.0075;
        this.protonEmitterArray[0].rate = new Proton.Rate(new Proton.Span(10, 15), new Proton.Span(.05, .1));

        let particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Proton.Body(particleImage));
        }

        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[0].addInitialize(new Proton.Life(1, 3));
        this.protonEmitterArray[0].addInitialize(new Proton.Position(new Proton.CircleZone(0, 0, 20)));
        this.protonEmitterArray[0].addInitialize(new Proton.Velocity(new Proton.Span(5, 8), new Proton.Span(-15, 15), 'polar'));
        this.protonEmitterArray[0].addBehaviour(new Proton.RandomDrift(10, 10, .05));

        this.protonEmitterArray[0].addBehaviour(new Proton.Alpha(0.1, 1));
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(new Proton.Span(2, 3.5), 0));
        this.protonEmitterArray[0].addBehaviour(new Proton.G(6));
        this.protonEmitterArray[0].addBehaviour(new Proton.Color('#FF0026', ['#ffff00', '#ffff11'], Infinity, Proton.easeOutSine));

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
        this.protonEmitterArray[0] = new Proton.Emitter();

        let img0 = new Image();
        img0.src = chrome.runtime.getURL("/images/0.png");
        // img0.onload = () => {
        //     this.protonEmitterArray[0].addInitialize(new Proton.Body(img0));
        // }

        let img1 = new Image();
        img1.src = chrome.runtime.getURL("/images/1.png");
        // img1.onload = () => {
        //     this.protonEmitterArray[0].addInitialize(new Proton.Body(img1));
        // }
        this.protonEmitterArray[0].addInitialize(new Proton.Body([img0, img1]));

        this.protonEmitterArray[0].rate = new Proton.Rate(35, new Proton.Span(0.2, 0.5));
        this.protonEmitterArray[0].damping = 0;
        this.protonEmitterArray[0].addInitialize(new Proton.Life(4));
        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[0].addInitialize(new Proton.Radius(4, 70));
        this.protonEmitterArray[0].addInitialize(
            new Proton.V(new Proton.Span(3, 6), new Proton.Span(180), "polar")
        );
        this.protonEmitterArray[0].addInitialize(new Proton.Body([img0, img1]));

        this.protonEmitterArray[0].addInitialize(
            new Proton.Position(new Proton.LineZone(0, -50, this.canvas.width, -50))
        );

        const dis = 150;
        this.crossZoneBehaviour = new Proton.CrossZone(
            new Proton.RectZone(
                0 - dis,
                0 - dis,
                this.canvas.width + 2 * dis,
                this.canvas.height + 2 * dis
            ),
            "dead"
        );
        this.protonEmitterArray[0].addBehaviour(this.crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Proton.Alpha(Proton.getSpan(0.1, 0.7)));
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(0.2, 0.7)));
        this.repulsionBehaviour = new Proton.Repulsion({ x: 0, y: 0 }, 0, 0);
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour);
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleSnow = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Proton.Emitter();

        let img0 = new Image();
        img0.src = chrome.runtime.getURL("/images/particle.png");
        img0.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Proton.Body(img0));
        }

        this.protonEmitterArray[0].rate = new Proton.Rate(60, new Proton.Span(0.2, 0.3));
        this.protonEmitterArray[0].damping = 0;
        this.protonEmitterArray[0].addInitialize(new Proton.Life(4));
        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[0].addInitialize(new Proton.Radius(4, 70));
        this.protonEmitterArray[0].addInitialize(
            new Proton.V(new Proton.Span(3, 6), new Proton.Span(180), "polar")
        );

        this.protonEmitterArray[0].addInitialize(
            new Proton.Position(new Proton.LineZone(0, -50, this.canvas.width, -50))
        );

        const dis = 150;
        this.crossZoneBehaviour = new Proton.CrossZone(
            new Proton.RectZone(
                0 - dis,
                0 - dis,
                this.canvas.width + 2 * dis,
                this.canvas.height + 2 * dis
            ),
            "dead"
        );
        this.protonEmitterArray[0].addBehaviour(this.crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Proton.Alpha(Proton.getSpan(0.1, 0.7)));
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(0.2, 0.7)));
        this.repulsionBehaviour = new Proton.Repulsion({ x: 0, y: 0 }, 0, 0);
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour);
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }

    this.cParticleSnowHoriz = function (){
        this.proton = new Proton();
        this.protonEmitterArray[0] = new Proton.Emitter();

        let img0 = new Image();
        img0.src = chrome.runtime.getURL("/images/particle.png");
        img0.onload = () => {
            this.protonEmitterArray[0].addInitialize(new Proton.Body(img0));
        }

        this.protonEmitterArray[0].rate = new Proton.Rate(110, new Proton.Span(0.2, 0.3));
        this.protonEmitterArray[0].damping = 0;
        this.protonEmitterArray[0].addInitialize(new Proton.Life(4));
        this.protonEmitterArray[0].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[0].addInitialize(new Proton.Radius(4, 70));
        this.protonEmitterArray[0].addInitialize(
            new Proton.V(new Proton.Span(3, 6), new Proton.Span(205), "polar")
        );

        this.protonEmitterArray[0].addInitialize(
            new Proton.Position(new Proton.LineZone(0, -50, this.canvas.width *2, -50))
        );

        //this.protonEmitterArray[0].rotation = -33;

        const dis = 300;
        this.crossZoneBehaviour = new Proton.CrossZone(
            new Proton.RectZone(
                0 - dis,
                0 - dis,
                this.canvas.width + 2 * dis,
                this.canvas.height + 2 * dis
            ),
            "dead"
        );
        this.protonEmitterArray[0].addBehaviour(this.crossZoneBehaviour);
        this.protonEmitterArray[0].addBehaviour(new Proton.Alpha(Proton.getSpan(0.1, 0.7)));
        this.protonEmitterArray[0].addBehaviour(new Proton.Scale(Proton.getSpan(0.2, 0.7)));
        this.repulsionBehaviour = new Proton.Repulsion({ x: 0, y: 0 }, 0, 0);
        this.protonEmitterArray[0].addBehaviour(this.repulsionBehaviour);
        this.protonEmitterArray[0].emit();
        this.proton.addEmitter(this.protonEmitterArray[0]);

        this.tryWebGLRendererInit();
    }


    this.createImageEmitter = function (x, y, color1, color2, scaleStart) {
        var emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(5, 7), new Proton.Span(.01, .02));

        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Life(1));
        var particleImage = new Image();
        particleImage.src = chrome.runtime.getURL("/images/particle.png");
        particleImage.onload = () => {
            emitter.addInitialize(new Proton.Body(particleImage, 32));
        }
        emitter.addInitialize(new Proton.Radius(40));

        emitter.addBehaviour(new Proton.Alpha(1, 0));
        emitter.addBehaviour(new Proton.Color(color1, color2));
        emitter.addBehaviour(new Proton.Scale(scaleStart, 0.1));
        emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, this.canvas.width, this.canvas.height), 'dead'));
        var attractionBehaviour = new Proton.Attraction(this.nosePosition, 0, 0);
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
        this.protonEmitterArray[emitterIndex] = new Proton.Emitter();
        this.protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(2, 5), .05);
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 20, 40));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1.5, 2.2));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Velocity(2, Proton.getSpan(0, 360), 'polar'));

        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Rotate());
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Gravity(3));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.6, 1));
        // protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvas.width, canvas.height), 'bound'));

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
        this.protonEmitterArray[emitterIndex] = new Proton.Emitter();
        this.protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(.1, .2), new Proton.Span(.01, .015));

        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(10));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1, 2));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 4));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(2));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(1, 2), angle, 'polar'));

        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.8, 0));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.RandomDrift(30, 30, 0));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(colorT, colorE));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Scale(1, 0));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, this.canvasGL.width, this.canvasGL.height), 'dead'));

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
        this.protonEmitterArray[emitterIndex] = new Proton.Emitter();
        this.protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(.1, .2), new Proton.Span(.01, .015));

        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1, 50));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 4));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(2));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(1, 2), angle, 'polar'));

        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.8, 0));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(colorT, colorE));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Scale(1, 0.1));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, this.canvasGL.width, this.canvasGL.height), 'dead'));

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
        this.protonEmitterArray[emitterIndex] = new Proton.Emitter();
        this.protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(.1, .2), new Proton.Span(.01, .015));

        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1, 2));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 32));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(2));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(1, 2), angle, 'polar'));

        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.1, 0));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(colorT, colorE));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Scale(3, 0.1));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, this.canvasGL.width, this.canvasGL.height), 'dead'));

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
        this.protonEmitterArray[emitterIndex] = new Proton.Emitter();
        this.protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(.1, .2), new Proton.Span(.01, .015));

        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(1, 50));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Body(image, 32));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(2));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(1, 2), angle, 'polar'));

        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(0.08, 0));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(colorT, colorE));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Scale(3, 0.1));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, this.canvasGL.width, this.canvasGL.height), 'dead'));

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
            this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
            this.rendererGL.blendFunc("SRC_ALPHA", "ONE");
            //this.rendererGL.gl.blendFuncSeparate(this.rendererGL.gl.SRC_ALPHA, this.rendererGL.gl.ONE, this.rendererGL.gl.ONE, this.rendererGL.gl.ONE_MINUS_SRC_ALPHA);
            this.proton.addRenderer(this.rendererGL);
        } catch (e) {
            const renderer = new Proton.CanvasRenderer(this.canvas);
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
        this.protonEmitterArray[emitterIndex] = new Proton.Emitter();
        this.protonEmitterArray[emitterIndex].rate = new Proton.Rate(new Proton.Span(10, 30), new Proton.Span(.1));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Mass(1));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Life(3, 6));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.Radius(4, 0.1));
        this.protonEmitterArray[emitterIndex].addInitialize(new Proton.V(new Proton.Span(0.5, 1), new Proton.Span(90, 10, true), 'polar'));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Alpha(1, 0));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Color(color));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.Attraction(handPos, 10, 1500));
        this.protonEmitterArray[emitterIndex].addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, this.canvas.width, this.canvas.height), 'cross'));
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
        this.protonEmitterArray[0].p.x = keypoints[9].x;
        this.protonEmitterArray[0].p.y = keypoints[9].y;
        this.protonEmitterArray[1].p.x = keypoints[10].x;
        this.protonEmitterArray[1].p.y = keypoints[10].y;
    }

    // ========== NEW PARTICLE ANIMATIONS ==========

    /** Particles from all 17 joints */
    this.cParticleAllJoints = function() {
        this.proton = new Proton();
        for(let i = 0; i < 17; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(3, 5), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(2, 6));
            emitter.addInitialize(new Proton.Life(0.5, 1.5));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.5, 2), new Proton.Span(0, 360), 'polar'));
            const hue = (i * 21) % 360;
            emitter.addBehaviour(new Proton.Color(`hsl(${hue}, 80%, 60%)`));
            emitter.addBehaviour(new Proton.Alpha(0.8, 0));
            emitter.addBehaviour(new Proton.Scale(1, 0.3));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Trail from feet */
    this.cParticleFeetTrail = function() {
        this.proton = new Proton();
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(8, 12), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(3, 8));
            emitter.addInitialize(new Proton.Life(2, 4));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.3, 0.8), new Proton.Span(0, 360), 'polar'));
            emitter.addBehaviour(new Proton.Color(i === 0 ? '#00FFFF' : '#FF00FF'));
            emitter.addBehaviour(new Proton.Alpha(0.7, 0));
            emitter.addBehaviour(new Proton.Scale(1.5, 0.1));
            emitter.addBehaviour(new Proton.RandomDrift(10, 10, 0.05));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Circling particles around knees */
    this.cParticleKneeCircles = function() {
        this.proton = new Proton();
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(5, 8), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(4, 10));
            emitter.addInitialize(new Proton.Life(1, 2));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(0, 360), 'polar'));
            emitter.addBehaviour(new Proton.Color('#FFD700', '#FF6B00'));
            emitter.addBehaviour(new Proton.Alpha(0.9, 0));
            emitter.addBehaviour(new Proton.Scale(1.2, 0.2));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Wave particles from shoulders */
    this.cParticleShoulderWaves = function() {
        this.proton = new Proton();
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(10, 15), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(5, 12));
            emitter.addInitialize(new Proton.Life(1.5, 3));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(2, 4), new Proton.Span(0, 360), 'polar'));
            emitter.addBehaviour(new Proton.Color('#00BFFF', '#1E90FF'));
            emitter.addBehaviour(new Proton.Alpha(0.6, 0));
            emitter.addBehaviour(new Proton.Scale(2, 0.1));
            emitter.addBehaviour(new Proton.RandomDrift(30, 20, 0.05));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Body acts as magnet */
    this.cParticleBodyMagnet = function() {
        this.proton = new Proton();
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(50, 80), 0.2);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(3, 8));
        emitter.addInitialize(new Proton.Life(3, 6));
        emitter.addInitialize(new Proton.Position(new Proton.RectZone(0, 0, this.canvas.width, this.canvas.height)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.5, 1.5), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Color('#FF1493', '#8B008B'));
        emitter.addBehaviour(new Proton.Alpha(0.8, 0));
        emitter.addBehaviour(new Proton.Scale(1, 0.3));
        this.attractionBehaviour = new Proton.Attraction(this.nosePosition, 20, 400);
        emitter.addBehaviour(this.attractionBehaviour);
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Wave field from shoulders */
    this.cParticleWaveField = function() {
        this.proton = new Proton();
        for(let i = 0; i < 6; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(15, 20), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(6, 14));
            emitter.addInitialize(new Proton.Life(2, 4));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(3, 6), new Proton.Span(i * 60, (i+1) * 60), 'polar'));
            emitter.addBehaviour(new Proton.Color('#00CED1', '#4682B4'));
            emitter.addBehaviour(new Proton.Alpha(0.5, 0));
            emitter.addBehaviour(new Proton.Scale(2.5, 0.1));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Vortex effect */
    this.cParticleVortex = function() {
        this.proton = new Proton();
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(60, 100), 0.2);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(4, 10));
        emitter.addInitialize(new Proton.Life(2, 4));
        emitter.addInitialize(new Proton.Position(new Proton.RectZone(0, 0, this.canvas.width, this.canvas.height)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Color('#9400D3', '#4B0082'));
        emitter.addBehaviour(new Proton.Alpha(0.7, 0));
        emitter.addBehaviour(new Proton.Scale(1.5, 0.2));
        emitter.addBehaviour(new Proton.Cyclone(3, 100));
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Electric arcs */
    this.cParticleElectric = function() {
        this.proton = new Proton();
        for(let i = 0; i < 8; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(20, 30), 0.05);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(2, 5));
            emitter.addInitialize(new Proton.Life(0.1, 0.3));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(5, 10), new Proton.Span(0, 360), 'polar'));
            emitter.addBehaviour(new Proton.Color('#FFFFFF', '#00FFFF'));
            emitter.addBehaviour(new Proton.Alpha(1, 0));
            emitter.addBehaviour(new Proton.Scale(2, 0));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Rainbow trail */
    this.cParticleRainbowTrail = function() {
        this.proton = new Proton();
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(30, 40), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(8, 16));
            emitter.addInitialize(new Proton.Life(2, 4));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.5, 1.5), new Proton.Span(0, 360), 'polar'));
            emitter.addBehaviour(new Proton.Color(colors));
            emitter.addBehaviour(new Proton.Alpha(0.9, 0));
            emitter.addBehaviour(new Proton.Scale(2.5, 0.1));
            emitter.addBehaviour(new Proton.RandomDrift(15, 15, 0.03));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Star field */
    this.cParticleStarField = function() {
        this.proton = new Proton();
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(100, 150), 0.5);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(2, 6));
        emitter.addInitialize(new Proton.Life(4, 8));
        emitter.addInitialize(new Proton.Position(new Proton.RectZone(0, 0, this.canvas.width, this.canvas.height)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.2, 0.8), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Color('#FFFFFF', '#FFFACD'));
        emitter.addBehaviour(new Proton.Alpha(0.8, 0));
        emitter.addBehaviour(new Proton.Scale(1, 0.3));
        this.attractionBehaviour = new Proton.Attraction(this.nosePosition, 5, 300);
        emitter.addBehaviour(this.attractionBehaviour);
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Bubbles */
    this.cParticleBubbles = function() {
        this.proton = new Proton();
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(15, 25), 0.2);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(10, 25));
            emitter.addInitialize(new Proton.Life(3, 6));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 2), new Proton.Span(80, 100), 'polar'));
            emitter.addBehaviour(new Proton.Color('#87CEEB', '#E0F6FF'));
            emitter.addBehaviour(new Proton.Alpha(0.6, 0));
            emitter.addBehaviour(new Proton.Scale(1, 2));
            emitter.addBehaviour(new Proton.RandomDrift(20, 5, 0.04));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Fireworks */
    this.cParticleFireworks = function() {
        this.proton = new Proton();
        for(let i = 0; i < 2; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(40, 60), 0.15);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(4, 10));
            emitter.addInitialize(new Proton.Life(1, 2.5));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(4, 8), new Proton.Span(0, 360), 'polar'));
            emitter.addBehaviour(new Proton.Color(['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#FF00FF']));
            emitter.addBehaviour(new Proton.Alpha(1, 0));
            emitter.addBehaviour(new Proton.Scale(2, 0));
            emitter.addBehaviour(new Proton.Gravity(2));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Neon glow */
    this.cParticleNeonGlow = function() {
        this.proton = new Proton();
        const colors = ['#FF1493', '#00FFFF', '#00FF00', '#FF00FF', '#FFD700', '#FF6347'];
        for(let i = 0; i < 12; i++) {
            const emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(20, 30), 0.1);
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(8, 18));
            emitter.addInitialize(new Proton.Life(0.8, 1.5));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(0, 360), 'polar'));
            emitter.addBehaviour(new Proton.Color(colors[i % colors.length]));
            emitter.addBehaviour(new Proton.Alpha(0.8, 0));
            emitter.addBehaviour(new Proton.Scale(2, 0.1));
            emitter.p.x = this.canvas.width / 2;
            emitter.p.y = this.canvas.height / 2;
            emitter.emit();
            this.proton.addEmitter(emitter);
            this.protonEmitterArray.push(emitter);
        }
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Aurora */
    this.cParticleAurora = function() {
        this.proton = new Proton();
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(80, 120), 0.3);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(10, 25));
        emitter.addInitialize(new Proton.Life(3, 6));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(60, 120), 'polar'));
        emitter.addBehaviour(new Proton.Color(['#00FF00', '#00FFFF', '#0080FF', '#FF00FF']));
        emitter.addBehaviour(new Proton.Alpha(0.6, 0));
        emitter.addBehaviour(new Proton.Scale(3, 0.1));
        emitter.addBehaviour(new Proton.RandomDrift(50, 20, 0.03));
        emitter.p.x = this.canvas.width / 2;
        emitter.p.y = 100;
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Fog */
    this.cParticleFog = function() {
        this.proton = new Proton();
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(30, 50), 0.4);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(30, 60));
        emitter.addInitialize(new Proton.Life(5, 10));
        emitter.addInitialize(new Proton.Position(new Proton.RectZone(0, this.canvas.height * 0.7, this.canvas.width, this.canvas.height * 0.3)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(0.3, 0.8), new Proton.Span(0, 360), 'polar'));
        emitter.addBehaviour(new Proton.Color('#CCCCCC', '#EEEEEE'));
        emitter.addBehaviour(new Proton.Alpha(0.3, 0));
        emitter.addBehaviour(new Proton.Scale(2, 3));
        this.repulsionBehaviour = new Proton.Repulsion(this.nosePosition, 30, 200);
        emitter.addBehaviour(this.repulsionBehaviour);
        emitter.addBehaviour(new Proton.RandomDrift(15, 10, 0.02));
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Rain */
    this.cParticleRain = function() {
        this.proton = new Proton();
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(100, 150), 0.3);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(2, 4));
        emitter.addInitialize(new Proton.Life(2, 4));
        emitter.addInitialize(new Proton.Position(new Proton.LineZone(0, 0, this.canvas.width, 0)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(5, 8), new Proton.Span(85, 95), 'polar'));
        emitter.addBehaviour(new Proton.Color('#4169E1', '#1E90FF'));
        emitter.addBehaviour(new Proton.Alpha(0.7, 0));
        emitter.addBehaviour(new Proton.Scale(1, 0.3));
        this.repulsionBehaviour = new Proton.Repulsion(this.nosePosition, 40, 180);
        emitter.addBehaviour(this.repulsionBehaviour);
        emitter.addBehaviour(new Proton.Gravity(3));
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    /** Falling leaves */
    this.cParticleLeaves = function() {
        this.proton = new Proton();
        const emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(40, 60), 0.5);
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.Radius(8, 16));
        emitter.addInitialize(new Proton.Life(6, 12));
        emitter.addInitialize(new Proton.Position(new Proton.LineZone(0, 0, this.canvas.width, 0)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 2), new Proton.Span(85, 95), 'polar'));
        emitter.addBehaviour(new Proton.Color(['#FF4500', '#FFD700', '#8B4513', '#FF6347', '#CD853F']));
        emitter.addBehaviour(new Proton.Alpha(0.8, 0));
        emitter.addBehaviour(new Proton.Scale(1, 0.5));
        this.repulsionBehaviour = new Proton.Repulsion(this.nosePosition, 35, 220);
        emitter.addBehaviour(this.repulsionBehaviour);
        emitter.addBehaviour(new Proton.RandomDrift(40, 20, 0.04));
        emitter.addBehaviour(new Proton.Gravity(1));
        emitter.addBehaviour(new Proton.Rotate());
        emitter.emit();
        this.proton.addEmitter(emitter);
        this.protonEmitterArray.push(emitter);
        this.rendererGL = new Proton.WebGLRenderer(this.canvasGL);
        this.proton.addRenderer(this.rendererGL);
    }

    // ========== NEW CANVAS ANIMATIONS ==========

    /**
     * Draw skeleton 7 times with different scales and positions
     */
    this.drawSkeleton7Times = function(pose, canvasPoseCoordinates) {
        const scales = [1.0, 0.3, 0.6, 0.9, 1.2, 0.4, 0.7];
        const offsets = [
            {x: 0, y: 0},
            {x: this.canvas.width/3, y: 0},
            {x: -this.canvas.width/3, y: 0},
            {x: 0, y: this.canvas.height/3},
            {x: 0, y: -this.canvas.height/3},
            {x: this.canvas.width/4, y: this.canvas.height/4},
            {x: -this.canvas.width/4, y: -this.canvas.height/4}
        ];

        for(let i = 0; i < scales.length; i++) {
            const transformed = detectUtils.transformKeypointsForRender(
                pose[0].keypoints, this.mainVideo, this.canvas,
                scales[i], scales[i], offsets[i].x, offsets[i].y
            );
            this.drawKeyPoints(transformed);
            this.drawSkeleton(transformed, i+1);
        }
    }

    /**
     * Draw mirrored skeleton
     */
    this.drawSkeletonMirror = function(pose, canvasPoseCoordinates) {
        this.drawKeyPoints(canvasPoseCoordinates);
        this.drawSkeleton(canvasPoseCoordinates, 1);

        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.translate(-this.canvas.width, 0);
        this.drawKeyPoints(canvasPoseCoordinates);
        this.drawSkeleton(canvasPoseCoordinates, 2);
        this.ctx.restore();
    }

    /**
     * Draw skeleton with rainbow colors
     */
    this.drawSkeletonRainbow = function(keypoints) {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        let colorIndex = 0;

        for (let i = 0; i < keypoints.length; i++) {
            const keypoint = keypoints[i];
            if (keypoint.score >= this.keypointScore) {
                this.ctx.fillStyle = colors[colorIndex % colors.length];
                this.ctx.beginPath();
                this.ctx.arc(keypoint.x, keypoint.y, this.keypointArcSize * 8, 0, 2 * Math.PI);
                this.ctx.fill();
                colorIndex++;
            }
        }

        const adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
        adjacentPairs.forEach((indices, pairIndex) => {
            const [i, j] = indices;
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            if (kp1.score >= this.keypointScore && kp2.score >= this.keypointScore) {
                this.ctx.strokeStyle = colors[pairIndex % colors.length];
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });
    }

    /**
     * Draw lines connecting all keypoints to each other
     */
    this.drawConnectingDots = function(keypoints) {
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < keypoints.length; i++) {
            if (keypoints[i].score >= this.keypointScore) {
                for (let j = i + 1; j < keypoints.length; j++) {
                    if (keypoints[j].score >= this.keypointScore) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(keypoints[i].x, keypoints[i].y);
                        this.ctx.lineTo(keypoints[j].x, keypoints[j].y);
                        this.ctx.stroke();
                    }
                }
            }
        }

        this.drawKeyPoints(keypoints);
    }

    /**
     * Draw geometric shapes at keypoints
     */
    this.drawGeometricShapes = function(keypoints) {
        const shapes = ['circle', 'square', 'triangle', 'diamond', 'hexagon'];

        for (let i = 0; i < keypoints.length; i++) {
            if (keypoints[i].score >= this.keypointScore) {
                const shape = shapes[i % shapes.length];
                const x = keypoints[i].x;
                const y = keypoints[i].y;
                const size = 15;

                this.ctx.fillStyle = `hsl(${i * 20}, 80%, 60%)`;
                this.ctx.strokeStyle = `hsl(${i * 20}, 80%, 40%)`;
                this.ctx.lineWidth = 2;

                this.ctx.beginPath();
                switch(shape) {
                    case 'circle':
                        this.ctx.arc(x, y, size, 0, 2 * Math.PI);
                        break;
                    case 'square':
                        this.ctx.rect(x - size, y - size, size * 2, size * 2);
                        break;
                    case 'triangle':
                        this.ctx.moveTo(x, y - size);
                        this.ctx.lineTo(x + size, y + size);
                        this.ctx.lineTo(x - size, y + size);
                        this.ctx.closePath();
                        break;
                    case 'diamond':
                        this.ctx.moveTo(x, y - size);
                        this.ctx.lineTo(x + size, y);
                        this.ctx.lineTo(x, y + size);
                        this.ctx.lineTo(x - size, y);
                        this.ctx.closePath();
                        break;
                    case 'hexagon':
                        for(let j = 0; j < 6; j++) {
                            const angle = (Math.PI / 3) * j;
                            const hx = x + size * Math.cos(angle);
                            const hy = y + size * Math.sin(angle);
                            if(j === 0) this.ctx.moveTo(hx, hy);
                            else this.ctx.lineTo(hx, hy);
                        }
                        this.ctx.closePath();
                        break;
                }
                this.ctx.fill();
                this.ctx.stroke();
            }
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