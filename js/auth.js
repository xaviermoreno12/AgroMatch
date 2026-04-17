window.Auth = {
  async signUp(email, password, fullName, isContractor) {
    if (!window.SupabaseAPI.client) {
      alert('Supabase not configured. Add credentials to js/config.js');
      return { error: 'Not configured' };
    }
    const { data, error } = await window.SupabaseAPI.client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) return { error };
    if (data.user) {
      await window.SupabaseAPI.createProfile(data.user.id, fullName, isContractor);
    }
    return { data };
  },

  async signIn(email, password) {
    if (!window.SupabaseAPI.client) {
      // Demo mode: just go through
      return { error: null, demo: true };
    }
    const { data, error } = await window.SupabaseAPI.client.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signInWithGoogle() {
    if (!window.SupabaseAPI.client) {
      alert('Supabase not configured. Add credentials to js/config.js');
      return;
    }
    const { error } = await window.SupabaseAPI.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/app.html'
      }
    });
    if (error) {
      console.error('Google OAuth error:', error);
      window.AgroMatch?.showToast('Google sign-in failed. Try again.', 'error');
    }
  },

  async signOut() {
    if (!window.SupabaseAPI.client) {
      window.location.href = 'login.html';
      return;
    }
    await window.SupabaseAPI.client.auth.signOut();
    window.location.href = 'login.html';
  },

  async getSession() {
    if (!window.SupabaseAPI.client) return null;
    const { data: { session } } = await window.SupabaseAPI.client.auth.getSession();
    return session;
  },

  async handleOAuthCallback() {
    if (!window.SupabaseAPI.client) return;
    // Supabase handles the OAuth hash/token automatically on page load.
    // We just need to check if a new session was created and ensure the profile exists.
    const session = await this.getSession();
    if (!session) return;

    const profile = await window.SupabaseAPI.getProfile();
    if (!profile) {
      const meta = session.user.user_metadata || {};
      await window.SupabaseAPI.createProfile(
        session.user.id,
        meta.full_name || meta.name || session.user.email,
        false
      );
    }
  },

  async handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;

    const updated = await window.SupabaseAPI.updateSubscription();
    if (updated) {
      const url = new URL(window.location);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url);
      window.AgroMatch?.showToast('Subscription activated! You can now match.', 'success');
    }
  }
};
