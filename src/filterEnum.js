/**
 * Horror Video Filters - Filter Registry
 * Class holds horror filter definitions with CSS filter strings and canvas overlay types.
 * Filters work additively with animations, transforming video appearance.
 *
 * Icon codes: Horror film-themed Unicode emoji
 */
class FilterEnum {

    // ========== FILTER DEFINITIONS ==========
    static none = new FilterEnum(
        'none',
        'No Filter',
        '&#x1F6AB;',  // 🚫 Prohibited
        '',
        null
    );

    static vhs = new FilterEnum(
        'vhs',
        'VHS Tape',
        '&#x1F4FC;',  // 📼 Videocassette
        'contrast(1.3) saturate(0.7) hue-rotate(-10deg) blur(0.5px)',
        'scanlines'
    );

    static foundFootage = new FilterEnum(
        'foundFootage',
        'Found Footage',
        '&#x1F4F9;',  // 📹 Video Camera
        'contrast(1.4) saturate(0.5) brightness(0.9)',
        'grain'
    );

    static xrayLab = new FilterEnum(
        'xrayLab',
        'X-Ray Lab',
        '&#x2622;&#xFE0F;',  // ☢️ Radioactive
        'contrast(1.6) brightness(1.2) saturate(0.3) hue-rotate(80deg)',
        'grid'
    );

    static bloodMoon = new FilterEnum(
        'bloodMoon',
        'Blood Moon',
        '&#x1F315;',  // 🌕 Full Moon
        'contrast(1.4) sepia(0.8) hue-rotate(-30deg) brightness(0.85)',
        'vignette'
    );

    static noir = new FilterEnum(
        'noir',
        'Film Noir',
        '&#x1F3AC;',  // 🎬 Clapper Board
        'grayscale(1) contrast(1.5) brightness(0.9)',
        'grain'
    );

    static toxicWaste = new FilterEnum(
        'toxicWaste',
        'Toxic Waste',
        '&#x2623;&#xFE0F;',  // ☣️ Biohazard
        'contrast(1.3) saturate(1.8) hue-rotate(90deg) brightness(1.1)',
        'glow'
    );

    /**
     * Constructor for filter definition
     * @param {string} name - Unique filter identifier
     * @param {string} displayName - Human-readable name
     * @param {string} icon - HTML entity for Unicode emoji
     * @param {string} cssFilter - CSS filter string
     * @param {string|null} overlayType - Canvas overlay type (scanlines, grain, grid, vignette, glow) or null
     */
    constructor(name, displayName, icon, cssFilter, overlayType = null) {
        this.name = name;
        this.displayName = displayName;
        this.icon = icon;
        this.cssFilter = cssFilter;
        this.overlayType = overlayType;
    }

    /**
     * Get all horror filters as array
     *
     * @returns {FilterEnum[]} Array of 7 filter objects
     */
    static getAllFilters() {
        return [
            FilterEnum.none,
            FilterEnum.vhs,
            FilterEnum.foundFootage,
            FilterEnum.xrayLab,
            FilterEnum.bloodMoon,
            FilterEnum.noir,
            FilterEnum.toxicWaste
        ];
    }

    /**
     * Get filter by name
     *
     * @param {string} name - Filter name to find
     * @returns {FilterEnum} Filter object or 'none' filter if not found
     */
    static getFilterByName(name) {
        const filter = FilterEnum.getAllFilters().find(f => f.name === name);
        return filter || FilterEnum.none;
    }
}

export { FilterEnum }
