# Friends invite gate

**Audience:** ~10 self-serve friends (gym-only, run-only, hybrid).  
**Rule:** Invite only when the app needs **no hand-holding**.

North star: tracker on the surface (Floor), athletic memory underneath (Close → notes + Trends).

---

## 1. Prod migrations (run in Supabase SQL Editor)

1. `athlete-profiles.sql` (if not already)
2. `athlete-profiles-sport-mode.sql` — `sport_mode`, `ui_flags`
3. `user-custom-foods.sql`
4. `supabase-workout-exercises.sql`
5. Confirm auth RLS (`supabase-auth.sql` policies) — own-row only

Optional: `python3 scripts/verify-phase-a-migration.py` if present → `VERIFY_OK`.

---

## 2. Smoke matrix (fresh account each preset)

For **Gym-only**, **Run-only**, and **Hybrid**:

1. Sign up → email confirm (or disable confirm for private invite)  
2. Setup: pick preset → name + targets → Save & continue  
3. Today: vitals save  
4. **Start session** → Floor logging → **Finish** → Close chips optional → Save & close  
5. Memory summary visible; Food log one meal  
6. Plan tab shows week; **Extend plan** works  
7. Progress: correct chrome (no run charts for gym-only; no lifts for run-only)

Also: hard-refresh PWA; SW cache `coach-v35`.

---

## 3. What you send friends

1. PWA URL  
2. “Create account → pick Gym / Run / Hybrid → Save”  
3. No Cursor, no debrief paste, no you editing Supabase  

---

## 4. Out of scope for this invite

- Coaching them in Cursor  
- openGym-parity features  
- Social / streaks  

If someone needs hand-holding mid-onboarding, the invite gate failed — fix Setup/Session before inviting the rest.
