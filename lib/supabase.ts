import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import storage from "./storage"; // Import the custom storage solution
import { Platform } from "react-native";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      storage: storage, // Use the custom storage solution
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  },
);

// Add session change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event, session?.provider_token ? "Has token" : "No token");
});
