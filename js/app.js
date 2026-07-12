// app.js — Boot orchestrator
// FIXED boot order: data loads BEFORE router activates any view, so modules
// never receive null data. Setup errors are surfaced visibly (no more silent fails).

import { loadStudents, loadSales } from "./data.js";
import { list, get } from "./registry.js";
import { initRouter, registerView } from "./router.js";
import { initTheme } from "./theme.js";

// Register all modules (import side-effects register themselves)
import "./modules/overview.js";
import "./modules/students.js";
import "./modules/sales.js";
import "./modules/insights.js";

// ============================================================
//  Build the sidebar nav + section placeholders from the registry
// ============================================================
function buildNav() {
  const modules = list();
  const navRoot = document.querySelector(".nav");
  const viewsRoot = document.querySelector("#views");

  if (!navRoot || !viewsRoot) {
    console.error("[app] #nav or #views container not found in DOM");
    return;
  }

  navRoot.innerHTML = modules.map(m => `
    <a href="#${m.id}" data-view="${m.id}"><span class="nav-icon">${m.icon}</span><span class="nav-label">${m.name}</span></a>
  `).join("");

  viewsRoot.innerHTML = modules.map(m =>
    `<section id="view-${m.id}" class="view"></section>`
  ).join("");

  modules.forEach(m => registerView(m.id));
}

// ============================================================
//  Render the active module into its view section
// ============================================================
let activeModule = null;
let data = null;
let pendingView = null; // view to activate once data is ready

function activate(id) {
  if (!data) {
    pendingView = id;
    return;
  }
  const mod = get(id);
  if (!mod) {
    console.warn(`[app] No module registered for "${id}"`);
    return;
  }
  const root = document.querySelector(`#view-${id}`);
  if (!root) {
    console.warn(`[app] No #view-${id} container found`);
    return;
  }

  // Tear down previous module's charts
  if (activeModule && activeModule !== mod && activeModule.dispose) {
    try { activeModule.dispose(); } catch (e) { console.error("[app] dispose error:", e); }
  }

  activeModule = mod;
  root.innerHTML = ""; // clear before re-setup

  if (typeof mod.setup === "function") {
    try {
      mod.setup(root, data);
    } catch (e) {
      console.error(`[app] Module "${id}" setup failed:`, e);
      root.innerHTML = `
        <div class="callout" style="border-left-color:#d81159;">
          <div class="callout-title">⚠ Module "${id}" failed to load</div>
          <div class="callout-body"><pre style="white-space:pre-wrap;font-family:JetBrains Mono,monospace;font-size:0.78rem;">${e.message}\n\n${e.stack || ""}</pre></div>
        </div>`;
    }
  }
}

function refreshActive() {
  if (activeModule && typeof activeModule.refresh === "function" && data) {
    try { activeModule.refresh(); } catch (e) { console.error("[app] refresh error:", e); }
  }
}

// ============================================================
//  Boot — fixed order: theme → nav → DATA → router
// ============================================================
async function boot() {
  initTheme();
  buildNav();
  initRouter();

  // Listen for view changes (always)
  document.addEventListener("viewchange", e => activate(e.detail));
  // Theme change → re-render active module so charts pick up new colors
  document.addEventListener("charts:redraw", () => {
    if (activeModule && typeof activeModule.setup === "function" && data) {
      const root = document.querySelector(`#view-${activeModule.id}`);
      if (root) {
        try {
          if (activeModule.dispose) activeModule.dispose();
          root.innerHTML = "";
          activeModule.setup(root, data);
        } catch (e) { console.error("[app] theme-redraw error:", e); }
      }
    }
  });

  try {
    const [students, sales] = await Promise.all([loadStudents(), loadSales()]);
    data = { students, sales };

    // Activate whatever view the hash points to (or the first registered)
    const initial = (location.hash || "").replace("#", "") || list()[0].id;
    activate(initial);

    // If router already dispatched a viewchange before data was ready, replay it now
    if (pendingView && pendingView !== initial) {
      activate(pendingView);
      pendingView = null;
    }
  } catch (e) {
    console.error("[app] Data load failed:", e);
    const viewsRoot = document.querySelector("#views");
    if (viewsRoot) {
      viewsRoot.innerHTML = `
        <div class="callout" style="margin:2rem;border-left-color:#d81159;">
          <div class="callout-title">⚠ Could not load data</div>
          <div class="callout-body">${e.message}</div>
          <div class="callout-body" style="margin-top:0.6rem;font-size:0.85rem;opacity:0.7;">
            If opening <code>index.html</code> directly via <code>file://</code>, browsers block <code>fetch()</code>.
            Run <code>python serve.py</code> from this folder instead.
          </div>
        </div>`;
    }
  }
}

boot();