console.log("🏈 equipo_detalle.js cargado");

// Variables globales para equipo detalle
window.equipoDetalleData = {
    equipoId: null,
    equipoNombre: null,
    currentView: "info"
};

// Función para obtener ID del equipo desde la URL
function getEquipoIdFromUrl() {
    // 1. Primero busca en los parámetros GET (?id=10)
    const urlParams = new URLSearchParams(window.location.search);
    let equipoId = urlParams.get('id');
    if (equipoId) return equipoId;

    // 2. Si no está, busca en la ruta tipo /equipo_detalle/10/
    const path = window.location.pathname;
    const match = path.match(/\/equipo_detalle\/(\d+)\//);
    if (match) return match[1];

    return null;
}

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("⚽ Inicializando página equipo detalle");
    
    const equipoId = getEquipoIdFromUrl();
    
    if (equipoId) {
        window.equipoDetalleData.equipoId = equipoId;
        console.log("✅ Equipo ID encontrado:", equipoId);
        
        // Esperar a que se cargue el topnav
        setTimeout(() => {
            setupEquipoDetalleButtons();
        }, 500);
        
    } else {
        console.error("❌ ID de equipo no encontrado en URL");
        mostrarError("ID de equipo no encontrado");
    }
});

// Configurar botones de navegación
function setupEquipoDetalleButtons() {
    const btnTablas = document.getElementById('btn-tablas');
    const btnStatsEquipo = document.getElementById('btn-stats-equipo');
    const btnStatsJugadores = document.getElementById('btn-stats-jugadores');
    
    console.log("🔧 Configurando botones:", {
        btnTablas: !!btnTablas,
        btnStatsEquipo: !!btnStatsEquipo,
        btnStatsJugadores: !!btnStatsJugadores
    });
    
    // Solo continuar si los botones existen
    if (!btnTablas && !btnStatsEquipo && !btnStatsJugadores) {
        console.warn("⚠️ No se encontraron botones de navegación");
        return;
    }
    
    // Funciones auxiliares
    function removeAllActive() {
        btnTablas?.classList.remove('active');
        btnStatsEquipo?.classList.remove('active');
        btnStatsJugadores?.classList.remove('active');
    }
    
    function showSection(sectionId) {
        hideAllSections();
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            console.log(`✅ Mostrando sección: ${sectionId}`);
        }
    }
    
    function hideAllSections() {
        const sections = ['info-container', 'stats-equipos-container', 'stats-jugadores-container'];
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) section.style.display = 'none';
        });
    }
    
    // Event listeners
    if (btnTablas) {
        btnTablas.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("📋 Información clickeado");
            removeAllActive();
            btnTablas.classList.add('active');
            showSection('info-container');
            window.equipoDetalleData.currentView = 'info';
            
            // Cargar información si no está cargada
            const infoContent = document.getElementById('info-content');
            if (infoContent && !infoContent.innerHTML.trim()) {
                cargarInfoEquipo(window.equipoDetalleData.equipoId);
            }
        });
    }
    
    if (btnStatsEquipo) {
        btnStatsEquipo.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("👥 Plantilla clickeado");
            removeAllActive();
            btnStatsEquipo.classList.add('active');
            showSection('stats-equipos-container');
            window.equipoDetalleData.currentView = 'plantilla';
            cargarPlantilla(window.equipoDetalleData.equipoId);
        });
    }
    
    if (btnStatsJugadores) {
        btnStatsJugadores.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("📊 Estadísticas clickeado");
            removeAllActive();
            btnStatsJugadores.classList.add('active');
            showSection('stats-jugadores-container');
            window.equipoDetalleData.currentView = 'estadisticas';
            cargarEstadisticas(window.equipoDetalleData.equipoId);
        });
    }
    
    // Activar información por defecto
    if (btnTablas) {
        btnTablas.click();
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const infoContainer = document.getElementById('info-container');
    if (infoContainer) {
        infoContainer.innerHTML = `
            <div class="error-message">
                <h3>❌ Error</h3>
                <p>${mensaje}</p>
                <a href="/equipo/" class="retry-btn">Volver a Equipos</a>
            </div>
        `;
    }
}

