import { db } from "./firebaseconfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  initObraPage();
});

async function initObraPage() {
  // Obtener ID desde la URL
  const params = new URLSearchParams(window.location.search);
  const obraId = params.get("id");
  if (!obraId) {
    console.error("No se recibió ID de obra en la URL.");
    showNotFound();
    return;
  }

  // Elementos del DOM
  const imgEl = document.getElementById("obra-img");
  const tituloEl = document.getElementById("obra-titulo");
  const autorEl = document.getElementById("obra-autor");
  const descEl = document.getElementById("obra-descripcion");
  const tecnicaEl = document.getElementById("obra-tecnica");
  const dimensionesEl = document.getElementById("obra-dimensiones");
  const ubicacionEl = document.getElementById("obra-ubicacion");
  const detallesOpcionalesContainer = document.getElementById("obra-detalles-opcionales");

  const setText = (el, text) => { if (el) el.textContent = text ?? ""; };
  const setSrc = (el, src, altText = "") => { if (el) { el.src = src || ""; if (altText) el.alt = altText; } };

  try {
    const obraRef = doc(db, "obras", obraId);
    const obraSnap = await getDoc(obraRef);

    if (!obraSnap.exists()) {
      console.error("La obra no existe en Firestore.");
      showNotFound();
      return;
    }

    const obra = obraSnap.data();

    // Asignaciones principales
    setSrc(imgEl, obra.imagen || obra.imagenURL || "../../assets/img/placeholder.jpg", obra.titulo || "Obra");
    setText(tituloEl, obra.titulo || "Sin título");
    setText(autorEl, obra.artista || obra.autor || "Autor desconocido");
    setText(descEl, obra.descripcion || "Sin descripción.");
    setText(tecnicaEl, obra.tecnica || "N/A");
    setText(dimensionesEl, obra.dimensiones || "No especificado");

    // Ubicación
    if (obra.museoId) {
      try {
        const museoRef = doc(db, "museos", obra.museoId);
        const museoSnap = await getDoc(museoRef);
        if (museoSnap.exists()) {
          const museo = museoSnap.data();
          setText(ubicacionEl, museo.nombre || `${museo.ciudad || ""} ${museo.direccion || ""}`.trim() || obra.museoId);
        } else {
          setText(ubicacionEl, obra.museoId);
        }
      } catch (err) {
        console.warn("No se pudo obtener museo por museoId:", err);
        setText(ubicacionEl, obra.museoId);
      }
    } else {
      setText(ubicacionEl, "No disponible");
    }

    // Detalles opcionales
    if (detallesOpcionalesContainer) detallesOpcionalesContainer.innerHTML = "";
    const optionalMap = {
      anio: obra.anio,
      valor: obra.valor,
      estado: obra.estado,
      observaciones: obra.observaciones,
      exhibida: (typeof obra.exhibida !== "undefined") ? (obra.exhibida ? "Sí" : "No") : undefined
    };

    for (const [key, val] of Object.entries(optionalMap)) {
      if (typeof val !== "undefined" && val !== null && String(val).trim() !== "") {
        const p = document.createElement("p");
        p.className = "obra-extra";
        const label = {
          anio: "Año",
          valor: "Valor",
          estado: "Estado",
          observaciones: "Observaciones",
          exhibida: "En exhibición"
        }[key] || key;
        p.innerHTML = `<strong>${label}:</strong> ${val}`;
        detallesOpcionalesContainer.appendChild(p);
      }
    }

  } catch (error) {
    console.error("Error cargando obra:", error);
    showNotFound();
  }
}

function showNotFound() {
  const tituloEl = document.getElementById("obra-titulo");
  if (tituloEl) tituloEl.textContent = "Obra no encontrada";

  const imgEl = document.getElementById("obra-img");
  if (imgEl) imgEl.style.display = "none";

  const descEl = document.getElementById("obra-descripcion");
  if (descEl) descEl.textContent = "";

  const detallesOpcionalesContainer = document.getElementById("obra-detalles-opcionales");
  if (detallesOpcionalesContainer) detallesOpcionalesContainer.innerHTML = "";

  const autorEl = document.getElementById("obra-autor");
  if (autorEl) autorEl.textContent = "";
}
