"""Week plan constants (Namrata).

Source of truth for scheduled days: Supabase ``daily_plans``
(user ``9e6a0d55-b63f-4857-b318-122e0c337ef4``).

Live week rows were removed from this file 21 Aug 2026 so the DB cannot be
overwritten by stale seeds. Coach workflow:

1. Author Week N+1 in debrief / chat
2. PATCH Supabase ``daily_plans`` for her user_id
3. Verify the week layout in the app / a DB dump

``WEEK_PLANS`` stays empty on purpose.
"""

NA = "NA"

# Intentionally empty — live plans live in Supabase daily_plans.
WEEK_PLANS = {}
