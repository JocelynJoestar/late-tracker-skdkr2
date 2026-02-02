import { auth, db } from "./firebase.js";
import { attachLogout } from "./auth-guard.js";
import { onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { applyI18n, getLang, setLang, t } from "./i18n.js";

import {
  collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, Timestamp,
  doc, deleteDoc, updateDoc,
  startAfter, endBefore, limitToLast
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

attachLogout();

/** ===== Students JSON (Option 1) ===== */
const STUDENTS_JSON_PATH = "./dataStudents.json";
let STUDENTS_BY_CLASS = {};

// ===== Pagination =====
const PAGE_SIZE = 10;
let pageNumber = 1;
let firstDoc = null;
let lastDoc = null;

// ===== Classes =====
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
const langSelect = document.getElementById("langSelect");

const classSelect = document.getElementById("className");
const studentName = document.getElementById("studentName");
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");

const remarkSelect = document.getElementById("remarkSelect");
const remarkOther = document.getElementById("remarkOther");

const msg = document.getElementById("msg");
const rows = document.getElementById("rows");
const whoami = document.getElementById("whoami");

// pagination buttons from your updated HTML
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

// ===== Helpers =====
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function fillClasses() {
  if (!classSelect) return;
  classSelect.innerHTML = CLASSES.map(c => `<option value="${c.className}">${c.className}</option>`).join("");
}

function getLevelForClass(className) {
  return CLASSES.find(c => c.className === className)?.level ?? 0;
}

function combineDateTime(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return Timestamp.fromDate(new Date(y, m - 1, d, hh, mm, 0));
}

function translateRemark(raw) {
  const val = String(raw || "");
  return val.startsWith("remark.") ? t(val) : val;
}

function getRemarkValue() {
  if (!remarkSelect) return "";
  const v = (remarkSelect.value || "").trim();
  if (v === "__OTHER__") return (remarkOther?.value || "").trim();
  return v;
}

function resetRemark() {
  if (!remarkSelect) return;
  remarkSelect.selectedIndex = 0;
  if (remarkOther) {
    remarkOther.value = "";
    remarkOther.style.display = "none";
  }
}

// ===== Students.json loader =====
async function loadStudentsJson() {
  const res = await fetch(STUDENTS_JSON_PATH, { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load students list. Check dataStudents.json path.");
  const data = await res.json();

  const normalized = {};
  for (const [cls, list] of Object.entries(data || {})) {
    const arr = Array.isArray(list) ? list.map(x => String(x).trim()).filter(Boolean) : [];
    arr.sort((a, b) => a.localeCompare(b));
    normalized[String(cls).trim()] = arr;
  }
  STUDENTS_BY_CLASS = normalized;
}

function fillStudentsForClass(className) {
  if (!studentName) return;

  const list = STUDENTS_BY_CLASS[className] || [];
  const placeholder = t("Select Student") || (getLang() === "ms" ? "-- Pilih Murid --" : "-- Select Student --");
  const noneFound = t("Not Found") || (getLang() === "ms" ? "(Tiada murid dijumpai)" : "(No students found)");

  if (list.length === 0) {
    studentName.innerHTML = `<option value="">${escapeHtml(noneFound)}</option>`;
    return;
  }

  studentName.innerHTML = [
    `<option value="" disabled selected>${escapeHtml(placeholder)}</option>`,
    ...list.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`)
  ].join("");
}

// ===== Paginated records =====
async function loadRecordsPage(direction = "first") {
  if (!rows) return;
  rows.innerHTML = "";

  let qBase = query(
    collection(db, "late_records"),
    orderBy("dateTime", "desc"),
    limit(PAGE_SIZE)
  );

  if (direction === "next" && lastDoc) {
    qBase = query(
      collection(db, "late_records"),
      orderBy("dateTime", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );
    pageNumber += 1;
  }

  if (direction === "prev" && firstDoc) {
    qBase = query(
      collection(db, "late_records"),
      orderBy("dateTime", "desc"),
      endBefore(firstDoc),
      limitToLast(PAGE_SIZE)
    );
    pageNumber = Math.max(1, pageNumber - 1);
  }

  const snap = await getDocs(qBase);

  firstDoc = snap.docs[0] || null;
  lastDoc = snap.docs[snap.docs.length - 1] || null;

  const html = snap.docs.map(d => {
    const r = d.data();
    const id = d.id;

    const dt = r.dateTime?.toDate ? r.dateTime.toDate().toLocaleString() : "";
    const remarkText = translateRemark(r.remark || "");

    return `<tr data-id="${id}">
      <td>${dt}</td>
      <td>${escapeHtml(r.studentName || "")}</td>
      <td>${escapeHtml(r.className || "")}</td>
      <td>${r.level ?? ""}</td>
      <td>${escapeHtml(remarkText)}</td>
      <td style="white-space:nowrap;">
        <button class="btn-ghost btn-edit" data-id="${id}"
          style="background:#B0E0E6; border:1px solid rgba(0,0,0,.1);">
          ${escapeHtml(t("btn.edit") || "Edit")}
        </button>
        <button class="btn-ghost btn-del" data-id="${id}"
          style="margin-left:6px; background:#F08080; border:1px solid rgba(0,0,0,.1);">
          ${escapeHtml(t("btn.delete") || "Delete")}
        </button>
      </td>
    </tr>`;
  }).join("");

  rows.innerHTML = html || `<tr><td colspan="6" class="small">${t("prefect.noSubmissions") || "No records."}</td></tr>`;

  // enable/disable buttons
  if (pageInfo) pageInfo.textContent = `Page ${pageNumber}`;
  if (prevBtn) prevBtn.disabled = pageNumber <= 1;

  // check if next page exists (look ahead 1 doc)
  let hasNext = false;
  if (lastDoc) {
    const qNext = query(
      collection(db, "late_records"),
      orderBy("dateTime", "desc"),
      startAfter(lastDoc),
      limit(1)
    );
    const nextSnap = await getDocs(qNext);
    hasNext = !nextSnap.empty;
  }
  if (nextBtn) nextBtn.disabled = !hasNext;
}

// ===== Auth =====
async function ensureSignedInAnonymously() {
  if (auth.currentUser) return auth.currentUser;

  const restoredUser = await new Promise((resolve) => {
    let done = false;
    const unsub = onAuthStateChanged(auth, (u) => {
      if (done) return;
      done = true;
      unsub();
      resolve(u);
    });

    setTimeout(() => {
      if (done) return;
      done = true;
      unsub();
      resolve(null);
    }, 1500);
  });

  if (restoredUser) return restoredUser;

  await signInAnonymously(auth);
  return auth.currentUser;
}

// ===== Init =====
(async () => {
  try {
    applyI18n();

    if (langSelect) {
      langSelect.value = getLang();
      langSelect.addEventListener("change", async (e) => {
        setLang(e.target.value);
        applyI18n();
        fillStudentsForClass(classSelect?.value || "");
        try { await loadRecordsPage("first"); } catch {}
      });
    }

    fillClasses();

    try {
      await loadStudentsJson();
    } catch (e) {
      if (msg) { msg.className = "error"; msg.textContent = e.message; }
      STUDENTS_BY_CLASS = {};
    }

    if (classSelect) {
      fillStudentsForClass(classSelect.value);
      classSelect.addEventListener("change", () => fillStudentsForClass(classSelect.value));
    }

    const now = new Date();
    if (dateEl) dateEl.value = now.toISOString().slice(0, 10);
    if (timeEl) timeEl.value = now.toTimeString().slice(0, 5);

    if (remarkSelect && remarkOther) {
      remarkSelect.addEventListener("change", () => {
        const isOther = remarkSelect.value === "__OTHER__";
        remarkOther.style.display = isOther ? "block" : "none";
        if (!isOther) remarkOther.value = "";
      });
    }

    const user = await ensureSignedInAnonymously();
    if (whoami) whoami.textContent = "Pengawas • Kiosk Mode";

    // first page
    pageNumber = 1;
    firstDoc = null;
    lastDoc = null;
    await loadRecordsPage("first");

    // pagination buttons
    if (nextBtn) nextBtn.addEventListener("click", async () => {
      await loadRecordsPage("next");
    });
    if (prevBtn) prevBtn.addEventListener("click", async () => {
      await loadRecordsPage("prev");
    });

    // edit/delete actions (event delegation)
    if (rows) {
      rows.addEventListener("click", async (e) => {
        const editBtn = e.target.closest(".btn-edit");
        const delBtn = e.target.closest(".btn-del");
        if (!editBtn && !delBtn) return;

        const id = (editBtn || delBtn).dataset.id;
        if (!id) return;

        if (delBtn) {
          const ok = confirm(t("confirm.delete") || "Delete this record?");
          if (!ok) return;

          try {
            await deleteDoc(doc(db, "late_records", id));
            // easiest: reload first page
            pageNumber = 1;
            firstDoc = null;
            lastDoc = null;
            await loadRecordsPage("first");
          } catch (err) {
            if (msg) { msg.className = "error"; msg.textContent = err.message; }
          }
          return;
        }

        if (editBtn) {
          const currentRow = editBtn.closest("tr");
          const currentRemark = currentRow?.children?.[4]?.textContent || "";

          const newRemark = prompt(t("prompt.editRemark") || "Edit remark:", currentRemark);
          if (newRemark === null) return;

          const trimmed = newRemark.trim();
          if (!trimmed) return;

          try {
            await updateDoc(doc(db, "late_records", id), { remark: trimmed });
            pageNumber = 1;
            firstDoc = null;
            lastDoc = null;
            await loadRecordsPage("first");
          } catch (err) {
            if (msg) { msg.className = "error"; msg.textContent = err.message; }
          }
        }
      });
    }

    // Submit
    document.getElementById("submitBtn").addEventListener("click", async () => {
      if (msg) { msg.textContent = ""; msg.className = ""; }

      const cls = classSelect?.value || "";
      const name = (studentName?.value || "").trim();
      const level = getLevelForClass(cls);
      const remarkValue = getRemarkValue();

      if (!cls || !name || !dateEl?.value || !timeEl?.value) {
        if (msg) {
          msg.className = "error";
          msg.textContent =
            t("prefect.errRequired") ||
            (getLang() === "ms"
              ? "Sila pilih kelas, nama murid, tarikh dan masa."
              : "Please select class, student name, date, and time.");
        }
        return;
      }

      if (!remarkValue) {
        if (msg) {
          msg.className = "error";
          msg.textContent = t("prefect.errRemark") || "Please select a remark.";
        }
        return;
      }

      try {
        await addDoc(collection(db, "late_records"), {
          studentName: name,
          className: cls,
          level,
          dateTime: combineDateTime(dateEl.value, timeEl.value),
          remark: remarkValue,
          createdByUid: auth.currentUser.uid,
          createdAt: serverTimestamp()
        });

        if (msg) { msg.className = "success"; msg.textContent = t("prefect.saved") || "Saved!"; }

        if (studentName) studentName.selectedIndex = 0;
        resetRemark();

        // reload first page to show newest record
        pageNumber = 1;
        firstDoc = null;
        lastDoc = null;
        await loadRecordsPage("first");
      } catch (e) {
        if (msg) { msg.className = "error"; msg.textContent = e.message; }
      }
    });

  } catch (e) {
    if (msg) {
      msg.className = "error";
      msg.textContent = e.message.includes("operation-not-allowed")
        ? "Anonymous login is not enabled in Firebase. Enable it in Authentication > Sign-in method > Anonymous."
        : e.message;
    }
  }
})();
