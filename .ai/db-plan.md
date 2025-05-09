# Schemat bazy danych PostgreSQL dla CampAlyze MVP

## 1. Tabele z kolumnami, typami danych i ograniczeniami

### 1.1. Tabela `organizations`

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 1.2. Tabela `user_organizations`

```sql
CREATE TABLE user_organizations (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, organization_id)
);
```

### 1.3. Tabela `platforms`

```sql
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inicjalizacja platform
INSERT INTO platforms (name, display_name) VALUES
('google_ads', 'Google Ads'),
('meta_ads', 'Meta Ads');
```

### 1.4. Tabela `campaigns`

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES platforms(id),
  name TEXT NOT NULL,
  external_id TEXT,  -- ID kampanii z platformy źródłowej
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, platform_id, external_id)
);
```

### 1.5. Tabela `metrics`

```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  spend DECIMAL(12, 2) NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, date)
);
```

### 1.6. Tabela `imports`

```sql
CREATE TABLE imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform_id UUID NOT NULL REFERENCES platforms(id),
  file_path TEXT NOT NULL,  -- Ścieżka do pliku w Supabase Storage
  original_filename TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  start_date DATE,
  end_date DATE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 1.7. Tabela `campaign_changes`

```sql
CREATE TABLE campaign_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  description TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('budget', 'targeting', 'creative', 'bid', 'other')),
  implementation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_date TIMESTAMPTZ,
  verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 1.8. Tabela `ai_insights`

```sql
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('summary', 'trend', 'recommendation', 'anomaly')),
  content TEXT NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'implemented')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 1.9. Tabela `user_preferences`

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 2. Relacje między tabelami

### 2.1. Relacje jeden-do-wielu (1:N)

- `organizations` 1:N `campaigns`
- `organizations` 1:N `imports`
- `organizations` 1:N `ai_insights`
- `campaigns` 1:N `metrics`
- `campaigns` 1:N `campaign_changes`
- `platforms` 1:N `campaigns`

### 2.2. Relacje wiele-do-wielu (N:M)

- `auth.users` N:M `organizations` (przez tabelę `user_organizations`)

## 3. Indeksy

```sql
-- Indeksy dla wydajnych zapytań
CREATE INDEX idx_campaigns_organization_id ON campaigns(organization_id);
CREATE INDEX idx_campaigns_platform_id ON campaigns(platform_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

CREATE INDEX idx_metrics_campaign_id ON metrics(campaign_id);
CREATE INDEX idx_metrics_date ON metrics(date);
CREATE INDEX idx_metrics_campaign_date ON metrics(campaign_id, date);

CREATE INDEX idx_campaign_changes_campaign_id ON campaign_changes(campaign_id);
CREATE INDEX idx_campaign_changes_verification_date ON campaign_changes(verification_date)
  WHERE verification_date IS NOT NULL AND verified = FALSE;

CREATE INDEX idx_ai_insights_organization_id ON ai_insights(organization_id);
CREATE INDEX idx_ai_insights_campaign_id ON ai_insights(campaign_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);

CREATE INDEX idx_imports_organization_id ON imports(organization_id);
CREATE INDEX idx_imports_status ON imports(status);
```

## 4. Widoki

