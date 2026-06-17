# Sertão Maker — Site de Projetos

## Estrutura de arquivos

```
sertao-maker/
├── index.html            → Página principal com todos os projetos
├── login.html            → Tela de login
├── register.html         → Tela de cadastro
├── novo-projeto.html     → Upload de novo projeto
├── meus-projetos.html    → Projetos do usuário logado
├── css/
│   ├── style.css         → Estilo geral (header, cards, grid)
│   ├── auth.css          → Estilo das telas de login/registro
│   └── dashboard.css     → Estilo do dashboard e modal
├── js/
│   ├── config.js         → Configurações do Supabase e Google Drive
│   ├── auth.js           → Funções de autenticação
│   ├── drive.js          → Upload e links do Google Drive
│   └── projects.js       → Lógica de projetos (listar, criar, render)
├── assets/
│   └── logo.jpg          → Logo do Sertão Maker
└── SUPABASE_SETUP.sql    → Script SQL para criar o banco no Supabase
```

---

## PASSO A PASSO DE CONFIGURAÇÃO

### 1. Supabase (banco de dados + autenticação)

1. Acesse https://supabase.com e crie uma conta gratuita
2. Crie um novo projeto
3. Vá em **SQL Editor** e cole o conteúdo do arquivo `SUPABASE_SETUP.sql`
4. Execute o SQL (cria as tabelas perfis e projetos com segurança)
5. Vá em **Project Settings > API**
6. Copie a **Project URL** e a **anon key**
7. Cole em `js/config.js`:
   ```js
   const SUPABASE_URL = 'https://xxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ...';
   ```

### 2. Google Drive (armazenamento de arquivos)

1. Acesse https://console.cloud.google.com
2. Crie um projeto novo
3. Ative as APIs: **Google Drive API** e **Google Picker API**
4. Em **Credenciais**, crie:
   - Uma **Chave de API** → cole em `GOOGLE_API_KEY`
   - Um **ID de cliente OAuth 2.0** (Tipo: Aplicativo da Web) → cole em `GOOGLE_CLIENT_ID`
   - Em "Origens JavaScript autorizadas", coloque o endereço do seu site (ou `http://localhost` para testar)
5. No Google Drive, crie uma pasta chamada "Sertão Maker Projetos"
6. Clique com botão direito > Compartilhar > "Qualquer pessoa com o link pode ver"
7. Copie o ID da pasta (está na URL: `drive.google.com/drive/folders/ESTE_ID`)
8. Cole em `js/config.js`:
   ```js
   const GOOGLE_DRIVE_FOLDER_ID = 'ESTE_ID';
   const GOOGLE_API_KEY = 'AIza...';
   const GOOGLE_CLIENT_ID = '123456-xxx.apps.googleusercontent.com';
   ```

### 3. Abrir no VS Code

1. Abra o VS Code
2. Vá em **File > Open Folder** e selecione a pasta `sertao-maker`
3. Instale a extensão **Live Server** (por Ritwick Dey)
4. Clique com botão direito em `login.html` > **Open with Live Server**
5. O site abrirá em `http://127.0.0.1:5500/login.html`

---

## Como usar

1. Acesse `login.html` e crie uma conta em "Criar conta"
2. Escolha se é **Discente** ou **Docente** e preencha matrícula e curso
3. Após login, navegue pelos projetos em `index.html`
4. Para publicar, clique em **Publicar Projeto**
5. Faça upload da foto e do arquivo (STL, SVG, DXF, etc.)
6. O arquivo vai direto para o Google Drive — sem precisar de servidor!

---

## Categorias disponíveis

- 🖨️ Impressão 3D (.stl, .obj, .gcode, .f3d)
- ⚙️ CNC (.nc, .dxf, .svg)
- 🔆 Corte a Laser (.svg, .ai, .dxf)
- 🔌 Eletrônica (.pdf, esquemas)
- 🤖 Robótica
- 🔧 Outro
