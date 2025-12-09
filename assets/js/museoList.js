import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./firebaseconfig.js";


const listaMuseos = document.getElementById("listaMuseos");
const inputBuscar = document.getElementById("buscar");
const selectCategoria = document.getElementById("categoria");
const selectUbicacion = document.getElementById("ubicacion");
const btnFiltrar = document.getElementById("filtrar");

let museos = []; // Se guarda todo para filtros

console.log("¿DB cargado?: ", db);

// 1. Cargar museos desde Firebase
async function cargarMuseos() {
  listaMuseos.innerHTML = "<p>Cargando museos...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "museos"));

    museos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    mostrarMuseos(museos);

  } catch (error) {
    console.error("Error cargando museos:", error);
    listaMuseos.innerHTML = "<p>Error al cargar museos.</p>";
  }
}

// 2. Mostrar museos en pantalla
function mostrarMuseos(lista) {
  if (lista.length === 0) {
    listaMuseos.innerHTML = "<p>No se encontraron museos.</p>";
    return;
  }

  listaMuseos.innerHTML = lista.map(museo => `
    <div class="museo-card">
      <img src="${museo.imagen || 'img/default.jpg'}" alt="${museo.nombre}">
      <h3>${museo.nombre}</h3>
      <p>Ubicación: ${museo.ubicacion || 'Sin especificar'}</p>

      <button class="ver-mas" onclick="location.href='museoInfo.html?id=${museo.id}'">
        Ver más
      </button>
    </div>
  `).join("");
}

// 3. Filtros
btnFiltrar.addEventListener("click", () => {
  let texto = inputBuscar.value.toLowerCase();
  let categoria = selectCategoria.value;
  let ubicacion = selectUbicacion.value;

  let filtrados = museos.filter(m => 
    m.nombre.toLowerCase().includes(texto) &&
    (categoria ? m.categoria === categoria : true) &&
    (ubicacion ? m.ubicacion === ubicacion : true)
  );

  mostrarMuseos(filtrados);
});

// 4. Ejecutar al inicio
cargarMuseos();
