// Vitals card expand/collapse UI (shared to avoid circular imports)

export function updateVitalsCollapseAria() {
  const btn = document.getElementById('vitals-collapse');
  const collapsed = document.getElementById('vitals-card')?.classList.contains('collapsed');
  if (!btn) return;
  btn.setAttribute('aria-expanded', String(!collapsed));
  btn.setAttribute('aria-label', collapsed ? 'Expand vitals' : 'Collapse vitals');
}

export function expandVitalsCard() {
  document.getElementById('vitals-card')?.classList.remove('collapsed');
  updateVitalsCollapseAria();
}

export function collapseVitalsCard() {
  document.getElementById('vitals-card')?.classList.add('collapsed');
  updateVitalsCollapseAria();
}
