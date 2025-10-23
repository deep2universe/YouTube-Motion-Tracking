# YouTube Motion Tracking - Animationen Übersicht

**Dokumentation erstellt am:** 23. Oktober 2025
**Extension Version:** 1.3
**Gesamtanzahl Animationen:** 28

## Inhaltsverzeichnis

1. [Architektur-Übersicht](#architektur-übersicht)
2. [Animations-Kategorien](#animations-kategorien)
3. [Detaillierte Animation-Beschreibungen](#detaillierte-animation-beschreibungen)
4. [Technische Details](#technische-details)
5. [Asset-Verzeichnis](#asset-verzeichnis)

---

## Architektur-Übersicht

### Kern-Dateien

| Datei | Zeilen | Funktion |
|-------|--------|----------|
| `src/animEnum.js` | 60 | Animation-Definitionen und Metadaten (Name, Icon, ID) |
| `src/anim.js` | 1,582 | Implementierung aller Animations-Logik |
| `src/content.js` | 607 | Steuerungssystem, Event-Handling, UI-Integration |
| `src/content.css` | 114 | Styling und CSS-Transitions für Popup |
| `src/detectUtils.js` | 33 | Keypoint-Transformation für Rendering |

### Rendering-Pipeline

```
Video Stream → TensorFlow.js MoveNet → 17 Keypoints → Transform → Canvas/WebGL Rendering
```

### Pose-Erkennungs-System

- **Modell:** TensorFlow.js MoveNet (Single Pose Detection)
- **Keypoints:** 17 Körperpunkte (OpenPose-Format)
- **Update-Zyklus:** `requestAnimationFrame` Loop
- **Canvas-Schichten:** 2 (Canvas 2D + WebGL)

**17 Erkannte Keypoints:**
```
0: Nose          5: Left Shoulder    11: Left Hip       15: Left Ankle
1: Left Eye      6: Right Shoulder   12: Right Hip      16: Right Ankle
2: Right Eye     7: Left Elbow       13: Left Knee
3: Left Ear      8: Right Elbow      14: Right Knee
4: Right Ear     9: Left Wrist
                10: Right Wrist
```

---

## Animations-Kategorien

### Kategorie 1: Canvas-basierte Animationen (5)

Direkt auf 2D-Canvas gezeichnet, nutzen Keypoint-Daten für geometrische Visualisierung.

| ID | Name | Aktuelles Icon | Beschreibung |
|----|------|----------------|--------------|
| - | `skeleton` | 🐳 Wal | Standard-Skelett: Blaue Punkte + rote Verbindungslinien |
| - | `skeleton3Times` | 😽 Katzengesicht | 3-fache Skelett-Wiederholung (Scale: 1.0, 0.5, 1.5) |
| - | `skeleton5Times` | 🐆 Tiger | 5-fache Skelett-Wiederholung (kaleidoskopischer Effekt) |
| - | `puppetsPlayer` | 🐘 Elefant | Marionetten-Effekt: Vertikale Linien von 7 Keypoints nach oben |
| - | `spiderWeb` | 🐙 Oktopus | Spinnennetz: Radiale Linien von allen Keypoints zu Canvas-Rändern |

### Kategorie 2: Partikel-Animationen (22)

Nutzen die **Proton.js Particle Engine** mit WebGL-Rendering für komplexe visuelle Effekte.

#### Subkategorie A: Hand/Kopf-Tracking (3)

| Anim-ID | Name | Aktuelles Icon | Emitter | Partikel-Leben | Haupteffekt |
|---------|------|----------------|---------|----------------|-------------|
| 0 | `particleHandsBall` | 🐉 Drache | 2 (beide Hände) | 0.1-0.4s | Farbige Bälle aus Händen (blau/gelb) |
| 1 | `particle2BallHead` | 🐼 Panda | 2 (rotierend um Nase) | variabel | Orbital-Effekt um Kopf, 170px Radius |
| 2 | `particleRightHandLine` | 🐈 Maus | 1 (rechtes Handgelenk) | 4-10s | Random-Drift-Linie aus Hand |

#### Subkategorie B: Schwerkraft & Physik (2)

| Anim-ID | Name | Aktuelles Icon | Emitter | Physik-Verhalten | Effekt |
|---------|------|----------------|---------|------------------|--------|
| 3 | `particleNoseGravity` | 🐮 Kuh | 1 (Nase) | Attraction (Force: 10) | Partikel fallen zur Nase |
| 4 | `particleNoseSupernova` | 🐸 Frosch | 1 (Nase) | Alpha-Pulse, Scale 1→0 | Expandierende Sternexplosion |

#### Subkategorie C: Tracking & Bewegung (1)

| Anim-ID | Name | Aktuelles Icon | Emitter | Verhalten | Effekt |
|---------|------|----------------|---------|-----------|--------|
| 5 | `particleHandsTrackFromBorder` | 🐍 Schlange | 2 (Canvas-Ränder) | Attraction zu Händen | Partikel verfolgen Hand-Bewegung |

#### Subkategorie D: Glow & Licht-Effekte (6)

| Anim-ID | Name | Aktuelles Icon | Emitter | Keypoints | Besonderheit |
|---------|------|----------------|---------|-----------|--------------|
| 6 | `particleUpperBodyGlow` | 🐧 Pinguin | 6 | Handgelenke, Ellbogen, Schultern | 6 Farben, Alpha 0.1→0 |
| 7 | `particleGlowPainting` | 🐁 Mausgesicht | 2 | Beide Handgelenke | Glow-Trail, Scale 3.0→0.1 |
| 8 | `particlePainting` | 🐢 Schildkröte | 2 | Beide Handgelenke | Persistente Malerei (1-50s Leben) |
| 9 | `particlePaintRandomDrift` | 🐌 Schnecke | 2 | Beide Handgelenke | Malerei mit Random-Drift (30, 30, 0) |
| 10 | `particleCometThrower` | 🐣 Küken | 2 | Custom | Kometen-Bilder mit Rotation + Gravity |
| 11 | `particleBodyGlow` | 🐨 Koala | 12 | Ganzer Körper | Vollkörper-Glow mit 12 Emittern |

#### Subkategorie E: Feuer & Verbrennung (1)

| Anim-ID | Name | Aktuelles Icon | Emitter | Farbe | Effekt |
|---------|------|----------------|---------|-------|--------|
| 12 | `particleBurningMan` | 🐺 Hund | 19 | Orange→Schwarz (#C97024→#290000) | Intensiver Ganzkörper-Feuereffekt |

#### Subkategorie F: Erweiterte Bewegungsmuster (3)

| Anim-ID | Name | Aktuelles Icon | Emitter | Spezial-Verhalten | Effekt |
|---------|------|----------------|---------|-------------------|--------|
| 13 | `particleCyclone` | 🐝 Biene | 1 (unter Nase) | Cyclone-Behavior | Wirbelnder Tornado-Effekt |
| 14 | `particleSun` | 🐠 Fisch | 1 (über Nase, -150px) | Rate: 30-50/0.1s | Strahlender Sonneneffekt |
| 22 | `particleLightSab` | 🐚 Spiralmuschel | 1 (rechtes Handgelenk) | RandomDrift (10, -100, 0.035) | Lichtschwert-Trail |

#### Subkategorie G: Schwarm & Ambient (2)

| Anim-ID | Name | Aktuelles Icon | Emitter | Partikel-Count | Spezial-Verhalten |
|---------|------|----------------|---------|----------------|-------------------|
| 15 | `particleFireFly` | 🐤 Schlüpfendes Küken | 1 (Fullscreen) | 1480 | Repulsion von Nase, Alpha-Blinken |
| 16 | `particleFireFlyColor` | 🐞 Käfer | 1 (Fullscreen) | variabel | Goldene Glühwürmchen, Repulsion Force: 20 |

#### Subkategorie H: Spezial-Effekte (4)

| Anim-ID | Name | Aktuelles Icon | Emitter | Asset | Effekt |
|---------|------|----------------|---------|-------|--------|
| 17 | `particleSpit` | 🐜 Ameise | 1 (über Nase, -100px) | Standard-Partikel | Spuck-Projektil mit Gravity (6) |
| 18 | `particle2BallHeadExp` | 🐫 Kamel | 2 (orbital) | Standard-Partikel | Vibrantere Version von Animation 1 |
| 19 | `particleMatrix` | 🐵 Affe | 1 (obere Linie) | `0.png`, `1.png` | Fallende Matrix-Zahlen |
| 20 | `particleSnow` | 🐴 Pferd | 1 (obere Linie) | `particle.png` | Vertikal fallender Schnee |
| 21 | `particleSnowHoriz` | 🐸 Schildkröte | 1 (obere Linie) | `particle.png` | Diagonal fallender Schnee (205°) |

### Kategorie 3: CSS-Transitions (1)

| Klasse | Property | Dauer | Easing | Zweck |
|--------|----------|-------|--------|-------|
| `.posedream-video-popup` | `opacity` | 0.1s | cubic-bezier(0,0,0.2,1) | Sanftes Ein-/Ausblenden des Popup-Fensters |

---

## Detaillierte Animation-Beschreibungen

### Canvas-Animationen

#### 1. Skeleton (Standard)
- **Datei:** `anim.js:280-284`
- **Rendering:** `drawKeyPoints()` + `drawSkeleton()`
- **Darstellung:**
  - Blaue Kreise an allen 17 Keypoints
  - Rote Verbindungslinien zwischen anatomisch korrekten Körperteilen
- **Standard-Animation:** Wird beim Extension-Start geladen

#### 2. Skeleton 3 Times
- **Datei:** `anim.js:290-302`
- **Rendering:** 3x `drawSkeleton()` mit unterschiedlichen Scales
- **Scale-Faktoren:** 1.0, 0.5, 1.5
- **Effekt:** Wiederholungsmuster mit variierender Größe

#### 3. Skeleton 5 Times
- **Datei:** `anim.js:304-324`
- **Rendering:** 5x `drawSkeleton()`
- **Effekt:** Kaleidoskopisches Muster mit 5 überlappenden Skeletten

#### 4. Puppets Player
- **Datei:** `anim.js:326-329, 641-653`
- **Funktion:** `drawPuppets()`
- **Keypoints verwendet:** 7 (Hände, Nase, Schultern, Knöchel)
- **Darstellung:** Vertikale Linien von Keypoints zur Canvas-Oberseite
- **Visueller Effekt:** "Marionetten-Fäden"

#### 5. Spider Web
- **Datei:** `anim.js:331-334, 674-702`
- **Funktion:** `drawSpiderWeb()`
- **Darstellung:** Linien von allen Keypoints zu Canvas-Rändern (oben, unten, links, rechts)
- **Effekt:** Radiales Spinnennetz-Muster

---

### Partikel-Animationen - Technische Details

#### Proton.js Behaviors (Verwendete Effekte)

| Behavior | Verwendung | Effekt |
|----------|------------|--------|
| `Alpha` | 20 Animationen | Partikel-Transparenz-Übergang |
| `Color` | 19 Animationen | Farbverläufe während Partikel-Leben |
| `Scale` | 18 Animationen | Größenänderung (z.B. 3.0 → 0.1) |
| `Attraction` | 4 Animationen | Anziehung zu Keypoints |
| `Repulsion` | 3 Animationen | Abstoßung von Keypoints |
| `RandomDrift` | 5 Animationen | Zufällige Bewegung |
| `Gravity` | 3 Animationen | Fallende Bewegung |
| `Cyclone` | 1 Animation | Wirbelnde Rotation |
| `CrossZone` | 4 Animationen | Partikel bleiben in Zone |
| `Rotate` | 1 Animation | Kontinuierliche Rotation |

#### Partikel-Assets

**Bildpfad:** `/src/images/`

| Dateiname | Verwendung | Animationen |
|-----------|------------|-------------|
| `particle.png` | Standard-Partikel-Textur | 15+ Animationen |
| `particle2.png` | Alternative Textur | Einzelne Animationen |
| `Comet_1.png` | Kometen-Sprite | `particleCometThrower` |
| `Comet_2.png` | Kometen-Sprite | `particleCometThrower` |
| `0.png` | Matrix-Digit "0" | `particleMatrix` |
| `1.png` | Matrix-Digit "1" | `particleMatrix` |

---

## Technische Details

### Animation-Steuerungssystem

#### Event-System (Custom DOM Events)

```javascript
// Animation-Wechsel
document.dispatchEvent(new CustomEvent('changeVisualizationFromPlayer', {
  detail: { animationID: 'skeleton' }
}));

// Animation aktivieren/deaktivieren
document.dispatchEvent(new CustomEvent('changeIsAnimDisabled'));

// Zufällige Wiedergabe
document.dispatchEvent(new CustomEvent('runRandomAnimation'));

// Popup anzeigen/verstecken
document.dispatchEvent(new CustomEvent('displayPoseDreamPopup'));

// Zufalls-Intervall ändern
document.dispatchEvent(new CustomEvent('changeRandomInterval'));
```

#### Animation-Initialisierung

**Datei:** `content.js:140-147`

```javascript
function setNewAnimation(animationId) {
    currentAnimation = animationId;
    saveSelectedAnimation(currentAnimation);
    if(anim !== null){
        anim.setAnimation(animationId);
    }
}
```

#### Zufallswiedergabe

- **Intervall-Bereich:** 2-60 Sekunden (einstellbar)
- **Speicherung:** Chrome Storage API
- **Funktion:** Wechselt automatisch zwischen allen 28 Animationen

### Performance-Optimierungen

1. **Conditional Rendering:** Animationen pausieren bei Video-Pause
2. **requestAnimationFrame:** Effiziente Frame-Synchronisation
3. **WebGL-Beschleunigung:** Für Partikel-Rendering
4. **Lazy Loading:** TensorFlow.js-Modell lädt nach Bedarf

### Browser-Kompatibilität

- **Canvas 2D API:** Alle modernen Browser
- **WebGL:** Chrome, Firefox, Edge, Safari (>= 2015)
- **TensorFlow.js:** Chrome-optimiert
- **Proton.js:** Plattformunabhängig

---

## Asset-Verzeichnis

### Extension-Icons

| Datei | Größe | Verwendung |
|-------|-------|------------|
| `images/logo16.png` | 16x16 | Extension-Symbolleiste |
| `images/logo32.png` | 32x32 | Extension-Manager |
| `images/logo48.png` | 48x48 | Extension-Details |
| `images/logo128.png` | 128x128 | Chrome Web Store |

### Animations-Icons (Aktuell)

**Quelle:** https://graphemica.com/characters/tags/animal/page/1
**Format:** HTML-Entities (Unicode-Emojis)
**Kategorie:** Ausschließlich Tier-Emojis

**Vollständige Icon-Liste:**

```
Skeleton:           🐳 (&#x1F433 - Wal)
Skeleton 3 Times:   😽 (&#x1F63D - Katzengesicht)
Skeleton 5 Times:   🐆 (&#x1F406 - Tiger)
Puppets Player:     🐘 (&#x1F418 - Elefant)
Spider Web:         🐙 (&#x1F419 - Oktopus)

Particle Hands Ball:           🐉 (&#x1F409 - Drache)
Particle 2 Ball Head:          🐼 (&#x1F43C - Panda)
Particle Right Hand Line:      🐈 (&#x1F408 - Maus)
Particle Nose Gravity:         🐮 (&#x1F42E - Kuh)
Particle Nose Supernova:       🐸 (&#x1F432 - Frosch)
Particle Hands Track:          🐍 (&#x1F40D - Schlange)
Particle Upper Body Glow:      🐧 (&#x1F427 - Pinguin)
Particle Glow Painting:        🐁 (&#x1F401 - Mausgesicht)
Particle Painting:             🐢 (&#x1F422 - Schildkröte)
Particle Paint Random Drift:   🐌 (&#x1F40C - Schnecke)
Particle Comet Thrower:        🐣 (&#x1F429 - Küken)
Particle Body Glow:            🐨 (&#x1F428 - Koala)
Particle Burning Man:          🐺 (&#x1F43A - Hund)
Particle Cyclone:              🐝 (&#x1F41D - Biene)
Particle Sun:                  🐠 (&#x1F420 - Fisch)
Particle FireFly:              🐤 (&#x1F423 - Schlüpfendes Küken)
Particle FireFly Color:        🐞 (&#x1F41E - Käfer)
Particle Spit:                 🐜 (&#x1F41C - Ameise)
Particle 2 Ball Head Exp:      🐫 (&#x1F42B - Kamel)
Particle Matrix:               🐵 (&#x1F429 - Affe)
Particle Snow:                 🐴 (&#x1F43E - Pferd)
Particle Snow Horiz:           🐸 (&#x1F438 - Schildkröte)
Particle Light Saber:          🐚 (&#x1F41A - Spiralmuschel)
```

---

## Code-Referenzen

### Wichtige Funktionen

| Funktion | Datei | Zeile | Beschreibung |
|----------|-------|-------|--------------|
| `setNewAnimation()` | content.js | 140-147 | Wechselt aktive Animation |
| `updateSelectedButton()` | content.js | 315-324 | Aktualisiert UI-Auswahl |
| `startDetection()` | content.js | 242-278 | Hauptschleife für Pose-Erkennung |
| `drawSkeleton()` | anim.js | 655-672 | Zeichnet Skelett-Linien |
| `drawKeyPoints()` | anim.js | 622-638 | Zeichnet Keypoint-Kreise |
| `drawPuppets()` | anim.js | 641-653 | Marionetten-Effekt |
| `drawSpiderWeb()` | anim.js | 674-702 | Spinnennetz-Effekt |
| `transformKeypointsForRender()` | detectUtils.js | - | Koordinaten-Transformation |

### Animations-Klasse (AnimEnum)

**Datei:** `animEnum.js:7-58`

```javascript
class AnimEnum {
    constructor(name, icon, id) {
        this.name = name;    // Animation-Identifier
        this.icon = icon;    // HTML-Entity für Icon
        this.id = id;        // Particle-Animation ID (null für Canvas-Animationen)
    }

    static getNameArray() {
        // Gibt alle Animation-Namen als Array zurück
    }
}
```

---

## Erweiterungsmöglichkeiten

### Geplante Animationen (Vorbereitung erforderlich)

Die aktuelle UI-Struktur hat folgende Kapazitäten:

- **Aktuelle Zeilen:** 7 Zeilen à 4 Animationen
- **Maximale Kapazität ohne Scrolling:** ~32 Animationen bei aktuellem Layout (350px Breite, 415px Höhe)
- **Scrolling-Aktivierung:** Ab 29+ Animationen (aktuell bei 28 noch knapp kein Scrolling)

**Empfehlungen für weitere Animationen:**
1. Layout-Optimierung für kompaktere Icon-Darstellung
2. Kategorisierung mit Tab-System
3. Implementierung eines dynamischen Icon-Sets (siehe `dynamic-icon-concept.md`)

---

## Changelog

**Version 1.3 (Aktuell)**
- 28 Animationen implementiert
- Chrome Web Store Release
- Umfassende Testabdeckung

**Frühere Versionen**
- Version 1.2: Partikel-System erweitert
- Version 1.1: Erste Partikel-Animationen
- Version 1.0: Canvas-basierte Animationen

---

**Dokument-Ende**
