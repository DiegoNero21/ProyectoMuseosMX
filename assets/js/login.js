import { auth } from "../../assets/js/firebaseconfig.js";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const googleBtn = document.getElementById("loginGoogle");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("Inicio de sesión correcto");

    window.location.href = "../../pages/inicio/inicio.html";

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
});

googleBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);

    alert("Inicio con Google exitoso");
    window.location.href = "../../pages/inicio/inicio.html";

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
});
