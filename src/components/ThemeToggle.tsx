"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark"
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getCurrentTheme());
    setMounted(true);
  }, []);

  function setSiteTheme(nextTheme: Theme) {
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("lotd-theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <div
      className="theme-toggle"
      aria-label="Color theme"
      data-mounted={mounted ? "true" : "false"}
    >
      <button
        type="button"
        className={theme === "light" ? "is-active" : ""}
        aria-label="Use light mode"
        aria-pressed={theme === "light"}
        onClick={() => setSiteTheme("light")}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        className={theme === "dark" ? "is-active" : ""}
        aria-label="Use dark mode"
        aria-pressed={theme === "dark"}
        onClick={() => setSiteTheme("dark")}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path
            d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}
