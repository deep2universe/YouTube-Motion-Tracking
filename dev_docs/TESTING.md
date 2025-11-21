# Testing Guide für YouTube Motion Tracking Extension

## Installation

1. Öffnen Sie Chrome und navigieren Sie zu `chrome://extensions/`
2. Aktivieren Sie den **Entwicklermodus** (oben rechts)
3. Klicken Sie auf **"Entpackte Erweiterung laden"**
4. Wählen Sie den Ordner: `/home/user/YouTube-Motion-Tracking/dist`

## Funktionsweise testen

### 1. Extension laden
- Nach dem Laden sollte die Extension in der Erweiterungsliste erscheinen
- Öffnen Sie ein YouTube-Video: https://www.youtube.com/watch?v=dQw4w9WgXcQ

### 2. Pose Detection überprüfen
Öffnen Sie die Browser-Konsole (F12 → Console) und prüfen Sie folgende Nachrichten:

**Erwartete Konsolenmeldungen:**
```
TensorFlow.js backend initialized: webgl
Pose detector created successfully
```

**Diese Fehler sollten NICHT mehr auftreten:**
- ❌ "The highest priority backend 'webgpu' has not yet been initialized"
- ❌ "Cannot set properties of null (setting 'className')"
- ❌ "Cannot read properties of undefined (reading 'style')"

### 3. UI-Elemente testen

**Extension-Icon im Player:**
- Das Extension-Icon sollte in den Player-Controls erscheinen (neben anderen Buttons)
- Das Icon sollte **klickbar** sein

**Popup-Menü:**
- Klicken Sie auf das Extension-Icon
- Ein Popup-Menü sollte erscheinen mit:
  - "Stop/Play animation" Button (grün wenn aktiv)
  - "Randomly change every 10s" Button mit Slider
  - Grid mit verschiedenen Animations-Icons

**Animationen:**
- Klicken Sie auf verschiedene Icons im Popup
- Die Pose-Detection-Visualisierung sollte über dem Video erscheinen
- Verschiedene Animations-Stile sollten sichtbar sein (Skeleton, Partikel, etc.)

### 4. Pose Detection live testen

1. Spielen Sie ein Video mit einer Person ab
2. Die Extension sollte automatisch die Körperhaltung erkennen
3. Skeleton-Linien oder Partikeleffekte sollten der Bewegung folgen

**Gute Test-Videos:**
- Tanz-Videos
- Fitness/Workout-Videos
- Sport-Videos mit klarer Sicht auf Personen

## Bekannte Einschränkungen

- Die Pose Detection funktioniert am besten bei Videos mit:
  - Guter Beleuchtung
  - Frontalansicht der Person
  - Nur einer Person im Bild

- Performance hängt von der GPU ab (WebGL-Backend wird verwendet)

## Debugging

Falls Probleme auftreten:

1. **Konsole öffnen**: F12 → Console
2. **Extension neu laden**: chrome://extensions/ → Reload-Button bei der Extension
3. **Seite neu laden**: YouTube-Seite aktualisieren (F5)

### Häufige Probleme

**Icon erscheint nicht:**
- Warten Sie 1-2 Sekunden nach Laden des Videos
- Laden Sie die Seite neu
- Prüfen Sie die Konsole auf Fehler

**Pose Detection funktioniert nicht:**
- Prüfen Sie, ob "Pose detector created successfully" in der Konsole steht
- Stellen Sie sicher, dass das Video läuft (nicht pausiert)
- Klicken Sie auf das Extension-Icon und prüfen Sie, ob Animation aktiviert ist (grüner Button)

## Logs analysieren

Wichtige Log-Meldungen:
- ✅ `TensorFlow.js backend initialized: webgl` → Backend korrekt initialisiert
- ✅ `Pose detector created successfully` → Detektor bereit
- ⚠️ `Popup already exists, skipping creation` → Normal bei Navigation
- ⚠️ `Popup element not found. Please wait for video to load.` → Zu früh geklickt, warten

## Performance-Tipps

- Die Extension nutzt WebGL für GPU-Beschleunigung
- Bei niedrigerer Performance: Wählen Sie einfachere Animationen (Skeleton statt Partikel)
- Schließen Sie andere Tabs für bessere Performance
