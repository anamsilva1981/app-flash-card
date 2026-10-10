-- Minimal representation of the historical schema that predates the migrations
-- tracked in this repository. Integration starts from it so additive migrations
-- and the later access revocations are exercised in their real order.
create table public.study_subjects (
  id uuid primary key,
  name text not null
);

create table public.study_queue (
  id uuid primary key,
  title text not null,
  subject text not null default '',
  notes text not null default '',
  link text,
  priority text not null default 'media',
  status text not null default 'todo',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.study_activity (
  activity_date date not null,
  kind text not null,
  label text not null,
  unique (activity_date, kind, label)
);

create table public.seed_card_progress (card_id bigint primary key);

-- These historical relations are only needed to verify that the protection
-- migration revokes their old API privileges.
create table public.subjects (id bigint primary key);
create table public.topics (id bigint primary key);
create table public.flashcards (id bigint primary key);
create table public.card_progress (id bigint primary key);
create table public.review_events (id bigint primary key);
create table public.review_sessions (id bigint primary key);

grant all on table
  public.study_subjects,
  public.study_queue,
  public.study_activity,
  public.seed_card_progress,
  public.subjects,
  public.topics,
  public.flashcards,
  public.card_progress,
  public.review_events,
  public.review_sessions
to anon, authenticated;
