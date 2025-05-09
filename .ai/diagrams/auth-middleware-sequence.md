```mermaid
sequenceDiagram
    participant Browser/Client
    participant Middleware (Astro src/middleware/index.ts)
    participant Supabase Client (@supabase/ssr)
    participant Supabase Auth
    participant Target Page/API (Astro)

    Browser/Client->>Middleware (Astro src/middleware/index.ts): Żądanie GET/POST (z ciasteczkami sesji)
    Middleware (Astro src/middleware/index.ts)->>Middleware (Astro src/middleware/index.ts): Sprawdza czy ścieżka jest publiczna (np. /login, /api/auth/*)
    alt Ścieżka publiczna
        Middleware (Astro src/middleware/index.ts)->>Target Page/API (Astro): Przekazuje żądanie dalej (next())
    else Ścieżka chroniona
        Middleware (Astro src/middleware/index.ts)->>Supabase Client (@supabase/ssr): Inicjalizuje klienta z cookies/headers żądania
        Middleware (Astro src/middleware/index.ts)->>Supabase Auth: supabase.auth.getUser()
        Supabase Auth-->>Middleware (Astro src/middleware/index.ts): Odpowiedź (User data lub null)
        alt Użytkownik zalogowany (User data)
            Middleware (Astro src/middleware/index.ts)->>Middleware (Astro src/middleware/index.ts): Ustawia `locals.user`
            Middleware (Astro src/middleware/index.ts)->>Target Page/API (Astro): Przekazuje żądanie dalej (next())
            Target Page/API (Astro)-->>Browser/Client: Zwraca zawartość strony/API
        else Użytkownik niezalogowany (null)
            Middleware (Astro src/middleware/index.ts)->>Browser/Client: Przekierowanie 302 na /auth/login
        end
    end
```
