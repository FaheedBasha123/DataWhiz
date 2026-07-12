// js/modules/overview.js — Dashboard landing page
import { register } from "../registry.js";
import { pie, line } from "../charts.js";
import {
  kpiHTML, sectionRule, chartCard, callout, mastheadHTML, footerHTML,
  mean, groupSum, fmtINR, fmtNum,
} from "./_base.js";

let charts = {};

register({
  id: "overview",
  name: "Overview",
  icon: "▦",
  description: "KPIs + at-a-glance",
  order: 1,

  setup(rootEl, data) {
    const { students, sales } = data;

    const avgMark = mean(students.map(s => s.Average));
    const top = students.reduce((a, b) => (a.Average > b.Average ? a : b));
    const totalRev = sales.reduce((s, r) => s + r.Sales, 0);
    const productRev = groupSum(sales, "Product");
    const bestProduct = productRev.reduce((a, b) => (a.value > b.value ? a : b));
    const catRev = groupSum(sales, "Category");
    const bestCategory = catRev.reduce((a, b) => (a.value > b.value ? a : b));
    const today = new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    rootEl.innerHTML = `
      ${mastheadHTML({
        eyebrow: `<span class="live-dot"></span>Live · ${today}`,
        title: "DataWhiz",
        sub: "A unified view of student performance and sales intelligence — clean data, clean visuals, clear insight."
      })}

      <div class="kpi-grid">
        ${kpiHTML({ label: "Students",        value: students.length,    delta: "Active enrollment",                 icon: "🎓", featured: true })}
        ${kpiHTML({ label: "Average Mark",    value: fmtNum(avgMark),     delta: `Top: ${fmtNum(top.Average)} (${top.Name})`, icon: "📊" })}
        ${kpiHTML({ label: "Total Revenue",   value: fmtINR(totalRev),    delta: `${sales.length.toLocaleString()} orders`,  icon: "💰" })}
        ${kpiHTML({ label: "Top Category",    value: bestCategory.label,  delta: `Top: ${bestProduct.label}`,              icon: "🏆" })}
      </div>

      ${sectionRule("At a Glance")}

      <div class="chart-grid">
        ${chartCard("Grade Distribution", "Students per grade", "ov-pie")}
        ${chartCard("Monthly Revenue",    "Sales trend across months", "ov-line")}
      </div>

      ${sectionRule("Methodology")}

      ${callout("How the numbers were prepared",
        `All data shown here is the result of careful cleaning, thoughtful aggregation, and visualisation choices that prioritise clarity. Missing values are imputed with column means (students) and medians (sales). Grades follow the standard <b>S / A / B / C / D / E</b> scale anchored at 90, 80, 70, 60, and 50.`
      )}

      ${footerHTML("Overview")}
    `;

    const gradeDist = ["S","A","B","C","D","E"].map(g => ({ g, n: students.filter(s => s.Grade === g).length }));
    charts.pie = pie(rootEl.querySelector("#ov-pie"), gradeDist.map(d => d.g), gradeDist.map(d => d.n), { valueSuffix: " students" });

    const monthly = groupSum(sales, "Month");
    monthly.sort((a, b) => a.label.localeCompare(b.label));
    charts.line = line(rootEl.querySelector("#ov-line"), monthly.map(m => m.label), monthly.map(m => m.value));
  },

  dispose() {
    Object.values(charts).forEach(c => { try { c.destroy(); } catch {} });
    charts = {};
  },
});