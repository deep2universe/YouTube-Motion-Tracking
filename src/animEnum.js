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