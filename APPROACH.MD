# 🧘‍♂️ ZenTime – APPROACH Specification

> **A minimal, immersive clock & stopwatch experience focused on clarity, calm, and complete presence.**

---

## Core Philosophy

* **Distraction-free by default**: Zen Mode is always on.
* **Minimal but powerful**: Simple features that do one thing well.
* **Sleek design, soothing UI**, and always ready — even offline.

---

## 🔧 Tech Stack

| Feature         | Stack                                  |
| --------------- | -------------------------------------- |
| Framework       | Expo SDK (React Native)                |
| UI Kit          | `react-native-paper` (Material Design) |
| Fonts           | `@expo-google-fonts/inter`             |
| Orientation     | `expo-screen-orientation`              |
| Keep Awake      | `expo-keep-awake`                      |
| Offline support | Built-in (no external dependencies)    |
| Timezones       | `dayjs` + `dayjs/plugin/timezone`      |

---

## Main Screens

### 1. **Clock Screen**

* Local time (HH\:MM\:SS) in large, centered digits
* Optional secondary timezone (world clock)
* Toggle for 12h / 24h display
* Zen Mode = full screen, nothing but the clock
* Tap to reveal hidden controls (e.g., switch modes, access settings)

### 2. **Stopwatch Screen**

* Start / Stop / Reset controls
* Large digit display
* Precision down to milliseconds
* Responsive layout: fits both portrait and landscape

### 3. **Settings Panel**

Accessible via hidden menu or swipe/gesture/FAB:

* Toggle Theme: Light / Dark / System Default
* Toggle Zen Mode: On / Off
* Enable Keep Screen Awake (uses `expo-keep-awake`)
* Select Time Format: 12h / 24h
* Choose Secondary Timezone (if online)

---

## UI & Design: Calm & Focused

### Color Palette Name: **“Dawn Mist”**

#### 🌤 Light Theme

| Element            | Color                     |
| ------------------ | ------------------------- |
| Background         | `#F7F8FA` (Mist White)    |
| Clock Text         | `#1F2937` (Slate Gray)    |
| Accent             | `#A3C4F3` (Cool Sky Blue) |
| Secondary          | `#F2D0A4` (Soft Apricot)  |
| Button Background  | `#E5E7EB` (Cloud Gray)    |
| Divider/Muted Text | `#9CA3AF` (Muted Gray)    |

#### 🌘 Dark Theme

| Element            | Color                       |
| ------------------ | --------------------------- |
| Background         | `#121212` (Charcoal Black)  |
| Clock Text         | `#E5E7EB` (Cloud Gray)      |
| Accent             | `#A3C4F3` (Cool Sky Blue)   |
| Secondary          | `#A78BFA` (Lavender Purple) |
| Button Background  | `#1F2937` (Deep Slate)      |
| Divider/Muted Text | `#6B7280` (Muted Slate)     |

#### Typography

* Font: `Inter` from `@expo-google-fonts`
* Clock digits: 64pt–96pt depending on orientation
* Button labels: 16pt
* High contrast, no serif, round letterforms

---

## Orientation & Responsiveness

* Fully supports both **portrait** and **landscape**
* Uses `expo-screen-orientation` to handle layout switches
* Landscape Mode:

  * Clock spans full width
  * Ideal for desk/stand usage
* Auto-layout adjusts paddings, font sizes, element positions

---

## Offline & Performance

* App runs entirely offline
* Local clock and stopwatch work without connection
* World clock: data saved once selected when online
* All assets and fonts preloaded

---

## Native Features

* **Stay Awake Mode** via `expo-keep-awake`

  * Prevents screen dimming/sleep while app is in foreground
  * User controlled via toggle

---

## Zen Mode (Always On by Default)

* Entire UI focuses only on what matters:

  * The time.
* Controls auto-hide (can be revealed by tap)
* When off:

  * Additional minimal controls stay visible
  * Useful for more active interaction, e.g. stopwatch use

---

## Theme Switching Logic

| Option         | Description                            |
| -------------- | -------------------------------------- |
| Light          | Uses "Dawn Mist" Light colors          |
| Dark           | Uses "Dawn Mist" Dark colors           |
| System Default | Matches OS-level setting automatically |

---

## Future-Proofing (Post-MVP Ideas)

| Feature                            | Status   |
| ---------------------------------- | -------- |
| Ambient Sound Loops (rain, forest) | Future   |
| Breathing/Focus Timer Overlay      | Future   |
| ZenTime Pro (paid themes, widgets) | Optional |
| Full Pomodoro Integration          | Optional |
| Haptic Feedback on controls        | Optional |

---

## MVP Deliverables

| Module                      | Status        |
| --------------------------- | ------------- |
| Clock View                  | ✅ MVP         |
| Stopwatch View              | ✅ MVP         |
| World Clock Selection       | ✅ MVP (basic) |
| Theme Support               | ✅ MVP         |
| Zen Mode                    | ✅ MVP         |
| Screen Awake                | ✅ MVP         |
| Orientation Handling        | ✅ MVP         |
| Offline Clock Functionality | ✅ MVP         |
| Settings Panel              | ✅ MVP         |

---

## Developer Notes

* Prefer React Context for theme & zen mode state
* Store preferences (theme, zen mode, keep awake) using `expo-secure-store` or `AsyncStorage`
* Time updates every 500ms or less using `setInterval` + `useEffect`
* Keep re-renders minimal: avoid expensive layout calculations

---

## Summary

> ZenTime is your **personal space for clarity, focus, and flow**.
> In 2 hours, you can build the foundation of a **timeless time tool** — built for creators, thinkers, and calm seekers.
