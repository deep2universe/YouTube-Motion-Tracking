# Motion Game Mode - Debug Guide

## Problem: Keine Bewegungserkennung

### Implementierte Debug-Maßnahmen

#### 1. Console Logging
Alle wichtigen Funktionen loggen jetzt mit dem Prefix `[GAME MODE]` oder `[MOTION DETECTOR]`:

**Game Mode Logs:**
- `[GAME MODE] Starting game with motion: X` - Wenn Bewegung ausgewählt wird
- `[GAME MODE] Game started. State: PLAYING` - Bestätigung dass State korrekt ist
- `[GAME MODE] Update called with X keypoints` - Bestätigung dass update() aufgerufen wird
- `[GAME MODE] First keypoint: {...}` - Zeigt Keypoint-Format
- `[GAME MODE] ✓ Movement detected!` - Erfolgreiche Erkennung
- `[GAME MODE] Rendering - Canvas: WxH` - Bestätigung dass render() läuft
- `[GAME MODE] Ghost position: x, y` - Ghost-Position

**Motion Detector Logs:**
- `[MOTION DETECTOR] First detect call for: X` - Erste Detection
- `[MOTION DETECTOR] Keypoints count: X` - Anzahl Keypoints
- `[MOTION DETECTOR] Sample keypoint: {...}` - Keypoint-Struktur
- `[MOTION DETECTOR] Keypoint validation failed` - Wenn Validation fehlschlägt
- `[MOTION DETECTOR] Required keypoints: [...]` - Welche Keypoints benötigt werden
- `[MOTION DETECTOR] Detection status: X detected: true/false` - Alle 3 Sekunden
- `[MOTION DETECTOR] Movement confirmed by time window!` - Time window Bestätigung

#### 2. Gelockerte Detection-Schwellwerte

**Vorher → Nachher:**
- Arm Curl: 45° → 60° (leichter zu erkennen)
- Head Turn: 30px → 20px (empfindlicher)
- Arm Raise: -50px → -30px (weniger hoch nötig)
- Squat: 100° → 120° (weniger tief nötig)
- Jumping Jack: 1.3x → 1.2x (weniger Spreizung nötig)
- Confidence: 0.3 → 0.2 (niedrigere Schwelle)

#### 3. Verbesserte Fehlerbehandlung

- Keypoint-Validation zeigt jetzt genau welche Keypoints fehlen
- Alle Errors werden mit Stack Trace geloggt
- State wird bei jedem Update überprüft

## Debug-Schritte

### 1. Chrome DevTools öffnen
1. Rechtsklick auf YouTube-Seite → "Untersuchen"
2. Tab "Console" öffnen
3. Filter setzen: `[GAME MODE]` oder `[MOTION DETECTOR]`

### 2. Game Mode aktivieren
1. Klick auf "👻🎮 Game Mode: OFF" Button
2. **Erwartete Logs:**
   ```
   [GAME MODE] Starting game with motion: armCurl
   [GAME MODE] Game started. State: PLAYING Motion: armCurl
   ```

### 3. Video abspielen
1. YouTube Video mit Menschen starten
2. **Erwartete Logs:**
   ```
   [GAME MODE] Update called with 17 keypoints
   [GAME MODE] First keypoint: {x: 123, y: 456, score: 0.9, name: "nose"}
   [GAME MODE] Selected motion: armCurl
   [GAME MODE] Rendering - Canvas: 1280 x 720
   [GAME MODE] Ghost position: 640 360
   ```

### 4. Bewegung ausführen (im Video)
1. Warte bis Person im Video die gewählte Bewegung macht
2. **Erwartete Logs:**
   ```
   [MOTION DETECTOR] First detect call for: armCurl
   [MOTION DETECTOR] Keypoints count: 17
   [MOTION DETECTOR] Detection status: armCurl detected: true
   [MOTION DETECTOR] Movement confirmed by time window!
   [GAME MODE] ✓ Movement detected!
   ```

## Häufige Probleme

### Problem 1: "Not updating - state is: SELECTING"
**Ursache:** Bewegung wurde nicht ausgewählt oder Panel nicht geschlossen
**Lösung:** Klick auf eine der 5 Bewegungs-Buttons

### Problem 2: "No keypoints received"
**Ursache:** Pose Detection funktioniert nicht
**Lösung:** 
- Überprüfe ob Video Menschen zeigt
- Überprüfe ob normale Animationen funktionieren
- Warte bis Video lädt

### Problem 3: "Keypoint validation failed"
**Ursache:** Benötigte Keypoints haben zu niedrige Confidence
**Lösung:**
- Verwende Videos mit besserer Beleuchtung
- Verwende Videos mit frontal sichtbaren Personen
- Confidence-Schwelle wurde bereits auf 0.2 gesenkt

### Problem 4: Ghost nicht sichtbar
**Ursache:** Canvas-Problem oder Rendering-Problem
**Lösung:**
- Überprüfe Console für "Rendering - Canvas" Log
- Überprüfe ob Canvas-Größe > 0
- Überprüfe ob Ghost-Position im sichtbaren Bereich

### Problem 5: Detection läuft, aber keine Bewegung erkannt
**Ursache:** Schwellwerte zu streng oder falsche Bewegung
**Lösung:**
- Überprüfe "Detection status" Logs
- Teste mit verschiedenen Videos
- Teste verschiedene Bewegungen (Arm Raise ist am einfachsten)

## Test-Videos (Empfehlungen)

**Beste Videos für Testing:**
1. **Fitness/Workout Videos** - Klare Bewegungen, gute Beleuchtung
2. **Dance Videos** - Viele verschiedene Bewegungen
3. **Yoga Videos** - Langsame, deutliche Bewegungen
4. **Sports Tutorials** - Demonstrationen mit Wiederholungen

**Bewegung → Empfohlenes Video:**
- Arm Curl: Fitness/Hantel-Training
- Head Turn: Dance/Choreographie
- Arm Raise: Yoga/Stretching
- Squat: Fitness/Leg Day
- Jumping Jack: Cardio/Warm-up

## Nächste Schritte

1. Extension in Chrome neu laden
2. YouTube Video öffnen
3. Console öffnen und Logs beobachten
4. Game Mode aktivieren
5. Bewegung wählen
6. Logs analysieren

**Wenn Logs erscheinen:** System funktioniert, nur Detection-Tuning nötig
**Wenn keine Logs:** Integration-Problem, content.js überprüfen
