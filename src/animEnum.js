/**
 * Halloween Edition - Animation Registry
 * Class holds Halloween-themed animation names and icons used in player popup.
 * Particle animations have an animation id for Proton particle system.
 *
 * Icon codes: Halloween-themed Unicode emoji
 */
class AnimEnum{

    // ========== SKELETON ANIMATIONS (Canvas-based) ==========
    static skeletonGlow = new AnimEnum('skeletonGlow', "&#x1F480", null);           // 💀 Skull
    static skeletonDance = new AnimEnum('skeletonDance', "&#x1F9B4", null);         // 🦴 Bone
    static skeletonXRay = new AnimEnum('skeletonXRay', "&#x2620", null);            // ☠️ Skull and Crossbones
    static skeletonZombie = new AnimEnum('skeletonZombie', "&#x1F9DF", null);       // 🧟 Zombie
    static skeletonNeon = new AnimEnum('skeletonNeon', "&#x26A1", null);            // ⚡ Lightning

    // ========== PUMPKIN/HEAD EFFECTS (Canvas-based) ==========
    static pumpkinClassic = new AnimEnum('pumpkinClassic', "&#x1F383", null);       // 🎃 Jack-o'-lantern
    static pumpkinEvil = new AnimEnum('pumpkinEvil', "&#x1F479", null);             // 👹 Ogre/Demon
    static skullHead = new AnimEnum('skullHead', "&#x1F480", null);                 // 💀 Skull

    // ========== PARTICLE EFFECTS - CREATURES ==========
    static particleBatSwarm = new AnimEnum('particleBatSwarm', "&#x1F987", 0);      // 🦇 Bat
    static particleGhostTrail = new AnimEnum('particleGhostTrail', "&#x1F47B", 1);  // 👻 Ghost
    static particleSpiderWeb = new AnimEnum('particleSpiderWeb', "&#x1F577", 2);    // 🕷️ Spider
    static particleFloatingSkulls = new AnimEnum('particleFloatingSkulls', "&#x2620", 3); // ☠️ Skull and Crossbones

    // ========== PARTICLE EFFECTS - MAGICAL ==========
    static particleWitchMagic = new AnimEnum('particleWitchMagic', "&#x1F9D9", 4);  // 🧙 Wizard/Witch
    static particleSpellCast = new AnimEnum('particleSpellCast', "&#x1F52E", 5);    // 🔮 Crystal Ball
    static particleDarkEnergy = new AnimEnum('particleDarkEnergy', "&#x1F311", 6);  // 🌑 New Moon

    // ========== PARTICLE EFFECTS - ATMOSPHERIC ==========
    static particleFog = new AnimEnum('particleFog', "&#x1F32B", 7);                // 🌫️ Fog
    static particleLightning = new AnimEnum('particleLightning', "&#x26A1", 8);     // ⚡ Lightning
    static particleAutumnLeaves = new AnimEnum('particleAutumnLeaves', "&#x1F342", 9); // 🍂 Fallen Leaf

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
