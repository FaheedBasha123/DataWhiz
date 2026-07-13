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
  initChartModal();

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

// ============================================================
//  Chart fullscreen modal — global handler
//  Strategy: CLONE the original chart-card into the modal + recreate each
//  Chart.js instance on the cloned canvases. The original card stays in place
//  completely untouched, so closing the modal never disturbs the layout.
//
//  Why clone instead of move:
//    - Chart.js binds to the canvas element it was constructed on. Moving the
//      canvas between containers leaves the chart bound to the original DOM node,
//      and ResizeObserver doesn't always fire reliably across container moves.
//    - Cloning creates fresh canvases. We pair each clone-canvas with the original
//      chart's data + options and build a brand-new Chart instance. This works
//      100% of the time because we're not asking Chart.js to track a DOM move.
// ============================================================
let _modalCharts = []; // Chart.js instances created inside the modal — destroyed on close

function openChartModal(card) {
  const modal = document.getElementById("chart-modal");
  const body  = document.getElementById("chart-modal-body");
  const title = document.getElementById("chart-modal-title");
  if (!modal || !body || body.firstElementChild) return;

  const heading = card.querySelector(".chart-heading")?.textContent || "Chart";
  title.textContent = heading;

  // Clone the card into the modal. CSS hides the cloned toolbar automatically
  // (.chart-modal-body .chart-toolbar { display: none }).
  const clone = card.cloneNode(true);
  body.innerHTML = "";
  body.appendChild(clone);

  // For each canvas in the original, find its Chart.js instance and create a
  // matching new instance on the cloned canvas. Deep-clone data + options so the
  // two instances are fully independent.
  const originals = card.querySelectorAll("canvas");
  const clones    = clone.querySelectorAll("canvas");
  originals.forEach((origCanvas, i) => {
    const inst = window.Chart && window.Chart.getChart && window.Chart.getChart(origCanvas);
    const cloneCanvas = clones[i];
    if (!inst || !cloneCanvas) return;
    try {
      const newInst = new window.Chart(cloneCanvas, {
        type:    inst.config.type,
        data:    JSON.parse(JSON.stringify(inst.data)),
        options: JSON.parse(JSON.stringify(inst.options)),
      });
      _modalCharts.push(newInst);
    } catch (e) {
      console.error("[modal] failed to recreate chart in clone:", e);
    }
  });

  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";
  document.body.classList.add("modal-open");

  // Trigger resize on the new modal charts after layout settles
  const resizeModalCharts = () => {
    _modalCharts.forEach(c => { try { c.resize(); } catch {} });
  };
  requestAnimationFrame(resizeModalCharts);
  setTimeout(resizeModalCharts, 200);
}

function closeChartModal() {
  const modal = document.getElementById("chart-modal");
  const body  = document.getElementById("chart-modal-body");
  if (!modal) return;

  // Destroy every modal chart instance (frees memory + releases canvas refs)
  _modalCharts.forEach(c => { try { c.destroy(); } catch {} });
  _modalCharts = [];

  // Remove the cloned card from the modal body
  if (body) body.innerHTML = "";

  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  document.body.classList.remove("modal-open");

  // The original card on the page is completely untouched. No resize calls
  // needed there — its charts are still bound to their original canvases at
  // original sizes. Layout stays exactly as it was before opening the modal.
}

function downloadChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) { console.warn(`[download] no canvas #${canvasId}`); return; }
  try {
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${canvasId}.png`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); }, 100);
  } catch (e) {
    console.error("[download] failed:", e);
  }
}

function initChartModal() {
  const modal = document.getElementById("chart-modal");
  if (!modal) return;

  // Delegated click handler. Catches three things:
  //   - chart toolbar buttons (.chart-btn): fullscreen or download
  //   - modal close button + backdrop click (.chart-modal-close OR [data-action="close-modal"])
  document.addEventListener("click", e => {
    const btn = e.target.closest('.chart-btn, [data-action="close-modal"]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "fullscreen") {
      const card = btn.closest("[data-chart-card]");
      if (card) openChartModal(card);
    } else if (action === "download") {
      const target = btn.dataset.target;
      if (target) downloadChart(target);
    } else if (action === "close-modal") {
      closeChartModal();
    }
  });

  // ESC to close
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeChartModal();
  });
}