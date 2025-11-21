# 🔍 Debug Scripts - Diagnostic Toolkit

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ██████╗ ███████╗██████╗ ██╗   ██╗ ██████╗               ║
    ║     ██╔══██╗██╔════╝██╔══██╗██║   ██║██╔════╝               ║
    ║     ██║  ██║█████╗  ██████╔╝██║   ██║██║  ███╗              ║
    ║     ██║  ██║██╔══╝  ██╔══██╗██║   ██║██║   ██║              ║
    ║     ██████╔╝███████╗██████╔╝╚██████╔╝╚██████╔╝              ║
    ║     ╚═════╝ ╚══════╝╚═════╝  ╚═════╝  ╚═════╝               ║
    ║                                                               ║
    ║          🛠️  YouTube Motion Tracking Extension  🛠️           ║
    ║                  Debugging & Diagnostics                      ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
```

## 📖 Übersicht

Dieses Verzeichnis enthält eine Sammlung von **Browser-Console-Scripts**, die entwickelt wurden, um Probleme mit der YouTube Motion Tracking Extension zu diagnostizieren und zu beheben. Jedes Script ist darauf ausgelegt, direkt in die Chrome DevTools Console kopiert und ausgeführt zu werden.

---

## 🗂️ Datei-Verzeichnis

```
debug_scripts/
├── 📄 complete-diagnosis.js      ⭐ Umfassende System-Diagnose
├── 📄 debug-youtube-dom.js       🔍 YouTube DOM-Struktur-Analyse
├── 📄 diagnose-animations.js     ❌ (Leer - Platzhalter)
├── 📄 diagnose-video-switch.js   🎬 Video-Wechsel-Diagnose
├── 📄 manual-fix-popup.js        🔧 Popup-Reparatur-Tool
├── 📄 quick-debug.js             ⚡ Schnell-Check
└── 📄 test-video-selection.js    🎯 Video-Auswahl-Test
```

---

## 📋 Datei-Steckbriefe

### 1️⃣ complete-diagnosis.js ⭐

```
┌─────────────────────────────────────────────────────────────┐
│  🏥 COMPLETE DIAGNOSIS - Der Gesundheits-Check              │
├─────────────────────────────────────────────────────────────┤
│  Zweck:     Umfassende Extension-Diagnose nach Video-Wechsel│
│  Zeilen:    ~200                                             │
│  Komplexität: ████████░░ (8/10)                             │
│  Entstehung: Debugging von Video-Wechsel-Problemen          │
└─────────────────────────────────────────────────────────────┘
```

**🎯 Wofür wurde es erstellt?**
- Diagnose von Problemen nach YouTube-Video-Wechseln
- Identifikation fehlender oder falsch platzierter Extension-Elemente
- Analyse der Video-Element-Auswahl und Canvas-Platzierung

**📦 Hauptinhalte:**
- **7 Diagnose-Bereiche:**
  1. Extension-Elemente (Button, Canvas, Popup)
  2. Video-Elemente und Playback-Status
  3. Event-Listener-Prüfung
  4. Canvas-Platzierung im DOM
  5. Popup-Platzierung im Player
  6. Animation-Status (Canvas-Inhalt)
  7. Problem-Zusammenfassung mit Lösungsvorschlägen

**🔑 Wesentliche Erkenntnisse:**
- Popup-Sichtbarkeit ist häufigste Fehlerquelle
- Canvas-Elemente müssen im gleichen Container wie Video sein
- Video-Auswahl basiert auf Scoring-System (Playing > Dimensions > ReadyState)
- Cleanup-Fehler führen zu mehreren Popup-Instanzen

**💡 Verwendung:**
```javascript
// In Chrome DevTools Console nach Video-Wechsel ausführen
// Kopiere gesamten Dateiinhalt und drücke Enter
```

**🔗 Verwandte Dateien:**
- [diagnose-video-switch.js](#4️⃣-diagnose-video-switchjs-🎬) - Fokussiert auf Video-Wechsel
- [manual-fix-popup.js](#5️⃣-manual-fix-popupjs-🔧) - Repariert gefundene Probleme

---

### 2️⃣ debug-youtube-dom.js 🔍

```
┌─────────────────────────────────────────────────────────────┐
│  🗺️ YOUTUBE DOM DEBUG - Der DOM-Explorer                    │
├─────────────────────────────────────────────────────────────┤
│  Zweck:     YouTube DOM-Struktur analysieren                 │
│  Zeilen:    ~120                                             │
│  Komplexität: ██████░░░░ (6/10)                             │
│  Entstehung: YouTube DOM-Änderungen verstehen                │
└─────────────────────────────────────────────────────────────┘
```

**🎯 Wofür wurde es erstellt?**
- Verstehen der dynamischen YouTube DOM-Struktur
- Identifikation der richtigen Selektoren für Video-Elemente
- Analyse von YouTube's Player-Container-Hierarchie

**📦 Hauptinhalte:**
- **7 Analyse-Bereiche:**
  1. Alle Video-Elemente mit Details (readyState, paused, dimensions)
  2. Video-Container-Selektoren (`.html5-video-container`, `#movie_player`, etc.)
  3. Player-Controls-Elemente
  4. Extension-Elemente-Check
  5. Video-Finding-Logic-Test (mit Fallback-Selektoren)
  6. Legacy-Variablen-Check
  7. Page-Info (URL, Video-ID)

