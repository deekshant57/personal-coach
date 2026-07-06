# Design System Improvements

**Date:** 02 July 2026
**Status:** Proposed. Not yet implemented.

---

## 1. New Components

### 1.1 Compressed Summary Line

A single-line summary of a completed logging section. Appears after save, replacing the expanded form.

```
check 77.4 kg - 6.8h - 3 cigs
```

- Height: 44px total (16px padding top/bottom + 12px text)
- Font: 14px, 500, `--text-secondary`
- Background: `--bg-summary` (new token)
- Left icon: green checkmark
- Tap target: entire line is tappable to re-expand
- Accessibility: `role="button"`, `aria-expanded="false"`, keyboard Enter to expand

**Priority: High Impact / Medium Effort**

### 1.2 Coaching Observation Block

A tinted card that surfaces Level 1 or Level 2 observations when a meaningful event triggers (see `IMPLEMENTATION-ROADMAP.md` Sprint 5 — `js/observation-engine.js`). **Not shown on quiet, on-plan days** (Product Bible S11).

```
"Cadence 148 -- 2 away from target. Knee clear."
```

- Background: `--bg-insight` (new token: 8% accent-green mixed with bg-card)
- Font: 15px, 400, normal case, `--text`, line-height 1.5
- No title. No icon. Just text.
- Appears with 250ms fade-in, 200ms delay after the triggering save
- Accessibility: `role="status"`, `aria-live="polite"`

**Priority: High Impact / Medium Effort**

### 1.3 Sparkline

Reusable SVG sparkline for the Trends screen.

**Inputs:**
```
data:        [{date, value}]
targetLine:  number | null     // e.g., 7 for sleep, 150 for cadence
targetLabel: string | null     // e.g., "floor: 7h"
delta:       computed           // {from, to, direction}
unit:        string            // "kg", "h", "/km", ""
days:        number            // lookback window
```

**Visual spec:**
- SVG, 100% width, 64px height
- `viewBox="0 0 100 100"`, `preserveAspectRatio="none"`
- Data line: `--accent-blue`, 1.5px stroke, no fill
- Target line: dashed, `--text-hint`, 1px
- Delta badge: 13px, 600 weight. Green if improving (direction-aware: weight/cigs down = green, cadence/sleep up = green)
- Min/max Y labels: 11px, `--text-muted`
- Target label: 11px, `--text-hint`
- Accessibility: `aria-label` with descriptive text (e.g., "Weight trend: 78.5 to 77.4 kg over 56 days, goal 73.5 kg")

**Priority: High Impact / Medium Effort** (one component, reused 6+ times)

### 1.4 Compliance Strip

A row of day indicators showing target adherence.

```
check check x check check check x check check check check x check check   12/14 days
```

- Each indicator: 8px circle or 12px character
- Green for on-target, `--text-muted` for off-target
- Count label at end: 13px, `--text-secondary`
- Row is not interactive

**Priority: Low Impact / Low Effort**

### 1.5 Skeleton Loader

Shimmer bars matching content dimensions. Replaces the broken spinner for inline loading.

- Rectangular bars with `--border` background
- Shimmer gradient animation: `--border` to `--border-light` and back, 1.5s ease-in-out infinite
- Widths match expected content (60% for titles, 40% for values, 100% for sparklines)
- No text during loading — pure visual placeholder

**Priority: High Impact / Low Effort**

### 1.6 "Same As" Banner

Dismissible banner on the Food screen showing previous day's slot contents.

```
+-------------------------------+
| Yesterday's lunch:            |
| 2x Eggs, 1x Chapati, Curd    |
| [Use same]     [Dismiss]      |
+-------------------------------+
```

- Background: `--bg-card`
- Border: 1px `--border`
- Border-radius: `--radius-sm`
- "Use same" button: `btn-primary` style
- "Dismiss" button: `btn-secondary` style or text-only link
- Only appears if yesterday's same slot has logged items
- Dismissed state persists for that slot (session only, not localStorage)

**Priority: High Impact / Medium Effort**

---

## 2. Existing Component Modifications

### 2.1 Progress Chip (day-progress strip)

**Change:** Add `role="listitem"` to each chip. Wrap strip in `role="list"`.
**Priority:** Low Impact / Low Effort

### 2.2 Supplement Toggle

**Change:** Move from isolated card on Today tab into Coach screen section. Same DOM structure, different parent container. Show D3 as dimmed with hint text on non-Thursdays ("D3: Thu") instead of hiding entirely.
**Priority:** High Impact / Low Effort

### 2.3 RPE Slider

**Change:** Initialize without a value. Slider starts at center visually but value label shows "--" until touched. `validateRunLogForDone` and `validateWorkoutLogForDone` add "RPE not set" as a blocking error.
**Priority:** High Impact / Low Effort

### 2.4 Toast

**Changes:**
- Add `role="alert"` to `#toast` element
- Increase duration from 2000ms to 2500ms
- Restore fade transition (200ms ease-out appear, 200ms ease-in dismiss)
- Error variant: red-tinted background, stays for 3500ms

