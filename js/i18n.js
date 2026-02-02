const DICT = {
  en: {
    // Common
    "app.title": "Late Tracker",
    "lang.label": "Language",
    "btn.logout": "Logout",

    // Prefect
    "prefect.title": "Prefect On Duty",
    "prefect.recordTitle": "Record Late Student",
    "prefect.studentName": "Student Name",
    "prefect.studentNamePh": "Type student name",
    "prefect.class": "Class",
    "prefect.date": "Date",
    "prefect.time": "Time",
    "prefect.remark": "Remark (Why late?)",
    "prefect.remarkPh": "e.g., Traffic / Overslept / Sick",
    "prefect.submit": "Submit",
    "prefect.latestTitle": "Students Record",
    "prefect.latestSubtitle": "Double-check what you entered",
     
    "table.datetime": "Date/Time",
    "table.name": "Name",
    "table.class": "Class",
    "table.level": "Level",
    "table.remark": "Remark",
   "prefect.noSubmissions": "No submissions yet.",
 
   "remark.pick": "-- Choose reason --",
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

    "table.actions": "Actions",
"btn.edit": "Edit",
"btn.delete": "Delete",
"confirm.delete": "Delete this record?",

"Select Student": "-- Select Student --",
"Not Found": "(No students found)",

"btn.prev": "Previous",
"btn.next": "Next",

"prefect.saved": "Saved!",


/* <-----Teacher's-----> */



  },

  ms: {
    // Common
    "app.title": "Jejak Lewat",
    "lang.label": "Bahasa",
    "btn.logout": "Log Keluar",

    // Prefect
    "prefect.title": "Pengawas Bertugas",
    "prefect.recordTitle": "Rekod Murid Lewat",
    "prefect.studentName": "Nama Murid",
    "prefect.studentNamePh": "Taip nama murid",
    "prefect.class": "Kelas",
    "prefect.date": "Tarikh",
    "prefect.time": "Masa",
    "prefect.remark": "Catatan (Sebab lewat?)",
    "prefect.remarkPh": "cth: Kesesakan / Terlewat bangun / Sakit",
    "prefect.submit": "Hantar",
    "prefect.latestTitle": "Rekod Murid",
    "prefect.latestSubtitle": "Semak semula rekod yang dihantar",

    "table.datetime": "Tarikh/Masa",
    "table.name": "Nama",
    "table.class": "Kelas",
    "table.level": "Tahap",
    "table.remark": "Catatan",
    "prefect.noSubmissions": "Tiada rekod lagi.",

    "remark.pick": "-- Pilih sebab --",
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

"table.actions": "Tindakan",
"btn.edit": "Edit",
"btn.delete": "Padam",
"confirm.delete": "Padam rekod ini?",

"Select Student": "-- Pilih Murid --",
"Not Found": "(Tiada data murid dijumpai)",

"btn.prev": "Sebelum",
"btn.next": "Seterusnya",

"prefect.saved": "Disimpan!",


/* <----Teacher's----> */


  }
};

/** Prefect-only language setting */
export function getLang() {
  return localStorage.getItem("lang_prefect") || "en";
}

export function setLang(lang) {
  localStorage.setItem("lang_prefect", lang);
  applyI18n(lang);
}

export function t(key) {
  const lang = getLang();
  return DICT[lang]?.[key] ?? DICT.en[key] ?? key;
}

export function applyI18n(lang = getLang()) {
  // Text nodes
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = DICT[lang]?.[key] ?? DICT.en[key] ?? key;
  });

  // Placeholders
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    el.setAttribute("placeholder", DICT[lang]?.[key] ?? DICT.en[key] ?? key);
  });

  // Select options
  document.querySelectorAll("option[data-i18n-opt]").forEach(opt => {
    const key = opt.getAttribute("data-i18n-opt");
    opt.textContent = DICT[lang]?.[key] ?? DICT.en[key] ?? key;
  });

  // Set dropdown value if exists
  const sel = document.getElementById("langSelect");
  if (sel) sel.value = lang;
}
