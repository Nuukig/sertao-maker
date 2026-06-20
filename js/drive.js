const Drive = {

  // Mantido para compatibilidade - não faz nada pois usamos Service Account no backend
  async inicializar() {
    return Promise.resolve();
  },

  async fazerUpload(arquivo, nomeArquivo, mimeType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];

          const response = await fetch('/api/upload-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: nomeArquivo,
              mimeType: mimeType,
              fileBase64: base64,
              folderId: GOOGLE_DRIVE_FOLDER_ID
            })
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erro no upload');
          }

          const arquivo_salvo = await response.json();
          resolve(arquivo_salvo);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(arquivo);
    });
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
