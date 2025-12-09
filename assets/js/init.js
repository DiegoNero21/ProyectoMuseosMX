// init.js - Script para inicializar correctamente la estructura
(function() {
    'use strict';
    
    console.log('Inicializando estructura de página...');
    
    // Esperar a que la navbar se cargue
    function checkNavbarAndWrap() {
        const navbarContainer = document.getElementById('navbar-container');
        const navbar = navbarContainer?.querySelector('.navbar');
        
        if (navbar) {
            // Navbar cargada, ahora envolver contenido
            wrapContent();
        } else {
            // Reintentar en 100ms
            setTimeout(checkNavbarAndWrap, 100);
        }
    }
    
    function wrapContent() {
        // Si ya hay un content-container, no hacer nada
        if (document.querySelector('.content-container')) {
            return;
        }
        
        // Crear contenedor
        const contentContainer = document.createElement('div');
        contentContainer.className = 'content-container';
        
        // Mover todo el contenido (excepto navbar y scripts) al contenedor
        const bodyChildren = Array.from(document.body.children);
        let movedElements = 0;
        
        bodyChildren.forEach(child => {
            // No mover: navbar-container, scripts, ni el contenedor mismo
            if (child.id !== 'navbar-container' && 
                child.tagName !== 'SCRIPT' && 
                child.className !== 'content-container') {
                
                contentContainer.appendChild(child);
                movedElements++;
            }
        });
        
        // Agregar contenedor al body
        if (movedElements > 0) {
            document.body.appendChild(contentContainer);
            console.log('Contenido envuelto correctamente. Elementos movidos:', movedElements);
            
            // Ajustar padding del hero
            const hero = contentContainer.querySelector('.hero');
            if (hero) {
                hero.style.paddingTop = '0';
            }
        }
    }
    
    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkNavbarAndWrap);
    } else {
        checkNavbarAndWrap();
    }
    
    // Exportar función para uso manual
    window.initializePageStructure = wrapContent;
    
    console.log('Inicializador de estructura listo');
})();