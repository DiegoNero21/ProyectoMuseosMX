
// 🍔 Menú responsivo
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}
/* -----------------------------------------------------------
   🍔 Menú responsivo y modo oscuro se manejan desde navbar.js
------------------------------------------------------------ */

/* -----------------------------------------------------------
   📌 Firebase Firestore
------------------------------------------------------------ */
import { db } from "./firebaseconfig.js";
import { collection, getDocs, query, orderBy } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* -----------------------------------------------------------
   📌 Función auxiliar para convertir fechas
------------------------------------------------------------ */
function convertirFecha(fecha) {
  if (!fecha) return null;
  if (fecha.toDate) return fecha.toDate(); // Timestamp de Firestore
  if (typeof fecha === "string") return new Date(fecha);
  if (fecha instanceof Date) return fecha;
  return null;
}

/* -----------------------------------------------------------
   📌 Cargar museos
------------------------------------------------------------ */
async function cargarMuseos() {
  const contenedor = document.getElementById("museos-container");
  if (!contenedor) return;

  contenedor.innerHTML = "<p>Cargando museos...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "museos"));
    contenedor.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const museo = doc.data();
      const card = document.createElement("article");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${museo.imagen}" alt="${museo.nombre}">
        <h4>${museo.nombre}</h4>
        <p>${museo.descripcion}</p>
        <a href="../museoInfo/museoInfo.html?id=${doc.id}" class="btn-detalles">Ver más</a>
      `;

      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando museos:", error);
    contenedor.innerHTML = "<p>Error al cargar museos.</p>";
  }
}
cargarMuseos();

/* -----------------------------------------------------------
   📌 Cargar obras
------------------------------------------------------------ */
async function cargarObras() {
  const obrasContainer = document.getElementById("obras-container");
  if (!obrasContainer) return;

  try {
    const querySnapshot = await getDocs(collection(db, "obras"));
    obrasContainer.innerHTML = "";

    querySnapshot.forEach(doc => {
      const obra = doc.data();
      const obraHTML = `
        <div class="obra-card">
          <img src="${obra.imagen}" alt="${obra.titulo}">
          <h3>${obra.titulo}</h3>
          <p>${obra.autor} — ${obra.anio}</p>
          <a href="../obras/obra.html?id=${doc.id}" class="btn-detalles">Ver más</a>
        </div>
      `;
      obrasContainer.insertAdjacentHTML("beforeend", obraHTML);
    });

  } catch (error) {
    console.error("Error cargando obras:", error);
  }
}
cargarObras();

/* -----------------------------------------------------------
   📌 Cargar exposiciones (anuncios)
------------------------------------------------------------ */
async function cargarExposiciones() {
  const eventosContainer = document.querySelector(".eventos .grid");
  if (!eventosContainer) return;

  eventosContainer.innerHTML = "<p>Cargando exposiciones...</p>";

  try {
    // Traer museos una sola vez para mapear por ID
    const museosSnapshot = await getDocs(collection(db, "museos"));
    const museosMap = {};
    museosSnapshot.forEach(doc => {
      museosMap[doc.id] = doc.data().nombre;
    });

    const hoy = new Date();
    const q = query(collection(db, "anuncios"), orderBy("fechaInicio", "asc"));
    const querySnapshot = await getDocs(q);

    eventosContainer.innerHTML = "";

    querySnapshot.forEach(doc => {
      const anuncio = doc.data();

      // Convertir fechas
      const fechaInicio = convertirFecha(anuncio.fechaInicio);
      const fechaFin = convertirFecha(anuncio.fechaFin);
      if (!fechaInicio || !fechaFin) return;

      // Mostrar solo anuncios activos y vigentes
      if (!anuncio.estado || fechaFin < hoy) return;

      const fechaInicioStr = fechaInicio.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
      const fechaFinStr = fechaFin.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

      const nombreMuseo = anuncio.museoId ? (museosMap[anuncio.museoId] || "Museo") : "Museo";

      const card = document.createElement("article");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${anuncio.imagen}" alt="${anuncio.titulo}">
        <h4>${anuncio.titulo}</h4>
        <p>${anuncio.descripcion}</p>
        <p><strong>${nombreMuseo}</strong> — ${fechaInicioStr} al ${fechaFinStr}</p>
      `;

      eventosContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando exposiciones:", error);
    eventosContainer.innerHTML = "<p>No se pudieron cargar las exposiciones.</p>";
  }
}
cargarExposiciones();
