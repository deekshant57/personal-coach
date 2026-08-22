# Whole-App UI Plan (MFP-inspired, phased)

**Status:** Implemented (phases 0–6)  
**Parent decisions:** Diary-first home (1A); steal diary+macro spine, lists/sheets, Progress layout, chrome; ship phase-wise.  
**Identity:** Athletic Memory — no ads, streaks, or calorie shame (`PRODUCT-BIBLE.md`).

See also: Food search is local-first; Open Food Facts only via **Look up packaged** / barcode.

## IA

| Nav | Role |
|-----|------|
| **Today** | Diary home |
| **Food** | Deep meal logging + Add sheet |
| **Plan** | Week browse |
| **Progress** | Charts (Body / Nutrition / Training / Recovery) |

## Phases

0. Kill auto-OFF; Create / Look up CTAs; this doc — **done**  
1. Chrome + macro spine + nav labels — **done**  
2. Today diary-home — **done**  
3. Food Add sheet (Recent / Yours / Staples) + confirm + Indian staples — **done**  
4. Plan tab density — **done**  
5. Progress grouped layout — **done**  
6. Polish + SW bump (`coach-v27`) — **done**

## Prod checklist (before ship)

1. Run `athlete-profiles.sql` then `user-custom-foods.sql` in Supabase SQL Editor (additive only)
2. `python3 scripts/verify-phase-a-migration.py` → `VERIFY_OK`
3. Hard-refresh PWA / confirm SW `coach-v27`
4. Smoke: diary meal → Food; Add sheet tabs; empty search CTAs; Plan Open day; Progress groups  

## Food search rule (locked)

```
Staples + Your foods → Recent → Create custom → Look up packaged (OFF) → always Confirm
```

Never auto-call OFF on input.
