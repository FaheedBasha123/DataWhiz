// js/modules/students.js - Student Performance analysis
import { register } from "../registry.js";
import { bar, pie, scatter, heatmap } from "../charts.js";
import {
  SUBJECTS, kpiHTML, sectionRule, chartCard, callout, articleCard,
  mastheadHTML, footerHTML, tableHTML,
  chipsHTML, searchInputHTML, sortSelectHTML,
  mean, median, unique, gradeFor, corrPearson,
  fmtNum, fmtInt,
} from "./_base.js";

let charts = {};
let currentRoot = null;
let state = null;

const SORT_OPTIONS = [
  { value: "avg-desc",   label: "Average · High → Low" },
  { value: "avg-asc",    label: "Average · Low → High" },
  { value: "name-asc",   label: "Name · A → Z" },
  { value: "name-desc",  label: "Name · Z → A" },
  { value: "att-desc",   label: "Attendance · High → Low" },
  { value: "att-asc",    label: "Attendance · Low → High" },
];

function compareForSort(a, b, mode) {
  switch (mode) {
    case "avg-asc":  return a.Average - b.Average;
    case "name-asc":  return a.Name.localeCompare(b.Name);
    case "name-desc": return b.Name.localeCompare(a.Name);
    case "att-desc":  return b.Attendance - a.Attendance;
    case "att-asc":   return a.Attendance - b.Attendance;
    case "avg-desc":
    default:          return b.Average - a.Average;
  }
}

