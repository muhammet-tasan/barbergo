# BarberGo — Branding

Kurzreferenz für Farben, Assets und UI-Regeln. **Canonical code:** `apps/mobile/constants/theme.ts`, `constants/brand-copy.ts`, `constants/images.ts`.

Visuelle Referenz: [barbergo-brand-overview.png](./assets/barbergo-brand-overview.png)

## Markenidentität

| Element | Wert |
|---------|------|
| Name | **barbergo** (kleingeschrieben) |
| Slogan | **DEIN STYLE. DEIN TERMIN.** |
| Untertitel (App) | Mobile Haarschnitte bei dir zu Hause |
| Look | Dark Navy + Gold, Barber-Charakter, Pin im „go“ |

## UI-Regel

Immer **Dark Navy** Hintergrund, **Gold** als Akzent, **helle Schrift**. Keine neuen Hex-Farben in Screens — Tailwind-Tokens (`brand-*`, `success`, `warning`, `error`) oder `colors` aus `theme.ts`.

## Farbpalette

| Token (theme / Tailwind) | Hex | Verwendung |
|--------------------------|-----|------------|
| `background` / `brand-dark` | `#0F172A` | App-Hintergrund, Splash, Android-Adaptive-Hintergrund |
| `surface` / `brand-surface` | `#1E293B` | Karten, Eingabefelder, sekundäre Flächen |
| `surfaceLight` / `brand-surfaceLight` | `#334155` | hellere Flächen, Borders |
| `border` / `brand-border` | `#334155` | Rahmen, Trennlinien |
| `text` / `brand-text` | `#F8FAFC` | Primärtext |
| `textMuted` / `brand-muted` | `#94A3B8` | Hilfstext, Platzhalter |
| `accent` / `brand-gold` | `#D4A574` | CTAs, Links, Highlights |
| `accentDark` / `brand-accentDark` | `#B8864E` | gedämpfter Gold-Akzent |
| `success` | `#22C55E` | bestätigt, Erfolg |
| `warning` | `#F59E0B` | offen / Hinweise |
| `error` | `#EF4444` | Fehler, Storno-Status |

Design-Export: `apps/mobile/constants/barbergo-colors.json` (Abgleich mit theme; `coolGray` dort = `#64748B`, in UI bevorzugt `brand-muted`).

## Assets (`apps/mobile/assets/images/`)

Alle Dateien **flach** in diesem Ordner (kein Unterordner `brand/`).

| Datei | Verwendung |
|-------|------------|
| `icon.png` | iOS/Android Store (1024×1024, quadratisch) |
| `splash-icon.png` | Native Splash (vertikales Logo) |
| `favicon.png` | Web-Tab (48×48) |
| `android-icon-foreground.png` | Adaptive Icon Vordergrund (`logo-icon-only`) |
| `android-icon-background.png` | Adaptive Icon Hintergrund |
| `android-icon-monochrome.png` | Android 13+ Monochrome |
| `hero-logo-wide.png` | Startseite Hero |
| `logo-mark-dark.png` | Avatare, Barber-Karten |
| `android-icon-foreground.png` | Icon-only (Android adaptive + Referenz) |
| `logo-horizontal-dark.png` | optional — Header (noch nicht im Ordner) |
| `logo-vertical-dark.png` | optional — vertikales Wordmark |
| `pin-mark.png` | optional — Karten-Pin |

Code: `BrandLogo`, `BrandMark` in `components/BrandLogo.tsx`; Pfade in `constants/images.ts`.

## Expo-Konfiguration (`app.json`)

- `userInterfaceStyle`: `dark`
- Splash: `backgroundColor` `#0F172A`, `imageWidth` 240
- Android `adaptiveIcon.backgroundColor`: `#0F172A`

## Später

- Barber-Avatar pro Provider (Supabase Storage), nicht unter `assets/images/`
- SVG-Nachzeichnung für skalierbare Logos
