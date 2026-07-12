// js/modules/insights.js — Cross-project synthesis + downloads
import { register } from "../registry.js";
import {
  kpiHTML, sectionRule, callout,
  mastheadHTML, footerHTML,
  mean, downloadCSV, fmtNum, fmtInt, fmtINR,
} from "./_base.js";

register({
  id: "insights",
  name: "Insights",
  icon: "💡",
  description: "Cross-project synthesis",
  order: 4,

  setup(rootEl, data) {
    const { students, sales } = data;
    const top = students.reduce((a, b) => (a.Average > b.Average ? a : b));
    const totalRev = sales.reduce((s, r) => s + r.Sales, 0);

    rootEl.innerHTML = `
      ${mastheadHTML({
        eyebrow: `<span class="live-dot"></span>Cross-Project Synthesis`,
        title: "Insights",
        sub: "A synthesis of student performance and sales intelligence — the patterns that quietly shape outcomes in both worlds."
      })}

      <div class="pull-quote">Performance is rarely a single thing — it is the quiet sum of attendance, effort, and the room you find yourself in.</div>

      ${sectionRule("Five Insights That Matter")}

      <div class="article-grid">
        <div class="article-card fade-in">
          <div class="article-eyebrow">Insight · 01</div>
          <div class="article-title">Top performers make up a small but vital minority</div>
          <div class="article-body">Only a fraction of students earn the top grade (${top.Name} leads at ${fmtNum(top.Average)}), mirroring how a few best-selling products typically drive the majority of revenue in any catalog.</div>
        </div>
        <div class="article-card fade-in">
          <div class="article-eyebrow">Insight · 02</div>
          <div class="article-title">The middle is where most outcomes live</div>
          <div class="article-body">Most students cluster in the B/C grades — just as most sales orders cluster around mid-tier products. The extremes are visible, but the middle carries the weight.</div>
        </div>
        <div class="article-card fade-in">
          <div class="article-eyebrow">Insight · 03</div>
          <div class="article-title">Patterns beat singular peaks</div>
          <div class="article-body">A single high sale or high mark can mislead. Trends across time (monthly revenue) and structure (subject grades, product mix) tell a truer story than any one data point.</div>
        </div>
        <div class="article-card fade-in">
          <div class="article-eyebrow">Insight · 04</div>
          <div class="article-title">Cleaning is half the work</div>
          <div class="article-body">Both datasets had <b>missing values</b> requiring imputation — a reminder that the most time in real-world analytics is spent preparing data, not just visualising it.</div>
        </div>
        <div class="article-card fade-in">
          <div class="article-eyebrow">Insight · 05</div>
          <div class="article-title">Two domains, one craft</div>
          <div class="article-body">Whether you're tracking student marks or sales orders, the backbone is the same: <b>load → clean → analyse → visualise → conclude</b>. The numbers differ; the method doesn't.</div>
        </div>
      </div>

      ${sectionRule("Side by Side")}

      <div class="kpi-grid">
        ${kpiHTML({ label: "Students Analysed", value: students.length, icon: "🎓" })}
        ${kpiHTML({ label: "Orders Analysed",  value: sales.length.toLocaleString(), icon: "📦" })}
        ${kpiHTML({ label: "Total Revenue",    value: fmtINR(totalRev), icon: "💰" })}
        ${kpiHTML({ label: "Tools",            value: "JS + Chart.js", delta: "Pure web, no build", icon: "🛠️" })}
      </div>

      ${callout("Methodology",
        `All charts use the same five-color palette and adapt automatically between light and dark themes via CSS variables. CSV cleaning (mean/median imputation for missing values) is applied at load time in <code>js/data.js</code>. All computation runs in the browser — no server, no build step.`
      )}

      ${sectionRule("Downloads")}

      <div class="chart-grid chart-grid-2">
        <button class="btn outline" id="dl-students">⬇ Download Students CSV</button>
        <button class="btn outline" id="dl-sales">⬇ Download Sales CSV</button>
      </div>

      ${footerHTML("Insights")}
    `;

    rootEl.querySelector("#dl-students")?.addEventListener("click", () => downloadCSV("students.csv", students));
    rootEl.querySelector("#dl-sales")?.addEventListener("click", () => downloadCSV("sales.csv", sales));
  },

  dispose() { /* no charts to clean up */ },
});