function draw() {
  if (!currentRoot || !state) return;

  const f = applyFilters();
  const sorted = [...f].sort((a, b) => compareForSort(a, b, state.sort));

  const avgM = mean(f.map(s => s.Average));
  const hi = f.length ? Math.max(...f.map(s => s.Average)) : 0;
  const lo = f.length ? Math.min(...f.map(s => s.Average)) : 0;
  const pass = f.length ? (f.filter(s => s.Average >= 50).length / f.length) * 100 : 0;
  const top5 = sorted.slice(0, 5);

  // tear down previous charts
  Object.values(charts).forEach(c => { try { c.destroy(); } catch {} });
  charts = {};

  const subjectAvg = SUBJECTS.map(s => ({ s, avg: mean(f.map(x => x[s])) }));
  subjectAvg.sort((a, b) => a.avg - b.avg);
  const weak = subjectAvg[0], strong = subjectAvg[subjectAvg.length - 1];
  const corr = corrPearson(f.map(s => s.Attendance), f.map(s => s.Average));
  const top = top5[0] || sorted[0];

  // pre-compute top 15 (sorted by current sort mode) for the bar
  const top15 = sorted.slice(0, 15).reverse();

  currentRoot.innerHTML = `
    ${mastheadHTML({
      eyebrow: `<span class="live-dot"></span>Live Data · ${state.allStudents.length} students`,
      title: "Student Performance",
      sub: "Marks across five subjects, grade distribution, and how attendance correlates with results - cleaned, analysed, and visualised."
    })}

    <div class="filter-bar">
      ${chipsHTML("st-section", `Section (${state.sections.size}/${state.allSections.length})`, state.allSections, state.sections)}
      ${chipsHTML("st-grade", `Grade (${state.grades.size}/6)`, ["S","A","B","C","D","E"], state.grades)}
      ${searchInputHTML("st-search", "Search by name", state.search)}
      ${sortSelectHTML("st-sort", "Sort by", SORT_OPTIONS, state.sort)}
    </div>

    <div class="filter-bar filter-bar-meta">
      <div class="filter-meta">
        <span class="filter-meta-label">Showing</span>
        <span class="filter-meta-value">${f.length}</span>
        <span class="filter-meta-label">of ${state.allStudents.length} students</span>
      </div>
      <button type="button" class="filter-reset" data-action="reset">Reset filters</button>
    </div>

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
        <div class="chart-card fade-in" data-chart-card>
          <div class="chart-toolbar">
            <button type="button" class="chart-btn" data-action="fullscreen" title="Fullscreen" aria-label="Open fullscreen">⛶</button>
          </div>
          <div class="chart-heading">Top Performers</div>
          <div class="chart-sub">Average marks, ranked</div>
          ${tableHTML(
            ["#", "Name", "Section", "Average", "Total", "Grade"],
            top5.map((s, i) => [i + 1, s.Name, s.Section, fmtNum(s.Average), fmtInt(s.Total), s.Grade]),
            { top: 0 }
          )}
        </div>
        <div class="chart-card fade-in" data-chart-card>
          <div class="chart-toolbar">
            <button type="button" class="chart-btn" data-action="fullscreen" title="Fullscreen" aria-label="Open fullscreen">⛶</button>
          </div>
          <div class="chart-heading">Subject Spread</div>
          <div class="chart-sub">Average across subjects</div>
          <div class="chart-wrap"><canvas id="st-subj-bar"></canvas></div>
        </div>
      </div>
    ` : ""}

    ${sectionRule("Marks by Student")}
    ${chartCard("Top Performers Bar", "Top 15 by current sort", "st-stud-bar")}

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
    <div class="chart-heading">Section × Subject</div>
    <div class="chart-sub">Average marks per section per subject</div>
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
        `The top scorer averages <b>${fmtNum(top.Average)}</b>, with a Grade <b>${top.Grade}</b>. The top 5 are spread across sections, suggesting talent is distributed rather than concentrated.`)}
      ${articleCard("Insight · 02", "Subject difficulty is uneven",
        `<b>${weak.s}</b> (${fmtNum(weak.avg)}) is the hardest while <b>${strong.s}</b> (${fmtNum(strong.avg)}) is the strongest - a gap of <b>${fmtNum(strong.avg - weak.avg)}</b> marks worth addressing.`)}
      ${articleCard("Insight · 03", `Attendance correlates at r = ${corr.toFixed(2)}`,
        corr > 0.5 ? "A clear signal: students who attend more perform meaningfully better." : "A moderate signal - attendance helps, but other factors matter too.")}
      ${articleCard("Insight · 04", "Cleaning is half the work",
        "Both datasets had missing values requiring imputation - a reminder that real-world analytics is mostly data preparation.")}
    </div>

    ${footerHTML("Student Performance")}
  `;

  wireFilters();
  if (f.length === 0) return;

  charts.subjBar    = bar(currentRoot.querySelector("#st-subj-bar"), SUBJECTS, SUBJECTS.map(s => mean(f.map(x => x[s]))));
  charts.studBar    = bar(currentRoot.querySelector("#st-stud-bar"), top15.map(s => s.Name), top15.map(s => s.Average));

  const gradeDist = ["S","A","B","C","D","E"].map(g => ({ g, n: f.filter(s => s.Grade === g).length }));
  charts.gradePie   = pie(currentRoot.querySelector("#st-grade-pie"), gradeDist.map(d => d.g), gradeDist.map(d => d.n), { valueSuffix: " students" });
  charts.gradeBar   = bar(currentRoot.querySelector("#st-grade-bar"), gradeDist.map(d => d.g), gradeDist.map(d => d.n));

  const subjRank = [...SUBJECTS].sort((a, b) => mean(f.map(s => s[a])) - mean(f.map(s => s[b])));
  charts.subjRank  = bar(currentRoot.querySelector("#st-subj-rank"), subjRank, subjRank.map(s => mean(f.map(x => x[s]))));

  const sections = unique(f.map(s => s.Section));
  const matrix = sections.map(sec => SUBJECTS.map(sub => Number(mean(f.filter(s => s.Section === sec).map(s => s[sub])).toFixed(2))));
  heatmap(currentRoot.querySelector("#st-heatmap"), sections, SUBJECTS, matrix);

  charts.attScatter = scatter(currentRoot.querySelector("#st-att-scatter"), f.map(s => ({ x: s.Attendance, y: s.Average })), { xLabel: "Attendance %", yLabel: "Average Mark" });
}

function wireFilters() {
  // Section chips
  currentRoot.querySelector('[data-filter="st-section"]')?.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chip.classList.toggle("checked");
    chip.setAttribute("aria-pressed", chip.classList.contains("checked") ? "true" : "false");
    state.sections = new Set(
      [...currentRoot.querySelectorAll('[data-filter="st-section"] .chip.checked')].map(c => c.dataset.value)
    );
    draw();
  });

  // Grade chips
  currentRoot.querySelector('[data-filter="st-grade"]')?.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chip.classList.toggle("checked");
    chip.setAttribute("aria-pressed", chip.classList.contains("checked") ? "true" : "false");
    state.grades = new Set(
      [...currentRoot.querySelectorAll('[data-filter="st-grade"] .chip.checked')].map(c => c.dataset.value)
    );
    draw();
  });

  // Search input (debounced)
  const searchEl = currentRoot.querySelector('[data-filter="st-search"]');
  let searchTimer;
  searchEl?.addEventListener("input", e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      draw();
    }, 150);
  });

  // Sort select
  currentRoot.querySelector('[data-filter="st-sort"]')?.addEventListener("change", e => {
    state.sort = e.target.value;
    draw();
  });

  // Reset button
  currentRoot.querySelector('[data-action="reset"]')?.addEventListener("click", () => {
    state.sections = new Set(state.allSections);
    state.grades   = new Set(["S","A","B","C","D","E"]);
    state.search   = "";
    state.sort     = "avg-desc";
    draw();
  });
}

function applyFilters() {
  const search = state.search.toLowerCase();
  return state.allStudents.filter(s =>
    state.sections.has(s.Section) &&
    state.grades.has(s.Grade) &&
    (search === "" || s.Name.toLowerCase().includes(search))
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
      allSections: unique(data.students.map(s => s.Section)),
      sections: new Set(unique(data.students.map(s => s.Section))),
      grades: new Set(["S","A","B","C","D","E"]),
      search: "",
      sort: "avg-desc",
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