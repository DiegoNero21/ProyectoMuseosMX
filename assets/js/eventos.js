import { db } from "./firebaseconfig.js";
import { collection, getDocs, query, orderBy } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

function convertirFecha(fecha) {
  if (!fecha) return null;
  if (fecha.toDate) return fecha.toDate();
  if (typeof fecha === "string") return new Date(fecha);
  if (fecha instanceof Date) return fecha;
  return null;
}

let museosMap = {}; // Para mostrar nombres de museos

async function cargarNotificaciones() {
  const listaContainer = document.getElementById("listaAnuncios");
  listaContainer.innerHTML = "<p>Cargando notificaciones...</p>";

  try {
    // Traer museos para mapear id -> nombre
    const museosSnapshot = await getDocs(collection(db, "museos"));
    museosSnapshot.forEach(doc => {
      museosMap[doc.id] = doc.data().nombre;
    });

    // Traer anuncios ordenados por fechaInicio
    const q = query(collection(db, "anuncios"), orderBy("fechaInicio", "asc"));
    const querySnapshot = await getDocs(q);

    listaContainer.innerHTML = "";

    const hoy = new Date();

    querySnapshot.forEach(doc => {
      const anuncio = doc.data();

      // Mostrar solo anuncios activos y vigentes
      const fechaInicio = convertirFecha(anuncio.fechaInicio);
      const fechaFin = convertirFecha(anuncio.fechaFin);
      if (!anuncio.estado || !fechaFin || fechaFin < hoy) return;

      const fechaStr = `${fechaInicio.toLocaleDateString('es-MX')} - ${fechaFin.toLocaleDateString('es-MX')}`;
      const nombreMuseo = anuncio.museoId ? (museosMap[anuncio.museoId] || "Museo") : "Museo";

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${anuncio.imagen}" alt="${anuncio.titulo}">
        <h4>${anuncio.titulo}</h4>
        <p><strong>Museo:</strong> ${nombreMuseo}</p>
        <p>${fechaStr}</p>
        <p>${anuncio.descripcion}</p>
        <a href="../Eventos/eventoInfo.html?id=${doc.id}" class="btn-detalles">Ver más</a>
      `;
      listaContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando notificaciones:", error);
    listaContainer.innerHTML = "<p>No se pudieron cargar las notificaciones.</p>";
  }
}

// Ejecutar al cargar la página
cargarNotificaciones();
