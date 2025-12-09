import { db } from "./firebaseconfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Obtener ID desde la URL
const params = new URLSearchParams(window.location.search);
const museoID = params.get("id");

if (!museoID) {
  alert("No se encontró el ID del museo.");
}

// Referencias a elementos HTML
const nombreEl = document.getElementById("museo-nombre");
const descEl = document.getElementById("museo-descripcion");
const direccionEl = document.getElementById("museo-direccion");
const ciudadEl = document.getElementById("museo-ciudad");
const horarioEl = document.getElementById("museo-horario");
const telefonoEl = document.getElementById("museo-telefono");
const creadoEl = document.getElementById("museo-creado");
const actualizadoEl = document.getElementById("museo-actualizado");

const imagenEl = document.getElementById("museo-imagen");
const urlEl = document.getElementById("museo-url");

// Convertir Timestamp a texto
function formatearFecha(ts) {
  if (!ts) return "No disponible";
  return ts.toDate().toLocaleDateString();
}

async function cargarMuseo() {
  try {
    const ref = doc(db, "museos", museoID);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      nombreEl.textContent = "Museo no encontrado";
      return;
    }

    const museo = snapshot.data();

    // Insertar datos
    nombreEl.textContent = museo.nombre ?? "Sin nombre";
    descEl.textContent = museo.descripcion ?? "Sin descripción";
    direccionEl.textContent = museo.direccion ?? "No disponible";
    ciudadEl.textContent = museo.ciudad ?? "No disponible";
    horarioEl.textContent = museo.horario ?? "No disponible";
    telefonoEl.textContent = museo.telefono ?? "No disponible";

    creadoEl.textContent = formatearFecha(museo.creadoEn);
    actualizadoEl.textContent = formatearFecha(museo.actualizadoEn);

    imagenEl.src = museo.imagen ?? "";
    imagenEl.alt = museo.nombre;

    if (museo.sitioweb) {
      urlEl.href = museo.sitioweb;
    } else {
      urlEl.style.display = "none";
    }

  } catch (error) {
    console.error("Error al cargar museo:", error);
  }
}

cargarMuseo();
