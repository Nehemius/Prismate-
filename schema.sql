-- ==========================================
-- PRISMATE Supabase PostgreSQL Table Schema
-- ==========================================

-- 1. Profiles & Authentication
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text check (role in ('STUDENT', 'TEACHER')) not null,
  display_name text not null,
  updated_at timestamp default now()
);

-- Enable RLS on Profiles
alter table profiles enable row level security;

-- Profiles Policies
create policy "Allow read access to all logged-in profiles" 
  on profiles for select 
  using (auth.role() = 'authenticated');

create policy "Allow users to update their own profile" 
  on profiles for update 
  using (auth.uid() = id);

create policy "Allow users to insert their own profile" 
  on profiles for insert 
  with check (auth.uid() = id);


-- 2. Chapters
create table chapters (
  id serial primary key,
  name text not null,        -- e.g. "Haloalkanes and Haloarenes"
  order_index int not null
);

-- Enable RLS on Chapters
alter table chapters enable row level security;

create policy "Allow read access to chapters for everyone" 
  on chapters for select 
  using (true);

create policy "Allow write access to chapters for teachers" 
  on chapters for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'TEACHER'
    )
  );


-- 3. Chemistry Reactions
create table chemistry_reactions (
  id serial primary key,
  chapter_id int references chapters(id) on delete cascade,
  name text not null,                  -- e.g. "Hydroboration-Oxidation"
  reaction_type text not null,         -- e.g. "Addition", "Elimination", "Redox", "Substitution"
  mechanism_type text not null,        -- e.g. "syn addition", "electrophilic addition", "SN2"
  reactant_cid int,                    -- Primary Reactant PubChem CID
  product_cid int,                     -- Primary Product PubChem CID
  reactant_sdf_path text not null,     -- Local static asset path fallback (e.g. "propene")
  product_sdf_path text not null,      -- Local static asset path fallback (e.g. "propan-1-ol")
  reagents text not null,              -- e.g. "BH3.THF, then H2O2/NaOH"
  conditions text not null,            -- e.g. "0°C to Room Temp, THF"
  balanced_equation text not null,     -- Formatted chemical notation
  reaction_mechanisms text not null,   -- Step-by-step mechanism breakdown
  structural_effects text not null,    -- steric hindrance, mesomeric, etc.
  iupac_product_name text not null,    -- IUPAC nomenclature
  uses_applications text not null,     -- real-world applications
  page_no int not null,                -- page reference
  is_secret_achievement boolean default false,
  achievement_title text,
  achievement_hint text,
  class_grade int check (class_grade in (11, 12)) not null
);

-- Enable RLS on Chemistry Reactions
alter table chemistry_reactions enable row level security;

create policy "Allow read access to chemistry reactions for everyone" 
  on chemistry_reactions for select 
  using (true);

create policy "Allow write access to chemistry reactions for teachers" 
  on chemistry_reactions for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'TEACHER'
    )
  );


-- 4. Queries (Q&A Feed)
create table queries (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  chapter_id int references chapters(id) on delete set null,
  subject text not null default 'Chemistry',
  query_text text not null,
  student_visible_to_teacher boolean default false, -- Student's choice to reveal name
  teacher_reply_anonymous boolean default true,       -- Teacher's reply privacy choice
  ai_flag_status text check (ai_flag_status in ('pending','approved','rejected')) default 'pending',
  created_at timestamp default now()
);

-- Enable RLS on Queries
alter table queries enable row level security;

-- Queries Policies
-- Students can insert queries if they are authenticated and check their own user_id
create policy "Students can insert queries for themselves"
  on queries for insert
  with check (auth.uid() = user_id);

-- Students can select queries they wrote, or queries that are approved
create policy "Students can select their own or approved queries"
  on queries for select
  using (
    auth.uid() = user_id 
    or ai_flag_status = 'approved'
  );

-- Teachers can select queries they wrote, queries that are approved, or queries where student_visible_to_teacher is true
create policy "Teachers can select queries visible to them or approved"
  on queries for select
  using (
    ai_flag_status = 'approved'
    or student_visible_to_teacher = true
    or auth.uid() = user_id
  );


-- 5. Replies
create table replies (
  id serial primary key,
  query_id int references queries(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_anonymous boolean default true,
  created_at timestamp default now()
);

-- Enable RLS on Replies
alter table replies enable row level security;

-- Replies Policies
create policy "Authenticated users can insert replies"
  on replies for insert
  with check (auth.uid() = user_id);

create policy "Users can view replies for visible queries"
  on replies for select
  using (
    exists (
      select 1 from queries
      where queries.id = replies.query_id
    )
  );


-- 6. Query Cooldowns
create table query_cooldowns (
  user_id uuid references profiles(id) on delete cascade primary key,
  last_posted_at timestamp default now()
);

-- Enable RLS on Cooldowns
alter table query_cooldowns enable row level security;

create policy "Users can manage their own cooldown rows"
  on query_cooldowns for all
  using (auth.uid() = user_id);

-- Trigger / function to automatically enforce rate limiting cooldown
create or replace function check_query_cooldown()
returns trigger as $$
declare
  last_post timestamp;
  cooldown_sec integer := 60; -- 60 seconds rate limit cooldown
begin
  -- Fetch last post timestamp for this user
  select last_posted_at into last_post
  from query_cooldowns
  where user_id = new.user_id;

  if last_post is not null and (now() - last_post) < (cooldown_sec * interval '1 second') then
    raise exception 'Rate limit reached. Please wait % seconds.', cooldown_sec - extract(epoch from (now() - last_post));
  end if;

  -- Insert or update the cooldown log
  insert into query_cooldowns (user_id, last_posted_at)
  values (new.user_id, now())
  on conflict (user_id)
  do update set last_posted_at = now();

  return new;
end;
$$ language plpgsql;

create trigger tr_check_query_cooldown
before insert on queries
for each row
execute function check_query_cooldown();
