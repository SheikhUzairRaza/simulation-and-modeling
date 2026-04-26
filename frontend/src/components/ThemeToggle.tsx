"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const readTheme = () => document.documentElement.classList.contains("dark");
    setIsDark(readTheme());

    const observer = new MutationObserver(() => {
      setIsDark(readTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (typeof document === "undefined") return;

    const nextIsDark = !document.documentElement.classList.contains("dark");

    if (nextIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setIsDark(nextIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn-ghost inline-flex min-h-11 min-w-11 items-center justify-center"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunMedium className="h-5 w-5 text-[var(--accent-alt)]" />
      ) : (
        <MoonStar className="h-5 w-5 text-[var(--accent)]" />
      )}
    </button>
  );
}
