const Drive = {
  tokenClient: null,
  accessToken: null,

  async inicializar() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: (response) => {
            if (response.access_token) {
              this.accessToken = response.access_token;
            }
          }
        });
        resolve();
      };
      document.head.appendChild(script);
    });
  },

  async obterToken() {
    if (this.accessToken) return this.accessToken;
    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response) => {
        if (response.error) reject(response);
        else {
          this.accessToken = response.access_token;
          resolve(response.access_token);
        }
      };
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  async fazerUpload(arquivo, nomeArquivo, mimeType) {
    const token = await this.obterToken();

    const metadata = {
      name: nomeArquivo,
      mimeType: mimeType,
      parents: [GOOGLE_DRIVE_FOLDER_ID]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', arquivo);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Erro no upload');
    }

    const arquivo_salvo = await response.json();

    await fetch(`https://www.googleapis.com/drive/v3/files/${arquivo_salvo.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });

    return arquivo_salvo;
  },

  async fazerUploadImagem(arquivo) {
    return this.fazerUpload(arquivo, `img_${Date.now()}_${arquivo.name}`, arquivo.type);
  },

  async fazerUploadProjeto(arquivo) {
    return this.fazerUpload(arquivo, `proj_${Date.now()}_${arquivo.name}`, arquivo.type);
  },

  urlVisualizacao(fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  },

  urlDownload(fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  },

  urlImagem(fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }
};
