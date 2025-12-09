// navbar.js - VERSIÓN SIMPLIFICADA PARA TU ESTRUCTURA
import { auth } from "./firebaseconfig.js";
import { initSpeech } from './speech.js';

// =============================
// 1. CARGAR NAVBAR
// =============================
async function loadNavbar() {
  try {
    const response = await fetch("../../components/navbar/navbar.html");
    if (!response.ok) throw new Error("No se pudo cargar la navbar");

    const navbarHTML = await response.text();
    const container = document.getElementById("navbar-container");

    if (container) {
      container.innerHTML = navbarHTML;
      initializeNavbar();
    }
  } catch (error) {
    console.error("Error cargando navbar:", error);
    // Fallback mínimo
    document.getElementById("navbar-container").innerHTML = `
      <nav style="padding: 1rem; background: #333; color: white; position: fixed; top: 0; width: 100%; z-index: 1000;">
        <div>Museos MX</div>
      </nav>
    `;
  }
}

// =============================
// 2. INICIALIZAR NAVBAR
// =============================
function initializeNavbar() {
  console.log("Inicializando navbar");

  const body = document.body;
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const accessibilityBtn = document.getElementById("accessibility-menu-toggle");
  const accessibilityMenu = document.querySelector(
    ".accessibility-dropdown-menu"
  );

  // =============================
  // A. MENÚ HAMBURGUESA
  // =============================
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.classList.toggle("active");
      menuToggle.textContent = navLinks.classList.contains("active")
        ? "✕"
        : "☰";
    });
  }

  // =============================
  // B. MENÚ DE ACCESIBILIDAD - VERSIÓN CORREGIDA
  // =============================
  if (accessibilityBtn && accessibilityMenu) {
    // PREVENIR que el menú herede filtros
    accessibilityMenu.style.cssText = `
        filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        isolation: isolate !important;
        transform: translateZ(100px) !important;
        position: absolute !important;
        z-index: 10003 !important;
    `;

    accessibilityBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // FORZAR reset de estilos antes de mostrar
      accessibilityMenu.style.filter = "none";
      accessibilityMenu.style.backdropFilter = "none";
      accessibilityMenu.style.webkitBackdropFilter = "none";

      // Mostrar/ocultar
      accessibilityMenu.classList.toggle("active");

      // Cerrar otros menús
      const profileCard = document.getElementById("profile-card");
      if (profileCard && profileCard.classList.contains("active")) {
        profileCard.classList.remove("active");
      }
    });

    // Asegurar que el menú no cierre accidentalmente
    accessibilityMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Si se hace clic en un botón del menú
      if (
        e.target.closest(".accessibility-option") ||
        e.target.closest(".reset-btn")
      ) {
        // Aplicar estilo de reset inmediato
        accessibilityMenu.style.filter = "none";

        // Cerrar después de un delay
        setTimeout(() => {
          accessibilityMenu.classList.remove("active");
        }, 300);
      }
    });

    document.addEventListener("click", (e) => {
      if (
        !accessibilityBtn.contains(e.target) &&
        !accessibilityMenu.contains(e.target)
      ) {
        accessibilityMenu.classList.remove("active");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        accessibilityMenu.classList.contains("active")
      ) {
        accessibilityMenu.classList.remove("active");
      }
    });

    // PREVENIR que los elementos hijos hereden filtros
    accessibilityMenu.querySelectorAll("*").forEach((el) => {
      el.style.filter = "none";
      el.style.backdropFilter = "none";
      el.style.webkitBackdropFilter = "none";
    });
  }

  // =============================
  // C. ESTADOS DE ACCESIBILIDAD
  // =============================
  let accessibilityState = {
    darkMode: localStorage.getItem("theme") === "dark",
    negativeMode: false,
    highContrast: false,
    grayscale: false,
    readability: false,
  };

  const savedAccessibility = localStorage.getItem("accessibilityState");
  if (savedAccessibility) {
    try {
      const savedState = JSON.parse(savedAccessibility);
      accessibilityState = { ...accessibilityState, ...savedState };
    } catch (e) {
      console.error("Error al cargar accesibilidad:", e);
    }
  }

  // =============================
  // D. FUNCIÓN CRÍTICA: APLICAR FILTROS SIN MOVER SCROLL
  // =============================
  function applyAccessibilityFilters() {
    // 1. GUARDAR POSICIÓN DE SCROLL ANTES DE CUALQUIER COSA
    const savedScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    // 2. Crear o encontrar el contenedor de contenido
    let contentContainer = document.querySelector(".content-container");

    if (!contentContainer) {
      // Si no existe, crearlo automáticamente
      contentContainer = document.createElement("div");
      contentContainer.className = "content-container";

      // Mover TODO el contenido (excepto navbar-container) dentro
      const bodyChildren = Array.from(document.body.children);
      bodyChildren.forEach((child) => {
        if (child.id !== "navbar-container" && child.tagName !== "SCRIPT") {
          contentContainer.appendChild(child);
        }
      });

      document.body.appendChild(contentContainer);
    }

    // 3. APLICAR FILTROS SOLO AL CONTENIDO
    contentContainer.classList.remove(
      "accessibility-negative",
      "accessibility-contrast",
      "accessibility-grayscale",
      "accessibility-readability"
    );

    if (accessibilityState.negativeMode) {
      contentContainer.classList.add("accessibility-negative");
    }
    if (accessibilityState.highContrast) {
      contentContainer.classList.add("accessibility-contrast");
    }
    if (accessibilityState.grayscale) {
      contentContainer.classList.add("accessibility-grayscale");
    }
    if (accessibilityState.readability) {
      // <-- NUEVO
      contentContainer.classList.add("accessibility-readability");
    }

    // 4. RESTAURAR SCROLL INMEDIATAMENTE
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScroll);
      setTimeout(() => window.scrollTo(0, savedScroll), 10);
      setTimeout(() => window.scrollTo(0, savedScroll), 50);
    });

    console.log("Filtros aplicados. Scroll mantenido en:", savedScroll);
  }

  // =============================
  // E. CARGAR ESTADOS INICIALES
  // =============================
  function loadSavedStates() {
    // Modo oscuro
    if (accessibilityState.darkMode) {
      body.setAttribute("data-theme", "dark");
    } else {
      body.removeAttribute("data-theme");
    }

    // Aplicar filtros iniciales
    applyAccessibilityFilters();
    updateAccessibilityUI();
  }

  // =============================
  // F. ACTUALIZAR UI
  // =============================
  function updateAccessibilityUI() {
    const options = document.querySelectorAll(".accessibility-option");

    options.forEach((option) => {
      const mode = option.getAttribute("data-mode");
      let isActive = false;

      switch (mode) {
        case "dark":
          isActive = accessibilityState.darkMode;
          const icon = option.querySelector(".accessibility-icon");
          if (icon) icon.textContent = isActive ? "☀️" : "🌙";
          break;
        case "negative":
          isActive = accessibilityState.negativeMode;
          break;
        case "contrast":
          isActive = accessibilityState.highContrast;
          break;
        case "grayscale":
          isActive = accessibilityState.grayscale;
          break;
      }

      option.classList.toggle("active", isActive);
    });

    if (accessibilityBtn) {
      const active =
        accessibilityState.darkMode ||
        accessibilityState.negativeMode ||
        accessibilityState.highContrast ||
        accessibilityState.grayscale;
      accessibilityBtn.classList.toggle("has-active-mode", active);
    }
  }

  // =============================
  // G. GUARDAR ESTADO
  // =============================
  function saveAccessibilityState() {
    localStorage.setItem(
      "theme",
      accessibilityState.darkMode ? "dark" : "light"
    );
    const { darkMode, ...otherStates } = accessibilityState;
    localStorage.setItem("accessibilityState", JSON.stringify(otherStates));
    updateAccessibilityUI();
  }

  // =============================
  // H. MANEJADORES DE BOTONES
  // =============================
  function createSafeHandler(callback) {
    return function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Guardar scroll ANTES de cambios
      const savedScroll =
        window.pageYOffset || document.documentElement.scrollTop;

      // Ejecutar callback
      callback();

      // Aplicar cambios visuales
      applyAccessibilityFilters();
      saveAccessibilityState();

      // Cerrar menú
      if (accessibilityMenu) {
        setTimeout(() => {
          accessibilityMenu.classList.remove("active");
        }, 100);
      }

      // Restaurar scroll
      setTimeout(() => {
        window.scrollTo(0, savedScroll);
      }, 0);
    };
  }

  // DARK MODE
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener(
      "click",
      createSafeHandler(() => {
        accessibilityState.darkMode = !accessibilityState.darkMode;
        if (accessibilityState.darkMode) {
          body.setAttribute("data-theme", "dark");
        } else {
          body.removeAttribute("data-theme");
        }
      })
    );
  }

  // NEGATIVE MODE
  const negativeModeToggle = document.getElementById("negative-mode-toggle");
  if (negativeModeToggle) {
    negativeModeToggle.addEventListener(
      "click",
      createSafeHandler(() => {
        accessibilityState.negativeMode = !accessibilityState.negativeMode;
        if (accessibilityState.negativeMode) {
          accessibilityState.highContrast = false;
          accessibilityState.grayscale = false;
        }
      })
    );
  }

  // CONTRAST MODE
  const contrastModeToggle = document.getElementById("contrast-mode-toggle");
  if (contrastModeToggle) {
    contrastModeToggle.addEventListener(
      "click",
      createSafeHandler(() => {
        accessibilityState.highContrast = !accessibilityState.highContrast;
        if (accessibilityState.highContrast) {
          accessibilityState.negativeMode = false;
          accessibilityState.grayscale = false;
        }
      })
    );
  }

  // GRAYSCALE MODE
  const grayscaleToggle = document.getElementById("grayscale-toggle");
  if (grayscaleToggle) {
    grayscaleToggle.addEventListener(
      "click",
      createSafeHandler(() => {
        accessibilityState.grayscale = !accessibilityState.grayscale;
        if (accessibilityState.grayscale) {
          accessibilityState.negativeMode = false;
          accessibilityState.highContrast = false;
        }
      })
    );
  }

  const readabilityToggle = document.getElementById("readability-toggle");
  if (readabilityToggle) {
    readabilityToggle.addEventListener(
      "click",
      createSafeHandler(() => {
        accessibilityState.readability = !accessibilityState.readability;

        // Si se activa modo lectura, desactivar otros modos visuales
        if (accessibilityState.readability) {
          accessibilityState.negativeMode = false;
          accessibilityState.highContrast = false;
          accessibilityState.grayscale = false;
        }
      })
    );
  }

  // RESET
  const resetAccessibility = document.getElementById("reset-accessibility");
  if (resetAccessibility) {
    resetAccessibility.addEventListener(
      "click",
      createSafeHandler(() => {
        accessibilityState.negativeMode = false;
        accessibilityState.highContrast = false;
        accessibilityState.grayscale = false;
      })
    );
  }

  // =============================
  // I. INICIALIZAR
  // =============================
  loadSavedStates();

  // =============================
  // J. PERFIL DE USUARIO
  // =============================
  const profileToggle = document.getElementById("profile-toggle");
  const profileCard = document.getElementById("profile-card");
  const logoutBtn = document.getElementById("logout-btn");
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");

  if (profileToggle && profileCard) {
    profileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      profileCard.classList.toggle("active");

      // Cerrar menú de accesibilidad si está abierto
      if (accessibilityMenu && accessibilityMenu.classList.contains("active")) {
        accessibilityMenu.classList.remove("active");
      }
    });

    document.addEventListener("click", (e) => {
      if (
        !profileToggle.contains(e.target) &&
        !profileCard.contains(e.target)
      ) {
        profileCard.classList.remove("active");
      }
    });
  }

  if (auth) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        if (profileName)
          profileName.textContent = user.displayName || "Usuario";
        if (profileEmail) profileEmail.textContent = user.email;
      } else {
        const currentPage = window.location.pathname;
        if (
          !currentPage.includes("login.html") &&
          !currentPage.includes("register.html")
        ) {
          window.location.href = "../../pages/login/login.html";
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await auth.signOut();
        window.location.href = "../../pages/login/login.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error al cerrar sesión");
      }
    });
  }

  // =============================
  // K. PREVENIR SCROLL EN BOTONES
  // =============================
  document
    .querySelectorAll(".accessibility-option, .accessibility-menu-btn")
    .forEach((btn) => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });

      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
      });
    });
}

