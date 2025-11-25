# Datenschutzerklärung

**für die Chrome-Erweiterung „YouTube Motion Tracking - Halloween Edition"**

Stand: 25. November 2025

---

## 1. Verantwortlicher

Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze sowie sonstiger datenschutzrechtlicher Bestimmungen ist:

**Mario Mijic**
Wilhelm-Blos-Str. 56
71636 Ludwigsburg
Deutschland

E-Mail für Datenschutzanfragen: deep2universe@gmail.com

---

## 2. Funktionsweise der Erweiterung

Diese Erweiterung fügt Halloween-Animationseffekte zu YouTube-Videos hinzu. Sie nutzt KI-gestützte Echtzeit-Pose-Detection, um Körperbewegungen in Videos zu erkennen und darauf basierend Animationen (z.B. leuchtende Skelette, Kürbisköpfe, Fledermäuse, Geister) einzublenden.

**Wichtig:** Die gesamte Videoanalyse und Pose-Detection erfolgt vollständig lokal in deinem Browser. Es werden keine Videodaten, Bilder oder Analyseergebnisse an externe Server übertragen.

---

## 3. Welche Daten werden verarbeitet?

### 3.1 Lokale Speicherung (chrome.storage)

Die Erweiterung nutzt die Chrome Storage API, um deine Einstellungen und Präferenzen lokal zu speichern. Dies umfasst:

- Ausgewählte Animationseffekte
- Aktivierungs-/Deaktivierungsstatus der Erweiterung
- Benutzerdefinierte Einstellungen (z.B. Animationsintensität)

*Diese Daten verbleiben ausschließlich auf deinem Gerät und werden nicht an mich oder Dritte übertragen.*

### 3.2 Lokale Videoanalyse

Für die Pose-Detection werden Videoframes des aktuell abgespielten YouTube-Videos analysiert. Diese Verarbeitung:

- Findet vollständig lokal in deinem Browser statt
- Überträgt keine Daten an externe Server
- Speichert keine Videoframes oder Analyseergebnisse dauerhaft
- Wird nur ausgeführt, wenn die Erweiterung aktiv ist

### 3.3 Keine Erhebung personenbezogener Daten

Die Erweiterung erhebt, speichert oder überträgt keine personenbezogenen Daten. Insbesondere werden **nicht** erfasst:

- IP-Adressen oder Gerätekennungen
- Dein YouTube-Konto oder Anmeldedaten
- Dein Browserverlauf oder Suchverhalten
- Die von dir angesehenen Videos
- Standortdaten

---

## 4. Verwendete Browser-Berechtigungen

Die Erweiterung benötigt folgende Berechtigungen, um zu funktionieren:

| Berechtigung | Verwendungszweck |
|--------------|------------------|
| `activeTab` | Ermöglicht Zugriff auf den aktiven Tab, um die Animationen in das YouTube-Video einzufügen. |
| `tabs` | Wird benötigt, um zu erkennen, ob der aktuelle Tab eine YouTube-Seite ist. |
| `webNavigation` | Ermöglicht es, die Erweiterung bei Seitenwechseln innerhalb von YouTube korrekt zu aktivieren (z.B. beim Wechsel zwischen Videos). |
| `storage` | Speichert deine Einstellungen lokal auf deinem Gerät (keine Cloud-Synchronisation). |
| `host_permissions` (youtube.com) | Beschränkt die Erweiterung ausschließlich auf YouTube. Die Erweiterung hat keinen Zugriff auf andere Webseiten. |

---

## 5. Datenweitergabe an Dritte

**Es werden keine Daten an Dritte übermittelt.**

Da diese Erweiterung keine Daten an externe Server sendet, erfolgt auch keine Weitergabe an Dritte wie Analyse-Tools, Werbepartner oder Cloud-Dienste.

*Hinweis zum Browser:* Der Betrieb von Google Chrome und deines Betriebssystems kann standardmäßig Daten erfassen (z.B. Absturzberichte), auf die ich keinen Einfluss habe. Diese unterliegen den Datenschutzbestimmungen von Google.

---

## 6. Open-Source-Transparenz

Der vollständige Quellcode dieser Erweiterung ist öffentlich einsehbar unter:

🔗 **[https://github.com/deep2universe/YouTube-Motion-Tracking](https://github.com/deep2universe/YouTube-Motion-Tracking)**

Du kannst jederzeit selbst überprüfen, dass keine unerwünschte Datenerhebung stattfindet.

---

## 7. Deine Rechte

Da diese Erweiterung keine personenbezogenen Daten verarbeitet, können datenschutzrechtliche Betroffenenrechte (wie Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch gemäß Art. 15–21 DSGVO) praktisch nicht geltend gemacht werden.

**Löschen deiner lokalen Daten:** Du kannst die von der Erweiterung gespeicherten Einstellungen jederzeit löschen, indem du die Erweiterung deinstallierst oder die Browserdaten löschst.

Bei Fragen kannst du dich jederzeit an die oben genannte E-Mail-Adresse wenden.

---

## 8. Beschwerderecht bei einer Aufsichtsbehörde

Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs hast du das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde, wenn du der Ansicht bist, dass die Verarbeitung deiner personenbezogenen Daten gegen die DSGVO verstößt.

Liste der deutschen Aufsichtsbehörden:
🔗 https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html

---

## 9. Chrome Web Store Compliance

Diese Erweiterung entspricht den Anforderungen der Chrome Web Store Developer Program Policies und der User Data Policy.

Die Nutzung von Informationen entspricht der Chrome Web Store User Data Policy, einschließlich der Limited Use Anforderungen.

---

## 10. Änderungen dieser Datenschutzerklärung

Ich behalte mir vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets verfügbar unter:

🔗 **https://github.com/deep2universe/YouTube-Motion-Tracking/assets/DATENSCHUTZ.md**

*Bei wesentlichen Änderungen wirst du durch ein Update der Erweiterung informiert.*
