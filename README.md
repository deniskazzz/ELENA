# Elena · Nutrition Coaching Hub

Responsives Coaching-Dashboard für Coach und Klientin: Dashboard, Ernährungsplan mit
automatischer Kohlenhydrat-Berechnung und eigenen Lebensmitteln, wöchentliche Check-ins,
Fortschritt (Diagramme, Vorher-/Nachher-Bilder, PDF-Bericht), Training (2 Ganzkörperpläne,
Historie), Dokumente (Upload, Ansicht, Bearbeitung) und Coach-Notizen.

**Technik:** React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · shadcn/ui (Radix) · Recharts · Zustand

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) 20 oder neuer.

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:5173
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
```

## Auf GitHub veröffentlichen (GitHub Pages)

1. Neues Repository auf GitHub anlegen und diesen Ordner hochladen:
   ```bash
   git init
   git add .
   git commit -m "Elena Coaching Hub"
   git branch -M main
   git remote add origin https://github.com/<benutzer>/<repo>.git
   git push -u origin main
   ```
2. Im Repository: **Settings → Pages → Source: „GitHub Actions“** wählen.
3. Der Workflow `.github/workflows/deploy.yml` baut und veröffentlicht die App bei jedem Push
   auf `main`. Adresse: `https://<benutzer>.github.io/<repo>/`

## Projektstruktur

```
src/
├── App.tsx                 Router (HashRouter) + Provider
├── main.tsx                Einstiegspunkt
├── routes.tsx              Seiten + Navigation (eine Stelle)
├── index.css               Farben/Design-Tokens (Dunkelblau, Mint, Weiß)
├── components/
│   ├── app-shell.tsx       Seitenleiste (Desktop), Bottom-Navigation (Mobil), Rollenumschalter
│   ├── charts.tsx          Gewichts-/Umfangsdiagramm, Fortschrittsring
│   ├── food-manager.tsx    Eigene Lebensmittel mit Nährwerten
│   └── ui/                 shadcn/ui-Bausteine
├── lib/
│   ├── types.ts            Datenmodell
│   ├── seed.ts             Startdaten (Beispieldaten – anpassen/ersetzen)
│   ├── store.ts            Zentraler Datenspeicher, automatisches Speichern
│   ├── file-store.ts       Dateiablage für PDFs/Bilder (IndexedDB)
│   └── calc.ts             Makro-/Kohlenhydrat-Berechnung, Formatierung
└── pages/                  Dashboard, Ernährung, Check-in, Fortschritt, Training, Dokumente, Coach-Notizen
```

## Wichtig zu Daten & Zugriff

- Alle Daten werden **im Browser des jeweiligen Geräts** gespeichert (localStorage / IndexedDB).
  Coach und Klientin sehen dadurch **nicht automatisch dieselben Daten**.
- Für echten gemeinsamen Zugriff braucht es ein Backend mit Anmeldung, z. B.
  [Supabase](https://supabase.com) oder [Firebase](https://firebase.google.com). Der zentrale
  Ansatzpunkt dafür ist `src/lib/store.ts` – alle Seiten lesen und schreiben ausschließlich darüber.
- Der Umschalter „Elena / Coach“ ist eine Ansicht, **kein Zugriffsschutz**. Coach-Notizen sind erst
  mit einer echten Anmeldung geschützt.
- `src/lib/seed.ts` enthält Beispieldaten für den Start. Für echte Klientinnen anpassen oder leeren.
