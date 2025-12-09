import { auth } from "../../assets/js/firebaseconfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario autenticado:", user.email);

    if (window.location.pathname.includes("login")) {
      window.location.href = "../../pages/inicio/inicio.html";
    }

  } else {
    console.log("Ningún usuario autenticado");

    if (window.location.pathname.includes("inicio")) {
      window.location.href = "../../pages/login/login.html";
    }
  }
});
