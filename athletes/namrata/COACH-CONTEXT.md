# Coach Context — Namrata

Separate coaching workspace for **Namrata** (physique / get-fit · gym strength + cardio).

**Not** Deekshant’s HM hybrid path. Open files under `athletes/namrata/` when coaching her.

**Supabase user ID:** `9e6a0d55-b63f-4857-b318-122e0c337ef4`  
**App login:** namu150595@gmail.com

## File map

| File | Purpose |
|------|---------|
| `personal-details.md` | Athlete profile — confirmed metrics, goals, lifestyle |
| `coach/coaching-log.md` | Coaching decision history |
| `coach/current-block.md` | Active training block + weekly template |
| `coach/week-plans.py` | Empty stub — **DB is source of truth** |
| App (same PWA) | Daily logging; data isolated by `user_id` via RLS |

## Plan source of truth

**Supabase `daily_plans`** for her `user_id`. Do not store live weeks in `week-plans.py`.

After writing Week N+1:

1. PATCH `daily_plans` in Supabase
2. Confirm the week in the app Week tab

```bash
# Do NOT seed empty WEEK_PLANS over her DB:
# python3 seed-plans.py --user-id 9e6a0d55-... --plans athletes/namrata/coach/week-plans.py
# → refused (WEEK_PLANS empty) — by design
```

## Coaching stance

* Beginner · Fitworld only · 6 training days/week · strength + cardio · **no running**
* Weekly template: **Mon Upper · Tue Lower · Wed Cardio+Core · Thu Easy cardio (fast) · Fri Upper · Sat Lower · Sun Rest**
* No back-to-back upper compound days; Thu fast stays cardio-only
* Sunday always Rest (gym closed)
* Goal window: ~3–4 months (late Oct – late Nov 2026)
* Physique: leaner waist, fuller hips/glutes, toned arms, overall muscle
* Eggetarian · whey ON Gold Standard isolate · Thu: milk/fruit/dry fruit/whey; chapati/dal/veg at dinner only
* Nutrition anchors: training ~1,800 / 100g · Thu ~1,450 / 90g+ · rest ~1,650 / 95g+
* App: Workout log only — do not use Run
* UI chrome is per signed-in user (`js/athlete-profile.js`)

## Artifact relationships

Deekshant’s `.cursor/rules/*.mdc` (HM, race, knee, run cadence) do **not** apply by default. Prefer this folder’s `personal-details.md` + `current-block.md` + `coaching-log.md` as authority for Namrata.
