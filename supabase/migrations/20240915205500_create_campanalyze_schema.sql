/*
  Migration: create_campanalyze_schema
  Description: Initial database schema for CampAlyze MVP
  This migration creates all necessary tables, indexes, views, RLS policies,
  and triggers for the CampAlyze campaign analytics system.
*/

-- organizations table
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable rls for organizations
alter table organizations enable row level security;

-- user_organizations table (for many-to-many relationship)
create table user_organizations (
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

-- enable rls for user_organizations
alter table user_organizations enable row level security;

-- platforms table
create table platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- enable rls for platforms
alter table platforms enable row level security;

-- initialize platforms with common advertising platforms
insert into platforms (name, display_name) values 
('google_ads', 'Google Ads'),
('meta_ads', 'Meta Ads');

-- campaigns table
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  platform_id uuid not null references platforms(id),
  name text not null,
  external_id text,  -- id of the campaign from the source platform
  status text not null check (status in ('active', 'paused', 'completed', 'archived')),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, platform_id, external_id)
);

-- enable rls for campaigns
alter table campaigns enable row level security;

-- metrics table
create table metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  date date not null,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  spend decimal(12, 2) not null default 0,
  conversions bigint not null default 0,
  revenue decimal(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, date)
);

-- enable rls for metrics
alter table metrics enable row level security;

-- imports table
create table imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  platform_id uuid not null references platforms(id),
  file_path text not null,  -- path to file in supabase storage
  original_filename text not null,
  status text not null check (status in ('pending', 'processing', 'completed', 'error')),
  start_date date,
  end_date date,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable rls for imports
alter table imports enable row level security;

-- campaign_changes table
create table campaign_changes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  description text not null,
  change_type text not null check (change_type in ('budget', 'targeting', 'creative', 'bid', 'other')),
  implementation_date timestamptz not null default now(),
  verification_date timestamptz,
  verified boolean default false,
  verification_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable rls for campaign_changes
alter table campaign_changes enable row level security;

-- ai_insights table
create table ai_insights (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  insight_type text not null check (insight_type in ('summary', 'trend', 'recommendation', 'anomaly')),
  content text not null,
  date_range_start date,
  date_range_end date,
  status text default 'active' check (status in ('active', 'dismissed', 'implemented')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable rls for ai_insights
alter table ai_insights enable row level security;

-- user_preferences table
create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- enable rls for user_preferences
alter table user_preferences enable row level security;

-- create indexes for efficient queries
-- campaigns indexes
create index idx_campaigns_organization_id on campaigns(organization_id);
create index idx_campaigns_platform_id on campaigns(platform_id);
create index idx_campaigns_status on campaigns(status);

-- metrics indexes
create index idx_metrics_campaign_id on metrics(campaign_id);
create index idx_metrics_date on metrics(date);
create index idx_metrics_campaign_date on metrics(campaign_id, date);

-- campaign_changes indexes
create index idx_campaign_changes_campaign_id on campaign_changes(campaign_id);
create index idx_campaign_changes_verification_date on campaign_changes(verification_date) 
  where verification_date is not null and verified = false;

-- ai_insights indexes
create index idx_ai_insights_organization_id on ai_insights(organization_id);
create index idx_ai_insights_campaign_id on ai_insights(campaign_id);
create index idx_ai_insights_type on ai_insights(insight_type);

-- imports indexes
create index idx_imports_organization_id on imports(organization_id);
create index idx_imports_status on imports(status);

-- create views for derived metrics
create or replace view campaign_metrics_derived as
select
  m.campaign_id,
  c.name as campaign_name,
  p.name as platform_name,
  m.date,
  m.impressions,
  m.clicks,
  m.spend,
  m.conversions,
  m.revenue,
  case when m.clicks > 0 then m.spend / m.clicks else 0 end as cpc,
  case when m.impressions > 0 then (m.clicks::float / m.impressions) * 100 else 0 end as ctr,
  case when m.conversions > 0 then m.spend / m.conversions else 0 end as cost_per_conversion,
  case when m.spend > 0 then m.revenue / m.spend else 0 end as roas
from
  metrics m
join
  campaigns c on m.campaign_id = c.id
join
  platforms p on c.platform_id = p.id;

-- create view for upcoming verifications
create or replace view upcoming_verifications as
select
  cc.id,
  cc.campaign_id,
  c.name as campaign_name,
  cc.description,
  cc.change_type,
  cc.implementation_date,
  cc.verification_date,
  u.email as user_email
from
  campaign_changes cc
join
  campaigns c on cc.campaign_id = c.id
join
  auth.users u on cc.user_id = u.id
where
  cc.verification_date is not null
  and cc.verified = false
  and cc.verification_date >= current_date
order by
  cc.verification_date asc;

-- create function for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create triggers for updating timestamps
create trigger update_organizations_updated_at
before update on organizations
for each row
execute function update_updated_at_column();

create trigger update_campaigns_updated_at
before update on campaigns
for each row
execute function update_updated_at_column();

create trigger update_metrics_updated_at
before update on metrics
for each row
execute function update_updated_at_column();

create trigger update_imports_updated_at
before update on imports
for each row
execute function update_updated_at_column();

create trigger update_campaign_changes_updated_at
before update on campaign_changes
for each row
execute function update_updated_at_column();

create trigger update_ai_insights_updated_at
before update on ai_insights
for each row
execute function update_updated_at_column();

create trigger update_user_preferences_updated_at
before update on user_preferences
for each row
execute function update_updated_at_column();

-- rls policies for organizations table
-- authenticated users can view their organizations
create policy "Users can view their organizations" 
on organizations for select
using (
  id in (
    select organization_id from user_organizations where user_id = auth.uid()
  )
);

-- authenticated users can create organizations
create policy "Authenticated users can insert organizations" 
on organizations for insert to authenticated
with check (true);  -- controlled by application logic

-- organization admins can update their organizations
create policy "Admins can update their organizations" 
on organizations for update to authenticated
using (
  id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role = 'admin'
  )
);

-- rls policies for user_organizations table
-- authenticated users can see their own organization memberships
create policy "Users can view their own organization memberships" 
on user_organizations for select to authenticated
using (user_id = auth.uid());

-- organization admins can see all members of their organizations
create policy "Admins can view all members of their organizations" 
on user_organizations for select to authenticated
using (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role = 'admin'
  )
);

