import { db } from "./firebaseconfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const obrasGrid = document.getElementById("obras-grid");

async function cargarObras() {
  try {
    const ref = collection(db, "obras");
    const snapshot = await getDocs(ref);

    obrasGrid.innerHTML = "";

    snapshot.forEach(doc => {
      const obra = doc.data();

      const card = document.createElement("div");
      card.classList.add("obra-card");

      card.innerHTML = `
        <img src="${obra.imagen}" alt="${obra.titulo}">
        <h3>${obra.titulo}</h3>
        <p>${obra.descripcion}</p>
        <a href="obra.html?id=${doc.id}" class="btn-detalles">Ver más</a>
      `;

      obrasGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Error al cargar obras:", error);
  }
}

cargarObras();
