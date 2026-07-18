// js/modules/sales.js - Sales Data analysis
import { register } from "../registry.js";
import { bar, pie, line, heatmap } from "../charts.js";
import {
  kpiHTML, sectionRule, chartCard, callout, articleCard,
  mastheadHTML, tableHTML,
  chipsHTML, dateRangeHTML,
  unique, groupSum, fmtINR, fmtInt,
} from "./_base.js";

let charts = {};
let currentRoot = null;
let state = null;

function draw() {
  if (!currentRoot || !state) return;
  const f = applyFilters();
  const totalRev = f.reduce((s, r) => s + r.Sales, 0);
  const avgOrder = f.length ? totalRev / f.length : 0;
  const productRev = groupSum(f, "Product");
  const bestProduct = productRev.reduce((a, b) => (a.value > b.value ? a : b), { label: "-", value: 0 });
  const catRev = groupSum(f, "Category");
  const bestCategory = catRev.reduce((a, b) => (a.value > b.value ? a : b), { label: "-", value: 0 });
  const regRev = groupSum(f, "Region");
  const bestRegion = regRev.reduce((a, b) => (a.value > b.value ? a : b), { label: "-", value: 0 });

  // tear down previous charts
  Object.values(charts).forEach(c => { try { c.destroy(); } catch {} });
  charts = {};

  const dateMinStr = state.allSales.length ? new Date(Math.min(...state.allSales.map(s => new Date(s.OrderDate)))).toISOString().slice(0,10) : "";
  const dateMaxStr = state.allSales.length ? new Date(Math.max(...state.allSales.map(s => new Date(s.OrderDate)))).toISOString().slice(0,10) : "";

  currentRoot.innerHTML = `
    ${mastheadHTML({
      eyebrow: `<span class="live-dot"></span>Live Data · ${f.length.toLocaleString()} orders`,
      title: "Sales Analysis",
      sub: `An end-to-end business intelligence report covering <b>${fmtINR(totalRev)}</b> in transactions across ${productRev.length} products and ${regRev.length} regions.`
    })}

    ${chipsHTML("sa-reg", `Region (${state.regions.size}/${state.allRegions.length})`, state.allRegions, state.regions)}
    ${chipsHTML("sa-cat", `Category (${state.cats.size}/${state.allCats.length})`, state.allCats, state.cats)}
    ${dateRangeHTML("sa-date", "Date Range", state.range[0], state.range[1])}

    <div class="filter-bar filter-bar-meta">
      <div class="filter-meta">
        <span class="filter-meta-label">Showing</span>
        <span class="filter-meta-value">${f.length.toLocaleString()}</span>
        <span class="filter-meta-label">of ${state.allSales.length.toLocaleString()} orders</span>
      </div>
      <button type="button" class="filter-reset" data-action="reset">Reset filters</button>
    </div>

    <div class="kpi-grid">
      ${kpiHTML({ label: "Total Revenue", value: fmtINR(totalRev), delta: `${fmtInt(f.length)} orders`, icon: "💰", featured: true })}
      ${kpiHTML({ label: "Avg Order",     value: fmtINR(avgOrder), icon: "🧾" })}
      ${kpiHTML({ label: "Best Product",  value: bestProduct.label, delta: `${fmtINR(bestProduct.value)} revenue`, icon: "🏆" })}
      ${kpiHTML({ label: "Best Category", value: bestCategory.label, delta: `Region: ${bestRegion.label}`, icon: "📈" })}
    </div>

    ${sectionRule("Revenue Trend")}
    <div class="chart-grid">
      ${chartCard("Monthly Revenue", "Total sales by month", "sa-monthly")}
      <div class="d-flex-col">
        <div class="chart-heading">Top 3 Products</div>
        <div class="chart-sub">By total revenue</div>
        ${[...productRev].sort((a,b)=>b.value-a.value).slice(0,3).map(p =>
          callout(p.label, `<b>${fmtINR(p.value)}</b> · ${(p.value/totalRev*100).toFixed(1)}% of total`)
        ).join("")}
      </div>
    </div>

    ${sectionRule("Product Performance")}
    <div class="chart-grid">
      ${chartCard("Top 10 Products", "Highest revenue", "sa-top10")}
      ${chartCard("Bottom 5 Products", "Candidates for review", "sa-bot5")}
    </div>

    ${sectionRule("Category & Region")}
    <div class="chart-grid">
      ${chartCard("Revenue by Category", "Where the catalog earns most", "sa-cat")}
      ${chartCard("Revenue by Region",   "Geographic distribution", "sa-reg")}
    </div>

    ${sectionRule("Channels & Segments")}
    <div class="chart-grid">
      ${chartCard("Sales by Channel", "How customers buy", "sa-chan")}
      ${chartCard("Sales by Segment", "B2B vs B2C vs Enterprise", "sa-seg")}
    </div>

    ${sectionRule("Sales Representatives")}
      <div class="chart-grid">
        <div class="chart-card fade-in" data-chart-card>
          <div class="chart-toolbar">
            <button type="button" class="chart-btn" data-action="fullscreen" title="Fullscreen" aria-label="Open fullscreen">⛶</button>
            <button type="button" class="chart-btn" data-action="download" data-target="sa-rep" title="Download PNG" aria-label="Download as PNG">⬇</button>
          </div>
          <div class="chart-heading">Performance by Rep</div>
          <div class="chart-sub">Total revenue per rep</div>
          <div class="chart-wrap"><canvas id="sa-rep"></canvas></div>
        </div>
        <div class="chart-card fade-in" data-chart-card>
          <div class="chart-toolbar">
            <button type="button" class="chart-btn" data-action="fullscreen" title="Fullscreen" aria-label="Open fullscreen">⛶</button>
          </div>
          <div class="chart-heading">Quarterly Heatmap</div>
          <div class="chart-sub">Rep × Quarter</div>
          <div class="heatmap" id="sa-heatmap" style="margin-top: 0.5rem;"></div>
        </div>
      </div>

    ${sectionRule("Detailed Product Table")}
    ${buildProductTable(f)}

    ${sectionRule("Insights")}
    <div class="chart-grid">
      ${articleCard("Insight · 01", `${bestProduct.label} drives the catalog`,
        `<b>${bestProduct.label}</b> alone brings in <b>${fmtINR(bestProduct.value)}</b> (${(bestProduct.value/totalRev*100 || 0).toFixed(1)}% of revenue) - a clear star product.`)}
      ${articleCard("Insight · 02", `${bestCategory.label} is the strongest category`,
        `The <b>${bestCategory.label}</b> category outperforms, while the <b>${bestRegion.label}</b> region is the top market - both worth prioritising.`)}
      ${articleCard("Insight · 03", `Average order stands at ${fmtINR(avgOrder)}`,
        `With <b>${fmtInt(f.length)}</b> orders across <b>${productRev.length}</b> products, the business shows healthy diversity.`)}
      ${articleCard("Insight · 04", "Seasonal patterns emerge",
        "Monthly trends show November–December spikes - a holiday tail worth inventory planning around.")}
    </div>
  `;

  // Filter handlers - chip toggles for Region + Category
  currentRoot.querySelector('[data-filter="sa-reg"]')?.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chip.classList.toggle("checked");
    chip.setAttribute("aria-pressed", chip.classList.contains("checked") ? "true" : "false");
    state.regions = new Set(
      [...currentRoot.querySelectorAll('[data-filter="sa-reg"] .chip.checked')].map(c => c.dataset.value)
    );
    draw();
  });
  currentRoot.querySelector('[data-filter="sa-cat"]')?.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chip.classList.toggle("checked");
    chip.setAttribute("aria-pressed", chip.classList.contains("checked") ? "true" : "false");
    state.cats = new Set(
      [...currentRoot.querySelectorAll('[data-filter="sa-cat"] .chip.checked')].map(c => c.dataset.value)
    );
    draw();
  });

  // Date range
  const dateEl = currentRoot.querySelector('[data-filter="sa-date"]');
  if (dateEl) {
    const fromInp = dateEl.querySelector('[data-role="from"]');
    const toInp   = dateEl.querySelector('[data-role="to"]');
    const applyDate = () => {
      if (fromInp.value && toInp.value) {
        if (fromInp.value > toInp.value) {
          // auto-swap if reversed
          const t = fromInp.value; fromInp.value = toInp.value; toInp.value = t;
        }
        state.range[0] = fromInp.value;
        state.range[1] = toInp.value;
        draw();
      }
    };
    fromInp?.addEventListener("change", applyDate);
    toInp?.addEventListener("change", applyDate);
  }

  // Reset
  currentRoot.querySelector('[data-action="reset"]')?.addEventListener("click", () => {
    state.regions = new Set(state.allRegions);
    state.cats    = new Set(state.allCats);
    state.range = [
      new Date(Math.min(...state.allSales.map(s => new Date(s.OrderDate)))).toISOString().slice(0,10),
      new Date(Math.max(...state.allSales.map(s => new Date(s.OrderDate)))).toISOString().slice(0,10),
    ];
    draw();
  });

  if (f.length === 0) return;

  const monthly = groupSum(f, "Month");
  monthly.sort((a, b) => a.label.localeCompare(b.label));
  charts.monthly = line(currentRoot.querySelector("#sa-monthly"), monthly.map(m => m.label), monthly.map(m => m.value));

  const top10 = [...productRev].sort((a, b) => b.value - a.value).slice(0, 10).reverse();
  charts.top10 = bar(currentRoot.querySelector("#sa-top10"), top10.map(p => p.label), top10.map(p => p.value), { horizontal: true });
  const bot5 = [...productRev].sort((a, b) => a.value - b.value).slice(0, 5).reverse();
  charts.bot5 = bar(currentRoot.querySelector("#sa-bot5"), bot5.map(p => p.label), bot5.map(p => p.value), { horizontal: true });

  charts.cat = pie(currentRoot.querySelector("#sa-cat"), catRev.map(c => c.label), catRev.map(c => c.value), { valuePrefix: "Rs." });
  charts.reg = pie(currentRoot.querySelector("#sa-reg"), regRev.map(r => r.label), regRev.map(r => r.value), { valuePrefix: "Rs." });

  const chanRev = groupSum(f, "Channel");
  charts.chan = bar(currentRoot.querySelector("#sa-chan"), chanRev.map(c => c.label), chanRev.map(c => c.value));
  const segRev = groupSum(f, "CustomerSegment");
  charts.seg = bar(currentRoot.querySelector("#sa-seg"), segRev.map(s => s.label), segRev.map(s => s.value));

  const repRev = groupSum(f, "SalesRep");
  charts.rep = bar(currentRoot.querySelector("#sa-rep"), repRev.map(r => r.label), repRev.map(r => r.value), { horizontal: true });

  const reps = unique(f.map(r => r.SalesRep));
  const qmap = {};
  f.forEach(r => { qmap[r.SalesRep] = qmap[r.SalesRep] || [0,0,0,0]; qmap[r.SalesRep][r.Quarter - 1] += r.Sales; });
  const matrix = reps.map(r => qmap[r].map(v => Math.round(v)));
  heatmap(currentRoot.querySelector("#sa-heatmap"), reps, ["Q1","Q2","Q3","Q4"], matrix);
}

