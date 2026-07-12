// data.js — CSV loading + cleaning
// Loads ./data/students.csv and ./data/sales.csv via PapaParse, then
// applies the same cleaning logic as the Python version:
//   - mean imputation for missing subject marks
//   - median for missing sales, "Unknown" for missing region
//   - derived columns: Average, Total, Grade, Month, Year, Quarter

export const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"];

export const GRADE_BANDS = [
  { letter: "S", min: 90 },
  { letter: "A", min: 80 },
  { letter: "B", min: 70 },
  { letter: "C", min: 60 },
  { letter: "D", min: 50 },
  { letter: "E", min: 0  },
];

export function gradeFor(avg) {
  if (avg == null || isNaN(avg)) return "N/A";
  for (const g of GRADE_BANDS) if (avg >= g.min) return g.letter;
  return "E";
}

export function mean(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

export function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ---------- fetch + parse ----------
async function fetchCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const text = await res.text();
  return Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
}

// ---------- students ----------
export async function loadStudents() {
  const rows = await fetchCSV("data/students.csv");
  // mean-impute each subject
  for (const subj of SUBJECTS) {
    const vals = rows.map(r => r[subj]).filter(v => typeof v === "number");
    const m = mean(vals);
    rows.forEach(r => {
      if (typeof r[subj] !== "number" || isNaN(r[subj])) r[subj] = Math.round(m * 10) / 10;
    });
  }
  // derived
  rows.forEach(r => {
    const avg = mean(SUBJECTS.map(s => r[s]));
    r.Average  = Math.round(avg * 100) / 100;
    r.Total    = SUBJECTS.reduce((s, k) => s + r[k], 0);
    r.Grade    = gradeFor(avg);
    r.Highest  = SUBJECTS.reduce((a, b) => (r[a] > r[b] ? a : b));
    r.Weakest  = SUBJECTS.reduce((a, b) => (r[a] < r[b] ? a : b));
  });
  return rows;
}

// ---------- sales ----------
export async function loadSales() {
  const rows = await fetchCSV("data/sales.csv");
  const parsed = [];
  for (const r of rows) {
    const d = r.OrderDate ? new Date(r.OrderDate) : null;
    if (!d || isNaN(d.getTime())) continue;
    parsed.push(r);
  }
  // median for Sales, "Unknown" for Region
  const salesVals = parsed.map(r => r.Sales).filter(v => typeof v === "number");
  const medSales = median(salesVals);
  parsed.forEach(r => {
    if (typeof r.Sales !== "number" || isNaN(r.Sales)) r.Sales = medSales;
    if (!r.Region) r.Region = "Unknown";
    const d = new Date(r.OrderDate);
    r.Month     = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    r.Year      = d.getFullYear();
    r.Quarter   = Math.floor(d.getMonth() / 3) + 1;
    r.DayOfWeek = d.toLocaleDateString("en", { weekday: "long" });
  });
  return parsed;
}