# REST API Plan

## 1. Resources

- **Organizations** → `organizations` table
- **Users** → `auth.users` table & `user_organizations` junction table
- **Platforms** → `platforms` table
- **Campaigns** → `campaigns` table
- **Metrics** → `metrics` table
- **Imports** → `imports` table
- **Campaign Changes** → `campaign_changes` table
- **AI Insights** → `ai_insights` table
- **User Preferences** → `user_preferences` table

## 2. Endpoints

### Authentication & User Management

#### Register User

- **Method**: POST
- **Path**: `/api/auth/register`
- **Description**: Register a new user using Supabase Auth. Sends a verification email.
- **Request Body**:
  ```json
  {
    "email": "string (valid email format)",
    "password": "string (min 8 chars, letters + digits)",
    "options": {
      "data": {
        "full_name": "string"
      }
    }
  }
  ```
- **Response Body** (on successful registration, before email verification):
  ```json
  {
    "id": "uuid",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "string",
    "email_confirmed_at": null,
    "phone": "",
    "confirmed_at": null,
    "last_sign_in_at": null,
    "app_metadata": {
      "provider": "email",
      "providers": ["email"]
    },
    "user_metadata": {
      "full_name": "string"
    },
    "identities": [
      {
        "identity_id": "uuid",
        "id": "uuid",
        "user_id": "uuid",
        "identity_data": {
          "email": "string",
          "email_verified": false,
          "phone_verified": false,
          "sub": "uuid"
        },
        "provider": "email",
        "last_sign_in_at": null,
        "created_at": "timestamp",
        "updated_at": "timestamp",
        "email": "string"
      }
    ],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 201 Created (User created, verification email sent)
- **Errors**: 400 Bad Request (Invalid email/password format), 422 Unprocessable Entity (User already registered, but email not verified), 500 Internal Server Error (Supabase error)

#### Login

- **Method**: POST
- **Path**: `/api/auth/login`
- **Description**: Authenticate user with email and password using Supabase Auth.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Body** (on successful login):
  ```json
  {
    "access_token": "string (JWT)",
    "token_type": "bearer",
    "expires_in": 3600, // Example TTL in seconds
    "expires_at": "timestamp",
    "refresh_token": "string",
    "user": {
      "id": "uuid",
      "aud": "authenticated",
      "role": "authenticated",
      "email": "string",
      "email_confirmed_at": "timestamp | null",
      "phone": "",
      "confirmed_at": "timestamp | null",
      "last_sign_in_at": "timestamp",
      "app_metadata": {
        /* ... */
      },
      "user_metadata": {
        "full_name": "string"
      },
      "identities": [
        /* ... */
      ],
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request (Invalid credentials, Missing email/password), 403 Forbidden (Email not verified, Account locked), 500 Internal Server Error (Supabase error)

#### Logout

- **Method**: POST
- **Path**: `/api/auth/logout`
- **Description**: Sign out the current user (invalidates tokens on the Supabase side).
- **Request Body**: None
- **Response Body**: None
- **Success**: 204 No Content
- **Errors**: 401 Unauthorized (No active session), 500 Internal Server Error (Supabase error)

#### Refresh Token

- **Method**: POST
- **Path**: `/api/auth/refresh`
- **Description**: Obtain a new access token using a refresh token.
- **Request Body**:
  ```json
  {
    "refresh_token": "string"
  }
  ```
- **Response Body** (Similar to Login response, but may not include the full user object depending on Supabase config):
  ```json
  {
    "access_token": "string (JWT)",
    "token_type": "bearer",
    "expires_in": 3600, // Example TTL
    "expires_at": "timestamp",
    "refresh_token": "string" // Supabase might return the same or a new refresh token
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request (Missing refresh token), 401 Unauthorized (Invalid or expired refresh token), 500 Internal Server Error

#### Forgot Password

- **Method**: POST
- **Path**: `/api/auth/password/forgot`
- **Description**: Initiate the password reset process. Sends a password reset email.
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response Body**:
  ```json
  {}
  ```
- **Success**: 200 OK (Email sent, or Supabase handled the case where the user doesn't exist gracefully)
- **Errors**: 400 Bad Request (Missing email), 500 Internal Server Error

#### Reset Password

- **Method**: POST
- **Path**: `/api/auth/password/reset`
- **Description**: Set a new password using the token received via email. Requires the user to be logged in with the recovery token.
- **Headers**: `Authorization: Bearer <recovery_access_token>` (obtained after user clicks the email link)
- **Request Body**:
  ```json
  {
    "password": "string (new password, min 8 chars, letters + digits)"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "string"
    // ... other user fields
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request (Invalid password format, Missing password), 401 Unauthorized (Invalid or expired recovery token), 500 Internal Server Error

#### Verify Email

- **Method**: POST
- **Path**: `/api/auth/verify-email`
- **Description**: Verify user's email address using the token received via email. Supabase handles this via redirect, but an API endpoint can be used for SPA flows if needed, typically called after the user clicks the link and is redirected back to the app with a token.
- **Request Body**:
  ```json
  {
    "token": "string (verification token from email link query param)",
    "type": "email"
  }
  ```
- **Response Body**: (User object after verification)
  ```json
  {
    // ... user object with email_confirmed_at set ...
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request (Missing token), 401 Unauthorized (Invalid or expired token), 422 Unprocessable Entity (Email already verified), 500 Internal Server Error

#### Resend Verification Email

- **Method**: POST
- **Path**: `/api/auth/resend-verification`
- **Description**: Resend the email verification link.
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response Body**:
  ```json
  {}
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request (Missing email), 422 Unprocessable Entity (Email already verified or user doesn't exist), 500 Internal Server Error

### Organizations

#### List Organizations

- **Method**: GET
- **Path**: `/api/organizations`
- **Description**: Get all organizations for current user
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "role": "string",
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Success**: 200 OK

#### Create Organization

- **Method**: POST
- **Path**: `/api/organizations`
- **Description**: Create a new organization
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "created_at": "timestamp"
  }
  ```
- **Success**: 201 Created
- **Errors**: 400 Bad Request

#### Manage Organization Users

- **Method**: POST
- **Path**: `/api/organizations/{id}/users`
- **Description**: Add user to organization
- **Request Body**:
  ```json
  {
    "email": "string",
    "role": "string" // 'admin', 'editor', 'viewer'
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "organization_id": "uuid",
    "email": "string",
    "role": "string"
  }
  ```
- **Success**: 201 Created
- **Errors**: 400 Bad Request, 404 Not Found

#### Update User Role

- **Method**: PUT
- **Path**: `/api/organizations/{id}/users/{user_id}`
- **Description**: Update user role within organization
- **Request Body**:
  ```json
  {
    "role": "string" // 'admin', 'editor', 'viewer'
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "organization_id": "uuid",
    "email": "string",
    "role": "string"
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request, 403 Forbidden, 404 Not Found

### Data Import

#### Upload File

- **Method**: POST
- **Path**: `/api/imports/upload`
- **Description**: Upload data file
- **Request Body**: Multipart form with file
  ```
  file: CSV/XLSX file
  platform_id: "uuid"
  organization_id: "uuid"
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "original_filename": "string",
    "status": "pending"
  }
  ```
- **Processing Logic**:
  - **Meta Ads CSV Mapping**:
    - "Nazwa kampanii" → identyfikator kampanii (lookup/create w `campaigns`)
    - "Dzień" → `metrics.date`
    - "Kliknięcia linku" → `metrics.clicks`
    - "Zasięg" → `metrics.reach`
    - "Wyświetlenia" → `metrics.impressions`
    - "Typ wyniku" → `metrics.conversion_type`
    - "Wyniki" → `metrics.conversions`
    - "Wydana kwota (PLN)" → `metrics.spend`
  - **Obsługa pustych pól**: Konwertuj puste pola na wartości domyślne (0 dla liczb, null dla tekstów)
- **Success**: 201 Created
- **Errors**: 400 Bad Request, 413 Payload Too Large

#### Process Import

- **Method**: POST
- **Path**: `/api/imports/{id}/process`
- **Description**: Begin processing an uploaded file
- **Request Body**:
  ```json
  {
    "platform_id": "uuid",
    "organization_id": "uuid"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "status": "processing"
  }
  ```
- **Success**: 202 Accepted
- **Errors**: 400 Bad Request, 404 Not Found

#### Get Import Status

- **Method**: GET
- **Path**: `/api/imports/{id}/status`
- **Description**: Check status of an import
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "status": "string",
    "progress": "number",
    "error_message": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 404 Not Found

#### List Imports

- **Method**: GET
- **Path**: `/api/imports`
- **Description**: Get import history
- **Query Parameters**:
  - `organization_id`: UUID (required)
  - `platform_id`: UUID
  - `status`: string
  - `page`: integer
  - `limit`: integer
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "organization_id": "uuid",
        "platform_id": "uuid",
        "platform_name": "string",
        "original_filename": "string",
        "status": "string",
        "created_at": "timestamp",
        "error_message": "string"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "pages": "integer"
    }
  }
  ```
- **Success**: 200 OK

### Campaigns

#### List Campaigns

- **Method**: GET
- **Path**: `/api/campaigns`
- **Description**: Get all campaigns for organization
- **Query Parameters**:
  - `organization_id`: UUID (required)
  - `platform_id`: UUID
  - `status`: string
  - `search`: string
  - `page`: integer
  - `limit`: integer
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "platform_id": "uuid",
        "platform_name": "string",
        "status": "string",
        "start_date": "date",
        "end_date": "date",
        "summary_metrics": {
          "impressions": "integer",
          "clicks": "integer",
          "spend": "number",
          "conversions": "integer",
          "revenue": "number"
        }
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "pages": "integer"
    }
  }
  ```
- **Success**: 200 OK

#### Get Campaign Details

- **Method**: GET
- **Path**: `/api/campaigns/{id}`
- **Description**: Get detailed campaign information
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "organization_id": "uuid",
    "platform_id": "uuid",
    "platform_name": "string",
    "external_id": "string",
    "status": "string",
    "start_date": "date",
    "end_date": "date",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "summary_metrics": {
      "impressions": "integer",
      "clicks": "integer",
      "spend": "number",
      "conversions": "integer",
      "revenue": "number",
      "ctr": "number",
      "cpc": "number",
      "cost_per_conversion": "number",
      "roas": "number"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**: 404 Not Found

#### Update Campaign

- **Method**: PUT
- **Path**: `/api/campaigns/{id}`
- **Description**: Update campaign information
- **Request Body**:
  ```json
  {
    "name": "string",
    "status": "string",
    "start_date": "date",
    "end_date": "date"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "status": "string",
    "start_date": "date",
    "end_date": "date",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request, 404 Not Found

### Metrics

#### Get Campaign Metrics

- **Method**: GET
- **Path**: `/api/metrics/campaigns/{id}`
- **Description**: Get metrics for a specific campaign
- **Query Parameters**:
  - `start_date`: date
  - `end_date`: date
  - `interval`: string ('day', 'week', 'month')
- **Response Body**:
  ```json
  {
    "campaign_id": "uuid",
    "campaign_name": "string",
    "data": [
      {
        "date": "date",
        "impressions": "integer",
        "clicks": "integer",
        "spend": "number",
        "conversions": "integer",
        "revenue": "number",
        "ctr": "number",
        "cpc": "number",
        "cost_per_conversion": "number",
        "roas": "number"
      }
    ]
  }
  ```
- **Success**: 200 OK
- **Errors**: 404 Not Found

#### Get Metrics Summary

- **Method**: GET
- **Path**: `/api/metrics/summary`
- **Description**: Get summary metrics across campaigns
- **Query Parameters**:
  - `organization_id`: UUID (required)
  - `platform_id`: UUID
  - `campaign_ids`: array of UUIDs
  - `start_date`: date
  - `end_date`: date
- **Response Body**:
  ```json
  {
    "summary": {
      "impressions": "integer",
      "clicks": "integer",
      "spend": "number",
      "conversions": "integer",
      "revenue": "number",
      "ctr": "number",
      "cpc": "number",
      "cost_per_conversion": "number",
      "roas": "number"
    },
    "comparison": {
      "impressions_change": "number",
      "clicks_change": "number",
      "spend_change": "number",
      "conversions_change": "number",
      "revenue_change": "number"
    }
  }
  ```
- **Success**: 200 OK

#### Compare Metrics Periods

- **Method**: GET
- **Path**: `/api/metrics/comparison/periods`
- **Description**: Compare metrics between two periods
- **Query Parameters**:
  - `organization_id`: UUID (required)
  - `campaign_ids`: array of UUIDs
  - `current_start`: date
  - `current_end`: date
  - `previous_start`: date
  - `previous_end`: date
- **Response Body**:
  ```json
  {
    "current_period": {
      "impressions": "integer",
      "clicks": "integer",
      "spend": "number",
      "conversions": "integer",
      "revenue": "number"
    },
    "previous_period": {
      "impressions": "integer",
      "clicks": "integer",
      "spend": "number",
      "conversions": "integer",
      "revenue": "number"
    },
    "changes": {
      "impressions_change": "number",
      "clicks_change": "number",
      "spend_change": "number",
      "conversions_change": "number",
      "revenue_change": "number"
    }
  }
  ```
- **Success**: 200 OK

### Campaign Changes

#### Create Campaign Change

- **Method**: POST
- **Path**: `/api/campaigns/{id}/changes`
- **Description**: Record a campaign change
- **Request Body**:
  ```json
  {
    "description": "string",
    "change_type": "string",
    "implementation_date": "timestamp",
    "verification_date": "timestamp"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "campaign_id": "uuid",
    "description": "string",
    "change_type": "string",
    "implementation_date": "timestamp",
    "verification_date": "timestamp",
    "created_at": "timestamp"
  }
  ```
- **Success**: 201 Created
- **Errors**: 400 Bad Request, 404 Not Found

#### List Campaign Changes

- **Method**: GET
- **Path**: `/api/campaigns/{id}/changes`
- **Description**: Get changes for a campaign
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "description": "string",
        "change_type": "string",
        "implementation_date": "timestamp",
        "verification_date": "timestamp",
        "verified": "boolean",
        "user_name": "string",
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Success**: 200 OK
- **Errors**: 404 Not Found

#### Get Upcoming Verifications

- **Method**: GET
- **Path**: `/api/verifications/upcoming`
- **Description**: Get upcoming change verifications
- **Query Parameters**:
  - `organization_id`: UUID (required)
  - `days`: integer (default: 7)
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "campaign_id": "uuid",
        "campaign_name": "string",
        "description": "string",
        "change_type": "string",
        "implementation_date": "timestamp",
        "verification_date": "timestamp",
        "user_name": "string"
      }
    ]
  }
  ```
- **Success**: 200 OK

#### Verify Campaign Change

- **Method**: PUT
- **Path**: `/api/changes/{id}/verify`
- **Description**: Mark a change as verified with notes
- **Request Body**:
  ```json
  {
    "verified": "boolean",
    "verification_notes": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "verified": "boolean",
    "verification_notes": "string",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request, 404 Not Found

#### Get Change Impact

- **Method**: GET
- **Path**: `/api/campaigns/changes/{id}/impact`
- **Description**: Get metrics before and after a change
- **Query Parameters**:
  - `days_before`: integer (default: 7)
  - `days_after`: integer (default: 7)
- **Response Body**:
  ```json
  {
    "change": {
      "id": "uuid",
      "description": "string",
      "change_type": "string",
      "implementation_date": "timestamp"
    },
    "before": {
      "impressions": "integer",
      "clicks": "integer",
      "spend": "number",
      "conversions": "integer",
      "revenue": "number",
      "ctr": "number",
      "cpc": "number",
      "cost_per_conversion": "number",
      "roas": "number"
    },
    "after": {
      "impressions": "integer",
      "clicks": "integer",
      "spend": "number",
      "conversions": "integer",
      "revenue": "number",
      "ctr": "number",
      "cpc": "number",
      "cost_per_conversion": "number",
      "roas": "number"
    },
    "impact": {
      "impressions_change": "number",
      "clicks_change": "number",
      "spend_change": "number",
      "conversions_change": "number",
      "revenue_change": "number",
      "ctr_change": "number",
      "cpc_change": "number",
      "cost_per_conversion_change": "number",
      "roas_change": "number"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**: 404 Not Found

### Alerts

#### Get Alerts

- **Method**: GET
- **Path**: `/api/alerts`
- **Description**: Get campaign alerts
- **Query Parameters**:
  - `organization_id`: UUID (required)
  - `campaign_id`: UUID
  - `status`: string ('active', 'dismissed')
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "campaign_id": "uuid",
        "campaign_name": "string",
        "metric": "string",
        "threshold": "number",
        "current_value": "number",
        "status": "string",
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Success**: 200 OK

#### Update Alert Status

- **Method**: PUT
- **Path**: `/api/alerts/{id}/status`
- **Description**: Update alert status (dismiss)
- **Request Body**:
  ```json
  {
    "status": "string" // 'dismissed'
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "status": "string",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 404 Not Found

#### Configure Alert Thresholds

- **Method**: PUT
- **Path**: `/api/organizations/{id}/alert-thresholds`
- **Description**: Configure alert thresholds for an organization
- **Request Body**:
  ```json
  {
    "ctr_threshold": "number",
    "cpc_threshold": "number",
    "cost_per_conversion_threshold": "number",
    "roas_threshold": "number"
  }
  ```
- **Response Body**:
  ```json
  {
    "organization_id": "uuid",
    "ctr_threshold": "number",
    "cpc_threshold": "number",
    "cost_per_conversion_threshold": "number",
    "roas_threshold": "number",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request, 404 Not Found

### AI Insights

#### Get AI Insights

- **Method**: GET
- **Path**: `/api/ai/insights`
- **Description**: Get AI-generated insights
- **Query Parameters**:
  - `organization_id`: UUID (required)
  - `campaign_id`: UUID
  - `insight_type`: string ('summary', 'trend', 'recommendation', 'anomaly')
  - `status`: string ('active', 'dismissed', 'implemented')
  - `page`: integer
  - `limit`: integer
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "campaign_id": "uuid",
        "campaign_name": "string",
        "insight_type": "string",
        "content": "string",
        "date_range_start": "date",
        "date_range_end": "date",
        "status": "string",
        "created_at": "timestamp"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "pages": "integer"
    }
  }
  ```
- **Success**: 200 OK

#### Generate Campaign Summary

- **Method**: POST
- **Path**: `/api/ai/insights/summary`
- **Description**: Generate a campaign summary
- **Request Body**:
  ```json
  {
    "campaign_id": "uuid",
    "date_range_start": "date",
    "date_range_end": "date"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "campaign_id": "uuid",
    "insight_type": "summary",
    "content": "string",
    "date_range_start": "date",
    "date_range_end": "date",
    "status": "active",
    "created_at": "timestamp"
  }
  ```
- **Success**: 201 Created
- **Errors**: 400 Bad Request, 404 Not Found

#### Update Insight Status

- **Method**: PUT
- **Path**: `/api/ai/insights/{id}/status`
- **Description**: Update insight status
- **Request Body**:
  ```json
  {
    "status": "string" // 'active', 'dismissed', 'implemented'
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "status": "string",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 400 Bad Request, 404 Not Found

#### Generate AI Report

- **Method**: POST
- **Path**: `/api/ai/reports/generate`
- **Description**: Generate a comprehensive AI report
- **Request Body**:
  ```json
  {
    "organization_id": "uuid",
    "campaign_ids": ["uuid"],
    "date_range_start": "date",
    "date_range_end": "date",
    "include_sections": ["summary", "trends", "recommendations", "anomalies"]
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "status": "processing"
  }
  ```
- **Success**: 202 Accepted
- **Errors**: 400 Bad Request

#### Get AI Report

- **Method**: GET
- **Path**: `/api/ai/reports/{id}`
- **Description**: Get a generated AI report
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "organization_id": "uuid",
    "campaign_ids": ["uuid"],
    "date_range_start": "date",
    "date_range_end": "date",
    "content": "string",
    "status": "string",
    "created_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 404 Not Found

### Data Export

#### Export Data

- **Method**: GET
- **Path**: `/api/export`
- **Description**: Export data in various formats
- **Query Parameters**:
  - `format`: string ('csv', 'xlsx', 'pdf')
  - `entity`: string ('campaigns', 'metrics', 'changes')
  - `organization_id`: UUID (required)
  - `campaign_ids`: array of UUIDs
  - `start_date`: date
  - `end_date`: date
- **Response Body**: Binary file
- **Success**: 200 OK
- **Errors**: 400 Bad Request

### User Activity

#### Get User Activities

- **Method**: GET
- **Path**: `/api/activities`
- **Description**: Get user activity logs
- **Query Parameters**:
  - `organization_id`: UUID (required)
  - `user_id`: UUID
  - `activity_type`: string
  - `start_date`: date
  - `end_date`: date
  - `page`: integer
  - `limit`: integer
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "user_email": "string",
        "activity_type": "string",
        "entity_type": "string",
        "entity_id": "uuid",
        "details": "object",
        "created_at": "timestamp"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "pages": "integer"
    }
  }
  ```
- **Success**: 200 OK

### Platforms

#### List Platforms

- **Method**: GET
- **Path**: `/api/platforms`
- **Description**: Get all available platforms
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "display_name": "string"
      }
    ]
  }
  ```
- **Success**: 200 OK

## 3. Authentication and Authorization

The API uses Supabase Authentication with JWT tokens for securing endpoints.

### Authentication Implementation

- JWT-based authentication using Supabase Auth
- Access and refresh tokens
- Token expiration and refresh flow
- Rate limiting to prevent brute force attacks

### Authorization Implementation

- Role-based access control via user_organizations roles
- Row-Level Security (RLS) policies on Supabase
- Three permission levels:
  - Admin: Full control over organization resources
  - Editor: Can create/edit campaigns and import data
  - Viewer: Can only view data, no modifications

### Security Headers

- CORS configuration
- Content-Security-Policy
- X-XSS-Protection
- X-Content-Type-Options

## 4. Validation and Business Logic

### Validation Rules

- **Organizations**:
  - Name: Required, max length 100
- **User Organizations**:

  - Role: Must be one of 'admin', 'editor', 'viewer'

- **Campaigns**:

  - Name: Required, max length 100
  - Status: Must be one of 'active', 'paused', 'completed', 'archived'
  - Unique constraint on (organization_id, platform_id, external_id)
  - Start date must be before or equal to end date

- **Metrics**:

  - Date: Required
  - Numeric fields (impressions, clicks, etc.): Must be non-negative
  - Unique constraint on (campaign_id, date)

- **Imports**:

  - Status: Must be one of 'pending', 'processing', 'completed', 'error'
  - File size limitations

- **Campaign Changes**:

  - Description: Required
  - Change type: Must be one of 'budget', 'targeting', 'creative', 'bid', 'other'
  - Implementation date: Required

- **AI Insights**:
  - Insight type: Must be one of 'summary', 'trend', 'recommendation', 'anomaly'
  - Status: Must be one of 'active', 'dismissed', 'implemented'
  - Content: Required

### Business Logic Implementation

- **Data Import Processing**:
  - File validation
  - Format detection
  - Mapping to internal schema
  - Campaign creation/updating
  - Metrics aggregation
- **AI Insight Generation**:
  - Trend detection based on statistical analysis
  - Anomaly detection using outlier identification algorithms
  - Summary generation using OpenRouter.ai with appropriate models
  - Recommendations based on performance metrics
- **Alert System**:
  - Threshold-based alerts for key metrics
  - Real-time notification via WebSockets
  - Daily digest of critical alerts
- **Campaign Change Impact Analysis**:
  - Pre/post comparison of metrics
  - Statistical significance testing
  - Automated verification reminders
