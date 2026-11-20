-- =====================================================================
-- LK-TECH — schéma Supabase (à coller dans : SQL Editor → New query)
-- Ou via CLI : supabase db push
-- ---------------------------------------------------------------------
-- À exécuter UNE fois après la création du projet Supabase.
-- RLS est activé sur toutes les tables : aucune politique "anon" →
-- le grand public ne peut rien lire ni écrire directement.
-- Seul le backend Next.js (clé service_role) accède aux données.
-- =====================================================================

create extension if not exists "pgcrypto";

-- Contenu éditorial de la vitrine (une seule ligne : cle = 'principal')
create table if not exists contenu (
  cle     text primary key,
  donnees jsonb not null,
  maj_le  timestamptz not null default now()
);

-- Réglages du site (devise, maintenance, portail client…)
create table if not exists reglages (
  cle     text primary key,
  donnees jsonb not null,
  maj_le  timestamptz not null default now()
);

-- Boutique
create table if not exists produits (
  id          text primary key,
  nom         text not null,
  description text default '',
  prix        numeric not null default 0,
  devise      text default 'USD',
  filtre      text default '',
  categorie   text default '',
  badge       text default '',
  image       text default '',
  stock       integer default 0,
  actif       boolean default true,
  ordre       integer default 0,
  cree_le     timestamptz default now()
);

-- Messages du formulaire de contact
create table if not exists messages (
  id       text primary key,
  nom      text not null,
  email    text not null,
  telephone text default '',
  sujet    text default '',
  message  text not null,
  lu       boolean default false,
  recu_le  timestamptz default now()
);

-- Journal d'activité (connexions, enregistrements…)
create table if not exists journal (
  id      bigint generated always as identity primary key,
  type    text not null,
  details jsonb,
  le      timestamptz default now()
);

-- ---------------------------------------------------------------------
-- RLS : activé partout, AUCUNE policy → accès refusé aux clés anon/publiques
-- ---------------------------------------------------------------------
alter table contenu enable row level security;
alter table reglages enable row level security;
alter table produits enable row level security;
alter table messages enable row level security;
alter table journal  enable row level security;

-- Index utiles
create index if not exists idx_messages_recu_le on messages (recu_le desc);
create index if not exists idx_produits_actif    on produits (actif);
create index if not exists idx_journal_le        on journal (le desc);

-- ---------------------------------------------------------------------
-- OPTIONNEL — administrateur Supabase Auth
-- Créer le compte dans : Dashboard → Authentication → Users → Add user
--   e-mail    : admin@linksmartec.com   (ou SUPABASE_ADMIN_EMAIL)
--   password  : au choix, auto-confirm activé
-- Aucun insert SQL n'est nécessaire ici.
-- ---------------------------------------------------------------------
