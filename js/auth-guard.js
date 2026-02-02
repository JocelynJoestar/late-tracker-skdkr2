import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export function attachLogout(buttonId = "logoutBtn") {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./login.html";
  });
}

export async function requireRole(allowedRoles = []) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "./login.html";
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        document.body.innerHTML = `<div class="container"><p class="error">No role found. Create Firestore doc users/{uid} with role.</p></div>`;
        return;
      }
      const role = snap.data().role;
      if (!allowedRoles.includes(role)) {
        window.location.href = role === "teacher" ? "./teacher.html" : "./prefect.html";
        return;
      }
      resolve({ user, role, profile: snap.data() });
    });
  });
}
