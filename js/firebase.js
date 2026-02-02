import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKLpZaKykVc166vwiw2uLMk8X71HVgSgA",
  authDomain: "skdkr2-a6a09.firebaseapp.com",
  projectId: "skdkr2-a6a09",
  storageBucket: "skdkr2-a6a09.firebasestorage.app",
  messagingSenderId: "303794142027",
  appId: "1:303794142027:web:2bceb3f86c3f4656e706ce"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
