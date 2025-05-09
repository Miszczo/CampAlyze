# Specyfikacja techniczna modułu rejestracji, logowania, weryfikacji e-mail i odzyskiwania hasła

Dokument opisuje architekturę frontendową (strony, komponenty, walidacja), backendową (endpointy, modele, wyjątki) oraz integrację z Supabase Auth i zarządzanie sesją i rolami.

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Strony Astro (src/pages)

- **register.astro** (`/register`) – Formularz rejestracji: pola `email`, `fullName`, `password`, `confirmPassword`; po submit wywołuje `/api/auth/register`.
- **login.astro** (`/login`) – Formularz logowania: pola `email`, `password`; wywołuje `/api/auth/login`.
- **verify-email.astro** (`/verify-email?token=...`) – Obsługa tokenu weryfikacyjnego; po wczytaniu wywołuje `/api/auth/verify-email`; przycisk resend wywołuje `/api/auth/resend-verification`.
- **forgot-password.astro** (`/forgot-password`) – Formularz: pole `email`; wywołuje `/api/auth/password/forgot`.
- **reset-password.astro** (`/reset-password?token=...`) – Formularz: pola `newPassword`, `confirmPassword`; wywołuje `/api/auth/password/reset`.

Każda strona używa `AuthLayout.astro` i osadza odpowiedni Reactowy komponent z `src/components/auth`.

### 1.2 Layouty

- **AuthLayout.astro** – Układ dla stron uwierzytelnienia (logo, kartka formularza, linki akcji).
- **MainLayout.astro** – Istniejący układ aplikacji dla treści chronionych i publicznych.

### 1.3 Komponenty React (src/components/auth)

- **RegisterForm.tsx** – Formularz rejestracji
- **LoginForm.tsx** – Formularz logowania
- **VerifyEmailForm.tsx** – Wyświetla status weryfikacji i przycisk resend
- **ForgotPasswordForm.tsx** – Formularz resetu hasła
- **ResetPasswordForm.tsx** – Formularz ustawienia nowego hasła
- **AuthInput.tsx**, **AuthButton.tsx**, **FormErrorMessage.tsx** – Wspólne pola i przyciski z handle błędów

#### Rozdzielenie odpowiedzialności

- Strony Astro: SSR, layout, environment variables
- React: walidacja, interakcja, wysyłanie requestów, obsługa odpowiedzi i błędów, navigacja

### 1.4 Walidacja i komunikaty błędów

- **Email**: wymagane, RFC 5322
- **Imię i nazwisko (fullName)**: wymagane, max 100 znaków
- **Hasło**: min 8 znaków, co najmniej 1 wielka litera, 1 cyfra
- **Potwierdzenie hasła**: równe `password`
- Błędy: wymagane pola, format, mismatch, server errors (400+), lockout, niezweryfikowany e-mail
- **Scenariusze**:
  1. Brak danych – komunikaty "To pole jest wymagane"
  2. Niepoprawny format – np. "Niepoprawny format adresu e-mail"
  3. Słabe hasło / różne hasła – "Hasła muszą być identyczne" / "Hasło zbyt słabe"
  4. Lockout – "Konto zablokowane na 15 minut po 5 nieudanych próbach"
  5. Niezweryfikowany e-mail – "Proszę najpierw zweryfikować adres e-mail"
  6. Sukces – redirect na `/dashboard` lub informacja o wysłaniu maila

## 2. LOGIKA BACKENDOWA

### 2.1 Endpointy API (Astro Functions)

#### Auth (src/pages/api/auth)

- **register.ts** (POST `/api/auth/register`): rejestracja, z `fullName`; inicjalizacja metadata (`failed_login_count=0, locked_until=null`).
- **login.ts** (POST `/api/auth/login`): logowanie z lockout (sprawdzenie metadata, inkrementacja lub reset). Zwraca Set-Cookie.
- **logout.ts** (POST `/api/auth/logout`): wylogowanie, czyszczenie cookies.
- **refresh.ts** (POST `/api/auth/refresh`): odświeżenie tokena, Set-Cookie.
- **verify-email.ts** (POST `/api/auth/verify-email`): weryfikacja e-mail z tokenem.
- **resend-verification.ts** (POST `/api/auth/resend-verification`): ponowne wysłanie maila.

#### Password (src/pages/api/auth/password)

- **forgot.ts** (POST `/api/auth/password/forgot`): resetPasswordForEmail, redirectTo
- **reset.ts** (POST `/api/auth/password/reset`): updateUser z nowym hasłem, token

