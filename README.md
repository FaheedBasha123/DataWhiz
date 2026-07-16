# DataWhiz

A clean, static analytics dashboard for **student performance** and **sales data** - no build step, no server, no framework, and no headache

---

## Quick start

Ensure you have **Python 3** installed (or whatever tool you use to fake a local server), then run:

```bash
cd DataWhiz
python serve.py
# open http://localhost:9999
```

That's it, any modern browser works. No Node, no `npm install` that downloads half the internet, and no build tools to configure.

## What's inside

- **4 modules** auto-generated from a registry: Overview · Students · Sales · Insights
- **200 students** across 5 sections of Class X, with grades + attendance data you can stress-test
- **500 simulated sales orders** across 5 regions and 3 channels (100% fake)
- **Live filters** on every page: section/grade pills, name search, sort, and date ranges that actually update instantly
- **Charts with fullscreen + PNG download** on hover (sounds cool right?)
- **Light + dark mode** that persists across sessions (dark is good ngl)

## Tech stack

- Vanilla JavaScript (ES modules, no framework, no build steps, just pure vibes)
- Chart.js + PapaParse loaded via CDN 
- Custom CSS with semantic color tokens + light/dark themes 

## Adding a new module
**Example:**

Adding features shouldn't require a degree in architecture. Each module is just one file. Create `js/modules/scoreboard.js`:

```js
import { register } from "../registry.js";

register({
  id: "scoreboard",
  name: "Scoreboard",
  icon: "🏆",
  setup(rootEl, data) {
    rootEl.innerHTML = `<h1>Scoreboard</h1>`;
  },
});
```

Add exactly one line to `js/app.js`:

```js
import "./modules/scoreboard.js";
```

The sidebar nav, view section, and routing will all pick it up automatically. No magic, just automation.

## Swapping in real data

If you are tired of the simulation, real datasets are bundled as backups:

| File | Rows | Source |
|---|---|---|
| `data/students_real.csv` | 1,000 | [Kaggle · Students Performance in Exams](https://www.kaggle.com/datasets/spscientist/students-performance-in-exams) |
| `data/sales_real.csv` | 9,994 | [Tableau Sample · Superstore](https://github.com/sumit0072/Superstore-Data-Analysis) |

**Windows:**
```cmd
copy data\students_real.csv data\students.csv
copy data\sales_real.csv   data\sales.csv
```

**Mac/Linux:**
```bash
tbh idk, figure it out (i use windows)
```


If column names differ from the mock schema, edit the cleaning logic in `js/data.js`.

## License

**Free**: Do whatever you want, if it helps you out, you owe me a thanks. If it makes you rich, you owe me a treat.
