// Modal focus trap — Sprint 6 a11y
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

let lastFocusedBeforeModal = null;

function getFocusable(container) {
  return [...container.querySelectorAll(FOCUSABLE)]
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function trapTab(e, overlay) {
  if (e.key !== 'Tab') return;

  const focusable = getFocusable(overlay);
  if (!focusable.length) {
    e.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function onOverlayKeydown(e) {
  const overlay = e.currentTarget;
  if (!overlay.classList.contains('show')) return;

  if (e.key === 'Escape') {
    const cancelBtn = overlay.querySelector('#confirm-modal-cancel, #dirty-slot-cancel, #custom-cancel');
    if (cancelBtn) {
      cancelBtn.click();
      return;
    }
    overlay.classList.remove('show');
    lastFocusedBeforeModal?.focus?.();
    lastFocusedBeforeModal = null;
    return;
  }

  trapTab(e, overlay);
}

function observeModalShow(overlay) {
  const observer = new MutationObserver(() => {
    if (overlay.classList.contains('show')) {
      lastFocusedBeforeModal = document.activeElement;
      const focusable = getFocusable(overlay);
      (focusable[0] || overlay.querySelector('.modal'))?.focus?.();
    } else if (lastFocusedBeforeModal) {
      lastFocusedBeforeModal.focus?.();
      lastFocusedBeforeModal = null;
    }
  });
  observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
}

export function setupModalFocusTraps() {
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('keydown', onOverlayKeydown);
    observeModalShow(overlay);
    const modal = overlay.querySelector('.modal');
    if (modal && !modal.hasAttribute('tabindex')) {
      modal.setAttribute('tabindex', '-1');
    }
  });
}

/** Focus trap for the Food Add bottom sheet (class `.open`, not `.show`). */
export function setupSheetFocusTrap(sheetEl, { onEscape } = {}) {
  if (!sheetEl) return;
  const panel = sheetEl.querySelector('.food-add-sheet-panel') || sheetEl;

  sheetEl.addEventListener('keydown', (e) => {
    if (!sheetEl.classList.contains('open')) return;
    if (e.key === 'Escape') {
      onEscape?.();
      return;
    }
    trapTab(e, panel);
  });
}