#### User Management (src/pages/api/admin/users) - **Endpoint for Admins Only**

- **index.ts** (GET `/api/admin/users`) – lista użytkowników i ról
- **update.ts** (PUT `/api/admin/users/{userId}/role`) – zmiana roli: `{ role: 'admin' | 'standard' }`
- **deactivate.ts** (PUT `/api/admin/users/{userId}/deactivate`) – dezaktywacja użytkownika (np. przez ustawienie flagi w metadata)

### 2.2 Modele danych i DTO (src/types.ts)

```ts
export interface RegisterDTO {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}
export interface LoginDTO {
  email: string;
  password: string;
}
export interface LogoutDTO {}
export interface RefreshDTO {
  refreshToken: string;
}
export interface ForgotPasswordDTO {
  email: string;
}
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
export interface VerifyEmailDTO {
  token: string;
}
export interface ResendVerificationDTO {
  email: string;
}

// Simplified Role Management DTOs (No Organizations)
export interface UpdateUserRoleDTO {
  userId: string;
  role: "admin" | "standard";
}
export interface UserListItemDTO {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "standard";
  isActive: boolean;
} // Example for GET /api/admin/users
```

### 2.3 Walidacja i obsługa wyjątków

- Użyć `zod` lub ręczne guard clauses (400, JSON `{ error }`).
- `try/catch` loguje błąd, zwraca 500.

### 2.4 Lockout i metadata

- **Rejestracja**: signUp({ email, password }, { data: { full_name, failed_login_count:0, locked_until:null } })
- **Login**: przed signIn pobrać użytkownika serviceRole, sprawdzić `failed_login_count<5 && locked_until<Now()`; przy lockout 403.
- **Nieudane logowanie**: inkrementacja `failed_login_count`, po 5 ustaw `locked_until=Now()+15m`.
- **Udane logowanie**: reset `failed_login_count=0, locked_until=null`.

### 2.5 Integracja SSR i middleware (src/middleware/index.ts)

- Wyklucza publiczne trasy auth: `/register`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`, `/api/auth/*`, `/api/auth/password/*`, `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/refresh`, `/api/auth/logout`.
- Odczyt cookies `sb-access-token`, `sb-refresh-token` (Secure, HttpOnly, SameSite=Strict).
- Ustawia `request.locals.session` i `locals.user` (dane z Supabase + rola z `user_metadata` lub dedykowanej tabeli).
- Redirect niezalogowanych na `/login`, niezweryfikowanych na `/verify-email`.

## 3. SYSTEM AUTENTYKACJI

### 3.1 Konfiguracja klienta Supabase (src/db/supabaseClient.ts)

```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
```

### 3.2 Operacje Supabase

- **signUp**: `supabase.auth.signUp({ email, password }, { data })`
- **verifyOtp**: `supabase.auth.verifyOtp({ token, type:'signup' })`
- **signInWithPassword**: `supabase.auth.signInWithPassword({ email, password })`
- **refreshSession**: `supabase.auth.refreshSession({ refresh_token })`
- **signOut**: `supabase.auth.signOut()`
- **resetPasswordForEmail**: `supabase.auth.resetPasswordForEmail({ email }, { redirectTo })`
- **updateUser**: `supabase.auth.updateUser({ password })`

### 3.3 Zarządzanie ciasteczkami i sesją

- **Set-Cookie**: w `login` i `refresh` zwracane nagłówki dla `sb-access-token` i `sb-refresh-token`.
- **Clear-Cookie**: w `logout` usuwa ciasteczka.
- Ciasteczka: Secure, HttpOnly, SameSite=Strict.

### 3.4 Serwis autoryzacji (src/lib/services/authService.ts)

- `register(dto: RegisterDTO)`
- `login(dto: LoginDTO)`
- `logout()`
- `refresh(dto: RefreshDTO)`
- `verifyEmail(dto: VerifyEmailDTO)`
- `resendVerification(dto: ResendVerificationDTO)`
- `forgotPassword(dto: ForgotPasswordDTO)`
- `resetPassword(dto: ResetPasswordDTO)`

// Simplified User Management Service methods (Admin only)

- `getAllUsers(): Promise<UserListItemDTO[]>`
- `updateUserRole(dto: UpdateUserRoleDTO)`
- `deactivateUser(userId: string)`

---

Powyższa specyfikacja w pełni pokrywa wymagania PRD, UI-plan, DB-plan i API-plan dla modułu autoryzacji.
