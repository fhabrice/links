-- LK-TECH — Candidatures « Travailler avec nous » + Google Form bridge
create table if not exists candidatures (
  id                text primary key,
  civilite          text default '',
  nom               text not null,
  prenom            text not null,
  email             text not null,
  telephone         text default '',
  ville             text default '',
  date_naissance    text default '',
  domaine           text default '',
  type_collaboration text default '',
  experience        text default '',
  disponibilite     text default '',
  message           text not null,
  lien_cv           text default '',
  consentement      boolean default false,
  lu                boolean default false,
  recu_le           timestamptz default now()
);

-- Compatibilité avec code JS qui utilise dateNaissance / typeCollaboration en camelCase via mapping
-- On stocke en snake_case mais le backend JS envoie déjà les bonnes clés camelCase vers JSON local ;
-- Pour Supabase on mappe côté code (voir lib/store.js) — on garde ici des colonnes explicites.
-- Ajout des colonnes camelCase si ton projet préfère les conserver telles quelles :
alter table candidatures add column if not exists "dateNaissance" text default '';
alter table candidatures add column if not exists "typeCollaboration" text default '';
alter table candidatures add column if not exists "lienCv" text default '';

alter table candidatures enable row level security;
create index if not exists idx_candidatures_recu_le on candidatures (recu_le desc);
create index if not exists idx_candidatures_email on candidatures (email);
create index if not exists idx_candidatures_domaine on candidatures (domaine);
