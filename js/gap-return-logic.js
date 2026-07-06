// Pure gap detection helpers — Node-testable (no Supabase)
const LOOKBACK_DAYS = 90;

function calendarDate(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildActivityDateSet(vitals, foodLogs, runLogs, workoutLogs) {
  const dates = new Set();

  for (const v of vitals || []) {
    if (v.weight_kg != null || v.sleep_hours != null || v.cigarettes != null) {
      dates.add(v.date);
    }
  }

  for (const f of foodLogs || []) {
    if (f.total_protein > 0 || f.total_calories > 0 || f.custom_text) {
      dates.add(f.date);
    }
  }

  for (const r of runLogs || []) {
    if (r.done === true) dates.add(r.date);
  }

  for (const w of workoutLogs || []) {
    if (w.done === true) dates.add(w.date);
  }

  return dates;
}

/**
 * Count consecutive days without logs ending yesterday.
 * Returns { gapDays, lastLoggedDate } where lastLoggedDate is most recent activity on or before today.
 */
export function computeLoggingGap(activityDates, today = new Date()) {
  const todayD = calendarDate(today);
  let lastLoggedDate = null;

  for (const iso of [...activityDates].sort().reverse()) {
    const d = calendarDate(new Date(`${iso}T12:00:00`));
    if (d.getTime() <= todayD.getTime()) {
      lastLoggedDate = iso;
      break;
    }
  }

  let gapDays = 0;
  const cursor = new Date(todayD);
  cursor.setDate(cursor.getDate() - 1);

  while (gapDays < LOOKBACK_DAYS) {
    const iso = formatDate(cursor);
    if (activityDates.has(iso)) break;
    gapDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { gapDays, lastLoggedDate };
}
