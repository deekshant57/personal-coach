# Personal Coach — Product Bible

**Version:** 1.0
**Date:** 02 July 2026
**Author:** Deekshant (Founder & Athlete)
**Status:** Living document — updated as philosophy evolves

---

## What This Document Is

This is the foundational philosophy of the Personal Coach product.

It defines what the product is, why it exists, what it believes, and how it should behave.

Every feature, every screen, every interaction, and every line of copy should be traceable to a principle in this document.

If a decision contradicts this document, either the decision is wrong or this document needs to be updated. There is no middle ground.

---

## Table of Contents

1. [Product Identity](#1-product-identity)
2. [The Three Actors](#2-the-three-actors)
3. [The App's Role](#3-the-apps-role)
4. [The Coach Skill's Role](#4-the-coach-skills-role)
5. [The Athlete's Role](#5-the-athletes-role)
6. [Coaching Philosophy](#6-coaching-philosophy)
7. [Logging Philosophy](#7-logging-philosophy)
8. [Data Philosophy](#8-data-philosophy)
9. [Intelligence Levels](#9-intelligence-levels)
10. [Meaningful Events Framework](#10-meaningful-events-framework)
11. [Silence Philosophy](#11-silence-philosophy)
12. [Voice and Tone](#12-voice-and-tone)
13. [Recovery Philosophy](#13-recovery-philosophy)
14. [Nutrition Philosophy](#14-nutrition-philosophy)
15. [The Plan](#15-the-plan)
16. [Training Blocks](#16-training-blocks)
17. [Long-Term Memory](#17-long-term-memory)
18. [Failure and Discontinuity](#18-failure-and-discontinuity)
19. [Trust and Data Confidence](#19-trust-and-data-confidence)
20. [Success and Failure Conditions](#20-success-and-failure-conditions)
21. [What the Product Is Not](#21-what-the-product-is-not)
22. [Core Principles Summary](#22-core-principles-summary)

---

## 1. Product Identity

**Name:** Personal Coach

**What it fundamentally is:** Athletic Memory

The Personal Coach is not a fitness tracker, not a dashboard, and not a coaching AI. It is the athlete's long-term athletic memory — a system that remembers everything the athlete would otherwise forget but that a great coach never would.

The product exists to enable consistently better decisions over time.

**One-sentence definition:**

> A system that remembers, observes, and provides context so that better decisions emerge from the collaboration between athlete, app, and coaching skill.

---

## 2. The Three Actors

The Personal Coach ecosystem has three distinct actors. Each has a clear role, and the boundaries between them are load-bearing.

### The Athlete

Logs data. Follows the plan. Makes final decisions. Owns the journey.

### The Personal Coach App

Remembers everything. Organizes information. Provides context. Surfaces meaningful events. Makes data easy to consume. Supports today's decisions.

The app is the canonical source of truth for all long-term athletic data and accepted coaching outcomes.

### The Coach Skill

An external workflow run manually every 2-3 days. Analyzes accumulated data. Generates coaching recommendations. Resolves trade-offs. Makes judgments.

The Coach Skill is not part of the application. It is a separate process that consumes the app's data and produces coaching decisions.

**The app is the memory and the interface. The Coach Skill is the brain.**

These roles must never blur. The app does not advise. The Coach Skill does not store. The athlete decides.

---

## 3. The App's Role

The app has five responsibilities:

### 3.1 Capture

Collect high-quality information with minimal friction. Every piece of data logged should have long-term coaching value. Nothing is collected for the sake of collecting.

### 3.2 Remember

Be the single source of truth for the athlete's complete history — training, nutrition, medical reports, coaching decisions, body composition, habits, goals, injuries, and any information with enduring coaching relevance.

The app should remember things the athlete would forget but a great coach never would.

### 3.3 Observe

Surface meaningful events — facts and patterns derived from stored data — without interpretation. The app understands the data. It does not interpret the athlete.

### 3.4 Contextualize

Connect related facts to provide situational awareness. Help the athlete understand their current situation by presenting relevant information together.

### 3.5 Serve the Coach Skill

Ensure that when the Coach Skill runs, every relevant piece of context is available. The app maintains data quality and completeness so that coaching analysis is never limited by missing or unreliable information.

---

## 4. The Coach Skill's Role

The Coach Skill is the interpretive layer. It has responsibilities the app deliberately does not:

### 4.1 Judgment

The Coach Skill evaluates trade-offs, considers competing priorities, weighs uncertainty, and makes recommendations. Two experienced coaches might reasonably disagree on the right call — that's exactly why judgment belongs here, not in the app.

### 4.2 Recommendations

"Reduce mileage." "Add 200 calories on gym days." "Skip leg day." "Deload this week." These are coaching decisions that require context, priorities, and judgment. They come exclusively from the Coach Skill.

### 4.3 Long-Term Evaluation

The Coach Skill evaluates adherence, patterns, and outcomes over weeks and months. It answers not just "what happened?" but "what should happen next?"

### 4.4 Evolution

The Coach Skill should evolve with the athlete. It should continuously learn from history, accepted and rejected recommendations, outcomes, preferences, injuries, and responses to training. Every coaching session should build on previous ones. It should never behave like a fresh coach starting from zero.

### 4.5 Trigger

The Coach Skill is run on demand, triggered by decision-making, not by schedule. The athlete seeks coaching when a meaningful decision needs to be made or when enough new information has accumulated to justify a new analysis.

---

## 5. The Athlete's Role

### 5.1 Log Honestly

The athlete provides accurate data. The system's value is proportional to the quality of its inputs.

### 5.2 Commit to the Plan

The plan deserves commitment, not blind obedience. It should be followed with discipline but can be changed through the coaching process when evidence justifies it — not when emotions do.

### 5.3 Make Final Decisions

The Coach Skill is an advisor, not an authority. The athlete may question, challenge, and override recommendations. Coaching is a collaborative process, not blind obedience.

When the athlete overrides a recommendation, that is part of the coaching history:
- What the Coach Skill recommended
- What the athlete decided
- Optionally, why the athlete chose differently

These moments are not compliance failures. They are decisions — often the most valuable learning opportunities in the system.

---

## 6. Coaching Philosophy

### 6.1 Coaching is Collaborative

The Coach Skill advises. The athlete decides. Neither has absolute authority. The best decisions emerge from the interaction between accumulated data, coaching analysis, and the athlete's lived experience.

### 6.2 Priorities Are Situational

There is no fixed hierarchy between fat loss, performance, muscle preservation, knee health, recovery, or habit management. Priorities are resolved through the coaching process by evaluating evidence, goals, constraints, and trade-offs at that point in time.

### 6.3 Decisions Persist, Deliberations Don't

The app remembers decisions — coaching recommendations, accepted or rejected, with outcomes.

The app does not store deliberations — intermediate reasoning, alternative options considered, chain-of-thought analysis. These are transient and belong to the coaching session, not the permanent record.

**The database stores decisions, not deliberations.**

### 6.4 Accepted Decisions Become the Plan

Once a coaching decision is accepted, it becomes the plan. The app does not keep reminding the athlete that something changed. However, the history of that decision remains accessible on demand.

By default, the app presents the current plan. The athlete focuses on execution. The reasoning behind a change is available when the athlete chooses to look, never forced into view.

### 6.5 Bad News Is Delivered Honestly

The coaching voice should be honest, evidence-based, respectful, and never sacrifice truth for comfort.

No sugarcoating. No hedging. No burying difficult messages in qualifiers.

If the evidence says the athlete should not attempt the race, the Coach Skill says so — with evidence, with empathy, but without softening the conclusion.

### 6.6 Difficult Moments Are Acknowledged, Not Dramatized

The app remains objective always. The Coach Skill acknowledges emotional reality when relevant — a bad race result, a recurring injury, a month of lost motivation — but always through empathy, evidence, and perspective.

Never through sympathy, motivation, or reassurance. The coaching relationship recognizes difficult moments without letting emotion override sound coaching.

---

## 7. Logging Philosophy

### 7.1 Logging Is Communication, Not Accomplishment

The act of logging should feel almost invisible. The effort should go into the training, not into recording the training.

Logging is how the athlete communicates with the coaching system. It is not an achievement to be celebrated. No badges. No streaks. No confetti. No "Great job!" messages.

The emotional reward comes from the coaching that follows, not from the act of entering data.

### 7.2 The Emotional Register

The app should quietly acknowledge that it has understood what was entered.

After logging a run, the app might say:
> "Cadence improved to 148. That's the highest this month."

Or:
> "Today's run completed. I'll take this into account during the next coaching review."

These responses tell the athlete their effort has been understood, not merely recorded.

The feeling should be: **trust.**

Every piece of information entered has a purpose. Nothing is collected for the sake of collecting. Everything contributes to future coaching.

### 7.3 The App Should Feel

- Effortless
- Purposeful
- Trustworthy
- Almost invisible
- Calm, confident, and professional
- Not motivational
- Not overly enthusiastic
- Not judgmental
- Like reporting to a coach who already knows you well

### 7.4 Log What Improves Coaching

Every field must pass the test: "Would a coach make a different decision if this field were missing?"

If the answer is no, the field should not exist.

### 7.5 The Fastest Log Wins

Every tap, every field, every scroll distance is friction. Friction accumulates across hundreds of logging sessions over a training block. A single unnecessary field costs hundreds of interactions.

### 7.6 Never Lose Data Silently

Failed saves must be unmissable. No silent data loss. If a write fails, the athlete must know immediately and have a path to retry.

### 7.7 Don't Log What the System Can Calculate

- Pace should auto-calculate from distance and time
- Daily macros should auto-sum from food items
- Weekly aggregates should auto-compute
- Meal timing should be inferred from slot structure

The athlete logs raw inputs. The system derives everything else.

---

## 8. Data Philosophy

### 8.1 The Boundary

The boundary of what belongs in the app is not determined by data type. It is determined by whether the information has long-term coaching value.

> If I expect my coach to remember it six months or even five years from now because it could influence future coaching decisions, it belongs in the Personal Coach App.

Everything else can remain transient.

### 8.2 What Belongs

**Long-lived athlete profile:**
Height, current goals, race history, injury history, training preferences, baseline metrics, equipment.

**Medical history with coaching relevance:**
Blood reports, body composition scans, cardiac reports, bone density scans. The reports themselves should be preserved, not just extracted values.

**Clinical recommendations:**
"Vitamin D supplementation for 12 weeks." "Avoid high-impact running for four weeks." "Right IT band tight — perform hip mobility before running." These often remain relevant long after the appointment.

**Athlete observations:**
"Knee discomfort only appears after 12 km." "Morning workouts consistently feel stronger than evening." These accumulate into coaching knowledge over time.

**Coaching decisions:**
What was recommended, what was accepted or rejected, the rationale, and the outcomes.

### 8.3 What Does Not Belong

- Today's grocery list
- Why a meal was skipped today
- An experimental workout idea never followed
- The Coach Skill's internal reasoning process
- Cursor conversations
- Any information without enduring coaching relevance

### 8.4 The App Is the Canonical Record

The Cursor conversations are not the permanent record. The Personal Coach App is always the canonical source of truth for long-term data and accepted coaching outcomes.

Nothing important should be lost. The app should retain every coaching decision that changes future behavior or provides historical context.

---

## 9. Intelligence Levels

The app operates at three levels of intelligence. The boundary between Level 2 and Level 3 is the most important boundary in the product.

### Level 1 — Observation

The app freely surfaces objective facts derived directly from stored data.

Examples:
- "Cadence: 148 (+4 from last month)."
- "3 workouts completed this week."
- "Protein target achieved 5 of the last 7 days."
- "Sleep averaged 6.4 hours over the last three nights."

These are facts. Different coaches would agree they're true.

### Level 2 — Context

The app connects related facts to provide situational awareness.

Example:
- "Sleep averaged 6.2h over the last four nights. Today's scheduled session is your weekly long run."

This is not coaching. The app is helping the athlete understand their current situation by presenting relevant information together. The athlete is responsible for interpreting it.

This is not a recommendation. It is good situational awareness.

### Level 3 — Coaching (FORBIDDEN for the app)

This is where the Coach Skill begins. The app must stop before telling the athlete what to do.

The app should never say:
- "Reduce tomorrow's mileage."
- "Skip leg day."
- "Increase calories."
- "You are overtraining."
- "You should deload."
- "This plateau means you need more protein."

These require judgment. They require understanding goals, trade-offs, training history, medical context, and uncertainty. Two experienced coaches might reasonably disagree. That is exactly why these decisions belong exclusively to the Coach Skill.

**The app informs. The Coach Skill advises.**

**The app remembers and observes. The Coach Skill interprets and recommends.**

This boundary keeps the app trustworthy because it never pretends to know more than it does. When coaching advice appears, it carries more weight because it comes from the dedicated coaching workflow — not from every screen in the application.

---

## 10. Meaningful Events Framework

The app should not surface changes. The app should surface **meaningful events**.

A meaningful event is anything that materially changes the athlete's understanding of their current situation, whether because something changed or because something expected didn't.

### 10.1 New Events

Something happened for the first time.

- "Sleep below target for 3 consecutive nights."
- "Longest run of the training block."
- "First body composition scan in six weeks."

### 10.2 Progression Events

An existing situation has meaningfully evolved.

- "Sleep deficit has extended from 3 to 5 nights."
- "Protein compliance has improved from 50% to 85%."
- "Cadence has increased to a new monthly high."

### 10.3 Stagnation Events

An expected change has not occurred within a meaningful period.

- "Weight has remained stable for 14 days despite a consistent caloric deficit."
- "Cadence has not improved for the last six runs."
- "Sleep has plateaued below target for three weeks."

The absence of expected change is itself informative.

### 10.4 Milestone Events

A meaningful threshold has been reached.

- "Body weight entered the target range."
- "Halfway through the current training block."
- "100 km completed in this block."

### 10.5 Event Lifecycle

Each meaningful event is surfaced **once**, when it becomes true. After that, it becomes part of the athlete's history unless the situation changes again.

The Coach Skill is responsible for answering "Why did this happen?" and "What should we do next?"

The app's responsibility is to ensure the athlete notices that something meaningful has occurred.

---

## 11. Silence Philosophy

**Silence is not a lack of value. Silence means the athlete is on course.**

When everything is going right — training on plan, sleep adequate, nutrition on target, no meaningful events — the app should be comfortable being quiet.

No manufactured interest. No motivational quotes. No repeated reminders. No recycled observations. No attempt to fill empty space.

The app should earn the athlete's attention only when something meaningful changes, stagnates, progresses, or reaches a milestone. Otherwise, it should quietly support the plan and stay out of the way.

A perfectly boring day is a successful day. The app should respect that by being calm.

On a quiet day, the athlete should see:
- Today's training plan
- Current progress through today's logging
- Current training block context
- Any outstanding items that genuinely need attention
- And then nothing else

The athlete should close it within a few seconds and get on with their day.

The absence of observations is itself information — it means the athlete is following the plan, nothing unexpected has happened, and no decision is currently required.

---

## 12. Voice and Tone

### 12.1 The App's Voice

The app is calm, confident, professional, and objective.

It presents facts without judgment — in either direction. A bad day is treated exactly like a good day: objectively, consistently, and without emotion.

The app is a mirror, not a parent.

It does not:
- Celebrate ("Great job!")
- Shame ("You missed your target")
- Motivate ("You can do it!")
- Minimize ("Don't worry about it")
- Judge ("That was a bad decision")

### 12.2 The Coach Skill's Voice

The coaching voice should feel like a trusted coach reviewing an athlete they've worked with for years.

- Direct. Uses the athlete's own language and context.
- Earned familiarity. Does not reintroduce itself every session.
- Evidence-based. Every observation is grounded in data.
- Respectful. Treats the athlete as an intelligent adult.
- Honest. Never sacrifices truth for comfort.
- Concise. Says what needs to be said without padding.

Less like an AI assistant. More like a coach who knows you.

### 12.3 Unified Experience

Although the app and Coach Skill have different roles, the overall experience should feel like one coaching relationship, not two separate systems. The tone of the app's observations and the Coach Skill's analysis should feel like different registers of the same voice — not different people.

---

## 13. Recovery Philosophy

**Recovery is always contextual.**

Being recovered enough for an easy Zone 2 run is different from being recovered enough for heavy squats or a 20 km long run.

The Coach Skill assesses recovery relative to the next training demand, not as an absolute state. There is no generic "recovery score."

Recovery signals include: sleep quality and duration, RPE trends, knee status, subjective fatigue, nutrition compliance, and training load history. These are inputs to coaching judgment, not standalone metrics.

---

## 14. Nutrition Philosophy

### 14.1 Purpose of Tracking

The purpose of logging food is to create an accurate record. The purpose of showing targets is to help the athlete make better decisions before the day is over.

### 14.2 Situational Awareness, Not Calorie Gaming

During the day, the app provides quiet situational awareness:

> Protein: 82g / 150g. Estimated remaining: 68g. Two meals likely remaining.

That's enough to decide whether the next meal should include paneer or a protein shake.

The app isn't telling the athlete what to eat. It's helping them understand where they stand.

### 14.3 Today's Decisions vs. Long-Term Adherence

The app supports today's decisions. The Coach Skill evaluates long-term adherence.

If the athlete finishes at 138g instead of 150g because of a family dinner, that's acceptable. The Coach Skill evaluates whether it's isolated or part of a pattern.

The app should not become a calorie game. It should influence behavior by improving awareness, not by rewarding or pressuring.

### 14.4 Data Confidence

Food macros from a tap-grid with estimated values are directionally accurate, not clinically precise. The system should preserve this distinction. The Coach Skill should know which data is high confidence (lab reports, body comp scans) and which is moderate confidence (estimated food macros).

---

## 15. The Plan

### 15.1 The Plan Deserves Commitment

The plan is not a suggestion. It carries weight. It was created through the coaching process with evidence and intention.

### 15.2 The Plan Is Not Law

The plan should evolve when evidence justifies it, not when emotions do.

Changes happen through the coaching process. Not on a whim mid-workout. Not because the athlete feels strong today. Not because they feel tired today. Through analysis, evidence, and deliberate decision-making.

### 15.3 Rest Days Are Active

Rest days are still training days. The app should help the athlete execute recovery: nutrition, supplements, sleep, hydration, and any prescribed mobility or rehabilitation.

The app should provide awareness of what's coming next, preparing the athlete for the next training stimulus. It should never simply say "do nothing."

**Rest days maintain readiness.**

---

## 16. Training Blocks

### 16.1 Training Blocks Are Chapters

The athlete's history is organized by training blocks, not by calendar dates. Each block is a complete story:

- What was the goal?
- What plan was followed?
- What actually happened?
- What were the important coaching decisions?
- What was learned?
- What was the final outcome?

Within each chapter, the supporting details — progress trends, weekly reviews, coaching decisions, body composition, medical events, training consistency, key milestones — provide the evidence.

### 16.2 Blocks Are Defined by Intent

Training blocks are defined by coaching decisions, not by dates on a calendar.

A block begins when the coaching process establishes a new primary goal and a plan to pursue it.

A block ends when the goal has been achieved, abandoned with reason, or superseded by a new priority.

Blocks can end early due to injury, life events, or a goal that no longer makes sense.

### 16.3 Closing a Block Is Deliberate

The transition between blocks is a deliberate coaching act — a final review, a summary, and a reflection. One block does not simply stop and the next begin. The chapter is closed with a coaching assessment of what happened and what was learned.

### 16.4 The App Always Knows the Current Block

The current training block is the primary context for everything. What observations are relevant, what patterns matter, what the Coach Skill should focus on — all are colored by the active block's goal.

---

## 17. Long-Term Memory

### 17.1 The App Is the Athlete's Athletic Memory

The app should become more than a logbook. It should become the athlete's long-term athletic memory.

Every workout, every race, every injury, every coaching decision, every successful block, every setback — they should not exist as isolated events. They should build on one another so that each year the athlete knows more about themselves than they did the year before.

### 17.2 Navigating History

The primary way to navigate the past is through training blocks.

Opening a training block should feel like reading a chapter:
- The goal and context
- The plan
- What happened
- Key decisions
- Lessons learned
- The outcome

Graphs, timelines, and historical metrics are supporting evidence — not the primary experience. The primary experience is understanding how the athlete evolved through successive training blocks.

### 17.3 The Most Irreplaceable Data

If everything else were lost, the coaching history would be the most important thing to recover: training blocks, coaching decisions, accepted and rejected recommendations, rationale, outcomes, and lessons learned.

Raw data can be recreated over time. Accumulated wisdom cannot.

### 17.4 Nothing Important Should Be Lost

The app should retain every coaching decision that changes future behavior or provides historical context. Six months or five years later, the athlete should understand not only what happened but what decisions were made and why.

---

## 18. Failure and Discontinuity

### 18.1 Failure Is Not a Special Case

The app treats a bad day exactly as it treats a good day: objectively, consistently, and without judgment.

A day with 5 hours of sleep, a skipped workout, poor nutrition, and missed supplements is presented the same way as a perfect day — facts and relevant patterns, no shame, no encouragement, no minimization.

Interpreting whether a bad day matters is the Coach Skill's responsibility, not the app's.

### 18.2 Gaps Are Chapters, Not Failures

When the athlete returns after a significant gap — vacation, injury, lost motivation — the app should:

- Present today's date and wait
- Not guilt the athlete for returning
- Not ask "where have you been?"
- Simply make it easy to continue from today

The first coaching review after a gap should rebuild context before making recommendations.

**The athlete's history is continuous, even when the data isn't.**

A gap is simply another chapter in the history. The system treats it with the same objectivity and respect as every other part of the journey.

The app should never make the athlete feel like they're returning after failing. It should make them feel like they're continuing their journey from where they are today.

---

## 19. Trust and Data Confidence

### 19.1 Directional Accuracy

The goal is not perfect measurement. The goal is sufficiently reliable information to make consistently better coaching decisions over time.

If today's protein shows 148g, the important question isn't whether it's actually 146g or 151g. The important question is whether the athlete is consistently meeting nutritional intent over days and weeks.

Coaching decisions are driven by trends, consistency, and patterns — not by individual values.

### 19.2 Confidence Levels

Not all data has equal reliability. The system should preserve and communicate the confidence level of its data:

**High confidence:** Body composition scans, laboratory reports, race results, directly measured values.

**Moderate confidence:** Manually estimated food macros, self-reported sleep hours, RPE ratings.

The Coach Skill should always understand the confidence level of the data it's analyzing. Uncertainty should be preserved rather than hidden.

### 19.3 Continuous Improvement

Accuracy matters. The app should continuously improve the quality of its data because better data leads to better coaching. But perfection is not the standard — reliability is.

---

## 20. Success and Failure Conditions

### 20.1 Success

The product succeeds if, over time, it helps the athlete make consistently better decisions than they would have made on their own.

Better decisions about:
- When to push and when to recover
- How to balance fat loss with performance
- How to preserve muscle while training for endurance
- How to adapt when life changes
- How to learn from previous mistakes instead of repeating them

**The real measure:**

> Every decision the athlete makes should be slightly better than the last because the system remembers what they would otherwise forget.

After two years, the athlete should be able to look back and clearly understand: what worked, what didn't, why it happened, what was learned, and how they evolved.

### 20.2 Failure

The product fails if it becomes just another tracker.

If the athlete spends time logging data that never meaningfully improves decisions...

If the Coach Skill gives the same advice it could give someone who has never used the app...

If history becomes an archive instead of accumulated knowledge...

Then what exists is a beautiful database, not a Personal Coach.

### 20.3 The Distinction

> A tracker stores what happened. A coach remembers why it mattered.

---

## 21. What the Product Is Not

**Not a fitness tracker.** Trackers record activity. This product remembers an athlete's journey and enables better decisions.

**Not a dashboard.** Dashboards display data statically. This product surfaces meaningful events contextually.

**Not a coaching AI.** The app does not advise. It informs and observes. Coaching judgment belongs to the Coach Skill.

**Not a motivation tool.** No badges, streaks, confetti, or praise. The app is calm and professional.

**Not a calorie counter.** Nutrition tracking serves coaching decisions, not daily number-chasing.

**Not a social platform.** This is a private coaching relationship, not a feed.

**Not a generic health app.** Every feature must serve the specific athlete's coaching needs. Nothing exists because "health apps usually have this."

---

## 22. Core Principles Summary

These are the load-bearing principles of the product. They are ordered by importance.

1. **The app informs. The Coach Skill advises.** The boundary between observation and recommendation is the most important boundary in the product.

2. **Logging is communication, not accomplishment.** The act of logging should be invisible. The value comes from coaching, not from data entry.

3. **Silence means the athlete is on course.** The app earns attention only when something meaningful occurs. Otherwise, it stays quiet.

4. **Surface meaningful events, not states.** New events, progression, stagnation, and milestones. Each surfaced once when it becomes true.

5. **Decisions persist, deliberations don't.** The database stores what was decided and what happened, not how the decision was reached.

6. **The athlete's history is continuous, even when the data isn't.** Gaps are chapters, not failures.

7. **The plan deserves commitment, not blind obedience.** Change through evidence and coaching, not through emotion.

8. **Recovery is relative to the next demand.** There is no generic recovery score.

9. **Priorities are situational.** No fixed hierarchy. Trade-offs are resolved through the coaching process.

10. **Training blocks are chapters.** History is organized by goals and intent, not by calendar dates.

11. **Every decision should be slightly better than the last.** The system's value is measured by the quality of decisions it enables over time.

12. **Trust is the product's emotional core.** The athlete should feel that every piece of logged data has a purpose, that nothing is collected without reason, and that the system will remember what matters.

---

*This is a living document. It should be updated when the athlete's philosophy evolves — but only through deliberate decisions, not casual edits. Every principle here was earned through experience and reflection.*
