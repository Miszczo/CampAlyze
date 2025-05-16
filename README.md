# CampAlyze

An analytical tool for advertising campaigns designed for marketing specialists who need a fast and efficient way to analyze data from various advertising platforms.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)
- [Pokrycie testami](#pokrycie-testami)

## Project Description

CampAlyze is a web application that simplifies the process of analyzing advertising campaign data. The MVP focuses on importing and analyzing data from CSV/XLSX files exported from Google Ads and Meta Ads, offering an interactive dashboard with key metrics and the ability to compare campaign performance. The tool also includes basic AI functions for generating automatic summaries and simple recommendations.

This solution addresses the problem of time wasted on manual collection, combination, and analysis of advertising data, which limits the ability of specialists to quickly respond and optimize campaigns. With CampAlyze, users can make data-driven decisions faster, leading to more efficient use of advertising budgets.

## Tech Stack

- [Astro](https://astro.build/) v5.5.5 - Modern web framework with Islands Architecture
- [React](https://react.dev/) v19.0.0 - UI library for interactive components
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework
- [Shadcn/UI](https://ui.shadcn.com/) - Accessible UI components based on Radix UI
- [Supabase](https://supabase.com/) - Backend with PostgreSQL, authentication and storage
- [OpenRouter.ai](https://openrouter.ai/) - Access to various AI models for data analysis

### Additional Libraries

- React Query - State management and API request caching
- Recharts/Nivo - Data visualization libraries
- date-fns - Date manipulation and formatting
- Papa Parse - CSV parsing in the browser
- xlsx - Excel file handling

### Testing Tools

- **Vitest** - Fast unit and integration testing framework
- **Playwright** - End-to-end testing framework for critical user journeys
- **k6** - Performance and load testing
- **OWASP ZAP** - Basic security scanning

## Getting Started Locally

### Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/campalyze.git
cd campalyze
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables template:

```bash
cp .env.example .env
```

4. Set up your environment variables in the `.env` file

5. Run the development server:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint on all files
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## Project Scope

### Core Features

1. **Import and Process Data** (Częściowo zaimplementowano w Minimal MVP)
   - Import data from CSV/XLSX files (Google Ads and Meta Ads) (Zaimplementowano w Minimal MVP - podstawowy upload CSV)
   - Data validation and error reporting (Podstawowa walidacja po stronie serwera)
   - Process key metrics: CPC, CTR, conversions, cost/conversion, ROAS (Dane ładowane do widoku `campaign_metrics_derived`)

2. **Interactive Dashboard** (Zaimplementowano w Minimal MVP)
   - Visualize key metrics (Zaimplementowano w Minimal MVP)
   - Compare platforms side-by-side (Zaimplementowano w Minimal MVP)
   - Segment data by platform, campaign, and time period (Zaimplementowano w Minimal MVP - podstawowe filtry)
   - Compare periods (current week/month vs. previous)

3. **Alert System**

   - Flags for campaigns with potential issues
   - Notifications for campaigns requiring attention

4. **Change Tracking**

   - Log changes made to campaigns
   - Set verification dates for changes
   - Compare metrics before and after changes

5. **Export Data**

   - Export reports to CSV/PDF/XLSX
   - Select data ranges for export

6. **User Authentication** (Zaimplementowano w Minimal MVP)

   - Supabase Authentication integration (Zaimplementowano w Minimal MVP)
   - User roles and permissions
   - Activity logging

7. **AI Features** (Częściowo zaimplementowano w Minimal MVP)
   - Automated campaign summaries (Zaimplementowano w Minimal MVP - prosta analiza OpenRouter)
   - Trend and anomaly detection
   - Simple optimization recommendations (Zaimplementowano w Minimal MVP - prosta analiza OpenRouter)

### Out of Scope for MVP

- Automatic integration with Google Ads and Meta Ads APIs
- Advanced anomaly detection systems
- Automated cyclic reporting via email
- Advanced predictive algorithms and machine learning models
- Multi-channel conversion attribution
- Integration with platforms beyond Google Ads and Meta Ads
- Automation of recommendations implementation
- Advanced benchmark comparisons with industry data

## Project Status & Currently Available Features

The Minimal Viable Product (MVP) phase focused on core functionalities has been completed. Users can now perform the following actions within the application:

* **User Account Management:**
  * Register for a new account.
  * Log in and log out securely.
  * Verify their email address.
  * Reset a forgotten password.
* **Data Import & Management:**
  * Upload campaign data via CSV files (initial support for Google Ads/Meta Ads common structures).
  * View a list of their imported files.
  * Delete previously imported files along with their associated data.
* **Interactive Dashboard:**
  * Access an interactive dashboard to view key campaign metrics.
  * Filter displayed data by organization ID, date range, specific platform (Google Ads/Meta Ads), and campaign.
  * View platform-specific metrics, such as reach and detailed conversion types for Meta Ads.
* **Basic AI-Powered Analysis:**
  * For any imported campaign, trigger a basic AI analysis using OpenRouter (gpt-3.5-turbo).
  * Receive simple summaries and optimization recommendations based on the provided data.
  * View these AI-generated insights directly on the import details page.

The project is under active development to expand these features and deliver the full MVP scope. Future enhancements will include more advanced analytics, broader AI capabilities, and additional data management tools.

## License

MIT

## Pokrycie testami

### Testy jednostkowe (unit)

Pokrywają kluczowe funkcje backendu i komponenty UI:

- **Autoryzacja (auth):**
  - Rejestracja, logowanie, reset hasła, weryfikacja emaila (`src/pages/api/auth/*.test.ts`)
- **Import danych:**
  - Endpoint uploadu plików, walidacja, obsługa błędów (`src/pages/api/imports/upload.test.ts`)
- **Dashboard:**
  - Pobieranie metryk, filtrowanie (`src/pages/api/dashboard/metrics.test.ts`)
- **Komponenty UI:**
  - DatePicker, DropdownSelect, CampaignChart (`src/components/ui/**/*.test.tsx`)
- **AI Insights:**
  - Endpoint analizy AI, komponent UI (`src/pages/api/ai-insights/analyze.test.ts`, `src/components/ai/AIInsights.test.tsx`)

### Testy end-to-end (E2E)

Pokrywają najważniejsze przepływy użytkownika i integracje:

- **Logowanie i rejestracja:**
  - Pełny przepływ logowania, rejestracji, weryfikacji emaila (`tests/e2e/login.spec.ts`, `tests/e2e/resend-verification.spec.ts`)
- **Strona główna i dashboard:**
  - Nawigacja, responsywność, widoczność kluczowych elementów, snapshoty UI (`tests/e2e/home.spec.ts`)
- **CRUD importów:**
  - Lista importów, usuwanie importu (`tests/e2e/imports.spec.ts` - obecnie pominięty, jeśli był problematyczny)
- **AI Analysis:**
  - Analiza AI na szczegółach importu (`tests/e2e/ai-analysis.spec.ts` - obecnie pominięty, jeśli był problematyczny)

> Uwaga: Niektóre testy E2E (np. pełny przepływ importów, analiza AI) mogą być tymczasowo pominięte, jeśli sprawiały problemy w CI/CD. Kluczowe funkcjonalności MVP są jednak pokryte testami jednostkowymi i E2E.
