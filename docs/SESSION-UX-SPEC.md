# Session UX Spec — Floor / Close / Memory

**Version:** 1.0  
**Date:** 18 Nov 2026  
**Status:** Implemented for friends invite gate  
**Parents:** `PRODUCT-BIBLE.md`, `docs/FRIENDS-PRODUCT-SPEC.md`  
**Related:** `js/session-player.js`, `js/today.js`, `js/workout-log.js`

---

## 1. Product contract

**Tracker on the surface. Athletic memory in the substrate.**

| Mode | When | Athlete sees |
|------|------|----------------|
| **Memory** | Default Today | Plan directive, vitals, meals, **Start / Resume session**, one-line session summary after close — not the live set grid |
| **Floor** | Active gym or run session | Focused logging only (sets or run fields), rest timer (gym), directive that collapses after first set, no Food/Plan/nav chrome |
| **Close** | Finish tapped | Optional “Anything for coach?” chips + note → written into session notes → Mark Done → back to Memory |

The app **informs and stores**. Close chips are athlete communication for future coaching — **not** in-app AI advice (Product Bible §3 / §21).

---

## 2. Entry / exit

1. Training day on Today → Memory card shows **Start session** (or **Resume** / **Edit** if log exists).  
2. Start → `body.session-floor-active` → Floor bar + training fields.  
3. Finish → Close panel → Save & close → validates via existing Done rules → Memory summary.  
4. Exit abandons Floor without forcing Done (autosave may still have partial data).

---

## 3. Gym Floor

- Reuses `exercises_json` + `workout-log.js` (last performance prefill unchanged).  
- Rest timer (default 90s, +15s / Skip) after a set is marked done.  
- Screen wake lock while Floor is active (best-effort).  
- No streaks, PR theater, or share cards.

## 4. Run Floor

- Same shell; run fields only (km, time, pace, cadence, RPE).  
- Knee segmented control only if `showKneeTracking` (coached athletes / explicit flag).  
- Plan labels never show `null km` — use `formatRunPlanLabel`.

## 5. Close hinge → memory

Chips (elbows, knees, low energy, cut short, felt easy, skipped accessories) + free note append to `run_logs.notes` or `workout_logs.notes` as:

`Coach notes: …`

Today Memory line uses `formatWorkoutSessionSummary` / run distance·time·pace.

---

## 6. Non-goals

- openGym parity (watches, plate math, 5k exercises, AI plan writer)  
- Full Coach state-machine from `SCREEN-SPECS.md`  
- Social / streaks / badges  
- Requiring Cursor Coach Skill for friends  

---

## 7. Invite gate (with Track A)

A stranger can: pick Gym/Run/Hybrid → set targets → Start → Floor → Close → see Memory summary and Progress, without hand-holding.
