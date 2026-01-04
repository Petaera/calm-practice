import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useTherapistSettings } from "@/hooks/use-therapist-settings";

type Theme = "light" | "dark" | "auto";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { therapist } = useAuth();
  const { data: settings } = useTherapistSettings(therapist?.id);
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Determine if it's daytime (6am to 6pm) or nighttime
  const getTimeBasedTheme = (): ResolvedTheme => {
    const hour = new Date().getHours();
    // Light theme from 6am (6) to 6pm (18)
    return hour >= 6 && hour < 18 ? "light" : "dark";
  };

  // Apply the theme to the document
  const applyTheme = (resolved: ResolvedTheme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    setResolvedTheme(resolved);
  };

  // Update resolved theme based on theme preference
  useEffect(() => {
    // Only apply user theme settings if logged in
    if (!therapist) {
      // Force light theme for public pages (landing, login, etc.)
      applyTheme("light");
      return;
    }

    let resolved: ResolvedTheme;

    if (theme === "auto") {
      resolved = getTimeBasedTheme();
    } else {
      resolved = theme;
    }

    applyTheme(resolved);
  }, [theme, therapist]);

  // Load theme from settings when available (only for logged in users)
  useEffect(() => {
    if (therapist && settings?.theme) {
      setThemeState(settings.theme as Theme);
    } else if (!therapist) {
      // Reset to light theme when logged out
      setThemeState("light");
    }
  }, [settings?.theme, therapist]);

  // Set up interval to check time for auto theme (only for logged in users)
  useEffect(() => {
    if (!therapist || theme !== "auto") return;

    // Check every minute if we need to switch theme
    const interval = setInterval(() => {
      const newResolvedTheme = getTimeBasedTheme();
      if (newResolvedTheme !== resolvedTheme) {
        applyTheme(newResolvedTheme);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [theme, resolvedTheme, therapist]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme-preference", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

