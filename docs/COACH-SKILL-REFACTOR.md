# Coach Skill Refactor

**Date:** 02 July 2026
**Status:** In progress
**Authority:** Personal Coach Product Bible v1.0

This document records every decision made during the Coach Skill refactor. Each phase builds on the previous. No phase is skipped.

---

## Phase 1 — Validated Review

An independent design review scored the Coach Skill 3/10 for Product Bible alignment. This phase evaluates every recommendation from that review, accepting, modifying, or rejecting each one against the Product Bible as final authority.

---

### Critical Recommendations

#### C1. Implement a coaching memory system

**Decision:** Accept

The review's strongest and most correct finding. Product Bible S4.4 is unambiguous: "Every coaching session should build on previous ones. It should never behave like a fresh coach starting from zero." S17.3 calls coaching history "the most irreplaceable data." The Coach Skill currently has no mechanism to read or reference previous coaching decisions, their outcomes, or accumulated insights. Without this, the system fails the Product Bible's own failure test (S20.2).

**Product Bible support:** S4.4, S17.1, S17.3, S17.4, S20.2
**Expected impact:** Transforms the Coach Skill from stateless report generator to evolving coaching intelligence.

---

#### C2. Remove the fixed priority hierarchy

**Decision:** Accept with modification

The review is right that Product Bible S6.2 says "There is no fixed hierarchy." The hardcoded priority order violates this.

However, the review goes too far. The Product Bible does not say priorities are unknowable — it says they are situational. Right now, with a race on 6 Sep 2026, HM performance IS the primary priority. That is not a rule violation — it is a current coaching judgment. The problem is not that the Coach Skill has priorities. The problem is that it presents them as permanent rather than current.

**Modification:** Keep the current priorities as the default stance for this training block, not as a permanent hierarchy. Require the coach to explicitly re-evaluate priorities when evidence conflicts (e.g., injury threatening long-term health vs race goal) and state which priority is being favored and why.

**Product Bible support:** S6.2, S16.1
**Expected impact:** Enables situational trade-off resolution without losing the clarity of having a current primary goal.

---

#### C3. Replace generic recovery scores with contextual recovery assessment

**Decision:** Accept with modification

The review is right that Product Bible S13 forbids a generic recovery score. But the recommendation to remove recovery from the scoring system entirely throws away useful signal.

The problem is not scoring recovery. The problem is scoring it without context. "Recovery: 6/10" is meaningless. "Recovery relative to tomorrow's 14km long run: insufficient — sleep deficit of 3 nights plus yesterday's leg session" is genuine coaching.

**Modification:** Keep recovery assessment but always state it relative to the next planned training demand. Not a number. A judgment: sufficient / marginal / insufficient for [specific upcoming session], with evidence.

**Product Bible support:** S13
**Expected impact:** Recovery assessments become actionable coaching instead of abstract ratings.

---

### High Recommendations

#### H1. Implement training block awareness

**Decision:** Accept

Product Bible S16 is an entire section dedicated to training blocks. S16.4: "The current training block is the primary context for everything." The Coach Skill has zero training block concept. This is a structural gap, not a minor omission.

**Product Bible support:** S16.1, S16.2, S16.3, S16.4, Core Principle #10
**Expected impact:** Coaching reasoning gains a temporal frame larger than "this week vs last week."

---

#### H2. Restructure nutrition from prescription to awareness

**Decision:** Reject

This is where the review makes its most significant error.

The review says: "Remove daily meal prescriptions from the weekly plan." It cites Product Bible S14.2: "The app isn't telling the athlete what to eat."

But S14.2 restricts the APP, not the Coach Skill. Product Bible S4.2 explicitly says coaching recommendations include: "Add 200 calories on gym days." The Coach Skill IS the place where specific nutritional recommendations belong. That is its entire purpose — to make judgments the app cannot.

The distinction the Product Bible makes:

- **App:** awareness ("Protein: 82g / 150g. Two meals remaining.")
- **Coach Skill:** recommendations ("Increase protein to 160g this week because body comp shows muscle loss")

The Coach Skill prescribing meal structures and calorie targets is not a violation — it is the Coach Skill doing its job. Deekshant does not count macros; the coach does. Removing meal guidance would make the system less useful.

What IS valid: the coach should explain why it prescribes specific targets when they change, and should evaluate adherence patterns rather than daily compliance. But the meal plan itself stays.

**Product Bible support:** S4.2, S14.3 (Coach evaluates long-term adherence)

---

#### H3. Add uncertainty and confidence to recommendations

**Decision:** Accept

Product Bible S19.2 requires confidence levels. S6.5 demands honesty. The Coach Skill currently expresses blanket certainty in every recommendation. This is a trust issue.

**Product Bible support:** S19.1, S19.2, S6.5
**Expected impact:** Athlete can calibrate how much weight to give each recommendation.

---

#### H4. Reframe "DEVIATIONS" as "DECISIONS AND ADAPTATIONS"

**Decision:** Accept with modification

The review is partly right. Product Bible S5.3 says athlete overrides are "often the most valuable learning opportunities." Treating all departures as defects is wrong.

But the review overcorrects. Some deviations ARE genuine misses — skipped workouts due to poor planning, missed protein targets due to inattention. These should be named honestly (Product Bible S6.5: bad news delivered honestly). The framing should distinguish between:

- **Athlete decisions** (deliberate departures — coaching data)
- **Unplanned misses** (things that went wrong — require root cause)

Both deserve honest treatment. Neither should be whitewashed.

**Modification:** Rename to "PLAN vs ACTUAL" — neutral framing. Within it, distinguish athlete decisions from unplanned misses. Record athlete decisions as coaching history. Analyze unplanned misses for root causes.

**Product Bible support:** S5.3, S6.5, S6.3
**Expected impact:** Better data about why departures happened. Athlete override decisions become part of coaching history.

---

### Medium Recommendations

#### M1. Allow flexible output structure

**Decision:** Accept with modification

Structured reports have real value — they prevent the coach from forgetting important areas (knee check, cadence, nutrition adherence). The Product Bible does not prohibit structure; it prohibits structure that constrains the coaching message.

**Modification:** Keep the structured sections as a checklist of topics to address, not as a fixed output order. The most urgent coaching issue leads. Sections with nothing meaningful to report can be brief or merged. The structure serves the message rather than the message serving the structure.

**Product Bible support:** S12.2 (concise, says what needs to be said without padding)
**Expected impact:** Reports become coaching-led rather than template-led while maintaining completeness.

---

#### M2. Add gap handling protocol

**Decision:** Accept

Product Bible S18.2 explicitly requires this. The Coach Skill has nothing. Clear gap.

**Product Bible support:** S18.2
**Expected impact:** Athlete never feels punished for returning after a break.

---

#### M3. Implement meaningful events detection

**Decision:** Accept with modification

Product Bible S10 describes the meaningful events framework extensively. But this is primarily the APP's responsibility (S10 is about what the app surfaces). The Coach Skill's responsibility is interpreting those events (S10.5: "The Coach Skill is responsible for answering 'Why did this happen?' and 'What should we do next?'").

**Modification:** The Coach Skill should identify and interpret meaningful events in its analysis, but the detection system belongs in the app. The coach should name patterns, progressions, stagnations, and milestones when it sees them — and interpret their significance.

**Product Bible support:** S10, S10.5
**Expected impact:** Coach explicitly names what matters rather than burying insights in metric tables.

---

#### M4. Consolidate duplicated rules

**Decision:** Accept

Duplication creates divergence risk. `personal-details.md` should own athlete values. Coaching rules should live in coaching prompts. No overlap.

**Product Bible support:** General engineering principle; S8.2 (single source of truth)
**Expected impact:** Eliminates conflicting instructions.

---

### Low Recommendations

#### L1. Remove system architecture from coaching prompts

**Decision:** Accept with modification

