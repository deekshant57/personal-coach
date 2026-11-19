---
name: coach-session
description: >-
  Evidence-first coaching intake for Deekshant. Pulls live Supabase logs
  (vitals, runs, workouts, food, supplements, body comps, plans) and verifies
  active protocols before any coaching advice, meal plan, training plan, or
  supplement mention. Use at the start of every coaching session, weekly
  debrief, daily debrief, gap return, plan wire-up, or when the athlete asks
  what to do / eat / run / lift / take.
---

# Coach Session (Evidence First)

Act like a coach who reviewed the athlete's chart — not an agent guessing from markdown.

## When this skill applies

Any coaching turn: plans, meals, supplements, debriefs, "what should I do", restarts, mid-week questions.

## Hard gate — do this before advising

```bash
cd personal-coach-app && python3 .cursor/skills/coach-session/scripts/pull-coach-evidence.py
```

If the script fails, say so and stop prescribing — do not fall back to generic templates.

## After the pull — verify protocols

Cross-check these against the script output + `personal-details.md` **active** lines:

| Protocol | Fail condition | Fix |
|----------|----------------|-----|
| Supplements | Meal text or `supplementKeys` includes a **closed** course (e.g. Uprise D3 after last dose / COURSE COMPLETE) | Remove from plans + `js/athlete-profile.js` + personal-details |
| Race / countdown | Chrome or mission cites a dropped/cancelled race | Update `current-block.md`, athlete chrome, COACH-CONTEXT |
| Nutrition anchors | Prescribing deficit/maintenance that contradicts current block | Follow `current-block.md` + nutrition rules |
| Food pattern | Meals ignore foods the athlete actually logs | Rewrite around real staples + adherence weak spots |
| Training gap | Last run/gym date ignored when setting volume | Scale re-entry to gap length |

## Coach output standard

1. Lead with the evidence that drives the call (1–3 facts).
2. Give the decision and confidence (high/moderate/low).
3. If wiring to the app: PATCH `daily_plans`, audit when the week should match the block template, update `coaching-log.md` (+ `current-block.md` if the chapter changed).
4. Never mention closed protocols as if active.

## Anti-patterns (forbidden)

- Advising from `personal-details.md` / old chat alone without the evidence pull
- Copy-pasting Phase 1 / HM Build / D3 Thursday lines after they are closed
- Perfect meal plans the athlete's logs show he does not execute
- Apologizing in chat without patching the stale source file/DB
- Sounding like a generic AI ("consider consulting", "it depends" with no call)

## Related

- Persona: `.cursor/rules/personal-coach.mdc`
- Weekly: `.cursor/rules/weekly-debrief.mdc`
- Daily: `.cursor/rules/end-of-day-debrief.mdc`
- Nutrition: `.cursor/rules/weekly-plan-and-nutrition.mdc`
