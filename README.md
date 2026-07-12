# DataWhiz — Analytics Dashboard

A pure-frontend analytics dashboard for **student performance** and **sales analysis**. No Python, no build step, no server-side code. Built as an **extensible framework** — adding a new sub-project (e.g. Scoreboard) takes 1 file + 1 import line.

---

## What is this?

A 4-page interactive dashboard where every page is a **self-contained module**:

| Module | What's on it |
|---|---|
| **Overview** | KPIs, grade distribution + monthly revenue at a glance, methodology note |
| **Students** | Class/grade/score filters, top-5 leaderboard, subject analysis, Class×Subject heatmap, attendance correlation, insights |
| **Sales** | Region/category/date filters, revenue trends, product top/bottom, channel/segment breakdowns, rep heatmap, detailed product table, insights |
| **Insights** | Cross-project synthesis, side-by-side KPIs, CSV downloads |

All data is loaded from local CSV files. Charts use [Chart.js](https://www.chartjs.org/) via CDN. CSV parsing uses [PapaParse](https://www.papaparse.com/) via CDN.

---

## Add a New Module in 60 Seconds

The whole dashboard is built around a **module registry**. To add a new sub-project (e.g. Scoreboard):

**Step 1.** Create `js/modules/scoreboard.js`:

```js
import { register } from "../registry.js";
import { mastheadHTML, kpiHTML, chartCard } from "./_base.js";

register({
  id: "scoreboard",
  name: "Scoreboard",
  icon: "🏆",
  description: "Live rankings",
  order: 5,

  setup(rootEl, data) {
    rootEl.innerHTML = `
      ${mastheadHTML({ title: "Scoreboard", sub: "Live rankings" })}
      <!-- your markup here -->
    `;
    // create charts, attach handlers
  },

  dispose() {
    // destroy any Chart.js instances
  },
});
```

**Step 2.** Add one line to `js/app.js`:

```js
import "./modules/scoreboard.js";
```

**Done.** The sidebar nav, view section, and routing all pick it up automatically.

---

## Requirements

- **Any modern browser** (Chrome, Firefox, Edge, Safari — current versions)
- That's it. No Node, no Python, no npm, no build tools.

---

## How to Run

### Option 1 — Quick start (recommended)

```bash
cd "C:\Users\kcdar\Desktop\Data Science\ProjectD"
python serve.py
```

Open **http://localhost:8766** in your browser.

To stop: `Ctrl+C` in the terminal.

### Option 2 — Open directly

Double-click `index.html`. **May fail to load charts** because some browsers block `fetch()` on `file://`. Use Option 1 if charts don't appear.

### Option 3 — Node

```bash
npx http-server -p 8766
```

---

## Project Structure

```
ProjectD/
├── index.html              ← Slim static sidebar + main area (sections populated by registry)
├── README.md               ← This file
├── context.md              ← Persistent project memory (for future sessions)
├── serve.py                ← Local HTTP server (Python)
├── launch_serve.py         ← Detached launcher for serve.py
├── css/
│   └── styles.css          ← 5-color palette + light/dark theme + responsive
├── js/
│   ├── data.js             ← CSV load + clean
│   ├── charts.js           ← Themed Chart.js wrappers
│   ├── theme.js            ← Light/dark toggle (sidebar is static, no collapse)
│   ├── router.js           ← Hash-based navigation
│   ├── registry.js         ← Module registry (add new modules here)
│   ├── app.js              ← Boot orchestrator (tiny)
│   └── modules/
│       ├── _base.js        ← Shared HTML builders + utilities
│       ├── overview.js     ← Overview module
│       ├── students.js     ← Student Performance module
│       ├── sales.js        ← Sales Analysis module
│       └── insights.js     ← Cross-project insights module
└── data/
    ├── students.csv        ← MOCK (50 rows) — loaded by default
    ├── sales.csv           ← MOCK (500 rows) — loaded by default
    ├── students_real.csv   ← REAL backup (1000 rows, Kaggle Students Performance)
    ├── sales_real.csv      ← REAL backup (9994 rows, Tableau Superstore)
    └── _generate_mock.py   ← Regenerate mock CSVs
```

---

## Color Palette

| Name | Hex | Where it's used |
|---|---|---|
| Sunflower Gold | `#ffbc42` | KPI icons, highlights, eyebrows, CTAs |
| Raspberry Red | `#d81159` | Featured cards, alerts, negative deltas |
| Vintage Berry | `#8f2d56` | Masthead bg, sidebar bg, headings |
| Teal | `#218380` | Section labels, links, success states |
| Frosted Blue | `#73d2de` | Heatmap gradients, dark-mode accent |

The palette is defined as CSS variables in `css/styles.css` and read at runtime by charts.

---

## Swap in Real Data

Two real datasets are bundled as backups:

| File | Rows | Source |
|---|---|---|
| `students_real.csv` | 1,000 | [Kaggle · Students Performance in Exams](https://www.kaggle.com/datasets/spscientist/students-performance-in-exams) |
| `sales_real.csv` | 9,994 | [Tableau Sample · Superstore](https://github.com/sumit0072/Superstore-Data-Analysis) (latin-1 encoded) |

### Steps to switch

1. **Replace the loaded CSVs:**
   ```bash
   copy data\students_real.csv data\students.csv
   copy data\sales_real.csv data\sales.csv
   ```

2. **Update the cleaning logic** in `js/data.js` because real CSVs use different column names:
   - Real students: `gender`, `race/ethnicity`, `parental level of education`, `lunch`, `test preparation course`, `math score`, `reading score`, `writing score`
   - Real sales: `Row ID`, `Order ID`, `Order Date`, `Ship Date`, `Ship Mode`, `Customer ID`, `Customer Name`, `Segment`, `Country`, `City`, `State`, `Postal Code`, `Region`, `Product ID`, `Category`, `Sub-Category`, `Product Name`, `Sales`, `Quantity`, `Discount`, `Profit`

   Edit `js/data.js` to match your column names (the cleaning functions `loadStudents()` and `loadSales()`).

3. **Refresh the browser.**

> Tip: regenerate mock data anytime with `python data/_generate_mock.py`.

---

## Layout

- **Slim 200px sidebar** — always visible, never collapses. Shows module nav + status.
- **Top-right theme toggle** — switches between light and dark mode (persists via localStorage).
- **Single scrollable main area** — content centered, max-width 1500px.

---

## Features

- 4 modules with hash-routed navigation
- Light/dark mode toggle (top-right) — persists in localStorage
- Static sidebar (no collapse) — always visible, ~200px wide
- Responsive — sidebar auto-collapses below 900px width
- Live filters on Students (class, grade, score range) and Sales (region, category, date range)
- 5 chart types: bar, pie/donut, line, scatter, custom CSS-grid heatmap
- CSV downloads for both datasets from the Insights page
- KPI cards with icons, animated fade-ins
- Editorial typography (Playfair Display headlines + Inter body)

---

## What's Where (code map)

| Want to... | Open |
|---|---|
| Change colors / theme | `css/styles.css` (top section: `:root` + `[data-theme="dark"]`) |
| Add a new chart type | `js/charts.js` (follow the `bar()` pattern) |
| Add a new module | `js/modules/yourmodule.js` + 1 import line in `js/app.js` |
| Change data cleaning | `js/data.js` |
| Change routing | `js/router.js` |
| See project history | `context.md` |

---

## Troubleshooting

**Charts don't load / blank page**
→ Use `python serve.py`. Browsers block `fetch()` on `file://`.

**Port 8766 already in use**
→ Edit `serve.py:5` and change `PORT = 8766` to any free port.

**Real CSV column names don't match**
→ Edit `js/data.js` `loadStudents()` / `loadSales()` to match your CSVs.

**Theme doesn't persist after page reload**
→ Check that localStorage is enabled in your browser.

---

## License & Credits

- Charts: [Chart.js](https://www.chartjs.org/) (MIT)
- CSV parsing: [PapaParse](https://www.papaparse.com/) (MIT)
- Fonts: [Inter](https://rsms.me/inter/), [Playfair Display](https://fonts.google.com/specimen/Playfair+Display), [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- Sample data: [Kaggle Students Performance](https://www.kaggle.com/datasets/spscientist/students-performance-in-exams), [Tableau Superstore](https://github.com/sumit0072/Superstore-Data-Analysis)

---

*For full project history and decisions log, see `context.md`.*