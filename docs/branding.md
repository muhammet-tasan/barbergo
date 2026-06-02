# BarberGo — Branding

Kurzreferenz für Farben, Assets und UI-Regeln. **Canonical code:** `apps/mobile/constants/theme.ts` und `apps/mobile/tailwind.config.js` (gleiche Hex-Werte).

## UI-Regel

Immer **Dark Navy** Hintergrund, **Gold** als Akzent, **helle Schrift**. Keine neuen Hex-Farben in Screens — Tailwind-Tokens (`brand-*`, `success`, `warning`, `error`) oder `colors` aus `theme.ts` für Icons und `StatusBar`.

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
| `accentDark` / `brand-accentDark` | `#B8864E` | gedämpfter Gold-Akzent (Press/Hover später) |
| `success` | `#22C55E` | bestätigt, Erfolg |
| `warning` | `#F59E0B` | offen / Hinweise |
| `error` | `#EF4444` | Fehler, Storno-Status |

## Tailwind (NativeWind)

```tsx
<View className="flex-1 bg-brand-dark">
  <Text className="text-brand-text">…</Text>
  <Text className="text-brand-muted">…</Text>
  <View className="border border-brand-border bg-brand-surface" />
  <Text className="text-brand-gold">…</Text>
</View>
```

Semantisch: `text-success`, `bg-warning/20`, `border-error`, usw.

## Assets (`apps/mobile/assets/images/`)

Aktuell noch **Expo/React-Default** — durch BarberGo-Branding ersetzen, wenn Logo final steht.

| Datei | Zweck | Empfohlene Größe |
|-------|--------|------------------|
| `icon.png` | App-Icon (iOS/Android Store) | 1024×1024 px |
| `splash-icon.png` | Splash (zentriert) | 200–400 px Breite (SVG/PNG mit Transparenz) |
| `favicon.png` | Web-Tab | 48×48 px (oder 32×32) |
| `android-icon-foreground.png` | Adaptive Icon Vordergrund | 1024×1024 px, sicherer Bereich ~66 % |
| `android-icon-background.png` | Adaptive Icon Hintergrund (optional) | 1024×1024 px, Vollfläche `#0F172A` |
| `android-icon-monochrome.png` | Android 13+ Monochrome | 1024×1024 px, einfarbig |

**Splash / Native:** Hintergrundfarbe in `app.json` → `#0F172A` (`expo-splash-screen`).

## Expo-Konfiguration

- `userInterfaceStyle`: `dark`
- Splash: `backgroundColor` `#0F172A` (light + dark)
- Android `adaptiveIcon.backgroundColor`: `#0F172A`

## Später (Phase 3+)

- Eigenes Logo auf Splash und `icon.png`
- Barber-Avatar in Profil (Storage), nicht unter `assets/images/`