-- organization admins can add users to their organizations
create policy "Admins can add users to their organizations" 
on user_organizations for insert to authenticated
with check (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role = 'admin'
  )
);

-- organization admins can update user roles in their organizations
create policy "Admins can update user roles in their organizations" 
on user_organizations for update to authenticated
using (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role = 'admin'
  )
);

-- organization admins can remove users from their organizations
create policy "Admins can remove users from their organizations" 
on user_organizations for delete to authenticated
using (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role = 'admin'
  )
);

-- rls policies for platforms table
-- all authenticated users can view platforms
create policy "Authenticated users can view platforms" 
on platforms for select to authenticated
using (true);

-- only service accounts can modify platforms (handled by application logic)
create policy "Service accounts can modify platforms" 
on platforms for all to authenticated
using (auth.uid() in (select id from auth.users where email like '%service@campanalyze.app'));

-- rls policies for campaigns table
-- users can view campaigns in their organizations
create policy "Users can view campaigns in their organizations" 
on campaigns for select to authenticated
using (
  organization_id in (
    select organization_id from user_organizations where user_id = auth.uid()
  )
);

-- editors and admins can insert campaigns
create policy "Editors and admins can insert campaigns" 
on campaigns for insert to authenticated
with check (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role in ('admin', 'editor')
  )
);

-- editors and admins can update campaigns
create policy "Editors and admins can update campaigns" 
on campaigns for update to authenticated
using (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role in ('admin', 'editor')
  )
);

-- admins can delete campaigns
create policy "Admins can delete campaigns" 
on campaigns for delete to authenticated
using (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role = 'admin'
  )
);

-- rls policies for metrics table
-- users can view metrics in their organizations
create policy "Users can view metrics in their organizations" 
on metrics for select to authenticated
using (
  campaign_id in (
    select c.id from campaigns c
    join user_organizations uo on c.organization_id = uo.organization_id
    where uo.user_id = auth.uid()
  )
);

