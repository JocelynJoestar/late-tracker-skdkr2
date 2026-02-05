import { db } from "./firebase.js";
import { requireRole, attachLogout } from "./auth-guard.js";
import { applyI8n, getLang, setLang, t } from "./i8n-teacher.js";

import {
  collection, query, where, orderBy, getDocs, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

attachLogout();

/** Keep this list consistent with Prefect page */
const CLASSES = [
  { className: "1 Dinamik", level: 1 },
  { className: "1 Kreatif", level: 1 },
  { className: "1 Setia", level: 1 },

  { className: "2 Dinamik", level: 2 },
  { className: "2 Kreatif", level: 2 },
  { className: "2 Setia", level: 2 },

  { className: "3 Dinamik", level: 3 },
  { className: "3 Kreatif", level: 3 },
  { className: "3 Setia", level: 3 },

  { className: "4 Dinamik", level: 4 },
  { className: "4 Kreatif", level: 4 },
  { className: "4 Setia", level: 4 },

  { className: "5 Dinamik", level: 5 },
  { className: "5 Kreatif", level: 5 },
  { className: "5 Setia", level: 5 },

  { className: "6 Dinamik", level: 6 },
  { className: "6 Kreatif", level: 6 },
  { className: "6 Setia", level: 6 }
];

// ===== Elements =====
const rangeEl = document.getElementById("range");
const summaryEl = document.getElementById("summary");
const listsEl = document.getElementById("lists");
const pickedDateEl = document.getElementById("pickedDate");
const clearDateBtn = document.getElementById("clearDateBtn");

const toggleFiltersBtn = document.getElementById("toggleFiltersBtn");
const filterPanel = document.getElementById("filterPanel");
const levelFiltersEl = document.getElementById("levelFilters");
const classFiltersEl = document.getElementById("classFilters");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

const studentStatsEl = document.getElementById("studentStats");

// IMPORTANT: add id="levelDoughnutCard" to the doughnut card in HTML
const levelDoughnutCard = document.getElementById("levelDoughnutCard");

let classBarChart = null;
let levelDoughnutChart = null;

// ===== Utilities =====
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function remarkLabel(v) {
  const key = String(v || "").trim();
  if (!key.startsWith("remark.")) return key;
  const out = t(key);
  return (out && String(out).trim()) ? out : key;
}

function normalizeRecord(r) {
  const className = String(r.className ?? "").trim();
  const studentName = String(r.studentName ?? "").trim();
  const remark = String(r.remark ?? "").trim();
  const level = Number(r.level ?? 0);

  return { ...r, className, studentName, remark, level };
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getRangeFromDropdown(type) {
  const now = new Date();

  if (type === "daily") {
    const start = startOfDay(now);
    const end = addDays(start, 1);
    return { start, end, label: "Today" };
  }
  if (type === "weekly") {
    const end = now;
    const start = addDays(now, -7);
    return { start, end, label: "Last 7 days" };
  }
  return { start: startOfMonth(), end: now, label: "This month" };
}

function getRangeFromPickedDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = addDays(start, 1);
  return { start, end, label: `Date: ${dateStr}` };
}

function groupBy(arr, keyFn) {
  const m = new Map();
  for (const item of arr) {
    const k = keyFn(item);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(item);
  }
  return m;
}

// ===== Filters =====
function getAllLevels() {
  // fixed: never show undefined; only 1..6
  return Array.from(
    new Set(
      CLASSES
        .map(c => Number(c.level))
        .filter(n => Number.isFinite(n) && n >= 1 && n <= 6)
    )
  ).sort((a, b) => a - b);
}

function getAllClassNames() {
  return Array.from(new Set(CLASSES.map(c => String(c.className)))).sort();
}

function renderFilterCheckboxes() {
  const levels = getAllLevels();
  const classes = getAllClassNames();

  levelFiltersEl.innerHTML = [
    `<label class="pill"><input type="checkbox" data-type="level" value="__ALL__" checked /><span class="all">All Levels</span></label>`,
    ...levels.map(l => `<label class="pill"><input type="checkbox" data-type="level" value="${l}" /><span>Level ${l}</span></label>`)
  ].join("");

  classFiltersEl.innerHTML = [
    `<label class="pill"><input type="checkbox" data-type="class" value="__ALL__" checked /><span class="all">All Classes</span></label>`,
    ...classes.map(cn => `<label class="pill"><input type="checkbox" data-type="class" value="${escapeHtml(cn)}" /><span>${escapeHtml(cn)}</span></label>`)
  ].join("");

  // "All" exclusive
  filterPanel.addEventListener("change", (e) => {
    const cb = e.target;
    if (!(cb instanceof HTMLInputElement)) return;
    if (cb.type !== "checkbox") return;

    const type = cb.dataset.type;
    const isAll = cb.value === "__ALL__";

    const allBox = filterPanel.querySelector(`input[data-type="${type}"][value="__ALL__"]`);
    const others = Array.from(filterPanel.querySelectorAll(`input[data-type="${type}"]`))
      .filter(x => x.value !== "__ALL__");

    if (isAll && cb.checked) {
      others.forEach(x => x.checked = false);
      return;
    }

    if (!isAll && cb.checked && allBox) {
      allBox.checked = false;
      return;
    }

    const anyOtherChecked = others.some(x => x.checked);
    if (!anyOtherChecked && allBox) allBox.checked = true;
  });
}

function readSelectedFilters() {
  const levelAll = filterPanel.querySelector(`input[data-type="level"][value="__ALL__"]`)?.checked;
  const classAll = filterPanel.querySelector(`input[data-type="class"][value="__ALL__"]`)?.checked;

  const levels = Array.from(filterPanel.querySelectorAll(`input[data-type="level"]`))
    .filter(x => x.value !== "__ALL__" && x.checked)
    .map(x => Number(x.value));

  const classes = Array.from(filterPanel.querySelectorAll(`input[data-type="class"]`))
    .filter(x => x.value !== "__ALL__" && x.checked)
    .map(x => x.value);

  return {
    levelAll: !!levelAll,
    classAll: !!classAll,
    levels,
    classes
  };
}

function applyRecordFilters(records, selected) {
  return records.filter(r => {
    const lvl = Number(r.level ?? 0);
    const cls = String(r.className ?? "");

    const okLevel = selected.levelAll ? true : selected.levels.includes(lvl);
    const okClass = selected.classAll ? true : selected.classes.includes(cls);

    return okLevel && okClass;
  });
}

// ===== Chart helpers =====
function pickTopNamesForClass(records, cls, limit = 10) {
  const counts = new Map();

  for (const r of records) {
    if (String(r.className ?? "") !== cls) continue;
    const name = String(r.studentName ?? "").trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  const items = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const total = items.reduce((s, x) => s + x.count, 0);
  const top = items.slice(0, limit);

  const pctMap = new Map();
  for (const x of top) {
    pctMap.set(x.name, total > 0 ? Math.round((x.count / total) * 100) : 0);
  }

  return { pctMap, topNames: top.map(x => x.name) };
}

// ===== Build stats =====
function buildStats(records, selected) {
  const levelCounts = new Map();
  for (const r of records) {
    const lvl = String(r.level ?? 0);
    levelCounts.set(lvl, (levelCounts.get(lvl) || 0) + 1);
  }

  const levelNums = Array.from(levelCounts.keys()).sort((a, b) => Number(a) - Number(b));
  const levelLabels = levelNums.map(l => `Level ${l}`);
  const levelValues = levelNums.map(l => levelCounts.get(l));

  const classAll = !!selected.classAll;
  const chosenClasses = selected.classes || [];
  const exactlyOneClass = !classAll && chosenClasses.length === 1;

  const hideDoughnut = exactlyOneClass;

  let barMode = "classCount";
  let barTitle = "Late Count by Class";
  let barLabels = [];
  let barDatasets = [];

  if (!classAll && chosenClasses.length >= 1) {
    barMode = "studentPctMulti";
    barTitle = "Late % by Student (Selected Classes)";

    const nameSet = new Set();
    const perClass = [];

    for (const cls of chosenClasses) {
      const res = pickTopNamesForClass(records, cls, 10);
      perClass.push({ cls, pctMap: res.pctMap, topNames: res.topNames });
      res.topNames.forEach(n => nameSet.add(n));
    }

    barLabels = Array.from(nameSet).sort((a, b) => a.localeCompare(b));

    barDatasets = perClass.map(({ cls, pctMap }) => ({
      label: cls,
      data: barLabels.map(n => pctMap.get(n) || 0)
    }));
  } else {
    const classCounts = new Map();
    for (const r of records) {
      const cls = String(r.className ?? "");
      if (!cls) continue;
      classCounts.set(cls, (classCounts.get(cls) || 0) + 1);
    }

    const items = Array.from(classCounts.entries())
      .map(([cls, count]) => ({ cls, count }))
      .sort((a, b) => b.count - a.count || a.cls.localeCompare(b.cls));

    barLabels = items.map(x => x.cls);
    barDatasets = [{
      label: barTitle,
      data: items.map(x => x.count)
    }];
  }

  return {
    total: records.length,
    levelLabels,
    levelValues,
    barMode,
    barTitle,
    barLabels,
    barDatasets,
    hideDoughnut
  };
}

function setupScrollableBarCanvas(labels) {
  const canvas = document.getElementById("classBar");
  if (!canvas) return;

  // Your HTML will wrap the canvas in .chart-scroll / .chart-scroll-inner
  const inner = canvas.closest(".chart-scroll-inner");

  // Reset to default first (so switching filters doesn't keep old width)
  canvas.style.width = "100%";
  canvas.removeAttribute("width");
  if (inner) inner.style.minWidth = "100%";

  const count = Array.isArray(labels) ? labels.length : 0;

  // Only widen/scroll when there are many bars
  // (You can change 6 -> 8 if you want later)
  if (count <= 6) return;

  // Bar spacing (feel free to tweak)
  const pxPerBar = 80;   // bigger = more spacing per class
  const minWidth = 520;  // minimum for nice look

  const desiredWidth = Math.max(minWidth, count * pxPerBar);

  // This makes the canvas physically wider so user can swipe horizontally
  canvas.style.width = desiredWidth + "px";
  canvas.width = desiredWidth; // important: sharp rendering

  if (inner) inner.style.minWidth = desiredWidth + "px";
}


// ===== Render charts =====
function renderCharts(stats) {
  const ctxBar = document.getElementById("classBar");
  const ctxD = document.getElementById("levelDoughnut");

  // Update bar chart title dynamically
  const barTitleEl = document.getElementById("barTitle");
  if (barTitleEl) barTitleEl.textContent = stats.barTitle;

  if (classBarChart) classBarChart.destroy();
  if (levelDoughnutChart) levelDoughnutChart.destroy();

  const isPct = stats.barMode === "studentPctMulti";

  // ✅ Make bar chart scrollable on mobile when many labels
  // Works for ALL devices because it's just CSS overflow + a wider canvas
  setupScrollableBarCanvas(stats.barLabels);

  classBarChart = new Chart(ctxBar, {
    type: "bar",
    data: { labels: stats.barLabels, datasets: stats.barDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: isPct },
        tooltip: {
          callbacks: {
            label: (ctx) => isPct
              ? `${ctx.dataset.label}: ${ctx.parsed.y}%`
              : `${ctx.parsed.y}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false, // ✅ show ALL labels (no skipping)
            maxRotation: 0,
            minRotation: 0,
            callback: function(value) {
              const label = this.getLabelForValue(value);
              return label.length > 14 ? label.slice(0, 14) + "…" : label;
            }
          }
        },
        y: {
          beginAtZero: true,
          ...(isPct ? { max: 100 } : {}),
          ticks: { callback: (v) => isPct ? `${v}%` : v }
        }
      }
    }
  });

  if (stats.hideDoughnut) {
    if (levelDoughnutCard) levelDoughnutCard.style.display = "none";
    return;
  }
  if (levelDoughnutCard) levelDoughnutCard.style.display = "";

  levelDoughnutChart = new Chart(ctxD, {
    type: "doughnut",
    data: { labels: stats.levelLabels, datasets: [{ data: stats.levelValues }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top" } }
    }
  });
}

// ===== Render lists =====
function renderLists(records) {
  const byLevel = groupBy(records, (r) => Number(r.level ?? 0));
  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);

  if (records.length === 0) {
    listsEl.innerHTML = `<p class="small">No records for this filter.</p>`;
    return;
  }

  listsEl.innerHTML = levels.map((level) => {
    const rows = byLevel.get(level).map((r) => {
      const dt = r.dateTime?.toDate ? r.dateTime.toDate().toLocaleString() : "";
      return `<tr>
        <td class="cell-nowrap">${escapeHtml(dt)}</td>
        <td class="cell-wrap">${escapeHtml(r.studentName || "")}</td>
        <td class="cell-nowrap">${escapeHtml(r.className || "")}</td>
        <td class="cell-wrap">${escapeHtml(remarkLabel(r.remark))}</td>
      </tr>`;
    }).join("");

    return `
      <div class="card" style="margin-top:12px;">
        <h3 style="margin:0 0 10px; font-size:14px;">Level ${escapeHtml(level)}</h3>
        <div style="overflow:auto;">
          <table class="fixed-table">
            <colgroup>
              <col style="width:170px;">
              <col style="width:320px;">
              <col style="width:120px;">
              <col>
            </colgroup>
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Name</th>
                <th>Class</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");
}

// ===== Student frequency table =====
function buildStudentFrequency(records) {
  const map = new Map();

  for (const r of records) {
    const cls = String(r.className || "");
    const name = String(r.studentName || "").trim();
    if (!cls || !name) continue;

    if (!map.has(cls)) map.set(cls, new Map());
    const inner = map.get(cls);
    inner.set(name, (inner.get(name) || 0) + 1);
  }

  const out = [];
  for (const [cls, inner] of map.entries()) {
    const items = Array.from(inner.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const total = items.reduce((s, x) => s + x.count, 0);
    out.push({ cls, total, items });
  }

  out.sort((a, b) => a.cls.localeCompare(b.cls));
  return out;
}

function renderStudentFrequency(records) {
  if (!studentStatsEl) return;

  if (records.length === 0) {
    studentStatsEl.innerHTML = `<p class="small">No records for this filter.</p>`;
    return;
  }

  const data = buildStudentFrequency(records);

  if (data.length === 0) {
    studentStatsEl.innerHTML = `<p class="small">No student names found in this range.</p>`;
    return;
  }

  studentStatsEl.innerHTML = data.map(({ cls, total, items }) => {
    const rows = items.map(({ name, count }) => {
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;

      return `
        <tr>
          <td class="cell-wrap">${escapeHtml(name)}</td>
          <td class="right cell-nowrap">${count}</td>
          <td class="right cell-nowrap">${pct}%</td>
        </tr>
      `;
    }).join("");

    return `
      <div class="card" style="margin-top:12px;">
        <h3 style="margin:0 0 8px; font-size:14px;">
          ${escapeHtml(cls)} <span class="muted small">• total ${total}</span>
        </h3>

        <div style="overflow:auto;">
          <table class="fixed-table">
            <colgroup>
              <col style="width:420px;">
              <col style="width:80px;">
              <col style="width:80px;">
            </colgroup>
            <thead>
              <tr>
                <th>Name</th>
                <th class="right">Late</th>
                <th class="right">%</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");
}

// ===== Load data =====
async function loadRangeAndRender() {
  const type = rangeEl.value;

  let range;
  if (type === "date") {
    const ds = pickedDateEl.value || new Date().toISOString().slice(0, 10);
    range = getRangeFromPickedDate(ds);
  } else {
    range = getRangeFromDropdown(type);
  }

  const q = query(
    collection(db, "late_records"),
    where("dateTime", ">=", Timestamp.fromDate(range.start)),
    where("dateTime", "<", Timestamp.fromDate(range.end)),
    orderBy("dateTime", "desc")
  );

  let snap;
  try {
    snap = await getDocs(q);
  } catch (err) {
    console.error(err);
    summaryEl.textContent = "Error loading records. Check Console (F12).";
    listsEl.innerHTML = "";
    if (studentStatsEl) studentStatsEl.innerHTML = "";
    return;
  }

  const all = snap.docs.map(d => normalizeRecord(d.data()));

  const selected = readSelectedFilters();
  const filtered = applyRecordFilters(all, selected);

  const stats = buildStats(filtered, selected);
  summaryEl.textContent = `${range.label} • Total Late: ${stats.total}`;

  renderCharts(stats);
  renderStudentFrequency(filtered);
  renderLists(filtered);

  // ✅ update any data-i18n labels in HTML
  try { applyI8n?.(document); } catch {}
}

// ===== Init =====
(async () => {
  try {
    // ✅ i8n init (no dropdown)
    const saved = getLang?.();
    if (!saved) setLang?.("en"); // change to "ms" if you want default Malay
    applyI8n?.(document);

    const { user, profile } = await requireRole(["teacher"]);
    document.getElementById("whoami").textContent =
      `${profile.displayName || "Teacher"} • ${user.email}`;

    pickedDateEl.value = new Date().toISOString().slice(0, 10);

    function syncDateEnabled() {
      const isDate = rangeEl.value === "date";
      pickedDateEl.disabled = !isDate;
      clearDateBtn.disabled = !isDate;
    }
    syncDateEnabled();

    clearDateBtn.addEventListener("click", () => {
      pickedDateEl.value = new Date().toISOString().slice(0, 10);
    });

    renderFilterCheckboxes();

    toggleFiltersBtn.addEventListener("click", () => {
      filterPanel.classList.toggle("open");
    });

    applyFiltersBtn.addEventListener("click", async () => {
      await loadRangeAndRender();
    });

    resetFiltersBtn.addEventListener("click", async () => {
      filterPanel.querySelectorAll(`input[type="checkbox"]`).forEach(cb => cb.checked = false);
      filterPanel.querySelector(`input[data-type="level"][value="__ALL__"]`).checked = true;
      filterPanel.querySelector(`input[data-type="class"][value="__ALL__"]`).checked = true;
      await loadRangeAndRender();
    });

    rangeEl.addEventListener("change", async () => {
      syncDateEnabled();
      await loadRangeAndRender();
    });

    pickedDateEl.addEventListener("change", async () => {
      if (rangeEl.value === "date") await loadRangeAndRender();
    });

    await loadRangeAndRender();
  } catch (err) {
    console.error(err);
    const msg = err?.message ? err.message : String(err);
    if (summaryEl) summaryEl.textContent = `Error: ${msg}`;
  }
})();

