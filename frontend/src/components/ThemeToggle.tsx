"use client";

import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");

    root.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-sm hover:-translate-y-0.5 hover:shadow-md"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 text-amber-500 dark:hidden" />
      <Moon className="hidden h-5 w-5 text-slate-200 dark:block" />
    </button>
  );
}
