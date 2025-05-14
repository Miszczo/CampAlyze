import { createClient } from "@supabase/supabase-js";
import { chromium, type FullConfig } from "@playwright/test";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

// Global setup for Playwright.
// Logs test user into Supabase and saves storageState with sb-localhost-auth-token cookie.

async function globalSetup(config: FullConfig) {
  const { SUPABASE_URL, SUPABASE_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD } = process.env;

  // Added for debugging:
  // console.log("[globalSetup] Attempting to load .env.test variables:");
  // console.log("[globalSetup] SUPABASE_URL:", SUPABASE_URL);
  // console.log("[globalSetup] SUPABASE_KEY:", SUPABASE_KEY ? "Set (first 10 chars: " + SUPABASE_KEY.substring(0, 10) + "...)" : "Not Set or Empty");
  // console.log("[globalSetup] TEST_USER_EMAIL:", TEST_USER_EMAIL ? "Set" : "Not Set or Empty");
  // End of added for debugging

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL or SUPABASE_KEY env vars missing for globalSetup");
  }
  if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
    throw new Error("Test user credentials env vars missing (TEST_USER_EMAIL / TEST_USER_PASSWORD)");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Helper to attempt sign-in and return session if successful
  const trySignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    if (error || !data.session) return null;
    return data.session;
  };

  let session = await trySignIn();
  if (!session) {
    console.log("[globalSetup] Sign-in failed → trying sign-up for test user...");
    const { error: signUpError } = await supabase.auth.signUp({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    if (signUpError && signUpError.status !== 400 /* 400 = already registered */) {
      throw new Error(`Supabase test user sign-up failed: ${signUpError.message}`);
    }
    
    // Dodajmy log dla lepszego debugowania
    // if (signUpError && signUpError.status === 400) {
    //   console.log("[globalSetup] User already registered, continuing with sign-in...");
    // }
    
    session = await trySignIn();
    if (!session) {
      throw new Error("Failed to obtain session for test user after sign-up.");
    }
  }

  const { access_token: accessToken, refresh_token: refreshToken } = session;

  // Derive Supabase project ref to construct correct cookie names.
  const getProjectRef = (url: string): string => {
    try {
      const u = new URL(url);
      // Localhost uses numeric project ref (e.g., 127) by convention in Supabase CLI
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        return "127";
      }
      // Cloud projects: <PROJECT_REF>.supabase.co or similar
      const subdomain = u.hostname.split(".")[0];
      return subdomain || "unknown";
    } catch {
      return "unknown";
    }
  };

  const projectRef = getProjectRef(SUPABASE_URL);

  const sessionPayload = session; // full session object from Supabase

  const encodedValue = `base64-${Buffer.from(JSON.stringify(sessionPayload)).toString("base64url")}`;

  const MAX_CHUNK_SIZE = 3180;
  const cookieChunks: { name: string; value: string }[] = [];
  if (encodedValue.length <= MAX_CHUNK_SIZE) {
    cookieChunks.push({ name: `sb-${projectRef}-auth-token`, value: encodedValue });
  } else {
    // Split into chunks preserving URI encoding boundaries
    let remaining = encodedValue;
    let index = 0;
    while (remaining.length > 0) {
      const chunk = remaining.slice(0, MAX_CHUNK_SIZE);
      cookieChunks.push({ name: `sb-${projectRef}-auth-token.${index}`, value: chunk });
      remaining = remaining.slice(MAX_CHUNK_SIZE);
      index += 1;
    }
  }

  const commonOptions = {
    domain: "localhost",
    path: "/",
    httpOnly: false, // Supabase SSR expects client-read cookies
    secure: false,
    sameSite: "Lax" as const,
    expires: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
  };

  const supabaseCookies = cookieChunks.map((c) => ({ ...commonOptions, name: c.name, value: c.value }));

  const cookieRefresh = {
    name: `sb-${projectRef}-refresh-token`,
    value: refreshToken,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
    expires: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
  };

  const browser = await chromium.launch();
  const contextBrowser = await browser.newContext();
  await contextBrowser.addCookies([...supabaseCookies, cookieRefresh]);
  const storagePath = "playwright/.auth/state.json";
  await fs.promises.mkdir("playwright/.auth", { recursive: true });
  await contextBrowser.storageState({ path: storagePath });
  await browser.close();
  // console.log(`[globalSetup] Saved authenticated storage state to ${storagePath}`);
}

export default globalSetup;
