const Auth = {
  async loginComGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/index.html'
      }
    });
    if (error) throw error;
  },

  async logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    window.location.href = 'login.html';
  },

  async getUsuarioAtual() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;

    const { data: perfil } = await supabaseClient
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      const nome = user.user_metadata?.full_name || user.email;
      const avatar = user.user_metadata?.avatar_url || null;
      await supabaseClient.from('perfis').insert({
        id: user.id,
        nome,
        email: user.email,
        tipo: 'discente',
        matricula: '',
        curso: '',
        avatar
      });
      return { id: user.id, nome, email: user.email, tipo: 'discente', avatar };
    }

    return perfil;
  },

  async exigirLogin() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }
};
