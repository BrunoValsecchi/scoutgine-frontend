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
    
    // Esperar a que el sidebar esté en el DOM
    setTimeout(() => {
        console.log('🔍 Buscando botón de logout...');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (logoutBtn) {
            console.log('✅ Botón de logout encontrado');
            
            logoutBtn.addEventListener('click', async function() {
                console.log('🔴 Botón de logout clickeado');
                
                if (window.supabaseClient) {
                    console.log('✅ supabaseClient disponible');
                    try {
                        await window.supabaseClient.auth.signOut();
                        console.log('✅ Sesión cerrada exitosamente');
                        window.location.href = 'sesion.html';
                    } catch (error) {
                        console.error('❌ Error al cerrar sesión:', error);
                        alert('Error al cerrar sesión: ' + error.message);
                    }
                } else {
                    console.log('❌ supabaseClient NO disponible');
                    alert('No se pudo cerrar sesión. Intenta recargar la página.');
                }
            });
        } else {
            console.log('❌ Botón de logout NO encontrado');
        }
    }, 1000); // Aumenta el tiempo a 1 segundo

    // Mostrar botón Dashboard solo si el usuario es admin
    setTimeout(async () => {
        if (!window.supabaseClient) return;
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user && user.user_metadata && user.user_metadata.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = '';
            });
        }
    }, 800); // Ajusta el tiempo si el sidebar tarda más en cargar
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
        'ligas': `
            <div class="topnav-content">
                <div class="topnav-searchbar">
                    <input type="text" placeholder="Buscar ligas..." class="topnav-search-input">
                </div>
                <div class="top-nav-actions">
                    <a href="#" id="btn-tablas" class="nav-action-btn active">Tabla</a>
                    <a href="#" id="btn-stats-equipo" class="nav-action-btn">Stats Equipos</a>
                    <a href="#" id="btn-stats-jugadores" class="nav-action-btn">Stats Jugadores</a>
                </div>
            </div>
        `,
        
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
        
        'estadisticas': `
            <div class="topnav-content">
                <div class="topnav-searchbar">
                    <input type="text" placeholder="Buscar estadísticas..." class="topnav-search-input">
                </div>
                <div class="top-nav-actions">
                    <a href="#" id="btn-equipos" class="nav-action-btn active">Equipos</a>
                    <a href="#" id="btn-jugadores" class="nav-action-btn">Jugadores</a>
                    <a href="#" id="btn-comparacion" class="nav-action-btn">Comparación</a>
                </div>
            </div>
        `,
        
        'equipo_detalle': `
            <div class="topnav-content">
                <div class="topnav-searchbar">
                    <input type="text" placeholder="Buscar jugadores..." class="topnav-search-input">
                </div>
                <div class="top-nav-actions">
                    <a href="#" id="btn-tablas" class="nav-action-btn active">Información</a>
                    <a href="#" id="btn-stats-equipo" class="nav-action-btn">Plantilla</a>
                    <a href="#" id="btn-stats-jugadores" class="nav-action-btn">Estadísticas</a>
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

// ✅ CONFIGURAR EVENTOS DEL TOPNAV - ACTUALIZAR EN header.js
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

// ✅ MANEJAR BOTONES DE NAVEGACIÓN - ACTUALIZAR EN header.js
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
    
    // ✅ HANDLER ESPECÍFICO PARA CADA PÁGINA
    if (currentPage === 'ligas') {
        const ligasEvent = new CustomEvent('ligasNavAction', {
            detail: { action: buttonId }
        });
        document.dispatchEvent(ligasEvent);
    } else if (currentPage === 'comparacion') {
        const comparacionEvent = new CustomEvent('comparacionNavAction', {
            detail: { action: buttonId }
        });
        document.dispatchEvent(comparacionEvent);
    } else if (currentPage === 'estadisticas') {
        const estadisticasEvent = new CustomEvent('estadisticasNavAction', {
            detail: { action: buttonId }
        });
        document.dispatchEvent(estadisticasEvent);
    } else if (currentPage === 'equipo_detalle') {
        const equipoDetalleEvent = new CustomEvent('equipoDetalleNavAction', {
            detail: { action: buttonId }
        });
        document.dispatchEvent(equipoDetalleEvent);
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

// ✅ AGREGAR A LA FUNCIÓN handleTopNavigation en header.js

function handleTopNavigation(clickedButton) {
    console.log('🎯 Navegación clickeada:', clickedButton.id);
    
    // ✅ DETECTAR PÁGINA ACTUAL
    const currentPath = window.location.pathname;
    const isComparacion = currentPath.includes('/comparacion');
    const isEstadisticas = currentPath.includes('/estadisticas');
    const isEquipoDetalle = currentPath.includes('/equipo_detalle') || currentPath.match(/\/equipo\/\d+\//);
    
    // ✅ RESETEAR ESTADOS ACTIVOS
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedButton.classList.add('active');
    
    // ✅ MANEJAR NAVEGACIÓN SEGÚN PÁGINA ACTUAL
    if (isComparacion) {
        // ✅ NAVEGACIÓN EN PÁGINA DE COMPARACIÓN
        handleComparacionNavigation(clickedButton.id);
    } else if (isEstadisticas) {
        // ✅ NAVEGACIÓN EN PÁGINA DE ESTADÍSTICAS
        handleEstadisticasNavigation(clickedButton.id);
    } else if (isEquipoDetalle) {
        // ✅ NAVEGACIÓN EN PÁGINA DE EQUIPO DETALLE
        handleEquipoDetalleNavigation(clickedButton.id);
    } else {
        // ✅ NAVEGACIÓN GLOBAL (CAMBIO DE PÁGINA)
        handleGlobalNavigation(clickedButton.id);
    }
}

// ✅ NUEVA FUNCIÓN PARA MANEJAR NAVEGACIÓN EN EQUIPO DETALLE
function handleEquipoDetalleNavigation(buttonId) {
    console.log('⚽ Manejando navegación en equipo detalle:', buttonId);
    
    const eventDetail = { action: buttonId };
    
    switch(buttonId) {
        case 'btn-tablas':
            // ✅ CAMBIAR A VISTA DE INFORMACIÓN
            document.dispatchEvent(new CustomEvent('equipoDetalleNavAction', { 
                detail: eventDetail 
            }));
            break;
            
        case 'btn-stats-equipo':
            // ✅ CAMBIAR A VISTA DE PLANTILLA
            document.dispatchEvent(new CustomEvent('equipoDetalleNavAction', { 
                detail: eventDetail 
            }));
            break;
            
        case 'btn-stats-jugadores':
            // ✅ CAMBIAR A VISTA DE ESTADÍSTICAS
            document.dispatchEvent(new CustomEvent('equipoDetalleNavAction', { 
                detail: eventDetail 
            }));
            break;
    }
}

// Mostrar nombre o email del usuario en el sidebar
document.addEventListener('DOMContentLoaded', async function() {
    setTimeout(async () => {
        if (!window.supabaseClient) return;
        
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        const userInfo = document.getElementById('sidebar-user-info');
        if (!userInfo) return;

        if (session && session.user) {
            // Obtener nombre de diferentes fuentes
            const nombre = session.user.user_metadata?.nombre || 
                          session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name;
            const email = session.user.email;
            
            userInfo.innerHTML = `
                <div style="color:#fff; font-size:0.95rem; padding:10px 20px; opacity:0.8;">
                    <i class='bx bx-user'></i>
                    ${nombre ? nombre : email}
                </div>
            `;
            
            // Mostrar botón Dashboard solo si es admin
            if (session.user.user_metadata?.role === 'admin') {
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = '';
                });
            }
        } else {
            userInfo.innerHTML = `<div style="color:#fff; font-size:0.95rem; padding:10px 20px; opacity:0.8;">
                <i class='bx bx-user'></i> Invitado
            </div>`;
        }
    }, 1500); // Aumentar el delay para OAuth
});

console.log("✅ HEADER.JS INICIALIZADO");

// CSS para animación de íconos en el enlace del dashboard
const style = document.createElement('style');
style.innerHTML = `
.dashboard-link a i {
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
`;
document.head.appendChild(style);