function initVoiceReader() {
    // Inicializar speech engine
    setTimeout(() => {
        try {
            initSpeech();
        } catch (error) {
            console.error('Error al inicializar lector de voz:', error);
        }
    }, 1000);
    
    // Botón de voz en el menú
    const speechToggle = document.getElementById('speech-toggle');
    if (speechToggle) {
        // No necesitamos otro event listener aquí porque
        // speech.js ya lo maneja, pero mantenemos el estado visual
        speechToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }
}

// Agregar esto después de initializeNavbar()

function initVoiceMenu() {
  const speechToggle = document.getElementById('speech-toggle');
  const speechControls = document.getElementById('speech-controls');
  const speechClose = document.getElementById('speech-close');
  
  if (!speechToggle || !speechControls) return;

  // Abrir/cerrar menú
  speechToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    speechControls.classList.toggle('active');
    speechToggle.classList.toggle('active');
    
    // Cerrar menú de accesibilidad si está abierto
    const accessibilityMenu = document.querySelector('.accessibility-dropdown-menu');
    if (accessibilityMenu?.classList.contains('active')) {
      accessibilityMenu.classList.remove('active');
    }
  });

  // Cerrar con botón X
  if (speechClose) {
    speechClose.addEventListener('click', (e) => {
      e.preventDefault();
      speechControls.classList.remove('active');
      speechToggle.classList.remove('active');
    });
  }

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!speechToggle.contains(e.target) && !speechControls.contains(e.target)) {
      speechControls.classList.remove('active');
      speechToggle.classList.remove('active');
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && speechControls.classList.contains('active')) {
      speechControls.classList.remove('active');
      speechToggle.classList.remove('active');
    }
  });
}

// Llamar en initializeNavbar()
initVoiceReader();
initVoiceMenu();

// =============================
// 3. EJECUTAR AL CARGAR
// =============================
document.addEventListener("DOMContentLoaded", loadNavbar);
