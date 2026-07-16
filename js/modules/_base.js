// js/modules/_base.js - shared HTML builders + utilities for all modules

export const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"];
export const GRADE_BANDS = [
  { letter: "S", min: 90 }, { letter: "A", min: 80 },
  { letter: "B", min: 70 }, { letter: "C", min: 60 },
  { letter: "D", min: 50 }, { letter: "E", min: 0  },
];

// HTML builders
export function kpiHTML({ label, value, delta = "", icon = "", featured = false, negative = false }) {
  return `
    <div class="kpi-card ${featured ? "featured" : ""} fade-in">
      ${icon ? `<div class="kpi-icon">${icon}</div>` : ""}
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      ${delta ? `<div class="kpi-delta ${negative ? "negative" : ""}">${delta}</div>` : ""}
    </div>`;
}

export function sectionRule(label, sub = "") {
  return `
    <div class="section-rule">
      <span class="section-rule-label">${label}</span>
      ${sub ? `<span class="section-rule-sub">${sub}</span>` : ""}
    </div>`;
}

export function chartCard(title, sub, canvasId, { withCanvas = true } = {}) {
  const body = withCanvas
    ? `<div class="chart-wrap"><canvas id="${canvasId}"></canvas></div>`
    : `<div class="chart-wrap"><div id="${canvasId}"></div></div>`;
  return `
    <div class="chart-card fade-in" data-chart-card>
      <div class="chart-toolbar">
        <button type="button" class="chart-btn" data-action="fullscreen" title="Fullscreen" aria-label="Open fullscreen">⛶</button>
        ${withCanvas ? `<button type="button" class="chart-btn" data-action="download" data-target="${canvasId}" title="Download PNG" aria-label="Download as PNG">⬇</button>` : ""}
      </div>
      <div class="chart-heading">${title}</div>
      <div class="chart-sub">${sub}</div>
      ${body}
    </div>`;
}

export function articleCard(eyebrow, title, body) {
  return `
    <div class="article-card fade-in">
      <div class="article-eyebrow">${eyebrow}</div>
      <div class="article-title">${title}</div>
      <div class="article-body">${body}</div>
    </div>`;
}

export function callout(title, body) {
  return `
    <div class="callout fade-in">
      <div class="callout-title">${title}</div>
      <div class="callout-body">${body}</div>
    </div>`;
}

export function mastheadHTML({ eyebrow = "", title = "", sub = "" }) {
  return `
    <div class="masthead fade-in">
      <div class="masthead-eyebrow">${eyebrow}</div>
      <h1>${title}</h1>
      <div class="masthead-rule"></div>
      <div class="masthead-sub">${sub}</div>
    </div>`;
}

export function footerHTML(moduleLabel = "") {
  return `
    <div class="app-footer">
      <div> </div>
      <div class="meta">© ${new Date().getFullYear()} · DataWhiz${moduleLabel ? " · " + moduleLabel : ""}</div>
    </div>`;
}

export function filterBar(filters) {
  // filters = [{ id, label, control: HTML string }]
  return `<div class="filter-bar">${filters.map(f => `
    <div class="filter">
      <label for="${f.id}">${f.label}</label>
      ${f.control}
    </div>`).join("")}</div>`;
}


// Filter controls - chips + dual range
function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Pill toggle chips - always-visible multi-select.
 * `name` is the filter key; `options` is an array of values; `selected` is the Set of currently-picked ones.
 * Returns the wrapper HTML; consumer wires click handlers that read .chip.checked inside.
 */
export function chipsHTML(name, label, options, selected) {
  const chips = options.map(o => {
    const isOn = selected && selected.has(o);
    return `<button type="button" class="chip ${isOn ? "checked" : ""}" data-name="${escAttr(name)}" data-value="${escAttr(o)}" aria-pressed="${isOn}">${escAttr(o)}</button>`;
  }).join("");
  return `
    <div class="filter">
      <label>${label}</label>
      <div class="filter-chips" data-filter="${escAttr(name)}">${chips}</div>
    </div>`;
}

/**
 * Two-side number range - type exact min and max values, no scratching a slider.
 * `[min, max]` is the absolute domain, `[curMin, curMax]` is current selection.
 */