function buildProductTable(f) {
  const detail = {};
  f.forEach(r => {
    const k = r.Category + "|" + r.Product;
    if (!detail[k]) detail[k] = { Category: r.Category, Product: r.Product, Orders: 0, Qty: 0, Rev: 0, Price: r.UnitPrice };
    detail[k].Orders++; detail[k].Qty += r.Quantity; detail[k].Rev += r.Sales;
  });
  const rows = Object.values(detail).sort((a, b) => b.Rev - a.Rev);
  return tableHTML(
    ["Category", "Product", "Orders", "Qty", "Price", "Revenue"],
    rows.map(r => [r.Category, r.Product, r.Orders, r.Qty, fmtINR(r.Price), `<b>${fmtINR(r.Rev)}</b>`])
  );
}

function applyFilters() {
  const start = new Date(state.range[0]);
  const end = new Date(state.range[1]);
  return state.allSales.filter(r =>
    state.regions.has(r.Region) &&
    state.cats.has(r.Category) &&
    new Date(r.OrderDate) >= start &&
    new Date(r.OrderDate) <= end
  );
}

register({
  id: "sales",
  name: "Sales",
  icon: "💰",
  description: "Revenue + product analysis",
  order: 3,

  setup(rootEl, data) {
    currentRoot = rootEl;
    const sales = data.sales;
    state = {
      allSales: sales,
      allRegions: unique(sales.filter(s => s.Region && s.Region !== "Unknown").map(s => s.Region)),
      allCats: unique(sales.map(s => s.Category)),
      regions: new Set(unique(sales.filter(s => s.Region && s.Region !== "Unknown").map(s => s.Region))),
      cats: new Set(unique(sales.map(s => s.Category))),
      range: [
        new Date(Math.min(...sales.map(s => new Date(s.OrderDate)))).toISOString().slice(0,10),
        new Date(Math.max(...sales.map(s => new Date(s.OrderDate)))).toISOString().slice(0,10),
      ],
    };
    draw();
  },

  refresh() { draw(); },

  dispose() {
    Object.values(charts).forEach(c => { try { c.destroy(); } catch {} });
    charts = {};
    currentRoot = null;
    state = null;
  },
});