```sql
-- Widok obliczający pochodne metryki
CREATE OR REPLACE VIEW campaign_metrics_derived AS
SELECT
  m.campaign_id,
  c.name AS campaign_name,
  p.name AS platform_name,
  m.date,
  m.impressions,
  m.clicks,
  m.spend,
  m.conversions,
  m.revenue,
  CASE WHEN m.clicks > 0 THEN m.spend / m.clicks ELSE 0 END AS cpc,
  CASE WHEN m.impressions > 0 THEN (m.clicks::float / m.impressions) * 100 ELSE 0 END AS ctr,
  CASE WHEN m.conversions > 0 THEN m.spend / m.conversions ELSE 0 END AS cost_per_conversion,
  CASE WHEN m.spend > 0 THEN m.revenue / m.spend ELSE 0 END AS roas
FROM
  metrics m
JOIN
  campaigns c ON m.campaign_id = c.id
JOIN
  platforms p ON c.platform_id = p.id;

-- Widok nadchodzących weryfikacji zmian
CREATE OR REPLACE VIEW upcoming_verifications AS
SELECT
  cc.id,
  cc.campaign_id,
  c.name AS campaign_name,
  cc.description,
  cc.change_type,
  cc.implementation_date,
  cc.verification_date,
  u.email AS user_email
FROM
  campaign_changes cc
JOIN
  campaigns c ON cc.campaign_id = c.id
JOIN
  auth.users u ON cc.user_id = u.id
WHERE
  cc.verification_date IS NOT NULL
  AND cc.verified = FALSE
  AND cc.verification_date >= CURRENT_DATE
ORDER BY
  cc.verification_date ASC;
```

## 5. Polityki Row Level Security (RLS)

-- Supabase Auth automatically adds user metadata to the auth.users table.
-- We will leverage this instead of creating a separate users_profile table.
-- The 'full_name' field is already part of user_metadata during registration.
-- The 'email_verified' status is available via the 'email_confirmed_at' column in auth.users.
-- We need to add 'failed_login_count' and 'locked_until' to user_metadata.

