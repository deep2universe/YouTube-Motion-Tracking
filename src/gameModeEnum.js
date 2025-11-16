/**
 * Game Mode Enum
 * Defines available game modes for the Motion Game Mode feature
 */
class GameModeEnum {
    static ghostJump = new GameModeEnum('ghostJump', '👻🎮', 'Ghost Jump');
    
    constructor(id, icon, displayName) {
        this.id = id;
        this.icon = icon;
        this.displayName = displayName;
    }
    
    /**
     * Get all game modes as array
     * @returns {GameModeEnum[]} Array of game mode objects
     */
    static getAllGameModes() {
        return [GameModeEnum.ghostJump];
    }
}

export { GameModeEnum };
