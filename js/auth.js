const Auth = {
  async login(email, senha) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password: senha
    });
    if (error) throw error;
    return data;
  },

  async registrar(nome, email, senha, tipo, matricula, curso) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, tipo, matricula, curso }
      }
    });
    if (error) throw error;

    if (data.user) {
      await supabaseClient.from('perfis').insert({
        id: data.user.id,
        nome,
        email,
        tipo,
        matricula,
        curso
      });
    }

    return data;
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
