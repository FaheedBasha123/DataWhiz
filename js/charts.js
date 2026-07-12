// charts.js — Themed Chart.js wrappers
// Reads theme colors from CSS variables so charts adapt to light/dark mode.

const FONT_SERIF = "'Playfair Display', Georgia, serif";
const FONT_SANS  = "'Inter', -apple-system, sans-serif";

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function themeColors() {
  return {
    paper: css("--c-paper"),
    grid:  css("--c-grid"),
    text:  css("--c-text"),
    muted: css("--c-muted"),
    sun:   css("--sun"),
    rasp:  css("--rasp"),
    berr:  css("--berr"),
    teal:  css("--teal"),
    frost: css("--frost"),
    seq: [
      css("--seq-1"), css("--seq-2"), css("--seq-3"),
      css("--seq-4"), css("--seq-5"), css("--seq-6"), css("--seq-7"),
    ],
  };
}

function baseOpts(extra = {}) {
  const t = themeColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    color: t.text,
    plugins: {
      legend: { labels: { color: t.text, font: { family: FONT_SANS } } },
      tooltip: {
        backgroundColor: t.berr,
        titleColor: t.sun,
        bodyColor: t.frost,
        borderColor: t.sun,
        borderWidth: 1,
      },
    },
    scales: {
      x: { ticks: { color: t.muted, font: { family: FONT_SANS } }, grid: { display: false } },
      y: { ticks: { color: t.muted, font: { family: FONT_SANS } }, grid: { color: t.grid } },
    },
    ...extra,
  };
}

// ---------- bar ----------
export function bar(canvas, labels, values, { horizontal = false, color = null } = {}) {
  const t = themeColors();
  const fill = color ? Array(labels.length).fill(color) : t.berr;
  return new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: fill,
        borderColor: t.berr,
        borderWidth: 0.5,
        borderRadius: 2,
      }],
    },
    options: baseOpts({
      indexAxis: horizontal ? "y" : "x",
      plugins: { legend: { display: false } },
    }),
  });
}

// ---------- pie / donut ----------
export function pie(canvas, labels, values, { valuePrefix = "", valueSuffix = "" } = {}) {
  const t = themeColors();
  const valueFmt = valuePrefix || valueSuffix
    ? `${valuePrefix}%{value:,.0f}${valueSuffix}`
    : "%{value:,.0f}";
  return new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: t.seq,
        borderColor: t.paper,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: {
          position: "right",
          labels: { color: t.text, font: { family: FONT_SANS }, boxWidth: 14 },
        },
        tooltip: {
          backgroundColor: t.berr,
          titleColor: t.sun,
          bodyColor: t.frost,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return `${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

// ---------- line ----------
export function line(canvas, labels, values, { valuePrefix = "Rs.", fill = true } = {}) {
  const t = themeColors();
  const trace = {
    data: values,
    borderColor: t.berr,
    backgroundColor: "rgba(143,45,86,0.10)",
    fill,
    tension: 0.4,
    borderWidth: 3,
    pointBackgroundColor: t.sun,
    pointBorderColor: t.paper,
    pointBorderWidth: 2,
    pointRadius: 6,
  };
  return new Chart(canvas, {
    type: "line",
    data: { labels, datasets: [trace] },
    options: baseOpts({
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: t.berr,
          titleColor: t.sun,
          bodyColor: t.frost,
          callbacks: { label: (ctx) => `${valuePrefix}${ctx.parsed.y.toLocaleString()}` },
        },
      },
    }),
  });
}

// ---------- scatter (no line) ----------
export function scatter(canvas, points, { xLabel = "", yLabel = "" } = {}) {
  const t = themeColors();
  return new Chart(canvas, {
    type: "scatter",
    data: {
      datasets: [{
        data: points,
        backgroundColor: t.sun,
        borderColor: t.berr,
        borderWidth: 1,
        pointRadius: 7,
      }],
    },
    options: baseOpts({
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: !!xLabel, text: xLabel, color: t.muted }, ticks: { color: t.muted }, grid: { color: t.grid } },
        y: { title: { display: !!yLabel, text: yLabel, color: t.muted }, ticks: { color: t.muted }, grid: { color: t.grid } },
      },
    }),
  });
}

// ---------- heatmap (CSS grid + lerp gradient) ----------
export function heatmap(container, rows, cols, data) {
  const t = themeColors();
  // Find min/max for color scale
  let mn = Infinity, mx = -Infinity;
  data.forEach(row => row.forEach(v => {
    if (typeof v === "number") { mn = Math.min(mn, v); mx = Math.max(mx, v); }
  }));
  const range = (mx - mn) || 1;

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  function mix(c1, c2, ratio) {
    const [r1, g1, b1] = hexToRgb(c1);
    const [r2, g2, b2] = hexToRgb(c2);
    return `rgb(${lerp(r1, r2, ratio)}, ${lerp(g1, g2, ratio)}, ${lerp(b1, b2, ratio)})`;
  }
  const low  = css("--frost");
  const high = css("--berr");

  container.innerHTML = "";
  container.style.gridTemplateColumns = `120px repeat(${cols.length}, 1fr)`;

  // header row
  const corner = document.createElement("div");
  corner.className = "heatmap-cell";
  corner.style.background = "transparent";
  container.appendChild(corner);
  cols.forEach(c => {
    const h = document.createElement("div");
    h.className = "heatmap-cell";
    h.style.background = "transparent";
    h.style.fontWeight = "700";
    h.textContent = c;
    container.appendChild(h);
  });

  // data rows
  rows.forEach((rname, i) => {
    const lbl = document.createElement("div");
    lbl.className = "heatmap-cell";
    lbl.style.background = "transparent";
    lbl.style.textAlign = "right";
    lbl.style.paddingRight = "0.6rem";
    lbl.style.fontWeight = "700";
    lbl.textContent = rname;
    container.appendChild(lbl);
    data[i].forEach(v => {
      const cell = document.createElement("div");
      cell.className = "heatmap-cell";
      if (typeof v !== "number") { cell.textContent = "—"; container.appendChild(cell); return; }
      const norm = (v - mn) / range;
      const bg = mix(low, high, norm);
      cell.style.background = bg;
      const [r, g, b] = hexToRgb(bg);
      const brightness = (r + g + b) / 3;
      cell.style.color = brightness > 140 ? "#1a1a1a" : "#ffffff";
      cell.textContent = v.toFixed(1);
      container.appendChild(cell);
    });
  });
}