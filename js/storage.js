/**
 * STORAGE ADAPTER - Sertão Maker
 * 
 * Camada de abstração para armazenamento de arquivos.
 * Para trocar o provedor de armazenamento no futuro,
 * basta modificar apenas este arquivo.
 * 
 * Provedor atual: Supabase Storage
 * Outros possíveis: Cloudflare R2, Backblaze B2, AWS S3
 */

const Storage = {

  // ── Configuração do provedor ──────────────────────────
  PROVIDER: 'supabase', // trocar aqui para mudar o provedor
  BUCKETS: {
    imagens: 'imagens-projetos',
    arquivos: 'arquivos-projetos'
  },

  // ── Upload principal ──────────────────────────────────
  async uploadImagem(arquivo, projetoId) {
    if (this.PROVIDER === 'supabase') {
      return this._supabaseUpload(arquivo, this.BUCKETS.imagens, `${projetoId}/${Date.now()}_${arquivo.name}`);
    }
    throw new Error('Provedor não suportado: ' + this.PROVIDER);
  },

  async uploadArquivo(arquivo, projetoId) {
    if (this.PROVIDER === 'supabase') {
      return this._supabaseUpload(arquivo, this.BUCKETS.arquivos, `${projetoId}/${Date.now()}_${arquivo.name}`);
    }
    throw new Error('Provedor não suportado: ' + this.PROVIDER);
  },

  async deletarArquivo(path, bucket) {
    if (this.PROVIDER === 'supabase') {
      const { error } = await supabaseClient.storage.from(bucket).remove([path]);
      if (error) throw error;
    }
  },

  // ── URL pública ───────────────────────────────────────
  urlPublica(path, bucket) {
    if (this.PROVIDER === 'supabase') {
      const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    }
    throw new Error('Provedor não suportado: ' + this.PROVIDER);
  },

  urlImagem(path) {
    return this.urlPublica(path, this.BUCKETS.imagens);
  },

  urlArquivo(path) {
    return this.urlPublica(path, this.BUCKETS.arquivos);
  },

  // ── Implementação Supabase ────────────────────────────
  async _supabaseUpload(arquivo, bucket, path) {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(path, arquivo, {
        cacheControl: '3600',
        upsert: false
      });
    if (error) throw error;
    return { path: data.path, url: this.urlPublica(data.path, bucket) };
  }
};
