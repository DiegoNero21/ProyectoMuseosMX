import { auth, db } from "../../assets/js/firebaseconfig.js";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (password !== confirm) {
    alert("Las contraseñas no coinciden");
    return;
  }

  try {
    // Crear usuario en Firebase Auth
    const res = await createUserWithEmailAndPassword(auth, email, password);

    // Actualizar el nombre en Firebase Auth
    await updateProfile(res.user, {
      displayName: name
    });

    // Guardarlo en Firestore
    await setDoc(doc(db, "users", res.user.uid), {
      name: name,
      email: email,
      uid: res.user.uid,
      createdAt: new Date()
    });

    alert("Cuenta creada exitosamente");
    window.location.href = "../../pages/inicio/inicio.html";

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
});
