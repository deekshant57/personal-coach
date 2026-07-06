// Level 1 event copy — shared by meaningful-events and observation-engine
export function eventLabel(event) {
  const labels = {
    'threshold:sleep:3nights_below_7h': 'Sleep below 7h for 3 consecutive nights.',
    'progression:cadence:monthly_high': event.payload?.cadence
      ? `Cadence ${event.payload.cadence} — highest this month.`
      : 'Cadence monthly high.',
    'stagnation:cadence:6runs_flat': 'Cadence unchanged over last 6 runs.',
    'milestone:long_run:block_record': event.payload?.km
      ? `Longest run of this block: ${event.payload.km} km.`
      : 'New long-run block record.',
    'new:pace:below_730': event.payload?.pace
      ? `First run below 7:30/km this block (${event.payload.pace}).`
      : 'First run below 7:30/km this block.',
  };
  return labels[event.id] || `${event.type}: ${event.metric}`;
}
