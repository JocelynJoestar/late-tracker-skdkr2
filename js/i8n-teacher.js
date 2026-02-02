// ./js/i18n-teacher.js
const STORAGE_KEY = "lang_teacher"; // separate key for teacher
let currentLang = localStorage.getItem(STORAGE_KEY) || "en";

const DICT = {
  en: {
    // page
    "teacher.title": "Discipline Teacher Dashboard",
    "teacher.btn.logout": "Logout",

    // filter
    "teacher.filter": "Filter",
    "teacher.range": "Range",
    "teacher.range.daily": "Daily (Today)",
    "teacher.range.weekly": "Weekly (Last 7 days)",
    "teacher.range.monthly": "Monthly (This month)",
    "teacher.range.date": "Specific Date",
    "teacher.pickDate": "Pick Date",
    "teacher.btn.clear": "Clear",
    "teacher.pickDateHint": "Pick Date only works when Range = Specific Date",

    "teacher.moreFilters": "More Filters",
    "teacher.moreFiltersHint": "Tick level/class to narrow the result.",
    "teacher.btn.filters": "Filters",

    "teacher.levels": "Standards",
    "teacher.classes": "Classes",
    "teacher.btn.apply": "Apply Filters",
    "teacher.btn.reset": "Reset",

    // pills + generated labels
    "teacher.pill.allLevels": "All Standards",
    "teacher.pill.allClasses": "All Classes",
    "teacher.pill.levelPrefix": "Standard",

    // summary / ranges (JS builds these)
    "teacher.rangeLabel.today": "Today",
    "teacher.rangeLabel.last7": "Last 7 days",
    "teacher.rangeLabel.thisMonth": "This month",
    "teacher.rangeLabel.date": "Date",
    "teacher.summary.totalLate": "Total Late",

    // charts
    "teacher.chart.barTitle.count": "Late Count by Class",
    "teacher.chart.barTitle.pct": "Late % by Student (Selected Classes)",
    "teacher.chart.doughnutTitle": "Late % by Level",

    // frequency section
    "teacher.freqTitle": "Student Late Frequency (by Class)",
    "teacher.freqHint":
      "Percent is based on total late records within the same class for the selected range.",
    "teacher.total": "total",

    // list section
    "teacher.lateListTitle": "Late Students List (Grouped by Standard)",

    // table headers (generated in JS)
    "teacher.th.dateTime": "Date/Time",
    "teacher.th.name": "Name",
    "teacher.th.class": "Class",
    "teacher.th.remark": "Remark",

    "teacher.th.late": "Late",
    "teacher.th.pct": "%",

    // empty states (generated in JS)
    "teacher.empty.noRecords": "No records for this filter.",
    "teacher.empty.noNames": "No student names found in this range."
  },

  ms: {
    "teacher.title": "Papan Pemuka Guru Disiplin",
    "teacher.btn.logout": "Log Keluar",

    "teacher.filter": "Penapis",
    "teacher.range": "Julat",
    "teacher.range.daily": "Harian (Hari ini)",
    "teacher.range.weekly": "Mingguan (7 hari lepas)",
    "teacher.range.monthly": "Bulanan (Bulan ini)",
    "teacher.range.date": "Tarikh Tertentu",
    "teacher.pickDate": "Pilih Tarikh",
    "teacher.btn.clear": "Kosongkan",
    "teacher.pickDateHint": "Pilih Tarikh hanya berfungsi bila Julat = Tarikh Tertentu",

    "teacher.moreFilters": "Penapis Tambahan",
    "teacher.moreFiltersHint": "Tanda tahap/kelas untuk kecilkan carian.",
    "teacher.btn.filters": "Penapis",

    "teacher.levels": "Darjah",
    "teacher.classes": "Kelas",
    "teacher.btn.apply": "Guna Penapis",
    "teacher.btn.reset": "Set Semula",

    "teacher.pill.allLevels": "Semua Darjah",
    "teacher.pill.allClasses": "Semua Kelas",
    "teacher.pill.levelPrefix": "Darjah",

    "teacher.rangeLabel.today": "Hari ini",
    "teacher.rangeLabel.last7": "7 hari lepas",
    "teacher.rangeLabel.thisMonth": "Bulan ini",
    "teacher.rangeLabel.date": "Tarikh",
    "teacher.summary.totalLate": "Jumlah Lewat",

    "teacher.chart.barTitle.count": "Jumlah Lewat Mengikut Kelas",
    "teacher.chart.barTitle.pct": "% Lewat Mengikut Murid (Kelas Dipilih)",
    "teacher.chart.doughnutTitle": "% Lewat Mengikut Tahap",

    "teacher.freqTitle": "Kekerapan Lewat Murid (mengikut Kelas)",
    "teacher.freqHint":
      "Peratus dikira berdasarkan jumlah rekod lewat dalam kelas yang sama bagi julat dipilih.",
    "teacher.total": "jumlah",

    "teacher.lateListTitle": "Senarai Murid Lewat (Mengikut Darjah)",

    "teacher.th.dateTime": "Tarikh/Masa",
    "teacher.th.name": "Nama",
    "teacher.th.class": "Kelas",
    "teacher.th.remark": "Catatan",

    "teacher.th.late": "Lewat",
    "teacher.th.pct": "%",

    "teacher.empty.noRecords": "Tiada rekod untuk penapis ini.",
    "teacher.empty.noNames": "Tiada nama murid ditemui dalam julat ini."
  }
};

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = (lang === "ms") ? "ms" : "en";
  localStorage.setItem(STORAGE_KEY, currentLang);
}

export function t(key) {
  return DICT[currentLang]?.[key] ?? DICT.en?.[key] ?? "";
}

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = t(key);
    if (val) el.textContent = val;
  });

  // Also translate <option data-i18n="..."> labels (common gotcha)
  root.querySelectorAll("option[data-i18n]").forEach((opt) => {
    const key = opt.getAttribute("data-i18n");
    const val = t(key);
    if (val) opt.textContent = val;
  });
}

export function bindLangDropdown(selectId = "langSelect", onChange) {
  const sel = document.getElementById(selectId);
  if (!sel) return;

  sel.value = getLang();
  sel.addEventListener("change", () => {
    setLang(sel.value);
    applyI18n(document);
    if (typeof onChange === "function") onChange(getLang());
  });
}
