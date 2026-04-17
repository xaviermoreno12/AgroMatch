window.AgroMatch = (() => {

  // ── Toast notification ────────────────────────────────────────────────────
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.ag-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'ag-toast';
    toast.style.cssText = `
      position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
      background: ${type === 'success' ? 'var(--color-primary)' : 'var(--color-surface-high)'};
      color: #fff; padding: 14px 28px;
      font-family: var(--font-headline); font-weight: 700; font-size: 13px;
      text-transform: uppercase; letter-spacing: 0.1em;
      z-index: 300; border-left: 4px solid var(--color-accent);
      animation: slideUp 0.3s ease; white-space: nowrap;
    `;
    toast.textContent = message;

    if (!document.querySelector('#ag-toast-anim')) {
      const style = document.createElement('style');
      style.id = 'ag-toast-anim';
      style.textContent = '@keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }';
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
  }

  function initModals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });
  }

  // ── Active nav link highlight ─────────────────────────────────────────────
  function highlightNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .bottom-nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ── Subscribe buttons ─────────────────────────────────────────────────────
  function initSubscribeButtons() {
    document.getElementById('btn-subscribe')?.addEventListener('click', () => {
      window.StripeAPI.redirectToSubscription();
    });
    document.getElementById('btn-paylead')?.addEventListener('click', () => {
      window.StripeAPI.redirectToPayPerLead();
    });
    document.getElementById('btn-modal-subscribe')?.addEventListener('click', () => {
      closeModal('payment-modal');
      window.StripeAPI.redirectToSubscription();
    });
    document.getElementById('btn-modal-paylead')?.addEventListener('click', () => {
      closeModal('payment-modal');
      window.StripeAPI.redirectToPayPerLead();
    });
  }

  // ── Page-specific init ────────────────────────────────────────────────────
  async function init() {
    highlightNav();
    initModals();
    initSubscribeButtons();

    // Handle Stripe payment success return
    await window.Auth.handlePaymentReturn();

    const page = window.location.pathname.split('/').pop() || 'index.html';

    if (page === 'app.html') {
      window.Filter.init();
      await window.Swipe.init();
    }

    if (page === 'dashboard.html') {
      await window.Dashboard.init();
    }
  }

  return { init, showToast, closeModal };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => window.AgroMatch.init());
