import { auth, db } from "./firebase.js";
import { signInAnonymously, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const msg = document.getElementById("msg");

const teacherForm = document.getElementById("teacherForm");
const teacherBtn = document.getElementById("teacherBtn");
const prefectBtn = document.getElementById("prefectBtn");

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

teacherBtn.addEventListener("click", () => {
  teacherForm.style.display = teacherForm.style.display === "none" ? "block" : "none";
});

prefectBtn.addEventListener("click", async () => {
  msg.textContent = "";
  msg.className = "";
  try {
    await signInAnonymously(auth); // no email/password
    window.location.href = "./prefect.html";
  } catch (e) {
    msg.className = "error";
    msg.textContent = e.message;
  }
});

loginBtn.addEventListener("click", async () => {
  msg.textContent = "";
  msg.className = "";
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value.trim(), password.value);

    // teacher must have users/{uid} role=teacher
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists() || snap.data().role !== "teacher") {
      msg.className = "error";
      msg.textContent = "Access denied. This account is not a Discipline Teacher.";
      return;
    }

    window.location.href = "./teacher.html";
  } catch (e) {
    msg.className = "error";
    msg.textContent = e.message;
  }
});
