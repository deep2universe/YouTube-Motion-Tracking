/**
 * Class holds animation names and icons used in player popup.
 * Particle animations also have an animation id.
 *
 * Icon codes from: https://graphemica.com/characters/tags/animal/page/1
 */
class AnimEnum{

    // custom canvas animations
    static skeleton = new AnimEnum('skeleton', "&#x1F433", null);
    static skeleton3Times = new AnimEnum('skeleton3Times', "&#x1F63D", null);
    static skeleton5Times = new AnimEnum('skeleton5Times', "&#x1F406", null);
    static puppetsPlayer = new AnimEnum('puppetsPlayer', "&#x1F418", null);
    static spiderWeb = new AnimEnum('spiderWeb', "&#x1F419", null);

    // starting with 'particle' uses Proton library for animation
    static particleHandsBall = new AnimEnum('particleHandsBall', "&#x1F409", 0);
    static particle2BallHead = new AnimEnum('particle2BallHead', "&#x1F43C", 1);
    static particleRightHandLine = new AnimEnum('particleRightHandLine', "&#x1F408", 2);
    static particleNoseGravity = new AnimEnum('particleNoseGravity', "&#x1F42E", 3);
    static particleNoseSupernova = new AnimEnum('particleNoseSupernova', "&#x1F432", 4);
    static particleHandsTrackFromBorder = new AnimEnum('particleHandsTrackFromBorder', "&#x1F40D", 5);
    static particleUpperBodyGlow = new AnimEnum('particleUpperBodyGlow', "&#x1F427", 6);
    static particleGlowPainting = new AnimEnum('particleGlowPainting', "&#x1F401", 7);
    static particlePainting = new AnimEnum('particlePainting', "&#x1F422", 8);
    static particlePaintRandomDrift = new AnimEnum('particlePaintRandomDrift', "&#x1F40C", 9);
    static particleCometThrower = new AnimEnum('particleCometThrower', "&#x1F429", 10);
    static particleBodyGlow = new AnimEnum('particleBodyGlow', "&#x1F428", 11);
    static particleBurningMan = new AnimEnum('particleBurningMan', "&#x1F43A", 12);
    static particleCyclone = new AnimEnum('particleCyclone', "&#x1F41D", 13);
    static particleSun = new AnimEnum('particleSun', "&#x1F420", 14);
    static particleFireFly = new AnimEnum('particleFireFly', "&#x1F423", 15);
    static particleFireFlyColor = new AnimEnum('particleFireFlyColor', "&#x1F41E", 16);
    static particleSpit = new AnimEnum('particleSpit', "&#x1F41C", 17);
    static particle2BallHeadExp = new AnimEnum('particle2BallHeadExp', "&#x1F42B", 18);
    static particleMatrix = new AnimEnum('particleMatrix', "&#x1F429", 19);
    static particleSnow = new AnimEnum('particleSnow', "&#x1F43E", 20);
    static particleSnowHoriz = new AnimEnum('particleSnowHoriz', "&#x1F438", 21);
    static particleLightSab = new AnimEnum('particleLightSab', "&#x1F41A", 22);

    // NEW ANIMATIONS - Canvas Variations
    static skeleton7Times = new AnimEnum('skeleton7Times', "&#x1F981", null);        // Lion
    static skeletonMirror = new AnimEnum('skeletonMirror', "&#x1F985", null);        // Eagle
    static skeletonRainbow = new AnimEnum('skeletonRainbow', "&#x1F308", null);      // Rainbow
    static connectingDots = new AnimEnum('connectingDots', "&#x1F577", null);        // Spider
    static geometricShapes = new AnimEnum('geometricShapes', "&#x1F48E", null);      // Gem

    // NEW ANIMATIONS - Particle Tracking
    static particleAllJoints = new AnimEnum('particleAllJoints', "&#x2728", 23);     // Sparkles
    static particleFeetTrail = new AnimEnum('particleFeetTrail', "&#x1F463", 24);    // Footprints
    static particleKneeCircles = new AnimEnum('particleKneeCircles', "&#x1F4AB", 25); // Dizzy
    static particleShoulderWaves = new AnimEnum('particleShoulderWaves', "&#x1F30A", 26); // Wave

    // NEW ANIMATIONS - Particle Physics
    static particleBodyMagnet = new AnimEnum('particleBodyMagnet', "&#x1F9F2", 27);  // Magnet
    static particleWaveField = new AnimEnum('particleWaveField', "&#x1F4E1", 28);    // Satellite
    static particleVortex = new AnimEnum('particleVortex', "&#x1F300", 29);          // Cyclone
    static particleElectric = new AnimEnum('particleElectric', "&#x26A1", 30);       // Lightning

