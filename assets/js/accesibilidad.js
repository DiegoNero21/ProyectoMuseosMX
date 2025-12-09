// Variables para estados de accesibilidad
let accessibilityState = {
    darkMode: false,
    negativeMode: false,
    highContrast: false,
    grayscale: false
};

// Clases CSS para cada modo
const CSS_CLASSES = {
    darkMode: 'accessibility-dark',
    negativeMode: 'accessibility-negative',
    highContrast: 'accessibility-contrast',
    grayscale: 'accessibility-grayscale'
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Cargar estado guardado (si existe)
    const savedState = localStorage.getItem('accessibilityState');
    if (savedState) {
        accessibilityState = JSON.parse(savedState);
        applyAccessibilityModes();
    }

    // Configurar event listeners para los botones
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
    document.getElementById('negative-mode-toggle').addEventListener('click', toggleNegativeMode);
    document.getElementById('contrast-mode-toggle').addEventListener('click', toggleHighContrast);
    document.getElementById('grayscale-toggle').addEventListener('click', toggleGrayscale);
    document.getElementById('reset-accessibility').addEventListener('click', resetAccessibility);
});

// Funciones para cada modo
function toggleDarkMode() {
    accessibilityState.darkMode = !accessibilityState.darkMode;
    updateMode('darkMode');
}

function toggleNegativeMode() {
    accessibilityState.negativeMode = !accessibilityState.negativeMode;
    // Si activamos modo negativo, desactivamos otros modos (opcional)
    if (accessibilityState.negativeMode) {
        accessibilityState.darkMode = false;
        accessibilityState.highContrast = false;
    }
    updateMode('negativeMode');
}

function toggleHighContrast() {
    accessibilityState.highContrast = !accessibilityState.highContrast;
    // Si activamos alto contraste, desactivamos otros modos (opcional)
    if (accessibilityState.highContrast) {
        accessibilityState.darkMode = false;
        accessibilityState.negativeMode = false;
        accessibilityState.grayscale = false;
    }
    updateMode('highContrast');
}

function toggleGrayscale() {
    accessibilityState.grayscale = !accessibilityState.grayscale;
    updateMode('grayscale');
}

function resetAccessibility() {
    // Resetear todos los estados
    Object.keys(accessibilityState).forEach(key => {
        accessibilityState[key] = false;
    });
    
    // Remover todas las clases
    Object.values(CSS_CLASSES).forEach(className => {
        document.body.classList.remove(className);
    });
    
    // Guardar estado
    saveState();
}

// Función para actualizar un modo específico
function updateMode(mode) {
    const className = CSS_CLASSES[mode];
    
    if (accessibilityState[mode]) {
        document.body.classList.add(className);
    } else {
        document.body.classList.remove(className);
    }
    
    saveState();
}

// Aplicar todos los modos activos
function applyAccessibilityModes() {
    Object.keys(accessibilityState).forEach(mode => {
        if (accessibilityState[mode]) {
            const className = CSS_CLASSES[mode];
            document.body.classList.add(className);
        }
    });
}

// Guardar estado en localStorage
function saveState() {
    localStorage.setItem('accessibilityState', JSON.stringify(accessibilityState));
}

function updateButtonStates() {
    const buttons = {
        'dark-mode-toggle': accessibilityState.darkMode,
        'negative-mode-toggle': accessibilityState.negativeMode,
        'contrast-mode-toggle': accessibilityState.highContrast,
        'grayscale-toggle': accessibilityState.grayscale
    };

    Object.entries(buttons).forEach(([id, isActive]) => {
        const button = document.getElementById(id);
        if (isActive) {
            button.classList.add('active-mode');
        } else {
            button.classList.remove('active-mode');
        }
    });
}

// Llamar a updateButtonStates() después de cada cambio en saveState():
function saveState() {
    localStorage.setItem('accessibilityState', JSON.stringify(accessibilityState));
    updateButtonStates(); // <-- Agrega esta línea
}