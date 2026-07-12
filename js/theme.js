// theme.js — Light/dark mode toggle (sidebar is static now, no collapse logic)
const KEY_THEME = "dw_theme";

export function getTheme() { return localStorage.getItem(KEY_THEME) || "light"; }

export function applyTheme(name) {
  document.documentElement.setAttribute("data-theme", name);
  localStorage.setItem(KEY_THEME, name);
  const btn = document.querySelector("#theme-toggle");
  if (btn) btn.textContent = name === "light" ? "☀" : "☾";
  document.dispatchEvent(new CustomEvent("themechange", { detail: name }));
}

export function toggleTheme() {
  applyTheme(getTheme() === "light" ? "dark" : "light");
}

export function initTheme() {
  applyTheme(getTheme());
  const btn = document.querySelector("#theme-toggle");
  if (btn) btn.addEventListener("click", toggleTheme);
  // re-apply colors on all chart instances after theme change
  document.addEventListener("themechange", () => {
    document.dispatchEvent(new CustomEvent("charts:redraw"));
  });
}