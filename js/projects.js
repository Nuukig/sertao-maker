const Projetos = {
  categorias: [
    { id: 'impressao3d', label: 'Impressão 3D', icone: '🖨️' },
    { id: 'laser_cnc', label: 'Corte a Laser / CNC', icone: '🔆' },
    { id: 'outro', label: 'Outro', icone: '🔧' }
  ],

  async listar(filtros = {}) {
    let query = supabaseClient
      .from('projetos')
      .select('*, perfis (nome)')
      .order('criado_em', { ascending: false });

    if (filtros.categoria && filtros.categoria !== 'todos') {
      query = query.eq('categoria', filtros.categoria);
    }
    if (filtros.busca) {
      query = query.ilike('titulo', `%${filtros.busca}%`);
    }
    if (filtros.usuario_id) {
      query = query.eq('usuario_id', filtros.usuario_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async buscarPorId(id) {
    const { data, error } = await supabaseClient
      .from('projetos')
      .select('*, perfis (nome)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async criar(dados) {
    const { data, error } = await supabaseClient
      .from('projetos')
      .insert(dados)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletar(id) {
    const { error } = await supabaseClient
      .from('projetos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getLabelCategoria(id) {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.label : id;
  },

  getIconeCategoria(id) {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.icone : '🔧';
  },

  // Pega primeira imagem do array
  primeiraImagem(projeto) {
    if (projeto.imagens && projeto.imagens.length > 0) {
      return Storage.urlImagem(projeto.imagens[0]);
    }
    return null;
  },

  renderCard(projeto, usuarioAtualId) {
    const imgSrc = this.primeiraImagem(projeto);
    const eProprietario = projeto.usuario_id === usuarioAtualId;
    const temArquivo = projeto.arquivos && projeto.arquivos.length > 0;

    return `
      <div class="projeto-card" data-id="${projeto.id}">
        ${imgSrc
          ? `<img class="imagem" src="${imgSrc}" alt="${projeto.titulo}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''
        }
        <div class="imagem-placeholder" ${imgSrc ? 'style="display:none"' : ''}>
          ${this.getIconeCategoria(projeto.categoria)}
        </div>
        <div class="info">
          <div class="titulo">${projeto.titulo}</div>
          <div class="descricao">${projeto.descricao || 'Sem descrição.'}</div>
          <div class="meta">
            <span>${projeto.perfis?.nome || 'Desconhecido'}</span>
            <span class="badge badge-categoria">${this.getLabelCategoria(projeto.categoria)}</span>
          </div>
        </div>
        <div class="rodape">
          <button class="btn btn-outline btn-sm" onclick="abrirProjeto('${projeto.id}')">Ver projeto</button>
          ${temArquivo
            ? `<a class="btn btn-primary btn-sm" href="${Storage.urlArquivo(projeto.arquivos[0])}" target="_blank">⬇ Baixar</a>`
            : ''
          }
          ${eProprietario
            ? `<button class="btn btn-danger btn-sm" onclick="confirmarDelecao('${projeto.id}', event)">Excluir</button>`
            : ''
          }
        </div>
      </div>
    `;
  },

  renderModal(projeto) {
    const imagens = projeto.imagens || [];
    const arquivos = projeto.arquivos || [];

    const galeria = imagens.length > 0
      ? `<div style="display:flex;gap:8px;overflow-x:auto;margin-bottom:20px;padding-bottom:4px">
          ${imagens.map(path => `
            <img src="${Storage.urlImagem(path)}" 
              style="height:200px;min-width:200px;object-fit:cover;border-radius:10px;cursor:pointer"
              onclick="this.style.height=this.style.height==='auto'?'200px':'auto'">`
          ).join('')}
        </div>`
      : `<div class="imagem-placeholder" style="height:160px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;font-size:64px;margin-bottom:20px">${this.getIconeCategoria(projeto.categoria)}</div>`;

    const listaArquivos = arquivos.length > 0
      ? arquivos.map((path, i) => {
          const nome = path.split('/').pop().replace(/^\d+_/, '');
          return `<a class="btn btn-primary" href="${Storage.urlArquivo(path)}" target="_blank" style="margin-bottom:8px">⬇ Baixar arquivo ${arquivos.length > 1 ? i+1 : ''}: ${nome}</a>`;
        }).join('')
      : '<span style="color:#999;font-size:13px">Nenhum arquivo disponível para download.</span>';

    return `
      <div class="modal-header">
        <div>
          <h2>${projeto.titulo}</h2>
          <div class="modal-meta">
            <span class="badge badge-categoria">${this.getLabelCategoria(projeto.categoria)}</span>
          </div>
        </div>
        <button class="modal-close" onclick="fecharModal()">✕</button>
      </div>
      <div class="modal-body">
        ${galeria}
        <p class="modal-descricao">${projeto.descricao || 'Sem descrição.'}</p>
        <div style="font-size:13px;color:#777;margin-bottom:20px">
          <strong>Autor:</strong> ${projeto.perfis?.nome || 'Desconhecido'}
        </div>
        <div class="modal-actions" style="display:flex;flex-direction:column;align-items:flex-start">
          ${listaArquivos}
        </div>
      </div>
    `;
  }
};
