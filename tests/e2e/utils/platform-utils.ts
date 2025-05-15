import { createClient } from "@supabase/supabase-js";

// Utworzenie klienta supabase dla testów E2E
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Funkcja pobierająca UUID platformy po nazwie
export async function getPlatformIdByName(name: string): Promise<string> {
  try {
    // Mapowanie nazw w testach na nazwy w bazie danych
    const platformMapping = {
      "google": "google_ads",
      "meta": "meta_ads"
    };

    // Pobieranie platformy z bazy danych
    const platformName = platformMapping[name] || name;
    
    const { data, error } = await supabase
      .from("platforms")
      .select("id")
      .eq("name", platformName)
      .single();
    
    if (error || !data) {
      console.error(`Nie znaleziono platformy o nazwie: ${platformName}`, error);
      throw new Error(`Nie znaleziono platformy o nazwie: ${platformName}`);
    }
    
    return data.id;
  } catch (error) {
    console.error("Błąd podczas pobierania ID platformy:", error);
    
    // Fallback na przypadek braku połączenia z bazą w trybie developerskim
    console.warn("UWAGA: Używam mocka UUID platformy - tylko do testów developerskich!");
    if (name === "google" || name === "google_ads") {
      return "11111111-1111-1111-1111-111111111111"; // Przykładowy UUID dla Google Ads
    } else if (name === "meta" || name === "meta_ads") {
      return "22222222-2222-2222-2222-222222222222"; // Przykładowy UUID dla Meta Ads
    } else {
      return "00000000-0000-0000-0000-000000000000"; // Generyczny UUID
    }
  }
}

// Cache dla UUID platform - opcjonalne, ale przyspiesza testy
const platformCache = new Map<string, string>();

// Funkcja z cache'owaniem - szybsza dla wielu testów
export async function getPlatformIdByNameCached(name: string): Promise<string> {
  if (platformCache.has(name)) {
    return platformCache.get(name);
  }
  
  const id = await getPlatformIdByName(name);
  platformCache.set(name, id);
  return id;
}

// Helper do inicjalizacji cache'a na początku testów
export async function initPlatformCache(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("platforms")
      .select("id, name");
    
    if (error || !data) {
      console.error("Nie udało się pobrać platform z bazy danych", error);
      return;
    }
    
    // Załadowanie cache'a
    data.forEach(platform => {
      platformCache.set(platform.name, platform.id);
      
      // Dodaj też mapowanie alternatywne (google_ads -> google)
      if (platform.name === "google_ads") platformCache.set("google", platform.id);
      if (platform.name === "meta_ads") platformCache.set("meta", platform.id);
    });
    
    console.log("Cache platform załadowany pomyślnie");
  } catch (error) {
    console.error("Błąd podczas inicjalizacji cache'a platform:", error);
  }
} 