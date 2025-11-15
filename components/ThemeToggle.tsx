"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./Icons";

type Theme = "light" | "dark";

const THEME_KEY = "voiceKeyboard.theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const isDark = theme === "dark";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial theme: from localStorage or system preference
    const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
    let initial: Theme = "dark";
    if (stored === "light" || stored === "dark") {
      initial = stored;
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      initial = "light";
    }
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(next: Theme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (next === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, next);
    }
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-200 dark:border-slate-700/80 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800 md:mt-2"
      aria-label="Toggle light and dark theme"
    >
      {isDark ? (
        <>
          <IconMoon className="h-3.5 w-3.5" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <IconSun className="h-3.5 w-3.5" />
          <span>Light</span>
        </>
      )}
    </button>
  );
}


