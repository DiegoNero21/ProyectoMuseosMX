import { db } from "./firebaseconfig.js";
import { doc, getDoc, getDocs, collection } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Función para convertir fechas
function convertirFecha(fecha) {
  if (!fecha) return null;
  if (fecha.toDate) return fecha.toDate();
  if (typeof fecha === "string") return new Date(fecha);
  if (fecha instanceof Date) return fecha;
  return null;
}

// Obtener ID de la URL
const params = new URLSearchParams(window.location.search);
const anuncioId = params.get("id");

async function mostrarDetalle() {
  const contenedor = document.getElementById("detalle-notificacion");

  if (!anuncioId || !contenedor) {
    contenedor.innerHTML = "<p>Notificación no encontrada.</p>";
    return;
  }

  contenedor.innerHTML = "<p>Cargando notificación...</p>";

  try {
    // Obtener anuncio
    const anuncioRef = doc(db, "anuncios", anuncioId);
    const anuncioSnap = await getDoc(anuncioRef);

    if (!anuncioSnap.exists()) {
      contenedor.innerHTML = "<p>Notificación no encontrada.</p>";
      return;
    }

    const anuncio = anuncioSnap.data();

    // Obtener nombre del museo
    let nombreMuseo = "Museo";
    if (anuncio.museoId) {
      const museosSnapshot = await getDocs(collection(db, "museos"));
      const museoData = museosSnapshot.docs.find(m => m.id === anuncio.museoId)?.data();
      if (museoData) nombreMuseo = museoData.nombre;
    }

    // Convertir fechas
    const fechaInicio = convertirFecha(anuncio.fechaInicio);
    const fechaFin = convertirFecha(anuncio.fechaFin);
    const fechaInicioStr = fechaInicio ? fechaInicio.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const fechaFinStr = fechaFin ? fechaFin.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    // Mostrar información completa
    contenedor.innerHTML = `
        <div class="detalle-card">
            <img src="${anuncio.imagen}" alt="${anuncio.titulo}">
            <h2>${anuncio.titulo}</h2>
            <p><strong>Museo:</strong> ${nombreMuseo}</p>
            <p><strong>Fechas:</strong> ${fechaInicioStr} al ${fechaFinStr}</p>
            <p>${anuncio.descripcion}</p>
            <p><strong>Publicado el:</strong> ${convertirFecha(anuncio.fechaPublicacion)?.toLocaleDateString('es-MX') || '-'}</p>
            <p><strong>Estado:</strong> ${anuncio.estado ? "Activo" : "Inactivo"}</p>
            <button id="btnVolver" class="btn-detalles">← Volver</button>
        </div>
        `;

    
  } catch (error) {
    console.error("Error al cargar notificación:", error);
    contenedor.innerHTML = "<p>No se pudo cargar la notificación.</p>";
  }

  document.getElementById("btnVolver").addEventListener("click", () => {
  // Regresa a la página anterior en el historial del navegador
  window.history.back();
});
}

mostrarDetalle();