export function rangeDualHTML(name, label, [absMin, absMax], [curMin, curMax]) {
  const fillPct = ((curMax - curMin) / (absMax - absMin)) * 100;
  const leftPct  = ((curMin - absMin) / (absMax - absMin)) * 100;
  return `
    <div class="filter">
      <label>${label}</label>
      <div class="filter-range" data-filter="${escAttr(name)}">
        <input type="number" inputmode="numeric" min="${absMin}" max="${absMax}" value="${curMin}" data-role="min" aria-label="${escAttr(label)} minimum">
        <span class="range-sep">-</span>
        <input type="number" inputmode="numeric" min="${absMin}" max="${absMax}" value="${curMax}" data-role="max" aria-label="${escAttr(label)} maximum">
      </div>
      <div class="range-track" aria-hidden="true"><div class="range-fill" style="left:${leftPct}%;width:${fillPct}%"></div></div>
    </div>`;
}

export function resetButtonHTML() {
  return `<div class="filter-actions"><button type="button" class="filter-reset" data-action="reset-filters">Reset</button></div>`;
}

// Two-side date range - two native date inputs side-by-side.
export function dateRangeHTML(name, label, fromVal, toVal) {
  return `
    <div class="filter">
      <label>${label}</label>
      <div class="filter-range" data-filter="${escAttr(name)}">
        <input type="date" data-role="from" value="${escAttr(fromVal)}" aria-label="From date">
        <span class="range-sep">→</span>
        <input type="date" data-role="to" value="${escAttr(toVal)}" aria-label="To date">
      </div>
    </div>`;
}

// Search input that filters as user types (caller handles wiring + filtering)
export function searchInputHTML(name, label, value = "") {
  return `
    <div class="filter">
      <label>${label}</label>
      <input type="search" class="filter-search" data-filter="${escAttr(name)}" value="${escAttr(value)}" placeholder="Type to search..." autocomplete="off" />
    </div>`;
}

// Sort dropdown
export function sortSelectHTML(name, label, options, selected) {
  const opts = options.map(o => `<option value="${escAttr(o.value)}" ${o.value === selected ? "selected" : ""}>${escAttr(o.label)}</option>`).join("");
  return `
    <div class="filter">
      <label>${label}</label>
      <select class="filter-sort" data-filter="${escAttr(name)}">${opts}</select>
    </div>`;
}

export function tableHTML(headers, rows, { top = -1 } = {}) {
  return `
    <table class="data-table">
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r, i) =>
        `<tr class="${i === top ? "top" : ""}">${r.map(c => `<td>${c}</td>`).join("")}</tr>`
      ).join("")}</tbody>
    </table>`;
}

//  Stats helpers
export function mean(arr) {
  const nums = arr.filter(v => typeof v === "number" && !isNaN(v));
  return nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
}
export function median(arr) {
  const nums = arr.filter(v => typeof v === "number" && !isNaN(v));
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function unique(arr) { return [...new Set(arr.filter(v => v != null))].sort(); }
export function gradeFor(avg) {
  if (avg == null || isNaN(avg)) return "N/A";
  for (const g of GRADE_BANDS) if (avg >= g.min) return g.letter;
  return "E";
}
export function groupSum(rows, key, value = "Sales") {
  const out = {};
  rows.forEach(r => { out[r[key]] = (out[r[key]] || 0) + (r[value] || 0); });
  return Object.entries(out).map(([k, v]) => ({ label: k, value: v }));
}
export function corrPearson(xs, ys) {
  if (xs.length < 2) return 0;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return num / Math.sqrt(dx * dy || 1);
}

// Formatters
export function fmtINR(n) {
  if (n == null || isNaN(n)) return "-";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `\u20B9${(n/1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `\u20B9${(n/1e5).toFixed(2)}L`;
  if (abs >= 1e3) return `\u20B9${(n/1e3).toFixed(1)}K`;
  return `\u20B9${Math.round(n)}`;
}
export function fmtNum(n, d = 1) { return n == null ? "-" : Number(n).toFixed(d); }
export function fmtInt(n) { return n == null ? "-" : Math.round(n).toLocaleString("en-IN"); }

// CSV download
export function downloadCSV(name, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = v => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}