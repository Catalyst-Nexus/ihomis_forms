create table public.tracking (
  id serial not null,
  tracking_encocode character varying(255) not null,
  encounter_type character varying(20) null,
  is_current boolean null default true,
  date_created timestamp with time zone null default now(),
  created_by character varying(100) null,
  current_seq_id integer null,
  constraint tracking_pkey primary key (id),
  constraint tracking_encocode_unique unique (tracking_encocode),
  constraint tracking_tracking_encocode_key unique (tracking_encocode),
  constraint fk_tracking_current_seq foreign KEY (current_seq_id) references tracking_sequence (id) on delete set null,
  constraint fk_current_sequence foreign KEY (current_seq_id) references tracking_sequence (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_tracking_encocode on public.tracking using btree (tracking_encocode) TABLESPACE pg_default;

create index IF not exists idx_tracking_encounter on public.tracking using btree (encounter_type) TABLESPACE pg_default;

create table public.tracking_log (
  id serial not null,
  tracking_id integer not null,
  seq_id integer not null,
  remarks text null,
  done_by character varying(100) null,
  done_at timestamp with time zone null default now(),
  constraint tracking_log_pkey primary key (id),
  constraint tracking_log_tracking_seq_unique unique (tracking_id, seq_id),
  constraint fk_log_tracking foreign KEY (tracking_id) references tracking (id) on delete CASCADE,
  constraint fk_tracking foreign KEY (tracking_id) references tracking (id) on delete CASCADE,
  constraint fk_sequence foreign KEY (seq_id) references tracking_sequence (id) on delete CASCADE,
  constraint fk_log_seq foreign KEY (seq_id) references tracking_sequence (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_tracking_log_tid_seq on public.tracking_log using btree (tracking_id, seq_id) TABLESPACE pg_default;

create index IF not exists idx_tracking_log_tid on public.tracking_log using btree (tracking_id) TABLESPACE pg_default;

create table public.tracking_sequence (
  id serial not null,
  description character varying(100) not null,
  next integer null,
  sort_order integer not null,
  constraint tracking_sequence_pkey primary key (id),
  constraint fk_next_sequence foreign KEY (next) references tracking_sequence (id) on delete set null
) TABLESPACE pg_default;

create table public.tracking_user_assignment (
  id serial not null,
  tracking_id integer not null,
  user_id character varying(100) not null,
  tag_order integer not null default 1,
  constraint tracking_user_assignment_pkey primary key (id),
  constraint tracking_user_assignment_tracking_id_user_id_key unique (tracking_id, user_id),
  constraint unique_tracking_user unique (tracking_id, user_id),
  constraint fk_tracking_user_user_id foreign KEY (user_id) references users (user_id) on delete CASCADE,
  constraint fk_tracking_assignment foreign KEY (tracking_id) references tracking (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.user_seq_assignment (
  id serial not null,
  user_id character varying(100) not null,
  seq_id integer not null,
  constraint user_seq_assignment_pkey primary key (id),
  constraint user_seq_assignment_user_id_seq_id_key unique (user_id, seq_id),
  constraint unique_user_seq unique (user_id, seq_id),
  constraint fk_user_seq_user_id foreign KEY (user_id) references users (user_id) on delete CASCADE,
  constraint fk_user_sequence foreign KEY (seq_id) references tracking_sequence (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.users (
  user_id character varying not null,
  username character varying null,
  email character varying null,
  full_name character varying null,
  active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint users_pkey primary key (user_id),
  constraint users_email_key unique (email)
) TABLESPACE pg_default;

create table public.lab_result_uploads (
  id bigserial not null,
  hpercode character varying(255) not null,
  enccode character varying(255) not null,
  orcode character varying(255) null,
  proccode character varying(255) null,
  procedure_instance_id character varying(255) null,
  docointkey character varying(255) null,
  file_name text not null,
  file_url text not null,
  storage_path text not null,
  file_size bigint null,
  content_type character varying(100) null,
  uploaded_by character varying(100) null,
  remarks text null,
  source character varying(50) null,
  is_signed_url boolean null default false,
  url_expires_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  constraint lab_result_uploads_pkey primary key (id),
  constraint lab_result_uploads_storage_path_key unique (storage_path)
) TABLESPACE pg_default;

create index if not exists idx_lab_result_uploads_enccode
  on public.lab_result_uploads using btree (enccode) TABLESPACE pg_default;

create index if not exists idx_lab_result_uploads_hpercode
  on public.lab_result_uploads using btree (hpercode) TABLESPACE pg_default;

create index if not exists idx_lab_result_uploads_order_proc
  on public.lab_result_uploads using btree (orcode, proccode) TABLESPACE pg_default;

create index if not exists idx_lab_result_uploads_docointkey
  on public.lab_result_uploads using btree (docointkey) TABLESPACE pg_default;

create index if not exists idx_lab_result_uploads_uploaded_by
  on public.lab_result_uploads using btree (uploaded_by) TABLESPACE pg_default;

-- Supabase storage bucket for lab results
insert into storage.buckets (id, name, public)
values ('lab-results', 'lab-results', false)
on conflict (id) do nothing;

-- RLS policies for lab result metadata
alter table public.lab_result_uploads enable row level security;

create policy lab_result_uploads_insert
  on public.lab_result_uploads
  for insert
  to anon, authenticated
  with check (true);

create policy lab_result_uploads_read
  on public.lab_result_uploads
  for select
  to anon, authenticated
  using (true);

-- RLS policies for lab result files in storage
alter table storage.objects enable row level security;

create policy lab_results_storage_insert
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'lab-results');

create policy lab_results_storage_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'lab-results');
