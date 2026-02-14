// i8n-teacher.js

const STORAGE_KEY = "lang_teacher";

const DICT = {
  en: {
    // ===== Remarks =====
    "remark.woke": "Woke up late",
    "remark.alarm": "Alarm didn’t ring / battery died",
    "remark.slow": "Took too long to get ready (shower/clothes/bag)",
    "remark.forgot": "Forgot school items",
    "remark.parents": "Parent/guardian got ready late / sent late",
    "remark.bus": "School bus/van late / didn’t come",
    "remark.traffic": "Traffic jam / congested road",
    "remark.weather": "Bad weather (heavy rain/flood)",
    "remark.sick": "Mild sickness / not feeling well",
    "remark.family": "Morning family matter (send sibling, emergency)",
    "remark.other": "Other (type your own)",
    "remark.otherPh": "Type other reason…",

    // ===== Teacher =====
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

    "teacher.levels": "Levels",
    "teacher.classes": "Classes",
    "teacher.btn.apply": "Apply Filters",
    "teacher.btn.reset": "Reset",

    // pills
    "teacher.pill.allLevels": "All Levels",
    "teacher.pill.allClasses": "All Classes",
    "teacher.pill.levelPrefix": "Level",

    // summary
    "teacher.summaryTitle": "Summary",
    "teacher.summaryTotal": "Total Late",

    // range labels (for summary line)
    "teacher.rangeLabel.today": "Today",
    "teacher.rangeLabel.last7": "Last 7 days",
    "teacher.rangeLabel.thisMonth": "This month",
    "teacher.rangeLabel.date": "Date",

    // charts
    "teacher.chart.barTitle.classCount": "Late Count by Class",
    "teacher.chart.barTitle.studentPct": "Late % by Student (Selected Classes)",
    "teacher.chart.doughnutTitle": "Late % by Level",

    // frequency
    "teacher.freqTitle": "Student Late Frequency (by Class)",
    "teacher.freqHint":
      "Percent is based on total late records within the same class for the selected range.",
    "teacher.total": "total",

    // list section
    "teacher.lateListTitle": "Late Students List (Grouped by Level)",

    // table headers
    "teacher.th.dateTime": "Date/Time",
    "teacher.th.name": "Name",
    "teacher.th.class": "Class",
    "teacher.th.remark": "Remark",
    "teacher.th.late": "Late",
    "teacher.th.pct": "%",

    // empty states
    "teacher.empty.noRecords": "No records for this filter.",
    "teacher.empty.noNames": "No student names found in this range.",

    // errors
    "teacher.error.load": "Error loading records. Check Console (F12)."
  },

  ms: {
    // ===== Remarks =====
    "remark.woke": "Bangun lewat",
    "remark.alarm": "Alarm tak berbunyi / habis bateri",
    "remark.slow": "Lambat siap (mandi/pakaian/beg)",
    "remark.forgot": "Tertinggal barang sekolah",
    "remark.parents": "Ibu bapa/penjaga lambat bersiap / lewat hantar",
    "remark.bus": "Bas/van sekolah lewat / tak datang",
    "remark.traffic": "Jem trafik / jalan sesak",
    "remark.weather": "Cuaca buruk (hujan lebat/banjir)",
    "remark.sick": "Sakit ringan / kurang sihat",
    "remark.family": "Urusan keluarga pagi (hantar adik, kecemasan)",
    "remark.other": "Lain-lain (taip sendiri)",
    "remark.otherPh": "Taip sebab lain…",

    // ===== Teacher =====
    "teacher.title": "Papan Pemuka Guru Disiplin",
    "teacher.btn.logout": "Log Keluar",

    "teacher.filter": "Penapis",
    "teacher.range": "Tempoh",
    "teacher.range.daily": "Harian (Hari ini)",
    "teacher.range.weekly": "Mingguan (7 hari lepas)",
    "teacher.range.monthly": "Bulanan (Bulan ini)",
    "teacher.range.date": "Tarikh Tertentu",

    "teacher.pickDate": "Pilih Tarikh",
    "teacher.btn.clear": "Kosongkan",
    "teacher.pickDateHint": "Pilih Tarikh hanya berfungsi bila Tempoh = Tarikh Tertentu",

    "teacher.moreFilters": "Penapis Tambahan",
    "teacher.moreFiltersHint": "Tanda tahap/kelas untuk tapis keputusan.",
    "teacher.btn.filters": "Penapis",

    "teacher.levels": "Tahap",
    "teacher.classes": "Kelas",
    "teacher.btn.apply": "Guna Penapis",
    "teacher.btn.reset": "Reset",

    "teacher.pill.allLevels": "Semua Tahap",
    "teacher.pill.allClasses": "Semua Kelas",
    "teacher.pill.levelPrefix": "Tahap",

    "teacher.summaryTitle": "Ringkasan",
    "teacher.summaryTotal": "Jumlah Lewat",

    "teacher.rangeLabel.today": "Hari ini",
    "teacher.rangeLabel.last7": "7 hari lepas",
    "teacher.rangeLabel.thisMonth": "Bulan ini",
    "teacher.rangeLabel.date": "Tarikh",

    "teacher.chart.barTitle.classCount": "Jumlah Lewat Mengikut Kelas",
    "teacher.chart.barTitle.studentPct": "% Lewat Mengikut Murid (Kelas Dipilih)",
    "teacher.chart.doughnutTitle": "% Lewat Mengikut Tahap",

    "teacher.freqTitle": "Kekerapan Lewat Murid (Mengikut Kelas)",
    "teacher.freqHint":
      "Peratus dikira berdasarkan jumlah rekod lewat dalam kelas yang sama untuk tempoh dipilih.",
    "teacher.total": "jumlah",

    "teacher.lateListTitle": "Senarai Murid Lewat (Mengikut Tahap)",

    "teacher.th.dateTime": "Tarikh/Masa",
    "teacher.th.name": "Nama",
    "teacher.th.class": "Kelas",
    "teacher.th.remark": "Sebab",
    "teacher.th.late": "Lewat",
    "teacher.th.pct": "%",

    "teacher.empty.noRecords": "Tiada rekod untuk penapis ini.",
    "teacher.empty.noNames": "Tiada nama murid dijumpai dalam tempoh ini.",

    "teacher.error.load": "Ralat semasa memuatkan rekod. Sila semak Console (F12)."
  }
};

// ===== Language helpers =====
export function getLang() {
  return localStorage.getItem(STORAGE_KEY) || "en";
}

export function setLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}

// translate
export function t(key) {
  const lang = getLang();
  return DICT[lang]?.[key] ?? DICT.en?.[key] ?? key;
}

// ===== Apply i18n to DOM =====
export function applyI8n(root = document) {
  const lang = getLang();

  // text content
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (text) el.textContent = text;
  });

  // placeholders
  root.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    const text = DICT[lang]?.[key] ?? DICT.en?.[key] ?? key;
    el.setAttribute("placeholder", text);
  });

  // sync dropdown
  const sel = root.getElementById?.("langSelect") || document.getElementById("langSelect");
  if (sel) sel.value = lang;
}
