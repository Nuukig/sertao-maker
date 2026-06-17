const Projetos = {
  categorias: [
    { id: 'impressao3d', label: 'Impressão 3D', icone: '🖨️' },
    { id: 'cnc', label: 'CNC', icone: '⚙️' },
    { id: 'laser', label: 'Corte a Laser', icone: '🔆' },
    { id: 'eletronica', label: 'Eletrônica', icone: '🔌' },
    { id: 'robotica', label: 'Robótica', icone: '🤖' },
    { id: 'outro', label: 'Outro', icone: '🔧' }
  ],

  async listar(filtros = {}) {
    let query = supabaseClient
      .from('projetos')
      .select(`
        *,
        perfis (nome, tipo, matricula)
      `)
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
      .select(`
        *,
        perfis (nome, tipo, matricula, curso)
      `)
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

  renderCard(projeto, usuarioAtualId) {
    const temImagem = projeto.imagem_drive_id;
    const imgSrc = temImagem ? Drive.urlImagem(projeto.imagem_drive_id) : null;
    const eProprietario = projeto.usuario_id === usuarioAtualId;

    return `
      <div class="projeto-card" data-id="${projeto.id}">
        ${temImagem
          ? `<img class="imagem" src="${imgSrc}" alt="${projeto.titulo}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''
        }
        <div class="imagem-placeholder" ${temImagem ? 'style="display:none"' : ''}>
          ${this.getIconeCategoria(projeto.categoria)}
        </div>
        <div class="info">
          <div class="titulo">${projeto.titulo}</div>
          <div class="descricao">${projeto.descricao || 'Sem descrição.'}</div>
          <div class="meta">
            <div class="autor">
              <span class="badge badge-${projeto.perfis?.tipo || 'discente'}">${projeto.perfis?.tipo || ''}</span>
              <span>${projeto.perfis?.nome || 'Desconhecido'}</span>
            </div>
            <span class="badge badge-categoria">${this.getLabelCategoria(projeto.categoria)}</span>
          </div>
        </div>
        <div class="rodape">
          <button class="btn btn-outline btn-sm" onclick="abrirProjeto('${projeto.id}')">Ver projeto</button>
          ${projeto.arquivo_drive_id
            ? `<a class="btn btn-primary btn-sm" href="${Drive.urlDownload(projeto.arquivo_drive_id)}" target="_blank">⬇ Baixar</a>`
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
    const temImagem = projeto.imagem_drive_id;
    const imgSrc = temImagem ? Drive.urlImagem(projeto.imagem_drive_id) : null;

    return `
      <div class="modal-header">
        <div>
          <h2>${projeto.titulo}</h2>
          <div class="modal-meta">
            <span class="badge badge-categoria">${this.getLabelCategoria(projeto.categoria)}</span>
            <span class="badge badge-${projeto.perfis?.tipo || 'discente'}">${projeto.perfis?.tipo || ''}</span>
          </div>
        </div>
        <button class="modal-close" onclick="fecharModal()">✕</button>
      </div>
      <div class="modal-body">
        ${temImagem
          ? `<img class="modal-img" src="${imgSrc}" alt="${projeto.titulo}">`
          : `<div class="imagem-placeholder" style="height:200px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;font-size:64px;margin-bottom:20px">${this.getIconeCategoria(projeto.categoria)}</div>`
        }
        <p class="modal-descricao">${projeto.descricao || 'Sem descrição.'}</p>
        <div style="font-size:13px;color:#777;margin-bottom:20px">
          <strong>Autor:</strong> ${projeto.perfis?.nome || 'Desconhecido'} &nbsp;|&nbsp;
          <strong>Matrícula:</strong> ${projeto.perfis?.matricula || '-'} &nbsp;|&nbsp;
          <strong>Curso:</strong> ${projeto.perfis?.curso || '-'}
        </div>
        <div class="modal-actions">
          ${projeto.arquivo_drive_id
            ? `<a class="btn btn-primary" href="${Drive.urlDownload(projeto.arquivo_drive_id)}" target="_blank">⬇ Baixar arquivo</a>
               <a class="btn btn-outline" href="${Drive.urlVisualizacao(projeto.arquivo_drive_id)}" target="_blank">🔗 Ver no Drive</a>`
            : '<span style="color:#999;font-size:13px">Nenhum arquivo disponível para download.</span>'
          }
        </div>
      </div>
    `;
  }
};
