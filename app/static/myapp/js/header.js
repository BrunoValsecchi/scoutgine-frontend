// static/myapp/js/header.js
console.log("=== HEADER.JS CARGADO ===");

document.addEventListener('DOMContentLoaded', function() {
    console.log("=== HEADER DOM LOADED ===");
    
    // Cargar sidebar primero
    loadSidebar().then(() => {
        // Esperar un poco para que el DOM se renderice
        setTimeout(() => {
            initSidebarFunctionality();
            markActivePage();
            loadTopNav();
        }, 300);
    });
});

// ✅ CARGAR SIDEBAR
async function loadSidebar() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) {
        console.log("❌ Header container no encontrado");
        return;
    }

    try {
        const response = await fetch('partials/header.html');
        if (response.ok) {
            const html = await response.text();
            headerContainer.innerHTML = html;
            console.log("✅ Sidebar cargado desde partials/header.html");
        } else {
            console.log("❌ No se pudo cargar partials/header.html");
        }
    } catch (error) {
        console.error('❌ Error cargando sidebar:', error);
    }
}

// ✅ INICIALIZAR FUNCIONALIDAD DEL SIDEBAR
function initSidebarFunctionality() {
    const sidebar = document.getElementById("sidebar");
    
    if (!sidebar) {
        console.log("❌ Sidebar no encontrado");
        return;
    }
    
    console.log("✅ Sidebar encontrado y configurado");
}

// ✅ CARGAR TOPNAV DINÁMICO
function loadTopNav() {
    const topnavContainer = document.getElementById('topnav-container');
    if (!topnavContainer) {
        console.log("❌ TopNav container no encontrado");
        return;
    }

    const currentPage = getCurrentPage();
    const topnavHTML = getTopNavForPage(currentPage);
    
    topnavContainer.innerHTML = topnavHTML;
    topnavContainer.className = 'topnav';
    
    console.log(`✅ TopNav cargado para página: ${currentPage}`);
    
    // Setup topnav events
    setupTopNavEvents();
}

// ✅ OBTENER PÁGINA ACTUAL
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    const page = filename || 'menu';
    console.log(`📄 Página detectada: ${page}`);
    return page;
}

// ✅ CONFIGURACIONES DE TOPNAV POR PÁGINA
function getTopNavForPage(pageName) {
    const configs = {
        'comparacion': `
            <div class="topnav-content">
                <div class="topnav-searchbar">
                    <input type="text" placeholder="Buscar para comparar..." class="topnav-search-input">
                </div>
                <div class="top-nav-actions">
                    <a href="#" id="btn-equipos" class="nav-action-btn active">Equipos</a>
                    <a href="#" id="btn-jugadores" class="nav-action-btn">Jugadores</a>
                </div>
            </div>
        `,
        
        'recomendacion': `
            <div class="topnav-content">
                <div class="topnav-searchbar">
                    <input type="text" placeholder="Buscar jugadores..." class="topnav-search-input">
                </div>
                <div class="top-nav-actions">
                    <a href="#" id="btn-recomendacion" class="nav-action-btn active">Búsqueda</a>
                    <a href="#" id="btn-perfiles" class="nav-action-btn">Perfiles</a>
                </div>
            </div>
        `,
        
        'menu': `
            <div class="topnav-content">
                <div class="topnav-searchbar">
                    <input type="text" placeholder="Buscar..." class="topnav-search-input">
                </div>
                <div class="top-nav-actions">
                    <span class="nav-info">Panel de Control</span>
                </div>
            </div>
        `
    };

    return configs[pageName] || `
        <div class="topnav-content">
            <div class="topnav-searchbar">
                <input type="text" placeholder="Buscar..." class="topnav-search-input">
            </div>
        </div>
    `;
}

// ✅ CONFIGURAR EVENTOS DEL TOPNAV
function setupTopNavEvents() {
    // Event delegation para botones de navegación
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-action-btn')) {
            e.preventDefault();
            handleNavButton(e.target);
        }
    });
    
    console.log("✅ TopNav event listeners configurados");
}

// ✅ MANEJAR BOTONES DE NAVEGACIÓN
function handleNavButton(button) {
    const currentPage = getCurrentPage();
    const buttonId = button.id;
    
    // Remover active de todos los botones
    document.querySelectorAll('.nav-action-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar active al botón clickeado
    button.classList.add('active');
    
    console.log(`🖱️ Botón clickeado: ${buttonId} en página: ${currentPage}`);
    
    // ✅ HANDLER ESPECÍFICO PARA COMPARACION
    if (currentPage === 'comparacion') {
        const comparacionEvent = new CustomEvent('comparacionNavAction', {
            detail: { action: buttonId }
        });
        document.dispatchEvent(comparacionEvent);
    }
    
    // Evento genérico
    const event = new CustomEvent('navButtonClick', {
        detail: { page: currentPage, button: buttonId }
    });
    document.dispatchEvent(event);
}

// ✅ MARCAR PÁGINA ACTIVA EN SIDEBAR
function markActivePage() {
    const currentPage = getCurrentPage();
    console.log(`🎯 Marcando página activa: ${currentPage}`);
    
    // Esperar un poco para asegurarse de que el sidebar esté cargado
    setTimeout(() => {
        // Remover active de todos los enlaces
        const sidebarLinks = document.querySelectorAll('.nav-link');
        sidebarLinks.forEach(link => link.classList.remove('active'));
        
        // Mapeo de páginas a enlaces
        const pageMap = {
            'ligas': 'a[href="ligas.html"]',
            'equipo': 'a[href="equipo.html"]',
            'comparacion': 'a[href="comparacion.html"]',
            'recomendacion': 'a[href="recomendacion.html"]',
            'menu': 'a[href="menu.html"]',
            '': 'a[href="menu.html"]',
            'index': 'a[href="menu.html"]'
        };
        
        if (pageMap[currentPage]) {
            const activeLink = document.querySelector(pageMap[currentPage]);
            if (activeLink) {
                const navLink = activeLink.closest('.nav-link');
                if (navLink) {
                    navLink.classList.add('active');
                    console.log(`✅ Página activa marcada: ${currentPage}`);
                }
            } else {
                console.log(`❌ No se encontró enlace para: ${currentPage}`);
            }
        } else {
            console.log(`❌ Página no mapeada: ${currentPage}`);
        }
    }, 100);
}

console.log("✅ HEADER.JS INICIALIZADO");