// Funciones para cargar datos via AJAX
async function cargarInfoEquipo(equipoId) {
    const loadingEl = document.getElementById("info-loading");
    const contentEl = document.getElementById("info-content");

    loadingEl.style.display = "block";
    contentEl.innerHTML = "";

    try {
        console.log(`🔄 Cargando info equipo ID: ${equipoId}`);
        console.log(`🌐 URL: ${API_CONFIG.BASE_URL}/ajax/equipo/${equipoId}/info/`);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/equipo/${equipoId}/info/`);
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const textResponse = await response.text();
        console.log('📄 Response text:', textResponse);
        
        const data = JSON.parse(textResponse);
        console.log('✅ Parsed data:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        console.log("✅ Info equipo cargada:", data);
        loadingEl.style.display = "none";
        renderInfoEquipo(data);

        // Actualizar datos globales
        if (data.equipo && data.equipo.nombre) {
            window.equipoDetalleData.equipoNombre = data.equipo.nombre;
            document.title = `${data.equipo.nombre} | ScoutGine`;
        }
    } catch (error) {
        console.error("❌ Error cargando info equipo:", error);
        console.error('❌ Error stack:', error.stack);
        loadingEl.style.display = "none";
        contentEl.innerHTML = `
            <div class="error-message">
                <h3>❌ Error cargando información</h3>
                <p>${error.message}</p>
                <button onclick="cargarInfoEquipo('${equipoId}')" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

async function cargarPlantilla(equipoId) {
    const loadingEl = document.getElementById("plantilla-loading");
    const contentEl = document.getElementById("plantilla-content");

    loadingEl.style.display = "block";
    contentEl.innerHTML = "";

    try {
        console.log(`🔄 Cargando plantilla equipo ID: ${equipoId}`);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/equipo/${equipoId}/plantilla/`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        console.log("✅ Plantilla cargada:", data);
        loadingEl.style.display = "none";
        renderPlantilla(data);
    } catch (error) {
        console.error("❌ Error cargando plantilla:", error);
        loadingEl.style.display = "none";
        contentEl.innerHTML = `
            <div class="error-message">
                <h3>❌ Error cargando plantilla</h3>
                <p>${error.message}</p>
                <button onclick="cargarPlantilla('${equipoId}')" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

async function cargarEstadisticas(equipoId) {
    const loadingEl = document.getElementById("stats-loading");
    const contentEl = document.getElementById("stats-content");

    loadingEl.style.display = "block";
    contentEl.innerHTML = "";

    try {
        console.log(`🔄 Cargando estadísticas equipo ID: ${equipoId}`);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/equipo/${equipoId}/estadisticas/`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        console.log("✅ Estadísticas cargadas:", data);
        loadingEl.style.display = "none";
        renderEstadisticas(data);
    } catch (error) {
        console.error("❌ Error cargando estadísticas:", error);
        loadingEl.style.display = "none";
        contentEl.innerHTML = `
            <div class="error-message">
                <h3>❌ Error cargando estadísticas</h3>
                <p>${error.message}</p>
                <button onclick="cargarEstadisticas('${equipoId}')" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

// Funciones de render
function renderInfoEquipo(data) {
    const equipo = data.equipo || {};
    const contentEl = document.getElementById("info-content");

    const infoHTML = `
        <div class="equipo-detalle-container">
            <div class="equipo-header">
                ${equipo.logo ? `
                    <img src="${equipo.logo}" alt="${equipo.nombre}" class="equipo-logo-grande">
                ` : `
                    <div class="equipo-logo-placeholder-grande">
                        ${equipo.nombre ? equipo.nombre.charAt(0).toUpperCase() : 'E'}
                    </div>
                `}
                
                <div class="equipo-info">
                    <h1>${equipo.nombre || 'Equipo'}</h1>
                    <p class="equipo-liga">${equipo.liga || "Primera División"}</p>
                    
                    <div class="equipo-datos">
                        <p><i class="bx bx-id-card"></i> ID: ${equipo.id}</p>
                        ${equipo.nombre_corto ? `<p><i class="bx bx-text"></i> ${equipo.nombre_corto}</p>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="equipo-descripcion">
                <h3><i class="bx bx-info-circle"></i> Información del Equipo</h3>
                <p>Datos básicos del equipo ${equipo.nombre || 'seleccionado'}.</p>
            </div>
        </div>
    `;

    contentEl.innerHTML = infoHTML;
}

function renderPlantilla(data) {
    const jugadores = data.jugadores || [];
    const equipo = data.equipo || {};
    const contentEl = document.getElementById("plantilla-content");

    let plantillaHTML = `
        <div class="jugadores-lista-container">
            <div class="header-content">
                <i class="bx bx-group" style="font-size: 2rem; color: #67aaff;"></i>
                <h2 class="plantilla-titulo">${equipo.nombre || 'Equipo'} - Plantilla (${jugadores.length} jugadores)</h2>
            </div>
    `;

    if (jugadores.length > 0) {
        plantillaHTML += `
            <div class="jugadores-tabla">
                <div class="jugadores-tabla-header">
                    <div class="jugador-th">Nombre</div>
                    <div class="jugador-th">Posición</div>
                    <div class="jugador-th">Edad</div>
                    <div class="jugador-th">#</div>
                    <div class="jugador-th">País</div>
                    <div class="jugador-th">Altura</div>
                </div>
        `;

        jugadores.forEach((jugador) => {
            plantillaHTML += `
                <div class="jugador-row">
                    <div class="jugador-td">
                        <a href="/jugador/${jugador.id}/" class="jugador-link">
                            ${jugador.nombre}
                        </a>
                    </div>
                    <div class="jugador-td">
                        <span class="pos-tag">${jugador.posicion || 'N/A'}</span>
                    </div>
                    <div class="jugador-td">${jugador.edad || 'N/A'}</div>
                    <div class="jugador-td">${jugador.dorsal || 'N/A'}</div>
                    <div class="jugador-td">${jugador.pais || 'N/A'}</div>
                    <div class="jugador-td">${jugador.altura ? jugador.altura + ' cm' : 'N/A'}</div>
                </div>
            `;
        });

        plantillaHTML += `</div>`;
    } else {
        plantillaHTML += `
            <div style="text-align: center; padding: 60px 20px; color: #a6b6d9;">
                <div style="font-size: 4rem; color: #6c7a89; margin-bottom: 20px;">
                    <i class='bx bx-user-x'></i>
                </div>
                <h3>Sin jugadores</h3>
                <p>Este equipo no tiene jugadores registrados.</p>
            </div>
        `;
    }

    plantillaHTML += "</div>";
    contentEl.innerHTML = plantillaHTML;
}

function renderEstadisticas(data) {
    const estadisticas = data.estadisticas || {};
    const equipo = data.equipo || {};
    const contentEl = document.getElementById("stats-content");

    if (Object.keys(estadisticas).length === 0) {
        contentEl.innerHTML = `
            <div class="equipo-stats-empty-simple">
                <i class="bx bx-info-circle" style="font-size: 3rem; color: #6c7a89; margin-bottom: 15px;"></i>
                <h3>Sin estadísticas</h3>
                <p>No hay estadísticas disponibles para este equipo.</p>
            </div>
        `;
        return;
    }

    let estadisticasHTML = `
        <div class="equipo-stats-full">
            <div class="header-content" style="margin-bottom: 30px;">
                <i class="bx bx-bar-chart-alt-2" style="font-size: 2rem; color: #67aaff;"></i>
                <h2 class="plantilla-titulo">${equipo.nombre || 'Equipo'} - Estadísticas</h2>
            </div>
            <div class="stats-grid">
    `;

    Object.entries(estadisticas).forEach(([key, value]) => {
        estadisticasHTML += `
            <div class="stat-card">
                <div class="stat-label">${key}</div>
                <div class="stat-value">${value}</div>
            </div>
        `;
    });

    estadisticasHTML += `
            </div>
        </div>
    `;

    contentEl.innerHTML = estadisticasHTML;
}

// Listener para eventos de navegación desde ligas
document.addEventListener('ligasNavAction', function(e) {
    const { action } = e.detail;
    // Solo ejecuta si estamos en equipo_detalle
    if (['btn-tablas', 'btn-stats-equipo', 'btn-stats-jugadores'].includes(action)) {
        // Llama a la función de navegación interna
        const btn = document.getElementById(action);
        if (btn) btn.click();
    }
});

console.log("✅ equipo_detalle.js inicializado");