    // NEW ANIMATIONS - Particle Visual Effects
    static particleRainbowTrail = new AnimEnum('particleRainbowTrail', "&#x1F308", 31); // Rainbow
    static particleStarField = new AnimEnum('particleStarField', "&#x2B50", 32);        // Star
    static particleBubbles = new AnimEnum('particleBubbles', "&#x1F4A7", 33);           // Droplet
    static particleFireworks = new AnimEnum('particleFireworks', "&#x1F386", 34);       // Fireworks
    static particleNeonGlow = new AnimEnum('particleNeonGlow', "&#x1F31F", 35);         // Glowing Star

    // NEW ANIMATIONS - Particle Atmospheric
    static particleAurora = new AnimEnum('particleAurora', "&#x1F319", 36);         // Crescent Moon
    static particleFog = new AnimEnum('particleFog', "&#x1F32B", 37);               // Fog
    static particleRain = new AnimEnum('particleRain', "&#x1F327", 38);             // Rain Cloud
    static particleLeaves = new AnimEnum('particleLeaves', "&#x1F342", 39);         // Fallen Leaf

    constructor(name, icon, id) {
        this.name = name;
        this.icon = icon;
        this.id = id;
    }

    /**
     * Get all names for animations as array
     *
     * @returns {*[]}
     */
    static getNameArray(){
        return [
            'skeleton', 'skeleton3Times', 'skeleton5Times', 'puppetsPlayer', 'spiderWeb',
            'particleHandsBall', 'particle2BallHead', 'particleRightHandLine', 'particleNoseGravity',
            'particleNoseSupernova', 'particleHandsTrackFromBorder', 'particleUpperBodyGlow',
            'particleGlowPainting', 'particlePainting', 'particlePaintRandomDrift', 'particleCometThrower',
            'particleBodyGlow', 'particleBurningMan', 'particleCyclone', 'particleSun',
            'particleFireFly', 'particleFireFlyColor', 'particleSpit', 'particle2BallHeadExp',
            'particleMatrix', 'particleSnow', 'particleSnowHoriz', 'particleLightSab',
            'skeleton7Times', 'skeletonMirror', 'skeletonRainbow', 'connectingDots', 'geometricShapes',
            'particleAllJoints', 'particleFeetTrail', 'particleKneeCircles', 'particleShoulderWaves',
            'particleBodyMagnet', 'particleWaveField', 'particleVortex', 'particleElectric',
            'particleRainbowTrail', 'particleStarField', 'particleBubbles', 'particleFireworks',
            'particleNeonGlow', 'particleAurora', 'particleFog', 'particleRain', 'particleLeaves'
        ];
    }

    /**
     * Get all animation objects as array
     *
     * @returns {AnimEnum[]}
     */
    static getAllAnimations(){
        return [
            AnimEnum.skeleton, AnimEnum.skeleton3Times, AnimEnum.skeleton5Times, AnimEnum.puppetsPlayer,
            AnimEnum.spiderWeb, AnimEnum.particleHandsBall, AnimEnum.particle2BallHead,
            AnimEnum.particleRightHandLine, AnimEnum.particleNoseGravity, AnimEnum.particleNoseSupernova,
            AnimEnum.particleHandsTrackFromBorder, AnimEnum.particleUpperBodyGlow, AnimEnum.particleGlowPainting,
            AnimEnum.particlePainting, AnimEnum.particlePaintRandomDrift, AnimEnum.particleCometThrower,
            AnimEnum.particleBodyGlow, AnimEnum.particleBurningMan, AnimEnum.particleCyclone,
            AnimEnum.particleSun, AnimEnum.particleFireFly, AnimEnum.particleFireFlyColor,
            AnimEnum.particleSpit, AnimEnum.particle2BallHeadExp, AnimEnum.particleMatrix,
            AnimEnum.particleSnow, AnimEnum.particleSnowHoriz, AnimEnum.particleLightSab,
            AnimEnum.skeleton7Times, AnimEnum.skeletonMirror, AnimEnum.skeletonRainbow,
            AnimEnum.connectingDots, AnimEnum.geometricShapes, AnimEnum.particleAllJoints,
            AnimEnum.particleFeetTrail, AnimEnum.particleKneeCircles, AnimEnum.particleShoulderWaves,
            AnimEnum.particleBodyMagnet, AnimEnum.particleWaveField, AnimEnum.particleVortex,
            AnimEnum.particleElectric, AnimEnum.particleRainbowTrail, AnimEnum.particleStarField,
            AnimEnum.particleBubbles, AnimEnum.particleFireworks, AnimEnum.particleNeonGlow,
            AnimEnum.particleAurora, AnimEnum.particleFog, AnimEnum.particleRain, AnimEnum.particleLeaves
        ];
    }
}

export {AnimEnum}