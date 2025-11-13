/**
 * Halloween Edition - Animation Registry
 * Class holds Halloween-themed animation names and icons used in player popup.
 * Particle animations have an animation id for Proton particle system.
 *
 * Icon codes: Halloween-themed Unicode emoji
 */
class AnimEnum{

    // ========== SKELETON ANIMATIONS (Canvas-based) ==========
    static skeletonGlow = new AnimEnum('skeletonGlow', "&#x1F480;&#x2728;", null);           // 💀✨ Glowing Skull
    static skeletonDance = new AnimEnum('skeletonDance', "&#x1F483;&#x1F9B4;", null);        // 💃🦴 Dancing Bone
    static skeletonXRay = new AnimEnum('skeletonXRay', "&#x1FA7A;", null);                   // 🩺 X-Ray (Stethoscope)
    static skeletonZombie = new AnimEnum('skeletonZombie', "&#x1F9DF;&#x200D;&#x2642;", null); // 🧟‍♂️ Zombie Man
    static skeletonNeon = new AnimEnum('skeletonNeon', "&#x1F4A5;&#x26A1;", null);           // 💥⚡ Neon Explosion

    // ========== PUMPKIN/HEAD EFFECTS (Canvas-based) ==========
    static pumpkinClassic = new AnimEnum('pumpkinClassic', "&#x1F383;", null);       // 🎃 Jack-o'-lantern
    static pumpkinEvil = new AnimEnum('pumpkinEvil', "&#x1F608;&#x1F383;", null);    // 😈🎃 Evil Pumpkin
    static skullHead = new AnimEnum('skullHead', "&#x2620;&#xFE0F;", null);          // ☠️ Skull and Crossbones

    // ========== PARTICLE EFFECTS - CREATURES ==========
    static particleBatSwarm = new AnimEnum('particleBatSwarm', "&#x1F987;&#x1F987;", 0);      // 🦇🦇 Bat Swarm
    static particleGhostTrail = new AnimEnum('particleGhostTrail', "&#x1F47B;&#x1F4A8;", 1);  // 👻💨 Ghost Trail
    static particleSpiderWeb = new AnimEnum('particleSpiderWeb', "&#x1F578;&#xFE0F;", 2);     // 🕸️ Spider Web
    static particleFloatingSkulls = new AnimEnum('particleFloatingSkulls', "&#x1F480;&#x1F4AB;", 3); // 💀💫 Floating Skulls

    // ========== PARTICLE EFFECTS - MAGICAL ==========
    static particleWitchMagic = new AnimEnum('particleWitchMagic', "&#x1F9D9;&#x200D;&#x2640;&#xFE0F;", 4);  // 🧙‍♀️ Witch
    static particleSpellCast = new AnimEnum('particleSpellCast', "&#x1F525;&#x2728;", 5);    // 🔥✨ Fire Spell
    static particleDarkEnergy = new AnimEnum('particleDarkEnergy', "&#x1F32A;&#xFE0F;", 6);  // 🌪️ Dark Tornado

    // ========== PARTICLE EFFECTS - ATMOSPHERIC ==========
    static particleFog = new AnimEnum('particleFog', "&#x1F32B;&#xFE0F;", 7);                // 🌫️ Fog
    static particleLightning = new AnimEnum('particleLightning', "&#x26A8;&#xFE0F;", 8);     // ⚨️ Lightning Bolt
    static particleAutumnLeaves = new AnimEnum('particleAutumnLeaves', "&#x1F342;&#x1F341;", 9); // 🍂🍁 Autumn Leaves

    constructor(name, icon, id) {
        this.name = name;
        this.icon = icon;
        this.id = id;
    }

    /**
     * Get all Halloween animation names as array
     *
     * @returns {string[]} Array of 18 Halloween animation names
     */
    static getNameArray(){
        return [
            // Skeleton animations (5)
            'skeletonGlow', 'skeletonDance', 'skeletonXRay', 'skeletonZombie', 'skeletonNeon',
            // Pumpkin/Head effects (3)
            'pumpkinClassic', 'pumpkinEvil', 'skullHead',
            // Particle - Creatures (4)
            'particleBatSwarm', 'particleGhostTrail', 'particleSpiderWeb', 'particleFloatingSkulls',
            // Particle - Magical (3)
            'particleWitchMagic', 'particleSpellCast', 'particleDarkEnergy',
            // Particle - Atmospheric (3)
            'particleFog', 'particleLightning', 'particleAutumnLeaves'
        ];
    }

    /**
     * Get all Halloween animation objects as array
     *
     * @returns {AnimEnum[]} Array of 18 Halloween AnimEnum objects
     */
    static getAllAnimations(){
        return [
            // Skeleton animations (5)
            AnimEnum.skeletonGlow, AnimEnum.skeletonDance, AnimEnum.skeletonXRay, 
            AnimEnum.skeletonZombie, AnimEnum.skeletonNeon,
            // Pumpkin/Head effects (3)
            AnimEnum.pumpkinClassic, AnimEnum.pumpkinEvil, AnimEnum.skullHead,
            // Particle - Creatures (4)
            AnimEnum.particleBatSwarm, AnimEnum.particleGhostTrail, AnimEnum.particleSpiderWeb, 
            AnimEnum.particleFloatingSkulls,
            // Particle - Magical (3)
            AnimEnum.particleWitchMagic, AnimEnum.particleSpellCast, AnimEnum.particleDarkEnergy,
            // Particle - Atmospheric (3)
            AnimEnum.particleFog, AnimEnum.particleLightning, AnimEnum.particleAutumnLeaves
        ];
    }
}

export {AnimEnum}
