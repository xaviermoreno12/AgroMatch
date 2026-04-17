window.Dashboard = (() => {

  function renderStats(profile, matches, machinery) {
    // Stats
    const totalMatches  = document.getElementById('stat-matches');
    const activeListings = document.getElementById('stat-listings');
    const fleetSize     = document.getElementById('stat-fleet');

    if (totalMatches)   totalMatches.textContent  = matches.length  || '0';
    if (activeListings) activeListings.textContent = machinery.length || '0';
    if (fleetSize)      fleetSize.textContent      = machinery.length || '0';

    // Subscription badge
    const subStatus = document.getElementById('sub-status-text');
    if (subStatus) {
      subStatus.textContent = profile?.subscription_active ? 'Premium Active' : 'Free Plan';
    }
    const subDesc = document.getElementById('sub-description');
    if (subDesc && !profile?.subscription_active) {
      subDesc.textContent = 'Upgrade to Premium for $10 AUD/month to unlock unlimited matches and direct contact.';
    }

    // User name
    const nameEl = document.getElementById('profile-name');
    if (nameEl && profile?.full_name) {
      nameEl.textContent = profile.full_name.split(' ').map(n => n[0]).join('. ') + '.';
    }
  }

  function renderMatches(matches) {
    const grid = document.getElementById('matches-grid');
    if (!grid) return;

    if (!matches.length) {
      grid.innerHTML = '<p class="empty-state"><span class="material-symbols-outlined" style="font-size:3rem;display:block;margin-bottom:12px;color:var(--color-text-muted)">search_off</span>No hay matches aún. ¡Empezá a deslizar en la pantalla de Match!</p>';
      return;
    }

    grid.innerHTML = matches.slice(0, 6).map(m => {
      const machine = m.machinery || m;
      return `
        <div class="match-card">
          <div class="match-card-img-wrap">
            <img class="match-card-img" src="${machine.image_url || ''}" alt="${machine.model || ''}">
            <div class="match-score">${Math.floor(Math.random() * 20 + 80)}% MATCH</div>
          </div>
          <div class="match-card-body">
            <div class="match-card-header">
              <h3 class="match-card-model">${machine.model || '—'}</h3>
              <span class="match-card-price">$${machine.daily_rate || '—'}/day</span>
            </div>
            <p class="match-card-sub">${machine.type || ''} • ${machine.status || 'Available'}</p>
            <div class="match-card-tags">
              <span class="tag">${machine.location || 'AU'}</span>
              <span class="tag">${machine.horsepower ? machine.horsepower + ' HP' : 'Fleet'}</span>
            </div>
            <button class="btn btn-outline-accent btn-full" style="font-size:12px;padding:12px 16px;">VIEW SPECIFICATIONS</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function init() {
    const [profile, matches, machinery] = await Promise.all([
      window.SupabaseAPI.getProfile(),
      window.SupabaseAPI.getMatches(),
      window.SupabaseAPI.getUserMachinery()
    ]);

    renderStats(profile, matches, machinery);
    renderMatches(matches.length ? matches : MOCK_MACHINES.map(m => ({ machinery: m })));

    // Manage billing button
    document.getElementById('btn-manage-billing')?.addEventListener('click', () => {
      window.StripeAPI.redirectToSubscription();
    });
  }

  return { init };
})();