**Priority:** High Impact / Low Effort

### 2.5 Protein Bar (Header)

**Change:** Un-hide `#calorie-current`. Display format: `94g P - 1,420 kcal / 150g - 2,100`.
**Priority:** High Impact / Low Effort

### 2.6 Day Badge

**Change:** None. Keep current design. It works.

---

## 3. Typography

| Token | Current | Proposed | Reason |
|---|---|---|---|
| Section title | 14px, 600, uppercase, 0.5 tracking | 13px, 600, uppercase, 0.6 tracking | Slightly smaller, tighter rhythm |
| Coaching observation | N/A | 15px, 400, normal case, `--text`, line-height 1.5 | Reads as prose, distinguishable from UI |
| Compressed summary | N/A | 14px, 500, `--text-secondary` | Recessive, doesn't compete with active sections |
| Delta badge | N/A | 13px, 600, colored | Quick scan of direction |
| Day brief | 15px, 600, `--accent-green` | Keep | Already the strongest element |

---

## 4. Spacing

| Token | Current | Proposed | Reason |
|---|---|---|---|
| Card padding | 16px | Keep | Works |
| Section gap on Coach | 12-16px (mixed utilities) | 16px standardized | Consistent rhythm |
| Compressed summary height | N/A | 44px (16px padding + 12px text) | Tap-friendly, compact |
| Sparkline container height | 72px (weight only) | 64px standardized | Consistent across all sparklines |

---

## 5. Color

### Existing Palette (no changes)
- `--bg: #0a0a0a`
- `--bg-card: #1a1a1a`
- `--accent-green: #4ade80`
- `--accent-blue: #60a5fa`
- `--accent-orange: #fb923c`
- `--accent-teal: #2dd4bf`
- `--accent-amber: #fbbf24`
- `--accent-red: #f87171`

### New Tokens

| Token | Value | Use |
|---|---|---|
| `--bg-insight` | `color-mix(in srgb, var(--accent-green) 8%, var(--bg-card))` | Observation block background |
| `--bg-summary` | `color-mix(in srgb, var(--text) 4%, var(--bg))` | Compressed summary line background |

---

## 6. Animation System

### Critical Fix: Remove Global Animation Kill

**Delete** lines 2931-2938 in `style.css`:
```css
/* DELETE THIS */
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  scroll-behavior: auto !important;
}
```

**Replace with:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

This respects OS-level motion preference while restoring all animations for normal use.

**Priority: High Impact / Low Effort** (CSS-only, 8 lines deleted, 6 added)

### Animation Durations

| Animation | Duration | Easing | Notes |
|---|---|---|---|
| Spinner rotation | 0.8s | linear infinite | Currently dead. Must restore. |
| Toast appear | 200ms | ease-out | Fade + scale(0.92 -> 1) |
| Toast dismiss | 200ms | ease-in | Fade out |
| Section compress/expand | 200ms | ease-in-out | Crossfade fields <-> summary |
| Protein bar fill | 300ms | ease-out | Width transition |
| Observation fade-in | 250ms, 200ms delay | ease-out | Appears after save completes |
| Modal slide up | 250ms | ease-out | translateY(100% -> 0) |
| Collapsible expand | 250ms | ease-in-out | max-height + opacity |
| Save success flash | 200ms | ease-out | Green border/icon flash |
| Button loading state | Instant | none | No transition needed |

---

## 7. Responsive Improvements

| Change | Priority |
|---|---|
| **Reduce fixed chrome height** — Move progress strip into Coach screen body. Header becomes: protein bar + date nav = ~94px (was ~130px). | High Impact / Medium Effort |
| **Food grid cells: min-height 110px -> 80px** — Emoji inline, cells shorter. More items visible. | High Impact / Low Effort |
| **Plan compact rows** — All 7 days visible in ~350px without scrolling. | High Impact / Medium Effort |
| **Remove `user-scalable=no`** — Allow pinch zoom. One attribute deletion. | High Impact / Low Effort |

---

## 8. Accessibility Improvements

Prioritized by daily impact:

| # | Change | Priority |
|---|---|---|
| 1 | **Restore spinner animation** (see Animation section) | High Impact / Low Effort |
| 2 | **Remove `user-scalable=no`** from viewport meta | High Impact / Low Effort |
| 3 | **Add `role="alert"` to toast** | High Impact / Low Effort |
| 4 | **Add `aria-live="polite"` to observation block** | High Impact / Low Effort |
| 5 | **Focus trap in modals** (custom food, dirty slot) | Medium Impact / Medium Effort |
| 6 | **Knee segment colors visible in inactive state** — faint color tint per severity | Low Impact / Low Effort |
| 7 | **Add `aria-label` to bottom nav** — `<nav aria-label="Main navigation">` | Low Impact / Low Effort |
| 8 | **Alt text on sparkline SVGs** | Low Impact / Low Effort |
| 9 | **RPE slider: `aria-describedby`** association | Low Impact / Low Effort |
