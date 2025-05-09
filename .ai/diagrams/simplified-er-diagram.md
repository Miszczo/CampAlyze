```mermaid
erDiagram
    USERS ||--o{ USER_ORGANIZATIONS : "has membership"
    ORGANIZATIONS ||--|{ USER_ORGANIZATIONS : "has members"
    ORGANIZATIONS ||--|{ CAMPAIGNS : "has"
    PLATFORMS ||--o{ CAMPAIGNS : "belongs to"
    CAMPAIGNS ||--|{ METRICS : "has"
    CAMPAIGNS ||--o{ IMPORTS : "originates from"
    USERS ||--o{ IMPORTS : "uploaded by"
    ORGANIZATIONS ||--|{ IMPORTS : "belongs to"
    ORGANIZATIONS ||--o{ AI_INSIGHTS : "relates to"
    CAMPAIGNS ||--o{ AI_INSIGHTS : "relates to"
    USERS ||--|{ USER_PREFERENCES : "has"

    USERS {
        UUID id PK "auth.users"
        string email
        string full_name "(user_metadata)"
        timestamp locked_until "(user_metadata - opcjonalnie)"
        int failed_login_count "(user_metadata - opcjonalnie)"
    }
    USER_ORGANIZATIONS {
        UUID user_id FK
        UUID organization_id FK
        string role "(admin, editor, viewer)"
    }
    ORGANIZATIONS {
        UUID id PK
        string name
        timestamp created_at
    }
    PLATFORMS {
        UUID id PK
        string name "(google, meta)"
        string display_name
    }
    CAMPAIGNS {
        UUID id PK
        UUID organization_id FK
        UUID platform_id FK
        string name
        string status
        date start_date
        date end_date
        timestamp created_at
    }
    METRICS {
        UUID id PK
        UUID campaign_id FK
        date date
        int impressions
        int clicks
        float cost
        int conversions
        timestamp created_at
    }
    IMPORTS {
        UUID id PK
        UUID organization_id FK
        UUID user_id FK
        string file_name
        string status "(pending, processing, completed, failed)"
        string platform_id "(google, meta)"
        timestamp created_at
    }
    AI_INSIGHTS {
        UUID id PK
        UUID organization_id FK
        UUID campaign_id FK "(opcjonalnie)"
        string insight_type
        text content
        timestamp created_at
    }
    USER_PREFERENCES {
        UUID user_id PK FK
        json settings
        timestamp updated_at
    }

```
