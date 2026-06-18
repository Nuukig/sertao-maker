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

create table if not exists projetos (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descricao text,
  categoria text not null,
  usuario_id uuid references perfis(id) on delete cascade not null,
  imagem_drive_id text,
  arquivo_drive_id text,
  criado_em timestamp with time zone default timezone('utc'::text, now())
);

alter table perfis enable row level security;
alter table projetos enable row level security;

create policy "Qualquer um pode ver perfis"
  on perfis for select using (true);

create policy "Usuario pode inserir proprio perfil"
  on perfis for insert with check (auth.uid() = id);

create policy "Usuario pode atualizar proprio perfil"
  on perfis for update using (auth.uid() = id);

create policy "Qualquer um pode ver projetos"
  on projetos for select using (true);

create policy "Usuario autenticado pode criar projeto"
  on projetos for insert with check (auth.uid() = usuario_id);

create policy "Dono pode deletar proprio projeto"
  on projetos for delete using (auth.uid() = usuario_id);
