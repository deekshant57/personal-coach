// Shared loading indicator helpers (static — no animation loop)

export function spinnerHtml(size = '') {
  const sizeClass = size ? ` coach-loader--${size}` : '';
  return `<span class="coach-loader${sizeClass}" role="status" aria-label="Loading"></span>`;
}

export function loadingCenterHtml(message = 'Loading…') {
  return `<div class="loading-center" role="status">${spinnerHtml('lg')}<span class="loading-message">${message}</span></div>`;
}

export function loadingInlineHtml(message = 'Loading…') {
  return `<span class="loading-inline">${spinnerHtml('sm')}<span>${message}</span></span>`;
}

export function skeletonBarHtml({ width = '100%', height = '12px' } = {}) {
  return `<span class="skeleton-bar" style="width:${width};height:${height}" aria-hidden="true"></span>`;
}

export function skeletonPlanHtml() {
  return `<div class="skeleton-block" role="status" aria-label="Loading plan">
    ${skeletonBarHtml({ width: '70%', height: '14px' })}
    ${skeletonBarHtml({ width: '90%', height: '12px' })}
    ${skeletonBarHtml({ width: '55%', height: '12px' })}
  </div>`;
}

export function skeletonWeekCardsHtml(count = 7) {
  const rows = Array.from({ length: count }, () => `
    <div class="skeleton-week-row" aria-hidden="true">
      ${skeletonBarHtml({ width: '32%', height: '14px' })}
      <span class="skeleton-week-dots"><span></span><span></span><span></span></span>
      ${skeletonBarHtml({ width: '18%', height: '12px' })}
    </div>`).join('');
  return `<div class="skeleton-week-list" role="status" aria-label="Loading week">${rows}</div>`;
}

export function skeletonProgressCardHtml() {
  return `<div class="skeleton-block" role="status" aria-label="Loading">
    ${skeletonBarHtml({ width: '45%', height: '14px' })}
    ${skeletonBarHtml({ width: '100%', height: '64px' })}
    ${skeletonBarHtml({ width: '60%', height: '12px' })}
  </div>`;
}

const buttonLabels = new WeakMap();

export function setButtonLoading(btn, loading, label = null) {
  if (!btn) return;

  if (loading) {
    if (!buttonLabels.has(btn)) {
      buttonLabels.set(btn, label ?? btn.textContent.trim());
    }
    btn.disabled = true;
    btn.classList.add('is-loading');
    const idleLabel = buttonLabels.get(btn);
    btn.innerHTML = `<span class="btn-loading-inner">${spinnerHtml('sm')}<span class="btn-loading-text">${idleLabel}</span></span>`;
    return;
  }

  btn.classList.remove('is-loading');
  btn.disabled = false;
  const idleLabel = label ?? buttonLabels.get(btn) ?? '';
  btn.textContent = idleLabel;
  buttonLabels.delete(btn);
}

export function setOverlayLoading(overlayId, loading) {
  const el = document.getElementById(overlayId);
  if (!el) return;
  el.classList.toggle('is-active', loading);
  el.setAttribute('aria-hidden', loading ? 'false' : 'true');
}
