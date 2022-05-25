/**
 * Class holds animation names and icons used in player popup.
 * Particle animations also have an animation id.
 */
class AnimEnum{

    // custom canvas animations
    static skeleton = new AnimEnum('skeleton', "🦄", null);
    static skeleton3Times = new AnimEnum('skeleton3Times', "🐻", null);
    static skeleton5Times = new AnimEnum('skeleton5Times', "🦊", null);
    static puppetsPlayer = new AnimEnum('puppetsPlayer', "🐧", null);
    static spiderWeb = new AnimEnum('spiderWeb', "🐙", null);

    // starting with 'particle' uses Proton library for animation
    static particleHandsBall = new AnimEnum('particleHandsBall', "🐥", 0);
    static particle2BallHead = new AnimEnum('particle2BallHead', "🐼", 1);
    static particleRightHandLine = new AnimEnum('particleRightHandLine', "🐌", 2);
    static particleNoseGravity = new AnimEnum('particleNoseGravity', "🦋", 3);
    static particleNoseSupernova = new AnimEnum('particleNoseSupernova', "🦖", 4);
    static particleHandsTrackFromBorder = new AnimEnum('particleHandsTrackFromBorder', "🪱", 5);
    static particleUpperBodyGlow = new AnimEnum('particleUpperBodyGlow', "🦀", 6);
    static particleGlowPainting = new AnimEnum('particleGlowPainting', "🐴", 7);
    static particlePainting = new AnimEnum('particlePainting', "🦉", 8);
    static particlePaintRandomDrift = new AnimEnum('particlePaintRandomDrift', "🐔", 9);
    static particleCometThrower = new AnimEnum('particleCometThrower', "🐷", 10);
    static particleBodyGlow = new AnimEnum('particleBodyGlow', "🐨", 11);
    static particleBurningMan = new AnimEnum('particleBurningMan', "🦕", 12);
    static particleCyclone = new AnimEnum('particleCyclone', "🐝", 13);
    static particleSun = new AnimEnum('particleSun', "🐬", 14);
    static particleFireFly = new AnimEnum('particleFireFly', "🪰", 15);
    static particleFireFlyColor = new AnimEnum('particleFireFlyColor', "🪲", 16);
    static particleSpit = new AnimEnum('particleSpit', "🦐", 17);
    static particle2BallHeadExp = new AnimEnum('particle2BallHeadExp', "🦚", 18);

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