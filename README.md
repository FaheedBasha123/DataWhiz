# DataWhiz

> A clean, static analytics dashboard for **student performance** and **sales data** — no build step, no server, no framework.

![Status](https://img.shields.io/badge/status-ready-success) ![Stack](https://img.shields.io/badge/stack-vanilla%20JS-blue) ![Deps](https://img.shields.io/badge/deps-CDN%20only-orange)

The full walk-through (architecture, decisions log, run instructions, troubleshooting) lives in **[`guide.md`](guide.md)** — kept out of GitHub by convention; open the file locally if you want the deep dive.

---

## Quick start

```bash
cd ProjectD
python serve.py
# open http://localhost:8766
```

That's it. Any modern browser works. No Node, no npm, no build tools.

## What's inside

- **4 modules** auto-generated from a registry: Overview · Students · Sales · Insights
- **200 students** across 5 sections of Class X, with grades + attendance
- **500 simulated sales orders** across 5 regions and 3 channels
- **Live filters** on every page: section/grade pills, name search, sort, date range
- **Charts with fullscreen + PNG download** on hover (any chart, any page)
- **Light + dark mode** that persists across sessions

## Tech stack

- Vanilla JavaScript (ES modules, no framework, no build step)
- [Chart.js](https://www.chartjs.org/) + [PapaParse](https://www.papaparse.com/) via CDN
- Custom CSS with semantic color tokens + light/dark themes

About **80 KB** of hand-written source total.

## Adding a new module

Each module is one file. Create `js/modules/scoreboard.js`:

```js
import { register } from "../registry.js";

register({
  id: "scoreboard",
  name: "Scoreboard",
  icon: "🏆",
  setup(rootEl, data) {
    rootEl.innerHTML = `<h1>Scoreboard</h1>`;   // any markup
  },
});
```

Add one line to `js/app.js`:

```js
import "./modules/scoreboard.js";
```

Sidebar nav, view section, and routing all pick it up automatically.

## Swapping in real data

Real datasets are bundled as backups:

| File | Rows | Source |
|---|---|---|
| `data/students_real.csv` | 1,000 | [Kaggle · Students Performance in Exams](https://www.kaggle.com/datasets/spscientist/students-performance-in-exams) |
| `data/sales_real.csv` | 9,994 | [Tableau Sample · Superstore](https://github.com/sumit0072/Superstore-Data-Analysis) |

To use them:

```bash
copy data\students_real.csv data\students.csv
copy data\sales_real.csv   data\sales.csv
```

If column names differ from the mock schema, edit the cleaning logic in `js/data.js`.

## License

MIT — do whatever you want.
