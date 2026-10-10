-- Schema of the retired Supabase project (wbssuitpowuljcvazlnd), kept for reference.
-- Row data for every table is in the JSON files exported alongside the app:
--   krux-web/data/        hundred_word_articles, learn_stacks, learn_stack_cards
--   krux-pipeline/data/   webhooks, curation_audit, curation_selected_items, research_assistant
--   supabase-export/      articles, creator_* tables, storage_objects (image bucket listing)

create table public.articles (
  id bigint not null default nextval('articles_id_seq'::regclass),
  event_id text not null,
  model text not null,
  headline text not null,
  content text not null,
  sources jsonb,
  word_count integer,
  created_at timestamp with time zone default now()
);

create table public.creator_raw_webhooks (
  id bigint not null,
  created_at timestamp with time zone not null default now(),
  timestamp text,
  event_type text,
  event_group_id text,
  monitor_id text,
  monitor_type text,
  source_type text not null default 'parallel'::text,
  source_name text,
  source_url text,
  news_output text,
  news_date date,
  source_urls jsonb not null default '[]'::jsonb,
  full_data jsonb not null default '{}'::jsonb,
  dedupe_hash text
);

create table public.creator_research_briefs (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  topic_id uuid not null,
  model_provider text not null default 'openai'::text,
  model text not null default 'gpt-5-nano'::text,
  brief text not null,
  key_facts jsonb not null default '[]'::jsonb,
  examples jsonb not null default '[]'::jsonb,
  caveats jsonb not null default '[]'::jsonb,
  source_urls jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table public.creator_scripts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  topic_id uuid not null,
  research_brief_id uuid,
  model_provider text not null default 'openai'::text,
  model text not null default 'gpt-5-nano'::text,
  language text,
  content_format text,
  hook_options jsonb not null default '[]'::jsonb,
  final_script text not null,
  caption text not null default ''::text,
  broll jsonb not null default '[]'::jsonb,
  cta text not null default ''::text,
  source_urls jsonb not null default '[]'::jsonb,
  reference_transcript_ids jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table public.creator_topic_candidates (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  candidate_key text not null,
  raw_webhook_ids jsonb not null default '[]'::jsonb,
  source_type text not null default 'parallel'::text,
  source_name text,
  title text not null,
  summary text not null default ''::text,
  category text not null,
  suggested_angle text not null default ''::text,
  why_relevant text not null default ''::text,
  recommended_format text,
  language text,
  score integer not null default 0,
  status text not null default 'new'::text,
  selection_reason text,
  source_urls jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  selected_at timestamp with time zone
);

create table public.curation_audit (
  id uuid not null default gen_random_uuid(),
  total_stories integer not null,
  funding integer not null default 0,
  model_announcements_enhancements integer not null default 0,
  workflow_improvement integer not null default 0,
  report integer not null default 0,
  others integer not null default 0,
  selection_notes text,
  created_at timestamp with time zone not null default now()
);

create table public.curation_selected_items (
  id uuid not null default gen_random_uuid(),
  event_id text not null,
  news_date date not null,
  topic text not null,
  output text not null,
  sources jsonb not null,
  created_at timestamp with time zone not null default now()
);

create table public.hundred_word_articles (
  id bigint not null default nextval('hundred_word_articles_id_seq'::regclass),
  event_id text not null,
  model_provider text not null,
  news_date text not null,
  output text not null,
  sources jsonb,
  created_at timestamp with time zone default now(),
  headline text not null default ''::text,
  image_url text,
  like_count integer default 0,
  skip_count integer default 0,
  topic text
);

create table public.learn_stack_cards (
  id integer not null default nextval('learn_stack_cards_id_seq'::regclass),
  stack_id integer not null,
  position integer not null,
  headline text not null,
  output text not null,
  image_url text,
  created_at timestamp with time zone default now()
);

create table public.learn_stacks (
  id integer not null default nextval('learn_stacks_id_seq'::regclass),
  slug text not null,
  title text not null,
  emoji text,
  description text,
  cover_gradient text,
  cover_image_url text,
  card_count integer default 0,
  sort_order integer default 0,
  is_published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.research_assistant (
  id bigint not null default nextval('research_assistant_id_seq'::regclass),
  event_id text not null,
  model_provider text not null,
  news_date text not null,
  output text not null,
  created_at timestamp with time zone default now(),
  topic text
);

create table public.webhooks (
  id bigint not null default nextval('webhooks_id_seq'::regclass),
  created_at timestamp with time zone default now(),
  timestamp text,
  event_type text,
  event_group_id text,
  monitor_id text,
  news_output text,
  news_date text,
  source_urls jsonb,
  full_data jsonb,
  monitor_type text
);

create or replace function public.increment_swipe(article_id integer, swipe_type text)
returns void language plpgsql security definer as $$
begin
  if swipe_type = 'like' then
    update hundred_word_articles set like_count = like_count + 1 where id = article_id;
  elsif swipe_type = 'skip' then
    update hundred_word_articles set skip_count = skip_count + 1 where id = article_id;
  end if;
end;
$$;
