"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    console.log("ThemeContext: Initializing theme...");
    try {
      const savedTheme = localStorage.getItem("theme") as Theme;
      console.log("ThemeContext: Saved theme from localStorage:", savedTheme);
      if (savedTheme) {
        setThemeState(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        console.log("ThemeContext: System prefers dark:", prefersDark);
        setThemeState(prefersDark ? "dark" : "light");
      }
      setMounted(true);
      console.log("ThemeContext: Mounted successfully");
    } catch (error) {
      console.error("ThemeContext: Error initializing theme:", error);
      setThemeState("light");
      setMounted(true);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      console.log("Applying theme to document:", theme);
      console.log("Document classes before:", root.className);
      
      if (theme === "dark") {
        root.classList.add("dark");
        console.log("Added 'dark' class to document");
      } else {
        root.classList.remove("dark");
        console.log("Removed 'dark' class from document");
      }
      
      console.log("Document classes after:", root.className);
      console.log("Document has dark class:", root.classList.contains("dark"));
      
      localStorage.setItem("theme", theme);
      console.log("Saved theme to localStorage:", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    try {
      console.log("ThemeContext: toggleTheme called");
      setThemeState(prev => {
        const newTheme = prev === "light" ? "dark" : "light";
        console.log("ThemeContext: Toggling theme from", prev, "to", newTheme);
        return newTheme;
      });
    } catch (error) {
      console.error("ThemeContext: Error toggling theme:", error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Provide context even when not mounted to prevent useTheme errors
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.error("useTheme must be used within a ThemeProvider");
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  console.log("useTheme: Context found, theme:", context.theme);
  return context;
}
