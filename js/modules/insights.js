// js/modules/insights.js - Cross-project synthesis + downloads
import { register } from "../registry.js";
import {
  kpiHTML, sectionRule, callout,
  mastheadHTML,
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
        sub: "A synthesis of student performance and sales intelligence - the patterns that quietly shape outcomes in both worlds."
      })}

      <div class="pull-quote">"Turning chaotic rows of simulated anxiety into clean, colorful charts."</div>

      ${sectionRule("Insights That Matter")}

      <div class="insight-groups">
        <div class="insight-group">
          <div class="insight-group-title">Academic Insights</div>
          <div class="insight-grid">
            <div class="article-card fade-in">
              <div class="article-eyebrow">Insight · 01</div>
              <div class="article-title">The Elite Top Margin</div>
              <div class="article-body">Only a small fraction of students reach peak performance. The academic curve is heavily spearheaded by Atharv Mane leading the pack at 99.0.</div>
            </div>
            <div class="article-card fade-in">
              <div class="article-eyebrow">Insight · 02</div>
              <div class="article-title">The Grade Cluster</div>
              <div class="article-body">The vast majority of academic outcomes live in the middle. Most student records cluster tightly within the B/C grade brackets rather than the extremes.</div>
            </div>
            <div class="article-card fade-in">
              <div class="article-eyebrow">Insight · 03</div>
              <div class="article-title">Attendance Drives Marks</div>
              <div class="article-body">Isolated study spikes fail without consistency. The cleanest long-term correlation in the dataset shows that steady attendance structures directly dictate higher final grades.</div>
            </div>
          </div>
        </div>

        <div class="insight-group">
          <div class="insight-group-title">Commercial Insights</div>
          <div class="insight-grid">
            <div class="article-card fade-in">
              <div class="article-eyebrow">Insight · 01</div>
              <div class="article-title">The 80/20 Revenue Driver</div>
              <div class="article-body">The Pareto principle dominates the catalog. A vital minority of best-selling items quietly commands and generates the overwhelming majority of your total revenue.</div>
            </div>
            <div class="article-card fade-in">
              <div class="article-eyebrow">Insight · 02</div>
              <div class="article-title">Mid-Tier Volume Engine</div>
              <div class="article-body">While flagship products get the spotlight, the business relies on the center. Regular, mid-tier orders form the stable backbone of daily transactional volume.</div>
            </div>
            <div class="article-card fade-in">
              <div class="article-eyebrow">Insight · 03</div>
              <div class="article-title">Outliers vs. Real Trends</div>
              <div class="article-body">Singular massive orders mislead forecasting models. Reliable operational health is only visible when evaluating macro monthly revenue trends over isolated peaks.</div>
            </div>
          </div>
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
        `All charts use the same five-color palette and adapt automatically between light and dark themes via CSS variables. CSV cleaning (mean/median imputation for missing values) is applied at load time in <code>js/data.js</code>. All computation runs in the browser - no server, no build step.`
      )}

      ${sectionRule("Downloads")}

      <div class="chart-grid chart-grid-2">
        <button class="btn outline" id="dl-students">⬇ Download Students CSV</button>
        <button class="btn outline" id="dl-sales">⬇ Download Sales CSV</button>
      </div>
    `;

    rootEl.querySelector("#dl-students")?.addEventListener("click", () => downloadCSV("students.csv", students));
    rootEl.querySelector("#dl-sales")?.addEventListener("click", () => downloadCSV("sales.csv", sales));
  },

  dispose() { /* no charts to clean up */ },
});