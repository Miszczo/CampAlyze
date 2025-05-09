```mermaid
stateDiagram-v2
    [*] --> LoggedOut : Początkowy stan
    LoggedOut --> Authenticating : Użytkownik próbuje się zalogować/zarejestrować
    Authenticating --> LoggedIn : Udana autentykacja (Supabase zwraca sesję)
    Authenticating --> LoggedOut : Nieudana autentykacja (błędne dane, błąd serwera)
    Authenticating --> EmailVerificationRequired : Rejestracja wymaga weryfikacji email
    LoggedIn --> LoggedOut : Wylogowanie (signOut)
    LoggedIn --> SessionExpired : Sesja wygasła (token JWT nieważny)
    SessionExpired --> Authenticating : Próba odświeżenia tokenu / ponowne logowanie
    SessionExpired --> LoggedOut : Nieudane odświeżenie / brak akcji
    EmailVerificationRequired --> LoggedIn : Użytkownik zweryfikował email
    EmailVerificationRequired --> LoggedOut : Anulowanie / błąd weryfikacji

    state LoggedIn {
        [*] --> AccessingProtectedRoutes
        AccessingProtectedRoutes --> LoggedIn
    }
```