-- Example function to update user metadata (run by service role key):
/\*
CREATE OR REPLACE FUNCTION update_user_metadata(user_id uuid, new_metadata jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || new_metadata
WHERE id = user_id;
END;

$$
;
*/

-- SQL snippet to add metadata fields during registration or first login attempt:
-- (This logic should be handled in the backend API when interacting with Supabase Auth)
-- Example: {"failed_login_count": 0, "locked_until": null}

```sql
-- Włączenie RLS dla wszystkich tabel (jeśli nie zostało zrobione)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY; ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY; ALTER TABLE campaigns FORCE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY; ALTER TABLE metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY; ALTER TABLE imports FORCE ROW LEVEL SECURITY;
ALTER TABLE campaign_changes ENABLE ROW LEVEL SECURITY; ALTER TABLE campaign_changes FORCE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY; ALTER TABLE ai_insights FORCE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY; ALTER TABLE user_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY; ALTER TABLE user_organizations FORCE ROW LEVEL SECURITY;
-- Platformy są publiczne
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY; ALTER TABLE platforms FORCE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON platforms FOR SELECT USING (true);


-- Polityka dla user_organizations
CREATE POLICY "Users can view their own organization memberships"
ON user_organizations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage organization memberships"
ON user_organizations FOR ALL
USING (
  auth.uid() IN (
    SELECT uo.user_id
    FROM user_organizations uo
    WHERE uo.organization_id = user_organizations.organization_id AND uo.role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT uo.user_id
    FROM user_organizations uo
    WHERE uo.organization_id = user_organizations.organization_id AND uo.role = 'admin'
  )
);

-- Polityka dla organizations (aktualizacja)
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view organizations they belong to"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can insert organizations" ON organizations;
CREATE POLICY "Authenticated users can insert organizations"
ON organizations FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );
-- Tworzenie organizacji powinno automatycznie dodać twórcę jako admina w user_organizations (logika backendu)

DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;
CREATE POLICY "Organization admins can update their organizations"
ON organizations FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_organizations WHERE organization_id = organizations.id AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_organizations WHERE organization_id = organizations.id AND role = 'admin'
  )
);

-- Polityka dla campaigns
CREATE POLICY "Users can view campaigns in their organizations"
ON campaigns FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
);

CREATE POLICY "Organization editors/admins can manage campaigns"
ON campaigns FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
);

-- Polityka dla metrics
CREATE POLICY "Users can view metrics for campaigns in their organizations"
ON metrics FOR SELECT
USING (
  campaign_id IN (
    SELECT c.id FROM campaigns c WHERE c.organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  )
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
);

CREATE POLICY "System/Backend can insert metrics"
ON metrics FOR INSERT
WITH CHECK ( auth.role() = 'service_role' ); -- Only backend/service role can insert raw metrics

-- Polityka dla imports
CREATE POLICY "Users can manage imports in their organizations"
ON imports FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  AND user_id = auth.uid() -- User can only manage their own imports
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
);

-- Polityka dla campaign_changes
CREATE POLICY "Users can view changes for campaigns in their organizations"
ON campaign_changes FOR SELECT
USING (
  campaign_id IN (
    SELECT c.id FROM campaigns c WHERE c.organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  )
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
);

CREATE POLICY "Organization editors/admins can manage campaign changes"
ON campaign_changes FOR ALL
USING (
  campaign_id IN (
    SELECT c.id FROM campaigns c WHERE c.organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  )
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
)
WITH CHECK (
  campaign_id IN (
    SELECT c.id FROM campaigns c WHERE c.organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  )
  AND user_id = auth.uid() -- User can only manage changes they created?
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
);

-- Polityka dla ai_insights
CREATE POLICY "Users can view insights for their organizations"
ON ai_insights FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
  AND auth.email_confirmed_at IS NOT NULL -- Require verified email
);

CREATE POLICY "System/Backend can manage AI insights"
ON ai_insights FOR ALL
USING ( auth.role() = 'service_role' ) -- Only backend/service role
WITH CHECK ( auth.role() = 'service_role' );

-- Polityka dla user_preferences
CREATE POLICY "Users can manage their own preferences"
ON user_preferences FOR ALL
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- RLS Policy to Block Login (Conceptual - Implemented in backend logic)
-- Supabase Auth login endpoint needs custom logic (e.g., via Edge Function hook or backend checks)
-- to verify 'failed_login_count' and 'locked_until' from user_metadata.
-- 1. Before attempting Supabase signIn: Fetch user metadata using service role key.
-- 2. Check if raw_user_meta_data->>'failed_login_count'::integer >= 5 AND raw_user_meta_data->>'locked_until'::timestamptz > NOW().
-- 3. If locked, return 403 Forbidden.
-- 4. If login fails: Increment 'failed_login_count'. If count reaches 5, set 'locked_until' = NOW() + interval '15 minutes'. Update metadata.
-- 5. If login succeeds: Reset 'failed_login_count' to 0, set 'locked_until' to null. Update metadata.
```

## 6. Funkcje i wyzwalacze

```sql
-- Funkcja aktualizująca pole updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$

BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

-- Wyzwalacze dla aktualizacji updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at
BEFORE UPDATE ON metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Podobne wyzwalacze dla pozostałych tabel
```

## 7. Uwagi dodatkowe

1. **Skalowanie**: Schemat jest przygotowany na przyszłe skalowanie poprzez:
   - Zastosowanie UUID jako kluczy głównych
   - Przemyślane indeksy dla często używanych zapytań
   - Możliwość łatwego dodania partycjonowania dla tabeli metrics w przyszłości

2. **Bezpieczeństwo**: Model wielodostępowy (multi-tenant) z izolacją danych na poziomie organizacji zabezpieczony przez RLS.

3. **AI**: Tabela ai_insights zapewnia elastyczność w przechowywaniu różnych typów automatycznie generowanych wskazówek.

4. **Rozszerzalność**: W przyszłości można łatwo dodać:
   - Partycjonowanie tabel metrics przez datę
   - Dodatkowe typy insightów AI
   - Wsparcie dla nowych platform reklamowych
   - Bardziej zaawansowane alerty i notyfikacje

5. **Uwaga implementacyjna**: Schemat korzysta z wbudowanych funkcji Supabase, w tym auth.users dla zarządzania użytkownikami i autoryzacją.
$$
