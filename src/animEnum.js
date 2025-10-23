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
    static skeleton7Times = new AnimEnum('skeleton7Times', "&#x1F981", null);
    static skeletonMirror = new AnimEnum('skeletonMirror', "&#x1F985", null);
    static skeletonRainbow = new AnimEnum('skeletonRainbow', "&#x1F308", null);
    static connectingDots = new AnimEnum('connectingDots', "&#x1F988", null);
    static geometricShapes = new AnimEnum('geometricShapes', "&#x1F98B", null);

    // NEW ANIMATIONS - Particle Tracking
    static particleAllJoints = new AnimEnum('particleAllJoints', "&#x1F98E", 23);
    static particleFeetTrail = new AnimEnum('particleFeetTrail', "&#x1F993", 24);
    static particleKneeCircles = new AnimEnum('particleKneeCircles', "&#x1F992", 25);
    static particleShoulderWaves = new AnimEnum('particleShoulderWaves', "&#x1F98F", 26);

    // NEW ANIMATIONS - Particle Physics
    static particleBodyMagnet = new AnimEnum('particleBodyMagnet', "&#x1F99B", 27);
    static particleWaveField = new AnimEnum('particleWaveField', "&#x1F998", 28);
    static particleVortex = new AnimEnum('particleVortex', "&#x1F999", 29);
    static particleElectric = new AnimEnum('particleElectric', "&#x1F99A", 30);

    // NEW ANIMATIONS - Particle Visual Effects
    static particleRainbowTrail = new AnimEnum('particleRainbowTrail', "&#x1F99C", 31);
    static particleStarField = new AnimEnum('particleStarField', "&#x1F99D", 32);
    static particleBubbles = new AnimEnum('particleBubbles', "&#x1F9A1", 33);
    static particleFireworks = new AnimEnum('particleFireworks', "&#x1F9A2", 34);
    static particleNeonGlow = new AnimEnum('particleNeonGlow', "&#x1F9A5", 35);

    // NEW ANIMATIONS - Particle Atmospheric
    static particleAurora = new AnimEnum('particleAurora', "&#x1F9A6", 36);
    static particleFog = new AnimEnum('particleFog', "&#x1F9A7", 37);
    static particleRain = new AnimEnum('particleRain', "&#x1F9A8", 38);
    static particleLeaves = new AnimEnum('particleLeaves', "&#x1F9A9", 39);

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
        var nameArray = [];
        Object.keys(AnimEnum).forEach(animName => nameArray.push(animName));
        //console.log(nameArray);
        return nameArray;
    }
}

export {AnimEnum}