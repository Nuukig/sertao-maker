-- ═══════════════════════════════════════════════════════
-- SERTÃO MAKER - Setup do banco de dados
-- Execute este SQL no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Tabela de perfis
create table if not exists perfis (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  email text not null,
  tipo text check (tipo in ('discente', 'docente')) not null default 'discente',
  matricula text,
  curso text,
  avatar text,
  criado_em timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de projetos (com suporte a múltiplas imagens e arquivos)
create table if not exists projetos (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descricao text,
  categoria text not null,
  usuario_id uuid references perfis(id) on delete cascade not null,
  imagens text[] default '{}',       -- array de paths (até 5)
  arquivos text[] default '{}',      -- array de paths (até 3)
  criado_em timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table perfis enable row level security;
alter table projetos enable row level security;

-- Policies perfis
create policy "Qualquer um pode ver perfis"
  on perfis for select using (true);

create policy "Usuario pode inserir proprio perfil"
  on perfis for insert with check (auth.uid() = id);

create policy "Usuario pode atualizar proprio perfil"
  on perfis for update using (auth.uid() = id);

-- Policies projetos
create policy "Qualquer um pode ver projetos"
  on projetos for select using (true);

create policy "Usuario autenticado pode criar projeto"
  on projetos for insert with check (auth.uid() = usuario_id);

create policy "Dono pode deletar proprio projeto"
  on projetos for delete using (auth.uid() = usuario_id);

-- ═══════════════════════════════════════════════════════
-- MIGRAÇÃO (rodar se já tiver a tabela antiga)
-- ═══════════════════════════════════════════════════════
-- alter table projetos add column if not exists imagens text[] default '{}';
-- alter table projetos add column if not exists arquivos text[] default '{}';
-- update projetos set imagens = ARRAY[imagem_drive_id] where imagem_drive_id is not null;
-- update projetos set arquivos = ARRAY[arquivo_drive_id] where arquivo_drive_id is not null;
-- alter table projetos drop column if exists imagem_drive_id;
-- alter table projetos drop column if exists arquivo_drive_id;
