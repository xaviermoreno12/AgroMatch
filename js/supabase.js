// Supabase client — loaded from CDN in HTML
const _isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL';

let _client = null;
if (_isSupabaseConfigured) {
  const { createClient } = supabase;
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

window.SupabaseAPI = {
  client: _client,

  async getUser() {
    if (!_client) return null;
    const { data: { user } } = await _client.auth.getUser();
    return user;
  },

  async getProfile() {
    if (!_client) return { subscription_active: false, full_name: 'Demo User' };
    const user = await this.getUser();
    if (!user) return null;
    const { data } = await _client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return data;
  },

  async loadMachinery(filters = {}) {
    if (!_client) {
      // Filter mock data locally
      let result = [...MOCK_MACHINES];
      if (filters.type && filters.type !== 'All') {
        result = result.filter(m => m.type === filters.type);
      }
      return result;
    }
    let query = _client.from('machinery').select('*');
    if (filters.type && filters.type !== 'All') query = query.eq('type', filters.type);
    if (filters.location)  query = query.eq('location', filters.location);
    if (filters.status)    query = query.eq('status', filters.status);
    const { data } = await query;
    return data || [];
  },

  async createMatch(machineId) {
    if (!_client) {
      console.log('[Mock] Match created for machine:', machineId);
      return { id: 'mock-match-' + Date.now(), machine_id: machineId };
    }
    const user = await this.getUser();
    if (!user) return null;
    const { data } = await _client
      .from('matches')
      .insert({ contractor_id: user.id, machine_id: machineId, status: 'pending' })
      .select()
      .single();
    return data;
  },

  async getMatches() {
    if (!_client) return [];
    const user = await this.getUser();
    if (!user) return [];
    const { data } = await _client
      .from('matches')
      .select('*, machinery(*)')
      .eq('contractor_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async updateSubscription() {
    if (!_client) return true;
    const user = await this.getUser();
    if (!user) return false;
    const { data } = await _client
      .from('profiles')
      .update({ subscription_active: true })
      .eq('id', user.id)
      .select()
      .single();
    return !!data;
  },

  async createProfile(userId, fullName, isContractor) {
    if (!_client) return null;
    const { data } = await _client
      .from('profiles')
      .insert({ id: userId, full_name: fullName, is_contractor: isContractor })
      .select()
      .single();
    return data;
  },

  async getUserMachinery() {
    if (!_client) return MOCK_MACHINES.slice(0, 2);
    const user = await this.getUser();
    if (!user) return [];
    const { data } = await _client
      .from('machinery')
      .select('*')
      .eq('owner_id', user.id);
    return data || [];
  },

  async createRejection(machineId) {
    if (!_client) {
      console.log('[Mock] Rejection for machine:', machineId);
      return;
    }
    const user = await this.getUser();
    if (!user) return;
    await _client
      .from('matches')
      .insert({ contractor_id: user.id, machine_id: machineId, status: 'rejected' });
  },

  async addMachinery(machineData) {
    if (!_client) return null;
    const user = await this.getUser();
    if (!user) return null;
    const { data } = await _client
      .from('machinery')
      .insert({ ...machineData, owner_id: user.id })
      .select()
      .single();
    return data;
  }
};