**🔑 Wesentliche Erkenntnisse:**
- YouTube verwendet mehrere Video-Container-Klassen
- Fallback-Selektoren sind essentiell: `video.html5-main-video` → `video.video-stream` → `video`
- Letztes Video-Element im Array ist meist das aktive
- ReadyState-Werte: 0=NOTHING, 1=METADATA, 2=CURRENT_DATA, 3=FUTURE_DATA, 4=ENOUGH_DATA

**💡 Verwendung:**
```javascript
// Auf YouTube-Seite ausführen um DOM-Struktur zu verstehen
// Hilfreich bei YouTube-Updates die Selektoren brechen
```

**🔗 Verwandte Dateien:**
- [test-video-selection.js](#7️⃣-test-video-selectionjs-🎯) - Testet Video-Auswahl-Logik
- [complete-diagnosis.js](#1️⃣-complete-diagnosisjs-⭐) - Nutzt ähnliche Selektoren

---

### 3️⃣ diagnose-animations.js ❌

```
┌─────────────────────────────────────────────────────────────┐
│  👻 DIAGNOSE ANIMATIONS - Das Phantom-Script                 │
├─────────────────────────────────────────────────────────────┤
│  Zweck:     Unbekannt (Datei ist leer)                       │
│  Zeilen:    0                                                │
│  Komplexität: ░░░░░░░░░░ (0/10)                             │
│  Entstehung: Platzhalter für zukünftige Animation-Diagnose   │
└─────────────────────────────────────────────────────────────┘
```

**🎯 Wofür wurde es erstellt?**
- Vermutlich geplant für Animation-spezifische Diagnose
- Aktuell nicht implementiert

**📦 Hauptinhalte:**
- Keine (Datei ist leer)

**🔑 Wesentliche Erkenntnisse:**
- Platzhalter für zukünftige Entwicklung
- Könnte für Proton-Particle-System-Debugging verwendet werden
- Oder für TensorFlow.js Pose-Detection-Diagnose

**💡 Potenzielle Verwendung:**
```javascript
// Könnte implementiert werden für:
// - Proton Emitter Status
// - Particle Count Monitoring
// - Animation Frame Rate
// - Canvas Rendering Performance
```

---

### 4️⃣ diagnose-video-switch.js 🎬

```
┌─────────────────────────────────────────────────────────────┐
│  🎬 VIDEO SWITCH DIAGNOSIS - Der Wechsel-Detektiv           │
├─────────────────────────────────────────────────────────────┤
│  Zweck:     Popup-Probleme nach Video-Wechsel diagnostizieren│
│  Zeilen:    ~150                                             │
│  Komplexität: ███████░░░ (7/10)                             │
│  Entstehung: Häufiges Problem: Popup verschwindet           │
└─────────────────────────────────────────────────────────────┘
```

**🎯 Wofür wurde es erstellt?**
- Spezifisches Problem: Popup erscheint nicht nach Video-Wechsel
- Diagnose von Cleanup-Fehlern
- Identifikation von DOM-Attachment-Problemen

**📦 Hauptinhalte:**
- **8 Diagnose-Bereiche:**
  1. Extension-Elemente-Check (Button, Canvas, Popup)
  2. Video-Elemente mit Playing-Status
  3. Canvas-Positionen und Parent-Container
  4. Player-Container-Analyse
  5. Button-Funktionalität-Test (mit automatischem Click)
  6. Duplikat-Check (mehrere Popups = Cleanup-Fehler)
  7. Animation-Status (Canvas-Content-Check)
  8. Diagnose-Zusammenfassung mit Empfehlungen

**🔑 Wesentliche Erkenntnisse:**
- Popup `display: none` ist häufigste Ursache
- Mehrere Popup-Instanzen deuten auf Cleanup-Fehler hin
- Canvas muss im gleichen Parent wie Video sein
- Button-Click kann Popup-Erstellung triggern

**💡 Verwendung:**
```javascript
// Nach Video-Wechsel ausführen wenn Popup fehlt
// Script testet automatisch Button-Click
// Wartet 1 Sekunde und prüft ob Popup erscheint
```

**🔗 Verwandte Dateien:**
- [complete-diagnosis.js](#1️⃣-complete-diagnosisjs-⭐) - Umfassendere Version
- [manual-fix-popup.js](#5️⃣-manual-fix-popupjs-🔧) - Repariert das Problem

---

### 5️⃣ manual-fix-popup.js 🔧

```
┌─────────────────────────────────────────────────────────────┐
│  🔧 MANUAL FIX POPUP - Der Reparatur-Roboter                 │
├─────────────────────────────────────────────────────────────┤
│  Zweck:     Popup-Probleme automatisch beheben               │
│  Zeilen:    ~50                                              │
│  Komplexität: ████░░░░░░ (4/10)                             │
│  Entstehung: Quick-Fix für häufiges Popup-Problem           │
└─────────────────────────────────────────────────────────────┘
```

**🎯 Wofür wurde es erstellt?**
- Schnelle Reparatur wenn Popup nicht erscheint
- Automatische Problemlösung ohne Extension-Reload
- User-freundliche Lösung für häufiges Problem

**📦 Hauptinhalte:**
- **2 Reparatur-Strategien:**
  1. **Popup existiert:** Setze `display: block`
  2. **Popup fehlt:** Trigger Button-Click → Warte 1.5s → Zeige Popup

**🔑 Wesentliche Erkenntnisse:**
- Meistens ist Popup vorhanden aber versteckt (`display: none`)
- Button-Click triggert `handleVideoLoaded()` Funktion
- 1.5s Delay nötig für YouTube's asynchrone DOM-Updates
- Fallback: Page-Reload wenn nichts funktioniert

**💡 Verwendung:**
```javascript
// Einfach ausführen wenn Popup fehlt
// Script versucht automatisch zu reparieren
// Gibt Status-Meldungen aus
```

**🔗 Verwandte Dateien:**
- [diagnose-video-switch.js](#4️⃣-diagnose-video-switchjs-🎬) - Diagnostiziert das Problem
- [complete-diagnosis.js](#1️⃣-complete-diagnosisjs-⭐) - Zeigt Quick-Fixes

---

### 6️⃣ quick-debug.js ⚡

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ QUICK DEBUG - Der Blitz-Check                            │
├─────────────────────────────────────────────────────────────┤
│  Zweck:     Schneller Status-Check in 7 Zeilen              │
│  Zeilen:    ~25                                              │
│  Komplexität: ██░░░░░░░░ (2/10)                             │
│  Entstehung: Minimalistisches Debugging-Tool                 │
└─────────────────────────────────────────────────────────────┘
```

**🎯 Wofür wurde es erstellt?**
- Schneller Überblick ohne viel Output
- Erste Anlaufstelle für Debugging
- Minimaler Code für maximale Info

**📦 Hauptinhalte:**
- **7 Checks:**
  1. Video-Element
  2. Canvas 2D
  3. Canvas WebGL
  4. Popup
  5. Extension-Button
  6. Video-Details (readyState, paused, dimensions)
  7. Animation-Button-Status (enabled/disabled)

**🔑 Wesentliche Erkenntnisse:**
- Kompakte Ausgabe für schnelle Diagnose
- Fokus auf essenzielle Elemente
- Zeigt Animation-Status (grün = enabled, rot = disabled)

**💡 Verwendung:**
```javascript
// Schneller Check ob Extension läuft
// Ideal für erste Diagnose
// Wenig Console-Output
```

**🔗 Verwandte Dateien:**
- [complete-diagnosis.js](#1️⃣-complete-diagnosisjs-⭐) - Detaillierte Version

---

### 7️⃣ test-video-selection.js 🎯

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 TEST VIDEO SELECTION - Der Auswahl-Algorithmus-Tester   │
├─────────────────────────────────────────────────────────────┤
│  Zweck:     Video-Auswahl-Logik testen und verstehen        │
│  Zeilen:    ~70                                              │
│  Komplexität: ██████░░░░ (6/10)                             │
│  Entstehung: Debugging von falscher Video-Auswahl           │
└─────────────────────────────────────────────────────────────┘
```

**🎯 Wofür wurde es erstellt?**
- Verstehen welches Video die Extension auswählt
- Debugging von Multi-Video-Szenarien (Ads, Picture-in-Picture)
- Validierung des Scoring-Algorithmus

**📦 Hauptinhalte:**
- **Scoring-System:**
  - Playing (not paused + currentTime > 0): +1000 Punkte
  - Valid dimensions (videoWidth/Height > 0): +100 Punkte
  - Ready state >= 2: +50 Punkte
  - Valid duration: +25 Punkte
  - Current time > 0: +10 Punkte
  - Array index: +index (Tiebreaker)

**🔑 Wesentliche Erkenntnisse:**
- Extension wählt Video mit höchstem Score
- Playing-Status ist wichtigster Faktor (1000 Punkte)
- Bei gleichen Scores gewinnt höherer Index (neueres Video)
- Ads haben oft niedrigeren Score (keine Dimensions)

**💡 Verwendung:**
```javascript
// Ausführen um zu sehen welches Video gewählt wird
// Zeigt Score-Berechnung für jedes Video
// Hilfreich bei Ad-Problemen oder PiP
```

**🔗 Verwandte Dateien:**
- [debug-youtube-dom.js](#2️⃣-debug-youtube-domjs-🔍) - Zeigt alle Videos
- [complete-diagnosis.js](#1️⃣-complete-diagnosisjs-⭐) - Nutzt gleichen Algorithmus

---

## 🎨 Visualisierung: Script-Beziehungen

```
                    🔍 Debugging-Workflow
                           
    ┌─────────────────────────────────────────────────┐
    │  1. Problem erkannt                             │
    │     "Popup erscheint nicht!"                    │
    └──────────────────┬──────────────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────────────┐
    │  2. Quick Check                                 │
    │     ⚡ quick-debug.js                           │
    │     → Zeigt: Popup fehlt                        │
    └──────────────────┬──────────────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────────────┐
    │  3. Detaillierte Diagnose                       │
    │     ⭐ complete-diagnosis.js                    │
    │     → Zeigt: Popup display: none                │
    └──────────────────┬──────────────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────────────┐
    │  4. Reparatur                                   │
    │     🔧 manual-fix-popup.js                      │
    │     → Setzt display: block                      │
    └──────────────────┬──────────────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────────────┐
    │  5. Problem gelöst! ✅                          │
    └─────────────────────────────────────────────────┘


                Alternative Workflows:

    Video-Wechsel-Problem:
    🎬 diagnose-video-switch.js → 🔧 manual-fix-popup.js

    DOM-Struktur verstehen:
    🔍 debug-youtube-dom.js → 🎯 test-video-selection.js

    Falsches Video gewählt:
    🎯 test-video-selection.js → 🔍 debug-youtube-dom.js
```

---

## 🚀 Verwendungsanleitung

### Schritt 1: Chrome DevTools öffnen
```
1. YouTube-Video öffnen
2. F12 drücken (oder Rechtsklick → "Untersuchen")
3. "Console"-Tab auswählen
```

### Schritt 2: Script auswählen
```
Problem                          → Empfohlenes Script
─────────────────────────────────────────────────────
Popup fehlt                      → manual-fix-popup.js
Allgemeine Probleme              → complete-diagnosis.js
Schneller Check                  → quick-debug.js
Video-Wechsel-Probleme           → diagnose-video-switch.js
DOM-Struktur verstehen           → debug-youtube-dom.js
Falsches Video gewählt           → test-video-selection.js
```

### Schritt 3: Script ausführen
```javascript
// 1. Datei öffnen (z.B. quick-debug.js)
// 2. Gesamten Inhalt kopieren (Ctrl+A, Ctrl+C)
// 3. In Console einfügen (Ctrl+V)
// 4. Enter drücken
// 5. Output analysieren
```

---

## 🎓 Häufige Probleme & Lösungen

### Problem 1: Popup erscheint nicht nach Video-Wechsel

**Diagnose:**
```javascript
// Ausführen: diagnose-video-switch.js
```

**Typische Ursachen:**
- Popup `display: none` (80% der Fälle)
- Popup nicht im DOM (15% der Fälle)
- Popup im falschen Container (5% der Fälle)

**Lösung:**
```javascript
// Ausführen: manual-fix-popup.js
// Oder manuell:
document.querySelector('.posedream-video-popup').style.display = 'block';
```

---

### Problem 2: Animationen laufen nicht

**Diagnose:**
```javascript
// Ausführen: quick-debug.js
// Prüfe: Animation-Button-Status
```

**Typische Ursachen:**
- Animationen deaktiviert (Button rot)
- Canvas nicht im DOM
- Video pausiert

**Lösung:**
```javascript
// Button-Status prüfen:
const animButton = document.getElementById('animDisabledDiv');
console.log('Button class:', animButton.className);
// Grün = enabled, Rot = disabled

// Manuell aktivieren:
document.dispatchEvent(new CustomEvent('changeIsAnimDisabled'));
```

---

### Problem 3: Extension wählt falsches Video

**Diagnose:**
```javascript
// Ausführen: test-video-selection.js
// Zeigt Score für jedes Video
```

**Typische Ursachen:**
- Ad-Video hat höheren Score
- Mehrere Videos gleichzeitig spielen
- Picture-in-Picture aktiv

**Lösung:**
```javascript
// Manuell bestes Video auswählen:
const videos = document.querySelectorAll('video.html5-main-video');
const mainVideo = videos[videos.length - 1]; // Letztes = meist richtig
console.log('Selected video:', mainVideo);
```

---

## 📊 Script-Komplexität-Matrix

```
Komplexität vs. Nützlichkeit

    10│                                    ⭐ complete-diagnosis.js
      │
     9│
      │
     8│
      │
     7│                          🎬 diagnose-video-switch.js
      │
     6│              🔍 debug-youtube-dom.js    🎯 test-video-selection.js
      │
     5│
      │
     4│                      🔧 manual-fix-popup.js
      │
     3│
      │
     2│          ⚡ quick-debug.js
      │
     1│
      │
     0│  👻 diagnose-animations.js
      └─────────────────────────────────────────────────────────────
       0    1    2    3    4    5    6    7    8    9    10
                          Nützlichkeit
```

---

## 🔮 Zukünftige Erweiterungen

### Geplante Scripts:

1. **diagnose-animations.js** (aktuell leer)
   - Proton Particle System Status
   - Animation Frame Rate Monitoring
   - Canvas Rendering Performance

2. **diagnose-tensorflow.js**
   - TensorFlow.js Backend Status
   - Pose Detection Performance
   - Keypoint Confidence Scores

3. **diagnose-performance.js**
   - FPS Monitoring
   - Memory Usage
   - GPU Utilization

4. **auto-fix-all.js**
   - Kombiniert alle Fix-Scripts
   - Automatische Problem-Erkennung
   - One-Click-Lösung

---

## 📚 Weiterführende Ressourcen

- **Extension Source Code:** [../src/content.js](../src/content.js)
- **Error Fixes Documentation:** [../dev_docs/ERROR_FIXES.md](../dev_docs/ERROR_FIXES.md)
- **Testing Guide:** [../dev_docs/TESTING.md](../dev_docs/TESTING.md)
- **Console Messages:** [../dev_docs/CONSOLE_MESSAGES.md](../dev_docs/CONSOLE_MESSAGES.md)

---

## 🤝 Beitragen

Neue Debug-Scripts sind willkommen! Bitte folge diesem Format:

```javascript
// ============================================
// [SCRIPT NAME] - [Kurzbeschreibung]
// ============================================

console.log('=== [SCRIPT NAME] ===');

// 1. Check [Was]
console.log('1. [BEREICH]:');
// ... Code ...

// 2. Check [Was]
console.log('2. [BEREICH]:');
// ... Code ...

console.log('=== END [SCRIPT NAME] ===');
```

---

**Erstellt mit 🔍 und ☕ für besseres Debugging**

*Letzte Aktualisierung: November 2024*