The review is right that "Relationship to other artifacts" tables are developer documentation. However, some of this information IS needed by the coaching LLM to know what to do after issuing a plan (sync to Supabase, archive reports). These are workflow instructions, not coaching instructions.

**Modification:** Move artifact relationship tables to `COACH-CONTEXT.md`. Keep only the workflow steps the coach needs to execute (plan sync, debrief archive) in the coaching prompts, as brief action items rather than documentation tables.

**Product Bible support:** Prompt efficiency
**Expected impact:** Reduces token waste without losing necessary workflow steps.

---

#### L2. Replace hardcoded calorie/mileage tables with principles

**Decision:** Reject

Principles without numbers are useless for practical coaching. "Increase run-day calories proportional to weekly volume" tells the coach nothing actionable. +100 kcal when crossing 25km/week is actionable.

The tables should be treated as current guidelines that get updated when athlete parameters change (which is already handled by body-comp.mdc's deficit taper rules). The solution is to date-stamp the tables and trigger recalculation at body comp milestones, not to remove the numbers.

**Product Bible support:** S4.2 (Coach makes specific recommendations)

---

#### L3. Add race-proximity adaptation framework

**Decision:** Accept

With a race on 6 Sep 2026, the Coach Skill needs to reason differently at 10 weeks out vs 3 weeks out vs race week. Currently there is no taper, peak, or race-week protocol. This is a genuine gap.

**Product Bible support:** S4.3 (long-term evaluation), S16.1 (block goals)
**Expected impact:** Coach can guide the athlete through the final training phases intelligently.

---

### Review Findings Challenged

#### The 3/10 alignment score is too harsh.

The Coach Skill has deep, athlete-specific domain knowledge. It tracks the right metrics. It enforces the right nutritional constraints. It monitors the knee. It respects the race timeline. It computes macros the athlete will not compute himself. The coaching voice is honest and direct. These are not small achievements.

The missing pieces (memory, blocks, situational priorities, confidence) are significant architectural gaps. But the domain content is strong. A fairer assessment: solid domain expertise in a framework that does not yet support the Product Bible's evolutionary requirements.

#### Daily plan revisions do not violate the Product Bible.

The review cites S15.2 ("Changes happen through the coaching process") and argues that Section 4 of the daily debrief ("REVISED TOMORROW") violates this. But the daily debrief IS the coaching process. The Coach Skill is the coaching layer. When it says "reduce tomorrow's load because today's data shows inadequate recovery," that IS coaching through evidence — not an emotional mid-workout change.

The Product Bible warns against the athlete unilaterally changing the plan on a whim. It does not prohibit the Coach Skill from adapting the plan based on new evidence. That is literally the coach's job.

#### Scoring is not inherently false precision.

Scores are a communication tool. A coach who says "Training: 8/10, Nutrition: 5/10" is communicating relative performance across dimensions quickly. The problem is not scores — it is scores without criteria. The solution is to define what the scores mean, not to eliminate them.

---

### Summary of Decisions

| ID | Recommendation | Decision |
|----|----------------|----------|
| C1 | Coaching memory system | Accept |
| C2 | Remove fixed priority hierarchy | Accept with modification |
| C3 | Contextual recovery assessment | Accept with modification |
| H1 | Training block awareness | Accept |
| H2 | Nutrition from prescription to awareness | Reject |
| H3 | Uncertainty and confidence | Accept |
| H4 | Reframe deviations | Accept with modification |
| M1 | Flexible output structure | Accept with modification |
| M2 | Gap handling protocol | Accept |
| M3 | Meaningful events detection | Accept with modification |
| M4 | Consolidate duplicated rules | Accept |
| L1 | Remove architecture from prompts | Accept with modification |
| L2 | Replace tables with principles | Reject |
| L3 | Race-proximity framework | Accept |

**Accepted:** 5
**Accepted with modification:** 5
**Rejected:** 3

---

---
---

## Phase 2 — Required Architectural Changes

This phase separates what needs new files and systems from what needs prompt rewording. Architecture first. Prompts later.

---

### Current Architecture

The coaching system today consists of:

| Component | Location | Role |
|-----------|----------|------|
| `personal-coach.mdc` | `.cursor/rules/` | Coach identity and persona |
| `end-of-day-debrief.mdc` | `.cursor/rules/` | Daily debrief protocol (5 sections) |
| `weekly-debrief.mdc` | `.cursor/rules/` | Weekly debrief protocol (8 sections) |
| `weekly-plan-and-nutrition.mdc` | `.cursor/rules/` | Nutrition rules and plan format |
| `body-comp.mdc` | `.cursor/rules/` | Body composition scan interpretation |
| `personal-details.md` | project root | Static athlete profile |
| `COACH-CONTEXT.md` | project root | Workflow documentation |
| `coach/week-plans.py` | `coach/` | Plan data synced to Supabase |
| `save-weekly-debrief` skill | `.cursor/skills/` | Archive reports to Supabase |

**What exists:** Strong domain knowledge, structured output formats, athlete-specific data, workflow automation.

**What is missing:** Memory between sessions, training block awareness, decision history, scoring criteria, gap handling, race-phase reasoning.

---

### Architecture Change 1 — Coaching Log

**Why:** Product Bible S4.4, S17.3, S17.4. The coach must build on previous sessions.

**What:** A file that accumulates coaching decisions and their outcomes across sessions.

**File:** `coach/coaching-log.md`

**Structure:**

```markdown
# Coaching Log

Append-only record of coaching decisions. The coach reads this before every session.
Entries are added after each weekly debrief. Daily debriefs do not write here
unless a significant mid-week decision is made.

## Format per entry

### [Date] — [Session type: Weekly Debrief / Mid-week Decision]

**Context:** What prompted this decision (evidence, events, athlete input)
**Decision:** What was recommended
**Athlete response:** Accepted / Rejected / Modified — with reason if given
**Outcome:** [Added later when evidence is available] What actually happened
**Insight:** [Added later] What this taught us about this athlete
```

**How it works:**
- Coach reads `coaching-log.md` at the start of every session (added to "Read first" instruction)
- After each weekly debrief, the coach appends new decisions to the log
- Outcomes and insights are filled in during subsequent sessions when evidence is available
- The athlete can note acceptance/rejection/modification during the session

**What this is NOT:**
- Not a full debrief archive (that is `coach_debriefs` in Supabase via `save-weekly-debrief`)
- Not deliberation (Product Bible S6.3 — no chain-of-thought reasoning stored)
- Only decisions, outcomes, and accumulated insights

**Maintenance:** The coach reviews and prunes the log during training block transitions. Closed-out decisions with recorded outcomes and insights can be summarized when the log exceeds ~200 lines.

---

### Architecture Change 2 — Current Training Block

**Why:** Product Bible S16.1, S16.4. The current block is the primary context for everything.

**What:** A file that defines the active training block — its goal, parameters, phase, and context.

**File:** `coach/current-block.md`

**Structure:**

```markdown
# Current Training Block

## Block identity
- **Name:** HM Build — Base Phase
- **Goal:** Build aerobic base, establish running consistency, lose initial fat
- **Started:** 22 Jun 2026
- **Projected end:** [date or condition, e.g., "when weekly mileage reaches 30km consistently"]
- **Week:** 2 of estimated 4–5

## Current priorities (for this block)
1. Half marathon preparation — aerobic base building
2. Fat loss — 0.5 kg/week target
3. Muscle reactivation — bodyweight only, preserve lean mass

These priorities are the current coaching stance. They can be re-evaluated
when evidence conflicts (injury, body comp changes, stagnation).

## Block parameters
- Weekly mileage target: 12–20 km (progressive)
- Long run target: progress from 5 km toward 8–10 km
- Strength: bodyweight only, no gym
- Nutrition: deficit 15–18%, protein floor 140–150g
- Key constraints: knee monitoring, cadence building (142 → 150+)

## What success looks like for this block
- Running 4x/week consistently
- Long run reaching 8–10 km without knee issues
- Cadence improving toward 148–150
- Weight trending down (~0.5 kg/week)
- Sleep averaging 7h+

## Race timeline context
- Race: 6 Sep 2026
- Weeks to race: [calculated]
- Current phase: Base (of Base → Build → Peak → Taper)
```

**How it works:**
- Coach reads `current-block.md` at the start of every session
- Weekly debriefs evaluate progress relative to the block, not just the prior week
- When a block ends, the coach writes a block retrospective to the coaching log and creates a new block file
- Block transitions are deliberate coaching acts (Product Bible S16.3)

**What this solves:**
- Coach can reason about "where we are" in a larger arc than this-week-vs-last-week
- Race-proximity reasoning is built in (weeks to race, phase identification)
- Priorities live here instead of hardcoded in the persona prompt — they can evolve

---

### Architecture Change 3 — Score Criteria

**Why:** Phase 1 finding — scores are valid but need defined criteria. Without criteria, the same data could score 6/10 or 8/10 depending on the session.

**What:** Defined rubrics for Training, Nutrition, and Adherence scores. Recovery becomes contextual assessment (no score).

**Location:** Added to the debrief protocol files, not a separate file. These are coaching instructions, not standalone data.

**Rubric design:**

```
Training score — how well training matched the plan and served the block goal
  9–10: All sessions completed as planned, RPE appropriate, key metrics progressing
  7–8:  Most sessions completed, minor adjustments, no setbacks
  5–6:  Meaningful sessions missed or quality compromised, but week still productive
  3–4:  Majority of training missed or significantly below plan
  1–2:  Essentially no productive training this week

Nutrition score — protein adherence and calorie discipline relative to the plan
  9–10: Protein floor hit 6–7 days, calories within bracket, no TG-risk foods
  7–8:  Protein floor hit 5+ days, calories mostly on target, minor slips
  5–6:  Protein under target 3+ days, or calorie discipline inconsistent
  3–4:  Protein regularly missed, or significant calorie overruns/underruns
  1–2:  Nutrition largely untracked or severely off plan

Adherence score — overall plan commitment including sleep, supplements, NEAT
  9–10: Plan followed with discipline across all domains
  7–8:  Plan mostly followed, minor gaps (missed supplement, one poor sleep night)
  5–6:  Multiple plan elements missed, but core training and nutrition maintained
  3–4:  Significant departure from plan across domains
  1–2:  Plan effectively abandoned this week

Recovery — NOT a score. Contextual assessment:
  State: sufficient / marginal / insufficient
  Relative to: [next planned session]
  Evidence: [sleep data, RPE trends, soreness, knee status, training load]
```

**What this solves:**
- Scores become repeatable and meaningful
- Recovery is contextual (Product Bible S13)
- Athlete can understand why they scored what they scored
- Coach can reference scoring trends across weeks via the coaching log

---

### Architecture Change 4 — Gap Handling Protocol

**Why:** Product Bible S18.2. No current protocol.

**What:** Not a new file — a new reasoning path added to the coach persona. When the coach detects a gap (no data for 5+ days, or athlete explicitly states they are returning), it follows a different protocol.

**Behavior:**
1. Do not comment on the gap's length or cause unless the athlete raises it
2. Assess current state: last known metrics, time elapsed, what has likely changed
3. Rebuild context before making recommendations
4. Establish a re-entry plan appropriate to the gap length
5. Update `current-block.md` — a significant gap may mean the block needs adjustment or a new block

**Where it lives:** Added to `personal-coach.mdc` as a conditional protocol.

---

### Architecture Change 5 — Race Phase Framework

**Why:** L3 accepted. The coach needs to reason differently at different distances from race day.

**What:** Not a new file — a framework added to `weekly-debrief.mdc` and embedded in `current-block.md` through the phase field.

**Phases:**

```
Base (current) — Aerobic foundation, consistency, fat loss
  Focus: volume building, habit establishment, body composition
  ~10–6 weeks out

Build — Longer runs, higher volume, race-specific work
  Focus: long run progression toward 18–20 km, sustained volume
  ~6–3 weeks out

Peak — Maximum training load, final long run
  Focus: highest volume week, final 18–20 km long run, confidence
  ~3–2 weeks out

Taper — Volume reduction, freshness, race prep
  Focus: reduced volume (40–60% of peak), maintain intensity, nutrition shift
  ~2–1 weeks out

Race Week — Final preparation
  Focus: light movement only, carb loading protocol, race logistics, mental prep
  Final 7 days
```

**How it works:**
- `current-block.md` carries the phase field
- Weekly debrief uses phase to contextualize recommendations
- Phase transitions are coaching decisions documented in the coaching log
- The coach adjusts nutrition, volume, and intensity guidance based on phase

---

### What Is NOT an Architecture Change

These are prompt wording changes that will be handled in Phase 3 (Refactoring Plan) and Phase 4 (Updated Coach Skill):

| Change | Type | Phase |
|--------|------|-------|
| Reframe DEVIATIONS to PLAN vs ACTUAL | Prompt wording | 4 |
| Make output structure adaptive | Prompt instruction | 4 |
| Add confidence to recommendations | Reasoning instruction | 4 |
| Interpret meaningful events | Reasoning instruction | 4 |
| Remove fixed priority hierarchy from persona | Prompt edit (moves to current-block.md) | 4 |
| Consolidate duplicated nutrition rules | File reorganization | 3 |
| Move artifact tables to COACH-CONTEXT.md | File reorganization | 3 |
| Add coaching-log.md to "Read first" | Prompt edit | 4 |
| Add current-block.md to "Read first" | Prompt edit | 4 |

---

### New File Summary

| File | New/Modified | Purpose |
|------|-------------|---------|
| `coach/coaching-log.md` | **New** | Append-only decision history with outcomes and insights |
| `coach/current-block.md` | **New** | Active training block definition, priorities, and phase |
| `personal-coach.mdc` | Modified | Add coaching-log + block reading, gap protocol, remove fixed hierarchy |
| `end-of-day-debrief.mdc` | Modified | Score criteria, contextual recovery, PLAN vs ACTUAL, confidence |
| `weekly-debrief.mdc` | Modified | Score criteria, contextual recovery, PLAN vs ACTUAL, coaching-log writes, block evaluation, phase framework, adaptive structure |
| `weekly-plan-and-nutrition.mdc` | Modified | Remove duplicated athlete values, keep coaching rules only |
| `COACH-CONTEXT.md` | Modified | Absorb artifact relationship tables from debrief files |

---

### Architecture Decision Records

**ADR-1: Coaching log is a flat markdown file, not a database table.**
The coaching log is read by an LLM in Cursor. Markdown is the native format. A Supabase table would require API calls and JSON parsing. The log is small (one entry per weekly debrief), human-readable, and directly usable by the LLM. If the log grows beyond ~200 lines, older entries are summarized during block transitions. The debrief archive in Supabase (`coach_debriefs`) remains the full record.

**ADR-2: Current block is a separate file, not embedded in personal-details.md.**
`personal-details.md` is the long-lived athlete profile — it changes slowly. The training block changes every 4–8 weeks. Mixing them creates update friction and risks stale data. The block file is small, self-contained, and cheap to replace entirely when a new block begins.

**ADR-3: Score criteria live in the debrief prompts, not in a separate file.**
Score criteria are coaching instructions — they tell the LLM how to score. They are not data. Putting them in the prompt that uses them keeps the instruction and its application together. If criteria evolve, they evolve where they are used.

**ADR-4: Race phases live in current-block.md, not as a separate framework file.**
The race phase is an attribute of the current block. It is not a standalone concept. Embedding it in the block file means the coach sees it naturally when reading block context. A separate file would add a read step for minimal benefit.

**ADR-5: Gap handling is a conditional path in the persona, not a separate protocol file.**
Gaps are rare events. A one-paragraph conditional instruction in `personal-coach.mdc` ("If no data exists for 5+ days or the athlete says they are returning after a break, follow these steps...") is sufficient. A separate file would add complexity for a rare case.

---

---
---

## Phase 3 — Refactoring Plan

This phase specifies every change to every file. Changes are grouped by file, ordered by dependency (new files first, then modifications). Each change is traced to a Phase 1 decision and Phase 2 architecture change.

---

### 3.1 New Files

#### 3.1.1 — `coach/coaching-log.md`

**Creates:** Architecture Change 1 (Coaching Memory)
**Traces to:** C1

Initial template with structure documentation and the first retrospective entry covering Weeks 1–2 (the coaching that has already occurred). This is not a blank file — it bootstraps from existing history so the coach has context from day one.

**Contents:**
- Header explaining the file's purpose and format
- Entry format specification
- Retrospective entry for Week 1 (22–28 Jun) and Week 2 (29 Jun–5 Jul) based on what has already been coached
- Placeholder for outcomes and insights to be filled in future sessions

---

#### 3.1.2 — `coach/current-block.md`

**Creates:** Architecture Change 2 (Training Block) + Architecture Change 5 (Race Phases)
**Traces to:** C2, H1, L3

Defines the current training block based on what is already in progress. The block is currently "HM Build — Base Phase" covering the initial aerobic base building period.

**Contents:**
- Block identity: name, goal, start date, projected end, current week
- Current priorities: HM performance > fat loss > muscle reactivation — framed as the current coaching stance for this block, not a permanent hierarchy
- Block parameters: mileage targets, long run targets, strength mode, nutrition bracket, key constraints
- Success criteria for this block
- Race timeline: race date, weeks remaining, current phase (Base), phase definitions
- Instruction that priorities are re-evaluated when evidence conflicts and during block transitions

---

### 3.2 Modified Files

#### 3.2.1 — `personal-coach.mdc` (Coach Identity)

**Traces to:** C1, C2, H1, M2, L1

**Keep as-is:**
- Opening identity line ("You are Deekshant's running coach, S&C coach, and dietician")
- Mission statement
- Tone section (blunt and direct)
- Session types table

**Remove:**
- "Priority order" section (1/2/3 hierarchy) — moved to `current-block.md`
- "No gym until ~July 2026" from integrated rules — stale time-bound rule, now handled by block parameters

**Modify:**
- "Read first" — add `coach/coaching-log.md` and `coach/current-block.md`
- "Integrated rules" — reframe from hard rules to coaching considerations. Keep the content (load linkage, sleep-load connection, 10% rule, knee/cadence monitoring) but frame them as inputs to judgment, not directives. Add: "These are coaching considerations, not immutable rules. Apply judgment based on the full picture."
- Add "Every plan is built on this athlete's current block, recent coaching history, and last week's data — never generic" (strengthens existing line)

**Add:**
- Gap handling protocol (Architecture Change 4): "If the athlete returns after 5+ days without data, or states they are returning after a break: (1) Do not comment on the gap unless the athlete raises it. (2) Assess current state from last known data. (3) Rebuild context before making any recommendations. (4) Propose a re-entry plan scaled to the gap length. (5) Evaluate whether `current-block.md` needs adjustment or a new block should begin."
- Coaching reasoning instruction: "Before every debrief, read the coaching log and current block. Reason within the block — what does this session mean for the block's goal, not just for this week. Reference previous coaching decisions when they are relevant to today's analysis."

---

#### 3.2.2 — `end-of-day-debrief.mdc` (Daily Debrief)

**Traces to:** C3, H3, H4, M1

**Keep as-is:**
- Trigger phrase and "Before debriefing" steps (read logs, compare to plan, calculate macros)
- 5-section structure (count preserved — sections renamed/refined)
- Section 4 — REVISED TOMORROW (validated in Phase 1 — this IS coaching)
- Section 5 — COACH'S NOTE (one firm paragraph)
- Run-day non-negotiables (knee, cadence, distance/pace/RPE comparison)

**Modify:**

Section 1 — DAY SCORE:
- Add score criteria rubric (daily-scoped versions):
  ```
  Training: 9–10 session completed as planned, RPE/metrics on target
            7–8 completed with minor deviations, still productive
            5–6 partially completed or significantly modified
            3–4 skipped or largely ineffective
            1–2 no training when training was planned
  Nutrition: 9–10 protein floor hit, calories in bracket, no TG-risk items
             7–8 protein close, calories roughly on target
             5–6 protein missed or calories significantly off
             3–4 poor adherence across protein and calories
             1–2 nutrition untracked or severely off
  Adherence: 9–10 all plan elements followed (sleep, supplements, NEAT, training, nutrition)
             7–8 most elements followed, one minor gap
             5–6 multiple gaps but core elements maintained
             3–4 significant departure from plan
             1–2 plan not followed
  ```
- Replace "Recovery" score with contextual assessment:
  ```
  Recovery — not a score. State:
    sufficient / marginal / insufficient
    relative to: [tomorrow's planned session from Week N plan]
    evidence: [sleep, RPE, soreness, knee, training load today]
  ```
- Keep composite score (average of Training + Nutrition + Adherence only, not Recovery)

Section 2 — rename "DEVIATIONS" → "PLAN vs ACTUAL":
- Each item: planned vs actual, then classify as:
  - **Athlete decision** — deliberate departure (record what was decided and why if stated)
  - **Unplanned miss** — something that went wrong (root cause: choice vs external)
- Remove "severity (Minor/Moderate/Critical)" — replaced by the classification above plus the mechanistic explanation of why it matters
- Keep: mechanistic "why it matters" for each item

Section 3 — rename "ROOT CAUSE" → merge into Section 2:
- Root cause analysis now lives inside each "unplanned miss" in Section 2
- Section 3 becomes unnecessary as a standalone section — redistribute its content

With Section 3 merged into Section 2, the 5 sections become:
1. DAY SCORE (with criteria + contextual recovery)
2. PLAN vs ACTUAL (with root causes inline)
3. REVISED TOMORROW
4. COACH'S NOTE
5. COACHING LOG ENTRY (only when a significant mid-week decision is made)

Wait — reducing from 5 to 4 core sections plus an optional 5th. The structure is cleaner but the count changes. This is acceptable per M1 (structure serves the message).

**Revised daily structure:**

```
Section 1 — DAY SCORE
  Training /10 · Nutrition /10 · Adherence /10 → composite
  Recovery: sufficient/marginal/insufficient for [tomorrow's session] — evidence
  One-line verdict

Section 2 — PLAN vs ACTUAL
  Each item: planned vs actual
  Classify: athlete decision (record it) or unplanned miss (root cause)
  Why it matters mechanistically

Section 3 — TOMORROW
  Adapt next day from today's evidence. State confidence level for any changes.

Section 4 — COACH'S NOTE
  One firm paragraph. No bullets. No hedging.
```

4 sections. Tighter. Nothing lost — root cause is folded into PLAN vs ACTUAL where it belongs.

**Add:**
- After Section 4, if a significant mid-week coaching decision was made (e.g., modifying the rest of the week's plan due to injury or major deviation), append a brief coaching log entry for the coach to add to `coaching-log.md`.
- Instruction: "State confidence when recommending changes to tomorrow's plan. High confidence = clear evidence. Moderate = reasonable inference. Low = best guess with limited data."

---

#### 3.2.3 — `weekly-debrief.mdc` (Weekly Debrief)

**Traces to:** C1, C3, H1, H3, H4, M1, M3, L1, L3

This is the largest change. The weekly debrief is the primary coaching session.

**Keep as-is:**
- Trigger phrase
- "Before debriefing" steps 1–6 (all still valid)
- Section 2 — METRICS & TRENDS (table format is good)
- Section 3 — TRAINING REVIEW (content is good)
- Section 4 — NUTRITION REVIEW (content is good, keeps meal-level coaching per H2 rejection)
- Section 7 — WEEK N+1 PLAN (format stays, per H2 rejection)
- Section 8 — COACH'S NOTE (one firm paragraph, race timeline)

**Modify:**

"Before debriefing" — add:
- Step 0: Read `coach/coaching-log.md` and `coach/current-block.md`
- Step 7: Identify meaningful events from the week — new patterns, progressions, stagnations, milestones (M3). Name them explicitly in the debrief.

Section 1 — WEEK SCORE:
- Add same score criteria rubric from daily debrief (week-scoped — already defined in Phase 2)
- Replace Recovery score with contextual assessment relative to Week N+1's first demanding session
- State the composite as Training + Nutrition + Adherence average

Section 2 — METRICS & TRENDS:
- Add: "Flag meaningful events: new patterns, progressions (improving trends), stagnations (expected change not happening), milestones reached."
- Add: "State what this means for the current block goal, not just for next week."

Section 5 — rename "DEVIATIONS & ROOT CAUSES" → "PLAN vs ACTUAL":
- Same classification as daily: athlete decisions vs unplanned misses
- Week-level patterns only (unchanged)
- Root causes inline per item (not a separate section)
- Add: "Record athlete decisions in the coaching log entry below."

Section 6 — LOAD & RECOVERY DECISION:
- Add: "State confidence level for each decision (high / moderate / low) and the evidence supporting it."
- Add: "When two priorities conflict, state which priority is being favored and why for this specific situation."
- Add: "Reference the current training block phase and how this week's decisions serve the block goal."
- Keep all existing content (10% cap math, knee modifiers, mileage-scaled calories, refeed, deficit taper)

After Section 8 — add Section 9:

```
Section 9 — COACHING LOG UPDATE

Append the following to `coach/coaching-log.md`:

### [Date] — Weekly Debrief

**Block:** [current block name and week]
**Context:** [key evidence that drove this week's decisions]
**Decisions made:**
- [each recommendation with its confidence level]
**Athlete response:** [to be filled by athlete — accepted/rejected/modified]
**Previous decisions to update:**
- [any outcomes or insights from prior log entries now observable]
```

**Remove:**
- "Relationship to other artifacts" table — move to `COACH-CONTEXT.md`
- "This is not the resolve-custom-food-macros skill" disclaimer — move to `COACH-CONTEXT.md`

**Add to top-level instruction:**
- "Lead with whatever matters most this week. If knee pain escalated, that comes before the metrics table. If nutrition fell apart, that leads. The section numbering is a checklist — address every topic, but the order follows the coaching message."

---

#### 3.2.4 — `weekly-plan-and-nutrition.mdc` (Nutrition Rules)

**Traces to:** M4

**Keep as-is:**
- Nutrition non-negotiables section (protein floor, TG flagging, fat floor, pre-long-run dinner)
- Fasting rules
- Rest-day NEAT
- Mileage-scaled calories table
- Refeed template
- Food estimation reference table

**Remove (duplicated elsewhere):**
- "Monday metrics (required before new week plan)" — already in `weekly-debrief.mdc` "Before debriefing"
- "Weekly plan output" format specification — already in `weekly-debrief.mdc` Section 7
- "After issuing a plan, add it to WEEK_PLANS..." — already in `weekly-debrief.mdc` Section 7

**Modify:**
- "Deficit anchors" — remove the specific numbers (maintenance ~2,450 kcal, run days ~2,050, rest ~1,900). These already live in `personal-details.md` lines 307–324 as the single source of truth. Replace with: "Apply deficit anchors from `personal-details.md`. Recalculate when weekly km crosses 25, 35, 45 or when a body comp scan triggers a band change (see `body-comp.mdc`)."
- Rename file description from "Monday weekly plans, metrics review, and nutrition rules" to "Nutrition coaching rules and reference tables"

---

#### 3.2.5 — `COACH-CONTEXT.md` (Workflow Documentation)

**Traces to:** L1

**Keep as-is:**
- Workspace instruction
- Daily workflow
- Monday workflow
- After plan changes
- Coach calculates note
- Race timeline

**Add:**
- `coach/coaching-log.md` and `coach/current-block.md` to file map table
- Artifact relationship table (moved from `weekly-debrief.mdc`):
  ```
  | Artifact | Role |
  | end-of-day-debrief.mdc | Daily debrief — 4 sections |
  | weekly-debrief.mdc | Weekly debrief — 9 sections (retrospective + plan + note + log update) |
  | weekly-plan-and-nutrition.mdc | Nutrition coaching rules + reference tables |
  | resolve-custom-food-macros skill | Manual — patch custom food P/kcal in food_logs |
  | save-weekly-debrief skill | Manual — archive full report to coach_debriefs |
  | App Debrief tab | Generates input paste for daily or Monday metrics |
  | App Week tab | Reads coach_debriefs for the week covered (read-only) |
  ```
- Note: "Coach responses are archived via `save-weekly-debrief` when invoked after Monday debrief. Not auto-saved."

**Modify:**
- Monday workflow step 4: update section count from 8 to 9

---

#### 3.2.6 — `personal-details.md` (Athlete Profile)

**Traces to:** M4

**No structural changes.** This file is the single source of truth for athlete-specific values. The duplication problem is on the other side — `weekly-plan-and-nutrition.mdc` duplicated values that live here. That duplication is resolved in 3.2.4 above.

One minor addition:
- Add a note near the calorie/deficit anchors section: "These are the current anchors. The coach recalculates when weekly km crosses volume thresholds or body comp scans indicate a band change."

---

### 3.3 Change Dependency Order

Changes must be applied in this order to avoid broken references:

```
Step 1 (independent — can be parallel):
  Create coach/coaching-log.md
  Create coach/current-block.md

Step 2 (independent — can be parallel):
  Modify COACH-CONTEXT.md (absorb artifacts, update file map)
  Modify weekly-plan-and-nutrition.mdc (remove duplicates)
  Modify personal-details.md (add recalculation note)

Step 3 (depends on Step 1):
  Modify personal-coach.mdc (references new files)

Step 4 (depends on Step 3):
  Modify end-of-day-debrief.mdc (uses updated persona)
  Modify weekly-debrief.mdc (uses updated persona, references new files)
```

---

### 3.4 What Is Preserved (Domain Knowledge Inventory)

The following domain expertise is explicitly preserved through the refactor. None of this is removed or simplified:

| Domain knowledge | Current location | After refactor |
|-----------------|-----------------|----------------|
| Indian vegetarian food estimation table | `weekly-plan-and-nutrition.mdc` | Same |
| Protein floor 140–150g, 152g+ on long-run days | `weekly-plan-and-nutrition.mdc` | Same |
| Fat floor 55–65g, never cut eggs/paneer | `weekly-plan-and-nutrition.mdc` | Same |
| Triglyceride-aware carb flagging | `weekly-plan-and-nutrition.mdc` | Same |
| Mileage-scaled calorie adjustments | `weekly-plan-and-nutrition.mdc` | Same |
| Refeed template for 12+ km weeks | `weekly-plan-and-nutrition.mdc` | Same |
| Fasting rules during HM prep | `weekly-plan-and-nutrition.mdc` | Same |
| Rest-day NEAT requirements | `weekly-plan-and-nutrition.mdc` | Same |
| Friday pre-long-run dinner protocol | `weekly-plan-and-nutrition.mdc` | Same |
| Body composition interpretation rules | `body-comp.mdc` | Unchanged |
| Deficit taper by BF% band | `body-comp.mdc` | Unchanged |
| 10% weekly mileage rule | `personal-coach.mdc` | Same (reframed as consideration) |
| Knee/cadence monitoring protocol | `personal-coach.mdc` + debrief files | Same |
| Run-day non-negotiables (knee, cadence, RPE) | `end-of-day-debrief.mdc` | Same |
| Calorie/deficit anchors | `personal-details.md` | Same (now single source) |
| Supplement plan | `personal-details.md` | Unchanged |
| Blood work / medical context | `personal-details.md` | Unchanged |
| Warm-up/cool-down templates | `coach/week-plans.py` | Unchanged |
| Meal planning with portions | `weekly-debrief.mdc` S7 | Same |
| Daily macro calculation by coach | `end-of-day-debrief.mdc` | Same |

**Zero domain knowledge is removed. The refactor changes how the coach reasons, not what it knows.**

---

### 3.5 Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Coaching log grows too large for LLM context | Summarize older entries during block transitions. Cap at ~200 lines. |
| Coach forgets to write coaching log entries | Section 9 is a mandatory part of the weekly debrief — not optional |
| Block file becomes stale if not updated | Weekly debrief explicitly references block — staleness becomes visible |
| Score criteria feel rigid for edge cases | Criteria are guidelines for the LLM, not hard boundaries. Add: "Use judgment for edge cases — the rubric is a calibration tool, not a formula." |
| Adaptive output order confuses the athlete | Keep section numbers/names consistent. Only the ORDER is flexible, not the names. |
| Removing Section 3 (ROOT CAUSE) from daily debrief loses information | Root cause is folded INTO Section 2 (PLAN vs ACTUAL) per-item — nothing is lost, just reorganized |

---

---
---

## Phase 4 — Updated Coach Skill

All changes applied. Summary of what was done:

### New files created

| File | Purpose |
|------|---------|
| `coach/coaching-log.md` | Append-only decision history. Bootstrapped with retrospective entries for Week 1 start and Week 1→2 transition. |
| `coach/current-block.md` | Active training block: "HM Build — Base Phase", Week 2. Contains priorities (as current stance, not permanent hierarchy), block parameters, success criteria, race timeline, and phase definitions (Base → Build → Deload → Peak → Taper → Race Week). |

### Files modified

| File | Key changes |
|------|------------|
| `personal-coach.mdc` | Added 4-file "Read before every session" list. Removed fixed priority hierarchy. Replaced "Integrated rules" with "Coaching considerations" (same content, framed as inputs to judgment). Added 8-step coaching reasoning process. Added gap handling protocol. Updated session types to 4/9 section counts. |
| `end-of-day-debrief.mdc` | Compressed from 5 to 4 sections (ROOT CAUSE merged into PLAN vs ACTUAL). Added score criteria rubrics with defined bands. Recovery changed from /10 score to contextual assessment (sufficient/marginal/insufficient for tomorrow's session). DEVIATIONS renamed to PLAN vs ACTUAL with athlete-decision vs unplanned-miss classification. Added confidence levels to TOMORROW recommendations. Added coaching log instruction for significant mid-week decisions. |
| `weekly-debrief.mdc` | Expanded from 8 to 9 sections (added Section 9: Coaching Log Update). Added "lead with what matters most" adaptive ordering instruction. Added coaching-log and current-block to "Before debriefing" reads. Added meaningful events identification step. Added score criteria rubrics. Recovery changed to contextual assessment. DEVIATIONS renamed to PLAN vs ACTUAL. Added confidence levels and priority-conflict transparency to Section 6. Added block goal and race phase references throughout. Removed artifact relationship table (moved to COACH-CONTEXT.md). Added Section 9 with coaching log entry format and current-block update trigger. |
| `weekly-plan-and-nutrition.mdc` | Removed duplicated content: Monday metrics list (in weekly-debrief.mdc), plan format spec (in weekly-debrief.mdc S7), plan-sync workflow (in weekly-debrief.mdc S7). Deficit anchors now reference personal-details.md as single source. Description updated. |
| `COACH-CONTEXT.md` | Added coaching-log.md and current-block.md to file map. Updated Monday workflow to 9 sections + coaching log step. Added artifact relationships table (moved from weekly-debrief.mdc). Updated daily workflow to 4-section count. |
| `save-weekly-debrief/SKILL.md` | Updated all references from 8 to 9 sections. Updated scores JSON to reflect Recovery no longer being numeric. |
| `personal-details.md` | Added recalculation note to deficit anchors (single source of truth). |

### Files NOT modified (unchanged)

| File | Reason |
|------|--------|
| `body-comp.mdc` | No changes needed. Already well-structured coaching logic. |
| `coach/week-plans.py` | Data file, not coaching logic. Unchanged. |
| `resolve-custom-food-macros/SKILL.md` | Unrelated skill. Unchanged. |

### Consistency verification

- No remaining references to "Priority order" in active coaching files
- No remaining references to "DEVIATIONS" in active coaching files
- No remaining "Recovery /10" or "Recovery score" in active coaching files
- All cross-file section count references updated (4 daily, 9 weekly)
- `save-weekly-debrief` skill updated for new section count and score structure

---

---
---

## Phase 5 — Final Verification

Every Product Bible principle verified against the refactored Coach Skill. Each verdict is based on what the files now contain, not on intent.

---

### Core Principle 1 — "The app informs. The Coach Skill advises."

**Verdict: ✅ Fully aligned**

The Coach Skill makes recommendations, evaluates trade-offs, and issues plans. It does not blur into app territory. The app's boundaries are respected — the Coach Skill is the interpretive layer. Nothing changed here; the original Coach Skill was already correct on this boundary.

---

### Core Principle 2 — "Logging is communication, not accomplishment."

**Verdict: ✅ Fully aligned**

Not directly the Coach Skill's responsibility (this governs the app's UX), but the Coach Skill supports it: no celebration of logging acts, no streak tracking, no "great job" language. The tone instruction ("strict, no fluff, no moralizing") prevents this. Unchanged from original.

---

### Core Principle 3 — "Silence means the athlete is on course."

**Verdict: 🟡 Partially aligned — acceptable**

This principle primarily governs the app, not the Coach Skill. The Coach Skill is triggered on demand (daily/weekly), so "silence" doesn't directly apply — the athlete asks for coaching and gets it. However, the daily debrief now includes: "If plan was followed fully, say so briefly and move on" and "If no changes are needed, say so. Do not manufacture adjustments." This prevents the coach from fabricating issues on a clean day.

**Residual gap:** The Coach Skill could still produce verbose output on a perfect day. But constraining it further would conflict with the athlete's expectation of a debrief when they trigger one. Acceptable as-is.

---

### Core Principle 4 — "Surface meaningful events, not states."

**Verdict: ✅ Fully aligned (new)**

Previously violated — the Coach Skill surfaced states (metric tables, scores) without identifying events. Now:
- `personal-coach.mdc` step 2: "Identify meaningful events — new patterns, progressions, stagnations, milestones. Name them."
- `weekly-debrief.mdc` before-step 7: "Identify meaningful events from the week... Name them explicitly."
- `weekly-debrief.mdc` Section 2: "Flag new patterns, progressions, stagnations, or milestones. State what each means for the current block goal."

The coach is now instructed to identify and name events, not just report metrics. The metrics table (Section 2) still exists, but it's now accompanied by event interpretation.

---

### Core Principle 5 — "Decisions persist, deliberations don't."

**Verdict: ✅ Fully aligned (new)**

Previously had no persistence mechanism. Now:
- `coaching-log.md` stores decisions, athlete responses, outcomes, and insights — explicitly not deliberations.
- The log header states: "What does NOT go here: Full debrief text, raw data, or chain-of-thought reasoning."
- Full debrief deliberations are archived in `coach_debriefs` (Supabase) for reference but not loaded into coaching context.
- The coaching log stores only: what was decided, what the athlete chose, what happened, what was learned.

This matches S6.3 precisely: "The database stores decisions, not deliberations."

---

### Core Principle 6 — "The athlete's history is continuous, even when the data isn't."

**Verdict: ✅ Fully aligned (new)**

Previously had no gap handling. Now:
- `personal-coach.mdc` gap handling protocol: 6-step process for returning after a break.
- Step 1: "Do not comment on the gap's length or cause unless the athlete raises it."
- Step 6: "The athlete's history is continuous, even when the data isn't." (Directly quotes the Product Bible.)
- The protocol rebuilds context, proposes a re-entry plan, and evaluates whether the current block needs adjustment.

---

### Core Principle 7 — "The plan deserves commitment, not blind obedience."

**Verdict: ✅ Fully aligned**

- PLAN vs ACTUAL sections distinguish between "athlete decisions" (deliberate departures — recorded as coaching data) and "unplanned misses" (root cause analysis).
- Product Bible S5.3 says athlete overrides are "often the most valuable learning opportunities." The Coach Skill now records them rather than treating them as defects.
- The daily debrief's TOMORROW section adapts the plan through coaching evidence, not athlete whim.
- The coaching log records when the athlete accepts, rejects, or modifies recommendations — this IS the collaborative process the Product Bible describes.

---

### Core Principle 8 — "Recovery is relative to the next demand."

**Verdict: ✅ Fully aligned (new)**

Previously violated — Recovery was a generic /10 score. Now:
- Daily debrief: "sufficient / marginal / insufficient for [tomorrow's planned session from Week N plan]"
- Weekly debrief: "sufficient / marginal / insufficient for [Week N+1's first demanding session]"
- Both require evidence: "sleep hours, RPE, soreness, knee status, today's training load"

Recovery is no longer a number. It is a contextual judgment tied to a specific upcoming demand.

---

### Core Principle 9 — "Priorities are situational."

**Verdict: ✅ Fully aligned (new)**

Previously violated — fixed hierarchy hardcoded in persona. Now:
- Priorities live in `current-block.md` as "the coaching stance for this block."
- Explicit statement: "There is no permanent hierarchy — these priorities reflect the current evidence and block goal."
- Re-evaluation triggers: "when evidence conflicts (e.g., knee deterioration, body comp concerns, illness) and during block transitions."
- `weekly-debrief.mdc` Section 6: "When two priorities conflict, state which priority is being favored and why for this specific situation."
- `personal-coach.mdc` reasoning step 5: "Evaluate competing priorities — when priorities conflict, state which is being favored and why."

---

### Core Principle 10 — "Training blocks are chapters."

**Verdict: ✅ Fully aligned (new)**

Previously violated — no block concept. Now:
- `current-block.md` defines the active block with goal, parameters, success criteria, and phase.
- `weekly-debrief.mdc` reads the block before every session.
- Section 3 (Training Review): "How this week's training served (or didn't serve) the current block goal."
- Section 6 (Load & Recovery Decision): "Reference the current training block phase and how this week's decisions serve the block goal."
- Section 8 (Coach's Note): "Reference current training block phase and race timeline."
- Block transitions are documented as coaching decisions in the coaching log.
- Phase definitions (Base → Build → Deload → Peak → Taper → Race Week) are built into the block file.

---

### Core Principle 11 — "Every decision should be slightly better than the last."

**Verdict: ✅ Fully aligned (new)**

Previously violated — no learning mechanism. Now:
- `coaching-log.md` accumulates decisions, outcomes, and insights across sessions.
- The coach reads this log before every session (step 0 of weekly debrief, step 4 of daily debrief).
- Weekly debrief before-step 8: "Review coaching log for previous decisions whose outcomes are now observable. Update outcomes and insights."
- Section 9 updates the log with new decisions and fills in outcomes from previous entries.
- The log's "Insight" field captures what was learned — this is accumulated coaching wisdom.

Over 10 years, the coaching log would contain hundreds of decisions with observed outcomes and learned insights. Each new session builds on this accumulated knowledge. The coach would know: what recommendations this athlete tends to accept, which ones he modifies, what nutrition approaches stick, how his knee responds to volume increases, which training stimuli produce the best adaptations.

This is the fundamental difference from the pre-refactor state.

---

### Core Principle 12 — "Trust is the product's emotional core."

**Verdict: ✅ Fully aligned**

Trust improvements in this refactor:
- Score criteria are defined and transparent — the athlete can see why they got a 7 vs an 8.
- Confidence levels on recommendations — the coach distinguishes between high-confidence and speculative advice.
- Recovery is contextual, not a meaningless number.
- Coaching considerations are framed as inputs to judgment ("generally lighter strength") not as false certainties ("always lighter strength").
- The coaching log creates accountability — the coach's past recommendations and their outcomes are visible.

---

### Product Bible S4.1 — Judgment

**Verdict: ✅ Fully aligned**

The 8-step coaching reasoning process explicitly separates observations, context, priorities, confidence, recommendations, and trade-offs. This IS judgment — structured, transparent, evidence-based.

---

### Product Bible S4.2 — Recommendations

**Verdict: ✅ Fully aligned**

The Coach Skill continues to make specific recommendations (mileage, nutrition targets, meal structures, strength plans). Preserved all domain knowledge through the refactor.

---

### Product Bible S4.3 — Long-Term Evaluation

**Verdict: ✅ Fully aligned (improved)**

Weekly debrief evaluates patterns and trends (Section 2 metrics table, Section 4 nutrition adherence patterns). Now also evaluates within the training block context (block goal references throughout) and against the coaching log (previous decisions and their outcomes).

---

### Product Bible S4.4 — Evolution

**Verdict: ✅ Fully aligned (new)**

The coaching log + current block + reasoning process collectively enable evolution:
- Past decisions are visible.
- Outcomes are tracked.
- Insights are accumulated.
- Each session builds on previous ones.
- The coach never starts from zero.

---

### Product Bible S4.5 — Trigger

**Verdict: 🟡 Partially aligned — acceptable**

The Product Bible says the Coach Skill is "triggered by decision-making, not by schedule." In practice, the Coach Skill runs on a regular cadence (daily tracker uploads, Monday debriefs). This is a practical necessity — the athlete needs structured coaching rhythm. The mid-week question pathway allows on-demand coaching when decisions arise outside the regular cadence. Acceptable.

---

### Product Bible S5.3 — Athlete overrides

**Verdict: ✅ Fully aligned (new)**

PLAN vs ACTUAL now classifies athlete decisions as coaching data, not compliance failures. The coaching log records athlete responses (accepted / rejected / modified) with reasons. This matches S5.3: "These moments are not compliance failures. They are decisions — often the most valuable learning opportunities in the system."

---

### Product Bible S6.2 — Situational priorities

**Verdict: ✅ Fully aligned (new)**

See Core Principle 9 above. Fixed hierarchy removed. Priorities are block-scoped and re-evaluated when evidence conflicts.

---

### Product Bible S6.3 — Decisions persist, deliberations don't

**Verdict: ✅ Fully aligned (new)**

See Core Principle 5 above. Coaching log stores decisions only. Deliberations stay in the Cursor conversation and archived debriefs.

---

### Product Bible S6.5 — Bad news delivered honestly

**Verdict: ✅ Fully aligned**

Tone: "Blunt and direct. Say plainly when the athlete is wrong, the plan is flawed, or the logic does not hold." Coach's Note: "No bullets. No hedging." Unchanged from original — this was always a strength.

---

### Product Bible S6.6 — Difficult moments acknowledged, not dramatized

**Verdict: ✅ Fully aligned**

"No moralizing. Flag cigarettes/cannabis only when directly relevant to a deviation or outcome." The coaching reasoning process adds: "Acknowledge trade-offs — what is being gained and what is being risked." This is empathy through evidence, not sympathy. Correct.

---

### Product Bible S12.2 — Coach's voice

**Verdict: ✅ Fully aligned (improved)**

Previously: good tone but rigid template structure could make the coach sound like a report generator. Now: "Lead with whatever matters most this week" instruction makes the coaching message-led rather than template-led. The tone instructions remain: direct, earned familiarity, evidence-based, respectful, honest, concise.

---

### Product Bible S13 — Recovery philosophy

**Verdict: ✅ Fully aligned (new)**

See Core Principle 8 above. Contextual assessment, not generic score.

---

### Product Bible S14 — Nutrition philosophy

**Verdict: ✅ Fully aligned**

- S14.2 (awareness, not calorie gaming): restricts the APP, not the Coach Skill. The Coach Skill properly makes nutritional recommendations (S4.2).
- S14.3 (today vs long-term): Weekly debrief Section 4 evaluates "% of days on floor" (adherence pattern) not daily compliance. Coach judges "structure and adherence, not gram-level carb/fat targets."
- S14.4 (data confidence): Coaching reasoning step 6 requires confidence assessment. Food-logged data is moderate confidence; the coach knows this through the estimation reference table and "show your math" instruction.

---

### Product Bible S16 — Training blocks

**Verdict: ✅ Fully aligned (new)**

See Core Principle 10 above. Full block system implemented.

---

### Product Bible S17 — Long-term memory

**Verdict: ✅ Fully aligned (new)**

- S17.1: The coaching log + block history creates long-term athletic memory across sessions.
- S17.3: The coaching log preserves what the Product Bible calls "the most irreplaceable data" — coaching decisions, accepted and rejected recommendations, rationale, outcomes, and lessons learned.
- S17.4: "Nothing important should be lost" — decisions persist in the log. Full debriefs are archived in Supabase.

---

### Product Bible S18 — Failure and discontinuity

**Verdict: ✅ Fully aligned (new)**

- S18.1: PLAN vs ACTUAL treats bad days with the same objectivity as good days. Classification into athlete decisions vs unplanned misses is neutral, not judgmental.
- S18.2: Gap handling protocol implemented. No guilt. Rebuild context. Continue.

---

### Product Bible S19 — Trust and data confidence

**Verdict: ✅ Fully aligned (new)**

- S19.1: Coaching scoring uses defined rubric bands, not false precision. Score criteria acknowledge edge cases ("use judgment — the rubric is a calibration tool, not a formula").
- S19.2: Confidence levels (high/moderate/low) required on all recommendations. Coaching reasoning step 6 makes this explicit.

---

### Product Bible S20 — Success and failure conditions

**Verdict: ✅ Aligned**

S20.2 failure test: "If the Coach Skill gives the same advice it could give someone who has never used the app..."

The refactored Coach Skill reads the coaching log before every session. After 6 months of use, the log would contain ~25 weekly entries with decisions, outcomes, and insights. A new coach seeing this athlete for the first time would not have this accumulated knowledge. The coaching would be meaningfully different because of the history.

The 10-year test: After 10 years, the coaching log would have been summarized through multiple block transitions, but the accumulated insights — what works for this athlete, what doesn't, how he responds to different stimuli, what he tends to reject, what nutrition approaches stick — would make the coaching profoundly different from a fresh start.

---

### Summary

| Principle | Pre-refactor | Post-refactor |
|-----------|-------------|---------------|
| 1. App informs, Coach advises | ✅ | ✅ |
| 2. Logging is communication | ✅ | ✅ |
| 3. Silence means on course | 🟡 | 🟡 (acceptable) |
| 4. Meaningful events, not states | ❌ | ✅ |
| 5. Decisions persist, deliberations don't | ❌ | ✅ |
| 6. History is continuous | ❌ | ✅ |
| 7. Plan deserves commitment | 🟡 | ✅ |
| 8. Recovery is relative | ❌ | ✅ |
| 9. Priorities are situational | ❌ | ✅ |
| 10. Training blocks are chapters | ❌ | ✅ |
| 11. Every decision better than the last | ❌ | ✅ |
| 12. Trust is the core | 🟡 | ✅ |
| S4.4 Evolution | ❌ | ✅ |
| S5.3 Athlete overrides | 🟡 | ✅ |
| S6.5 Honest bad news | ✅ | ✅ |
| S12.2 Coach's voice | 🟡 | ✅ |
| S13 Recovery contextual | ❌ | ✅ |
| S14 Nutrition philosophy | ✅ | ✅ |
| S16 Training blocks | ❌ | ✅ |
| S17 Long-term memory | ❌ | ✅ |
| S18 Failure and discontinuity | ❌ | ✅ |
| S19 Trust and data confidence | ❌ | ✅ |

**Pre-refactor:** 5 ✅, 4 🟡, 13 ❌
**Post-refactor:** 21 ✅, 1 🟡

---

### The 10-Year Question

"If this Coach Skill coached the same athlete every week for the next ten years, would it become wiser, or would it simply generate ten years of excellent reports?"

**Answer: It would become wiser.**

The coaching log accumulates decisions, outcomes, and insights. Each weekly debrief reads the log, references previous decisions, updates outcomes, and records new insights. The current training block provides temporal context. Phase transitions are deliberate coaching acts with retrospectives. Priorities evolve with evidence.

After 10 years, the coaching log (summarized through block transitions) would contain a compressed history of what worked, what didn't, what the athlete prefers, how his body responds, what injuries recur, and what coaching approaches produce the best outcomes. A session in year 10 would be informed by 9 years of accumulated coaching wisdom — meaningfully different from a session in month 1.

This was not true before the refactor.

---

### What Remains Imperfect

1. **The coaching log depends on LLM discipline.** The LLM must actually read the log and reference it. If a Cursor session doesn't load the file, the coach loses memory. This is a platform constraint, not a design flaw.

2. **Log maintenance requires human oversight.** The 200-line cap and block-transition summarization depend on someone managing the file. In practice, this will be the athlete or a Cursor session asked to clean up.

3. **S4.5 (trigger by decision-making, not schedule) remains partially addressed.** The regular cadence (daily/weekly) is practical but doesn't perfectly match the Product Bible's vision of on-demand coaching triggered by meaningful decisions. The mid-week question pathway partially addresses this.

4. **Silence principle (Core Principle 3) is inherently tension with on-demand debriefs.** When the athlete asks for a debrief, the coach should respond — even on a quiet day. The instruction "do not manufacture adjustments" is the correct mitigation.

These are acceptable trade-offs. None violates the Product Bible. They are practical limitations of the current platform.

---

### Domain Knowledge Preservation Audit

| Domain knowledge | Status |
|-----------------|--------|
| Indian vegetarian food estimation | ✅ Preserved in `weekly-plan-and-nutrition.mdc` |
| Protein floor 140–150g, 152g+ on long-run days | ✅ Preserved |
| Fat floor 55–65g | ✅ Preserved |
| Triglyceride-aware carb flagging | ✅ Preserved |
| Mileage-scaled calorie adjustments | ✅ Preserved |
| Refeed template for 12+ km weeks | ✅ Preserved |
| Fasting rules during HM prep | ✅ Preserved |
| Rest-day NEAT requirements | ✅ Preserved |
| Friday pre-long-run dinner | ✅ Preserved |
| Body comp interpretation rules | ✅ Unchanged (`body-comp.mdc`) |
| Deficit taper by BF% band | ✅ Unchanged |
| 10% weekly mileage rule | ✅ Preserved (reframed as strong guideline) |
| Knee/cadence monitoring | ✅ Preserved |
| Run-day non-negotiables | ✅ Preserved |
| Calorie/deficit anchors | ✅ Preserved in `personal-details.md` |
| Supplement protocol | ✅ Unchanged |
| Blood work / medical context | ✅ Unchanged |
| Warm-up/cool-down templates | ✅ Unchanged (`week-plans.py`) |
| Meal planning with portions | ✅ Preserved in weekly plan S7 |
| Coach calculates macros | ✅ Preserved |

**Zero domain knowledge removed.**

---

## Refactor Complete

**Status:** All 5 phases complete.

| Phase | Status |
|-------|--------|
| Phase 1 — Validated Review | ✅ 13 recommendations evaluated |
| Phase 2 — Architecture Changes | ✅ 5 changes designed, 5 ADRs documented |
| Phase 3 — Refactoring Plan | ✅ Every change specified per file |
| Phase 4 — Updated Coach Skill | ✅ 2 files created, 7 files modified |
| Phase 5 — Final Verification | ✅ 22 principles verified, 21 ✅, 1 🟡 |

**Pre-refactor alignment:** 5/22 principles fully met.
**Post-refactor alignment:** 21/22 principles fully met.