-- editors and admins can insert metrics
create policy "Editors and admins can insert metrics" 
on metrics for insert to authenticated
with check (
  campaign_id in (
    select c.id from campaigns c
    join user_organizations uo on c.organization_id = uo.organization_id
    where uo.user_id = auth.uid() and uo.role in ('admin', 'editor')
  )
);

-- editors and admins can update metrics
create policy "Editors and admins can update metrics" 
on metrics for update to authenticated
using (
  campaign_id in (
    select c.id from campaigns c
    join user_organizations uo on c.organization_id = uo.organization_id
    where uo.user_id = auth.uid() and uo.role in ('admin', 'editor')
  )
);

-- admins can delete metrics
create policy "Admins can delete metrics" 
on metrics for delete to authenticated
using (
  campaign_id in (
    select c.id from campaigns c
    join user_organizations uo on c.organization_id = uo.organization_id
    where uo.user_id = auth.uid() and uo.role = 'admin'
  )
);

-- rls policies for imports table
-- users can view imports in their organizations
create policy "Users can view imports in their organizations" 
on imports for select to authenticated
using (
  organization_id in (
    select organization_id from user_organizations where user_id = auth.uid()
  )
);

-- editors and admins can create imports
create policy "Editors and admins can create imports" 
on imports for insert to authenticated
with check (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role in ('admin', 'editor')
  )
);

-- users can only update their own imports
create policy "Users can update their own imports" 
on imports for update to authenticated
using (user_id = auth.uid());

-- admins can delete imports in their organizations
create policy "Admins can delete imports" 
on imports for delete to authenticated
using (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role = 'admin'
  )
);

-- rls policies for campaign_changes table
-- users can view campaign changes in their organizations
create policy "Users can view campaign changes" 
on campaign_changes for select to authenticated
using (
  campaign_id in (
    select c.id from campaigns c
    join user_organizations uo on c.organization_id = uo.organization_id
    where uo.user_id = auth.uid()
  )
);

-- editors and admins can insert campaign changes
create policy "Editors and admins can insert campaign changes" 
on campaign_changes for insert to authenticated
with check (
  campaign_id in (
    select c.id from campaigns c
    join user_organizations uo on c.organization_id = uo.organization_id
    where uo.user_id = auth.uid() and uo.role in ('admin', 'editor')
  )
);

-- users can update their own campaign changes
create policy "Users can update their own campaign changes" 
on campaign_changes for update to authenticated
using (user_id = auth.uid());

-- admins can delete campaign changes
create policy "Admins can delete campaign changes" 
on campaign_changes for delete to authenticated
using (
  campaign_id in (
    select c.id from campaigns c
    join user_organizations uo on c.organization_id = uo.organization_id
    where uo.user_id = auth.uid() and uo.role = 'admin'
  )
);

-- rls policies for ai_insights table
-- users can view ai insights in their organizations
create policy "Users can view ai insights" 
on ai_insights for select to authenticated
using (
  organization_id in (
    select organization_id from user_organizations where user_id = auth.uid()
  )
);

-- service accounts can insert ai insights
create policy "Service accounts can insert ai insights" 
on ai_insights for insert to authenticated
with check (auth.uid() in (select id from auth.users where email like '%service@campanalyze.app'));

-- editors and admins can update ai insights status
create policy "Editors and admins can update ai insights" 
on ai_insights for update to authenticated
using (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role in ('admin', 'editor')
  )
);

-- admins can delete ai insights
create policy "Admins can delete ai insights" 
on ai_insights for delete to authenticated
using (
  organization_id in (
    select organization_id from user_organizations 
    where user_id = auth.uid() and role = 'admin'
  )
);

-- rls policies for user_preferences table
-- users can view their own preferences
create policy "Users can view their own preferences" 
on user_preferences for select to authenticated
using (user_id = auth.uid());

-- users can insert their own preferences
create policy "Users can insert their own preferences" 
on user_preferences for insert to authenticated
with check (user_id = auth.uid());

-- users can update their own preferences
create policy "Users can update their own preferences" 
on user_preferences for update to authenticated
using (user_id = auth.uid());

-- users can delete their own preferences
create policy "Users can delete their own preferences" 
on user_preferences for delete to authenticated
using (user_id = auth.uid()); 