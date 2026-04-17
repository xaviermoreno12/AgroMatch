window.Swipe = (() => {
  let machines = [];
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  const SWIPE_THRESHOLD = 100;

  function getCard() { return document.querySelector('.swipe-card'); }

  function renderCard(machine) {
    const card = getCard();
    if (!card) return;

    card.style.transition = '';
    card.style.transform  = 'translateX(0) rotate(0deg)';
    card.style.opacity    = '1';

    card.querySelector('.machine-img').src    = machine.image_url || '';
    card.querySelector('.machine-img').alt    = machine.model;
    card.querySelector('.machine-model').textContent  = machine.model;
    card.querySelector('.machine-detail').textContent =
      `${machine.type?.toUpperCase()} • ${machine.status?.toUpperCase() || 'AVAILABLE'}`;
    card.querySelector('.machine-location').textContent = machine.location;
    card.querySelector('.machine-status').textContent   = machine.status?.toUpperCase() || 'AVAILABLE';
    card.querySelector('.spec1-label').textContent = machine.spec1_label || 'Power';
    card.querySelector('.spec1-value').textContent = machine.spec1_value || `${machine.horsepower} HP`;
    card.querySelector('.spec2-label').textContent = machine.spec2_label || 'Daily Rate';
    card.querySelector('.spec2-value').textContent = machine.spec2_value || `$${machine.daily_rate} AUD`;

    card.dataset.machineId = machine.id;

    card.querySelector('.swipe-hint-left').style.opacity  = '0';
    card.querySelector('.swipe-hint-right').style.opacity = '0';
  }

  function applyTransform(x) {
    const card = getCard();
    if (!card) return;
    const rotation = x * 0.07;
    card.style.transform = `translateX(${x}px) rotate(${rotation}deg)`;

    const ratio = Math.min(Math.abs(x) / SWIPE_THRESHOLD, 1);
    if (x > 0) {
      card.querySelector('.swipe-hint-right').style.opacity = ratio;
      card.querySelector('.swipe-hint-left').style.opacity  = 0;
    } else {
      card.querySelector('.swipe-hint-left').style.opacity  = ratio;
      card.querySelector('.swipe-hint-right').style.opacity = 0;
    }
  }

  function resetCard() {
    const card = getCard();
    if (!card) return;
    card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform  = 'translateX(0) rotate(0deg)';
    card.querySelector('.swipe-hint-left').style.opacity  = '0';
    card.querySelector('.swipe-hint-right').style.opacity = '0';
    setTimeout(() => { if (card) card.style.transition = ''; }, 400);
  }

  // ── MATCH: creates a pending match record, requires subscription ───────
  async function match() {
    const card = getCard();
    if (!card) return;
    const machineId = card.dataset.machineId;

    const profile = await window.SupabaseAPI.getProfile();
    if (!profile?.subscription_active) {
      resetCard();
      document.getElementById('payment-modal')?.classList.add('active');
      return;
    }

    card.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
    card.style.transform  = 'translateX(160%) rotate(30deg)';
    card.style.opacity    = '0';

    await window.SupabaseAPI.createMatch(machineId);
    window.AgroMatch?.showToast('Match created! The operator will contact you.', 'success');
    setTimeout(nextCard, 350);
  }

  // ── RECHAZADO: records rejection, animates left ────────────────────────
  async function reject() {
    const card = getCard();
    if (!card) return;
    const machineId = card.dataset.machineId;

    card.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
    card.style.transform  = 'translateX(-160%) rotate(-30deg)';
    card.style.opacity    = '0';

    await window.SupabaseAPI.createRejection(machineId);
    window.AgroMatch?.showToast('Marked as not interested.', 'info');
    setTimeout(nextCard, 350);
  }

  // ── OMITIR: just moves to next, no record ─────────────────────────────
  function skip() {
    const card = getCard();
    if (!card) return;

    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    card.style.transform  = 'translateY(-20px) scale(0.95)';
    card.style.opacity    = '0';
    setTimeout(() => {
      nextCard();
      window.AgroMatch?.showToast('Skipped — you can come back later.', 'info');
    }, 300);
  }

  function nextCard() {
    if (!machines.length) return;
    currentIndex = (currentIndex + 1) % machines.length;
    renderCard(machines[currentIndex]);
  }

  // ── Pointer/mouse events ──────────────────────────────────────────────
  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX;
    currentX = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    applyTransform(currentX);
  }
  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    if (currentX > SWIPE_THRESHOLD)       match();
    else if (currentX < -SWIPE_THRESHOLD) reject();
    else                                  resetCard();
  }

  // ── Touch events ──────────────────────────────────────────────────────
  function onTouchStart(e) {
    isDragging = true;
    startX = e.touches[0].clientX;
    currentX = 0;
  }
  function onTouchMove(e) {
    if (!isDragging) return;
    currentX = e.touches[0].clientX - startX;
    if (Math.abs(currentX) > 8) e.preventDefault();
    applyTransform(currentX);
  }
  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    if (currentX > SWIPE_THRESHOLD)       match();
    else if (currentX < -SWIPE_THRESHOLD) reject();
    else                                  resetCard();
  }

  async function init() {
    const card = getCard();
    if (!card) return;

    machines = await window.SupabaseAPI.loadMachinery();
    if (!machines.length) return;
    currentIndex = 0;
    renderCard(machines[0]);

    card.addEventListener('pointerdown',   onPointerDown);
    card.addEventListener('pointermove',   onPointerMove);
    card.addEventListener('pointerup',     onPointerUp);
    card.addEventListener('pointercancel', onPointerUp);

    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchmove',  onTouchMove,  { passive: false });
    card.addEventListener('touchend',   onTouchEnd);

    document.getElementById('btn-reject')?.addEventListener('click', reject);
    document.getElementById('btn-match')?.addEventListener('click', match);
    document.getElementById('btn-skip')?.addEventListener('click', skip);
  }

  async function reloadWithFilter(filters) {
    machines = await window.SupabaseAPI.loadMachinery(filters);
    if (!machines.length) return;
    currentIndex = 0;
    renderCard(machines[0]);
  }

  return { init, match, reject, skip, reloadWithFilter };
})();
