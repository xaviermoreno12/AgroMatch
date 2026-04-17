window.Auth = {
  async signUp(email, password, fullName, isContractor) {
    if (!window.SupabaseAPI.client) {
      alert('Supabase not configured. Configure credentials in js/config.js');
      return { error: 'Not configured' };
    }
    const { data, error } = await window.SupabaseAPI.client.auth.signUp({ email, password });
    if (error) return { error };
    if (data.user) {
      await window.SupabaseAPI.createProfile(data.user.id, fullName, isContractor);
    }
    return { data };
  },

  async signIn(email, password) {
    if (!window.SupabaseAPI.client) {
      alert('Modo demo activo — Supabase no configurado.');
      return { error: null, demo: true };
    }
    const { data, error } = await window.SupabaseAPI.client.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signOut() {
    if (!window.SupabaseAPI.client) return;
    await window.SupabaseAPI.client.auth.signOut();
    window.location.href = 'index.html';
  },

  async handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;

    const updated = await window.SupabaseAPI.updateSubscription();
    if (updated) {
      // Clean URL without reload
      const url = new URL(window.location);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url);
      window.AgroMatch?.showToast('¡Suscripción activada! Ya podés hacer match.', 'success');
    }
  }
};
