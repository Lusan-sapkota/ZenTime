# ZenTime – Architecture Overview

## 📌 Purpose

ZenTime is a minimalist, distraction-free clock and stopwatch application designed with clarity and focus in mind. It supports dark/light themes, offline functionality, dual timezone view, and a Zen Mode that hides all UI except the time.

---

## 🏗️ Project Structure (Modular)

/ZenTime
├── /assets # Fonts, icons, static files
├── /components # Reusable UI components (ClockDisplay, Buttons, Toggles)
├── /screens # Main app screens (Clock, Stopwatch, Settings)
├── /contexts # Global contexts (ThemeContext, ZenModeContext)
├── /utils # Utility functions (time formatting, storage, etc.)
├── /constants # Color palettes, theme config, font sizes
├── /hooks # Custom hooks (useTime, useStopwatch, etc.)
├── App.tsx # Root of the app, providers + navigation
└── /docs # Project documentation (you’re reading this)

---

## 🧘 Feature Modules Breakdown

### 1. **Clock Module**

- Local time display (12h/24h toggle)
- Optional second timezone
- Custom `ClockDisplay` component
- Uses `dayjs` + `timezone` plugin
- Updates every second (or 500ms for smoothness)

### 2. **Stopwatch Module**

- Start/Stop/Reset
- Controlled via `useStopwatch` hook
- Uses `setInterval` and React state
- Accurate down to milliseconds

### 3. **Zen Mode**

- Global `ZenModeContext` controls UI visibility
- By default, Zen Mode is enabled
- Taps or gestures can temporarily reveal controls
- Smooth auto-hide via timeout

### 4. **Theme Support**

- `ThemeContext` handles light/dark/system themes
- Themes defined in `/constants/themes.ts`
- Integrated into `react-native-paper` provider
- Syncs with system appearance via `useColorScheme`

### 5. **Settings Screen**

- Toggle theme
- Toggle Zen Mode
- Toggle Keep Screen Awake (uses `expo-keep-awake`)
- Time format (12h/24h)
- Select second timezone (stores locally)

### 6. **Orientation Support**

- Handled via `expo-screen-orientation`
- Auto-layout for portrait/landscape
- Landscape = focused display (e.g. on a phone stand)

---

## 🧠 Global State & Contexts

- `ThemeContext`: tracks current theme, system preference, setter function
- `ZenModeContext`: controls whether UI is hidden or visible
- Stored with `AsyncStorage` or `expo-secure-store`

---

## 💡 Utilities

- `useTime()`: Hook to return current time (with optional timezone)
- `useStopwatch()`: Hook for stopwatch logic (start, stop, reset, time elapsed)
- `formatTime()`: Converts milliseconds into HH:MM:SS:MS
- `storage.ts`: Saves/loads user preferences (theme, time format, etc.)

---

## 🔌 Native Modules

| Feature          | Module              |
|------------------|---------------------|
| Keep Awake       | `expo-keep-awake`   |
| Orientation Lock | `expo-screen-orientation` |
| Font Support     | `@expo-google-fonts/inter` |
| Offline Clock    | Native `Date()` + `dayjs` |
| World Clock      | `dayjs/plugin/timezone` (fallbacks gracefully offline) |

---

## 🔄 Navigation

- Stack or Bottom Tab via `react-navigation`
- `ClockScreen.tsx`
- `StopwatchScreen.tsx`
- `SettingsScreen.tsx`

---

## 📈 Performance Considerations

- Minimal re-renders (memoized components)
- Update intervals set efficiently (`setInterval`)
- Avoid unnecessary context updates (split Zen/Theme contexts)

---

## 🔜 Post-MVP Ideas (Optional Modules)

- Breathing timer / focus mode
- Ambient background sounds (rain, wind, white noise)
- Pomodoro mode (work cycles)
- Analytics for personal time use
- Sync/export logs (if needed)

---

## 🧘 Final Words

ZenTime is not just a time tool — it’s a **mindset**.  
This architecture prioritizes calm, control, and clarity — both for the **user experience** and the **codebase**.

Keep building with flow. Adjust and evolve this doc as the system grows.
