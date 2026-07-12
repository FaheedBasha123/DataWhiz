// js/modules/students.js — Student Performance analysis
import { register } from "../registry.js";
import { bar, pie, scatter, heatmap } from "../charts.js";
import {
  SUBJECTS, kpiHTML, sectionRule, chartCard, callout, articleCard,
  mastheadHTML, footerHTML, filterBar, tableHTML,
  mean, median, unique, gradeFor, corrPearson,
  fmtNum, fmtInt,
} from "./_base.js";

let charts = {};
let currentRoot = null;
let state = null;

function draw() {
  if (!currentRoot || !state) return;
  const f = applyFilters();
  const avgM = mean(f.map(s => s.Average));
  const hi = f.length ? Math.max(...f.map(s => s.Average)) : 0;
  const lo = f.length ? Math.min(...f.map(s => s.Average)) : 0;
  const pass = f.length ? (f.filter(s => s.Average >= 50).length / f.length) * 100 : 0;
  const top5 = [...f].sort((a, b) => b.Average - a.Average).slice(0, 5);

  // tear down previous charts
  Object.values(charts).forEach(c => { try { c.destroy(); } catch {} });
  charts = {};

  const subjectAvg = SUBJECTS.map(s => ({ s, avg: mean(f.map(x => x[s])) }));
  subjectAvg.sort((a, b) => a.avg - b.avg);
  const weak = subjectAvg[0], strong = subjectAvg[subjectAvg.length - 1];
  const corr = corrPearson(f.map(s => s.Attendance), f.map(s => s.Average));
  const top = top5[0];

  currentRoot.innerHTML = `
    ${mastheadHTML({
      eyebrow: `<span class="live-dot"></span>Live Data · ${state.allStudents.length} students`,
      title: "Student Performance",
      sub: "Marks across five subjects, grade distribution, and how attendance correlates with results — cleaned, analysed, and visualised."
    })}

    ${filterBar([
      { id: "st-class", label: "Class", control: `<select id="st-class" multiple size="3">${state.allClasses.map(c => `<option value="${c}" ${state.classes.has(c) ? "selected" : ""}>${c}</option>`).join("")}</select>` },
      { id: "st-grade", label: "Grade", control: `<select id="st-grade" multiple size="3">${["S","A","B","C","D","E"].map(g => `<option value="${g}" ${state.grades.has(g) ? "selected" : ""}>${g}</option>`).join("")}</select>` },
      { id: "st-range", label: `Score Range (${state.range[0]} – ${state.range[1]})`, control: `<input id="st-range" type="range" min="${state.minAvg}" max="${state.maxAvg}" value="${state.range[1]}" />` },
    ])}

    <div class="kpi-grid kpi-grid-5">
      ${kpiHTML({ label: "Students",  value: f.length,                     icon: "🎓" })}
      ${kpiHTML({ label: "Average",   value: fmtNum(avgM),                 icon: "📊" })}
      ${kpiHTML({ label: "Highest",   value: fmtNum(hi),                   icon: "🏆" })}
      ${kpiHTML({ label: "Lowest",    value: fmtNum(lo),                   icon: "📉" })}
      ${kpiHTML({ label: "Pass Rate", value: `${pass.toFixed(0)}%`,        icon: "✅" })}
    </div>

    ${sectionRule("Leaderboard")}
    ${top5.length ? `
      <div class="chart-grid">
        <div class="chart-card fade-in">
          <div class="chart-heading">Top Performers</div>
          <div class="chart-sub">Average marks, ranked</div>
          ${tableHTML(
            ["#", "Name", "Class", "Average", "Total", "Grade"],
            top5.map((s, i) => [i + 1, s.Name, s.Class, fmtNum(s.Average), fmtInt(s.Total), s.Grade]),
            { top: 0 }
          )}
        </div>
        <div class="chart-card fade-in">
          <div class="chart-heading">Subject Spread</div>
          <div class="chart-sub">Average across subjects</div>
          <div class="chart-wrap"><canvas id="st-subj-bar"></canvas></div>
        </div>
      </div>
    ` : ""}

    ${sectionRule("Marks by Student")}
    ${chartCard("Top Performers", "Top 15 by average marks", "st-stud-bar")}

    ${sectionRule("Grade Distribution")}
    <div class="chart-grid">
      ${chartCard("Grade Breakdown", "Share per grade", "st-grade-pie")}
      ${chartCard("Grade Counts",    "Absolute numbers", "st-grade-bar")}
    </div>

    ${sectionRule("Subject Analysis")}
    <div class="chart-grid">
      ${chartCard("Subject Averages", "Difficulty ranking", "st-subj-rank")}
      <div class="d-flex-col">
        ${callout("Hardest Subject", `<b>${weak.s}</b> with average <b>${fmtNum(weak.avg)}</b>.`)}
        ${callout("Strongest Subject", `<b>${strong.s}</b> with average <b>${fmtNum(strong.avg)}</b>.`)}
      </div>
    </div>

    ${sectionRule("Performance Heatmap")}
    <div class="chart-heading">Class × Subject</div>
    <div class="chart-sub">Where each class performs strongest</div>
    <div class="heatmap" id="st-heatmap" style="margin-top: 1rem;"></div>

    ${sectionRule("Attendance vs Performance")}
    <div class="chart-grid">
      ${chartCard("Marks vs Attendance", "Each dot is one student", "st-att-scatter")}
      <div class="d-flex-col">
        ${callout("Correlation",
          `<b>${corr > 0.6 ? "Strong positive" : corr > 0.3 ? "Moderate positive" : "Weak / none"} correlation</b> (r = ${corr.toFixed(3)}).<br><br>${
            corr > 0.5 ? "Higher attendance strongly predicts better marks." :
            corr > 0.3 ? "Attendance has some influence on performance." :
            "Attendance is not a strong predictor here."
          }`
        )}
      </div>
    </div>

    ${sectionRule("Insights")}
    <div class="chart-grid">
      ${articleCard("Insight · 01", `${top.Name} sets the standard`,
        `The top scorer averages <b>${fmtNum(top.Average)}</b>, with a Grade <b>${top.Grade}</b>. The top 5 are spread across classes, suggesting talent is distributed rather than concentrated.`)}
      ${articleCard("Insight · 02", "Subject difficulty is uneven",
        `<b>${weak.s}</b> (${fmtNum(weak.avg)}) is the hardest while <b>${strong.s}</b> (${fmtNum(strong.avg)}) is the strongest — a gap of <b>${fmtNum(strong.avg - weak.avg)}</b> marks worth addressing.`)}
      ${articleCard("Insight · 03", `Attendance correlates at r = ${corr.toFixed(2)}`,
        corr > 0.5 ? "A clear signal: students who attend more perform meaningfully better." : "A moderate signal — attendance helps, but other factors matter too.")}
      ${articleCard("Insight · 04", "Cleaning is half the work",
        "Both datasets had missing values requiring imputation — a reminder that real-world analytics is mostly data preparation.")}
    </div>

    ${footerHTML("Student Performance")}
  `;

  // Wire up filter handlers (re-bind because we just rewrote innerHTML)
  currentRoot.querySelector("#st-class")?.addEventListener("change", e => {
    state.classes = new Set(Array.from(e.target.selectedOptions).map(o => o.value));
    draw();
  });
  currentRoot.querySelector("#st-grade")?.addEventListener("change", e => {
    state.grades = new Set(Array.from(e.target.selectedOptions).map(o => o.value));
    draw();
  });
  currentRoot.querySelector("#st-range")?.addEventListener("input", e => {
    state.range = [state.minAvg, +e.target.value];
    draw();
  });

  if (f.length === 0) return;

  // subject bar (top right of leaderboard)
  charts.subjBar = bar(currentRoot.querySelector("#st-subj-bar"), SUBJECTS, SUBJECTS.map(s => mean(f.map(x => x[s]))));

  // Top 15 students bar
  const top15 = [...f].sort((a, b) => b.Average - a.Average).slice(0, 15).reverse();
  charts.studBar = bar(currentRoot.querySelector("#st-stud-bar"), top15.map(s => s.Name), top15.map(s => s.Average));

  // Grade pie + bar
  const gradeDist = ["S","A","B","C","D","E"].map(g => ({ g, n: f.filter(s => s.Grade === g).length }));
  charts.gradePie = pie(currentRoot.querySelector("#st-grade-pie"), gradeDist.map(d => d.g), gradeDist.map(d => d.n), { valueSuffix: " students" });
  charts.gradeBar = bar(currentRoot.querySelector("#st-grade-bar"), gradeDist.map(d => d.g), gradeDist.map(d => d.n));

  // subject rank
  const subjRank = [...SUBJECTS].sort((a, b) => mean(f.map(s => s[a])) - mean(f.map(s => s[b])));
  charts.subjRank = bar(currentRoot.querySelector("#st-subj-rank"), subjRank, subjRank.map(s => mean(f.map(x => x[s]))));

  // Heatmap
  const classes = unique(f.map(s => s.Class));
  const matrix = classes.map(c => SUBJECTS.map(sub => Number(mean(f.filter(s => s.Class === c).map(s => s[sub])).toFixed(2))));
  heatmap(currentRoot.querySelector("#st-heatmap"), classes, SUBJECTS, matrix);

  // Attendance scatter
  charts.attScatter = scatter(currentRoot.querySelector("#st-att-scatter"), f.map(s => ({ x: s.Attendance, y: s.Average })), { xLabel: "Attendance %", yLabel: "Average Mark" });
}

function applyFilters() {
  return state.allStudents.filter(s =>
    state.classes.has(s.Class) &&
    state.grades.has(s.Grade) &&
    s.Average >= state.range[0] &&
    s.Average <= state.range[1]
  );
}

register({
  id: "students",
  name: "Students",
  icon: "🎓",
  description: "Performance analysis",
  order: 2,

  setup(rootEl, data) {
    currentRoot = rootEl;
    state = {
      allStudents: data.students,
      allClasses: unique(data.students.map(s => s.Class)),
      classes: new Set(unique(data.students.map(s => s.Class))),
      grades: new Set(["S","A","B","C","D","E"]),
      minAvg: Math.floor(Math.min(...data.students.map(s => s.Average))),
      maxAvg: Math.ceil(Math.max(...data.students.map(s => s.Average))),
      range: [0, 100],
    };
    state.range = [state.minAvg, state.maxAvg];
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