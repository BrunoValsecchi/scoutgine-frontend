console.log("🏈 equipo_detalle.js cargado");

// ✅ VARIABLES GLOBALES
window.equipoDetalleData = {
    equipoId: null,
    equipoNombre: null,
    currentView: "info",
};

// ✅ INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log("⚽ Página de equipo detalle cargada");

    // ✅ CONFIGURAR NAVEGACIÓN ENTRE PESTAÑAS
    setupNavegacionEquipoDetalle();
    
    // Obtener ID del equipo desde URL
    const equipoId = getEquipoIdFromUrl();
    
    if (equipoId) {
        window.equipoDetalleData.equipoId = equipoId;
        console.log("✅ Equipo ID encontrado:", equipoId);
        
        // Cargar información inicial
        cargarInfoEquipo(equipoId);

        // Configurar botones después de que se cargue el topnav
        setTimeout(() => {
            setupEquipoDetalleButtons();
        }, 500);
    } else {
        console.error("❌ ID de equipo no encontrado");
        mostrarError("ID de equipo no encontrado en la URL");
    }
});

// ✅ FUNCIÓN PARA OBTENER ID DEL EQUIPO DESDE URL
function getEquipoIdFromUrl() {
    const path = window.location.pathname;
    const match = path.match(/\/equipo_detalle\/(\d+)\//);
    let equipoId = null;
    
    if (match) {
        equipoId = match[1];
    } else {
        // Fallback para URLs con parámetros GET
        const urlParams = new URLSearchParams(window.location.search);
        equipoId = urlParams.get("id");
    }
    
    return equipoId;
}

// ✅ FUNCIÓN PARA CONFIGURAR NAVEGACIÓN DE EQUIPO DETALLE
function setupNavegacionEquipoDetalle() {
    console.log('🔧 Configurando navegación de equipo detalle...');
    
    // ✅ ESCUCHAR EVENTOS DE NAVEGACIÓN DESDE HEADER.JS
    document.addEventListener('equipoDetalleNavAction', function(e) {
        console.log('🎯 Evento equipoDetalleNavAction recibido:', e.detail);
        const { action } = e.detail;
        
        if (action === 'btn-tablas') {
            console.log('📋 Cambiando a vista de información desde topnav');
            mostrarSeccionInformacion();
        } else if (action === 'btn-stats-equipo') {
            console.log('👥 Cambiando a vista de plantilla desde topnav');
            mostrarSeccionPlantilla();
        } else if (action === 'btn-stats-jugadores') {
            console.log('📊 Cambiando a vista de estadísticas desde topnav');
            mostrarSeccionEstadisticas();
        }
    });
}

// ✅ FUNCIÓN PARA MOSTRAR SECCIÓN DE INFORMACIÓN
function mostrarSeccionInformacion() {
    console.log('📋 Mostrando sección de información');
    
    // Actualizar botones activos
    updateActiveButton('btn-tablas');
    
    // Mostrar contenedor correcto
    showSection('info-container');
    
    // Cargar datos si no están cargados
    if (!document.getElementById('info-content').innerHTML.trim()) {
        cargarInfoEquipo(window.equipoDetalleData.equipoId);
    }
    
    window.equipoDetalleData.currentView = 'info';
}

// ✅ FUNCIÓN PARA MOSTRAR SECCIÓN DE PLANTILLA
function mostrarSeccionPlantilla() {
    console.log('👥 Mostrando sección de plantilla');
    
    // Actualizar botones activos
    updateActiveButton('btn-stats-equipo');
    
    // Mostrar contenedor correcto
    showSection('stats-equipos-container');
    
    // Cargar plantilla
    cargarPlantilla(window.equipoDetalleData.equipoId);
    
    window.equipoDetalleData.currentView = 'plantilla';
}

// ✅ FUNCIÓN PARA MOSTRAR SECCIÓN DE ESTADÍSTICAS
function mostrarSeccionEstadisticas() {
    console.log('📊 Mostrando sección de estadísticas');
    
    // Actualizar botones activos
    updateActiveButton('btn-stats-jugadores');
    
    // Mostrar contenedor correcto
    showSection('stats-jugadores-container');
    
    // Cargar estadísticas
    cargarEstadisticas(window.equipoDetalleData.equipoId);
    
    window.equipoDetalleData.currentView = 'estadisticas';
}

// ✅ FUNCIÓN AUXILIAR PARA ACTUALIZAR BOTÓN ACTIVO
function updateActiveButton(activeButtonId) {
    // Remover active de todos los botones
    const buttons = ['btn-tablas', 'btn-stats-equipo', 'btn-stats-jugadores'];
    buttons.forEach(buttonId => {
        const btn = document.getElementById(buttonId);
        if (btn) btn.classList.remove('active');
    });
    
    // Agregar active al botón seleccionado
    const activeBtn = document.getElementById(activeButtonId);
    if (activeBtn) activeBtn.classList.add('active');
}

// ✅ FUNCIÓN AUXILIAR PARA MOSTRAR SECCIÓN
function showSection(sectionId) {
    hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        console.log(`✅ Mostrando sección: ${sectionId}`);
    }
}

// ✅ FUNCIÓN AUXILIAR PARA OCULTAR TODAS LAS SECCIONES
function hideAllSections() {
    const sections = ['info-container', 'stats-equipos-container', 'stats-jugadores-container'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    });
}

// ✅ CONFIGURAR BOTONES LOCALES (COMPATIBILIDAD)
function setupEquipoDetalleButtons() {
    const btnTablas = document.getElementById('btn-tablas');
    const btnStatsEquipo = document.getElementById('btn-stats-equipo');
    const btnStatsJugadores = document.getElementById('btn-stats-jugadores');
    
    console.log("🔧 Configurando botones equipo detalle:", {
        btnTablas: !!btnTablas,
        btnStatsEquipo: !!btnStatsEquipo,
        btnStatsJugadores: !!btnStatsJugadores,
    });

    // Event listeners para botones (ahora llaman a las funciones de navegación)
    if (btnTablas) {
        btnTablas.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("📋 Botón Información clickeado directamente");
            mostrarSeccionInformacion();
        });
    }

    if (btnStatsEquipo) {
        btnStatsEquipo.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("👥 Botón Plantilla clickeado directamente");
            mostrarSeccionPlantilla();
        });
    }

    if (btnStatsJugadores) {
        btnStatsJugadores.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("📊 Botón Estadísticas clickeado directamente");
            mostrarSeccionEstadisticas();
        });
    }

    // Mostrar información por defecto
    setTimeout(() => {
        mostrarSeccionInformacion();
    }, 100);
}

// ✅ FUNCIÓN PARA CARGAR INFORMACIÓN DEL EQUIPO
async function cargarInfoEquipo(equipoId) {
    const loadingEl = document.getElementById("info-loading");
    const contentEl = document.getElementById("info-content");

    loadingEl.style.display = "block";
    contentEl.innerHTML = "";

    try {
        console.log(`🔄 Cargando info equipo ID: ${equipoId}`);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/equipo/${equipoId}/info/`);
        const data = await response.json();

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

// ✅ FUNCIÓN PARA CARGAR PLANTILLA
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

// ✅ FUNCIÓN PARA CARGAR ESTADÍSTICAS
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

// ✅ FUNCIONES DE RENDER (mantener las que ya tienes)
function renderInfoEquipo(data) {
    const equipo = data.equipo;
    const wikipediaInfo = data.wikipedia_info || {};
    const totalJugadores = data.total_jugadores || 0;

    const contentEl = document.getElementById("info-content");

    const infoHTML = `
        <div class="equipo-detalle-container">
            <div class="equipo-header">
                ${equipo.logo ? `
                    <img src="${equipo.logo}" alt="${equipo.nombre}" class="equipo-logo-grande">
                ` : `
                    <div class="equipo-logo-placeholder-grande">
                        ${equipo.nombre.charAt(0).toUpperCase()}
                    </div>
                `}
                
                <div class="equipo-info">
                    <h1>${equipo.nombre}</h1>
                    <p class="equipo-liga">${equipo.liga || "Primera División"}</p>
                    
                    ${wikipediaInfo.fundacion ? `
                        <p class="equipo-fundacion">
                            <i class="bx bx-calendar"></i>
                            Fundado en ${wikipediaInfo.fundacion}
                        </p>
                    ` : ""}
                    
                    ${wikipediaInfo.estadio ? `
                        <p class="equipo-estadio">
                            <i class="bx bx-map"></i>
                            ${wikipediaInfo.estadio}
                        </p>
                    ` : ""}
                </div>
            </div>
            
            <div class="equipo-descripcion">
                <h3>
                    <i class="bx bx-info-circle"></i>
                    Acerca del club
                </h3>
                <p class="equipo-resumen">
                    ${wikipediaInfo.resumen || `
                        ${equipo.nombre} es un equipo de fútbol que compite en ${equipo.liga || "Primera División"}.
                        ${totalJugadores ? `Cuenta con una plantilla de ${totalJugadores} jugadores.` : ""}
                    `}
                </p>
            </div>
            
            ${equipo.rating || equipo.goles_promedio || equipo.goles_concedidos_promedio || equipo.posesion_promedio ? `
                <div class="stats-cards">
                    ${equipo.rating ? `
                        <div class="stat-card">
                            <div class="stat-value">${equipo.rating}</div>
                            <div class="stat-label">Rating</div>
                        </div>
                    ` : ""}
                    
                    ${equipo.goles_promedio ? `
                        <div class="stat-card">
                            <div class="stat-value">${equipo.goles_promedio}</div>
                            <div class="stat-label">Goles por Partido</div>
                        </div>
                    ` : ""}
                    
                    ${equipo.goles_concedidos_promedio ? `
                        <div class="stat-card">
                            <div class="stat-value">${equipo.goles_concedidos_promedio}</div>
                            <div class="stat-label">Goles Concedidos</div>
                        </div>
                    ` : ""}
                    
                    ${equipo.vallas_invictas ? `
                        <div class="stat-card">
                            <div class="stat-value">${equipo.vallas_invictas}</div>
                            <div class="stat-label">Vallas Invictas</div>
                        </div>
                    ` : ""}
                    
                    ${equipo.posesion_promedio ? `
                        <div class="stat-card">
                            <div class="stat-value">${equipo.posesion_promedio}%</div>
                            <div class="stat-label">Posesión</div>
                        </div>
                    ` : ""}
                    
                    ${equipo.tiros_arco_promedio ? `
                        <div class="stat-card">
                            <div class="stat-value">${equipo.tiros_arco_promedio}</div>
                            <div class="stat-label">Tiros al Arco</div>
                        </div>
                    ` : ""}
                </div>
            ` : ""}
        </div>
    `;

    contentEl.innerHTML = infoHTML;
}

function renderPlantilla(data) {
    const equipoNombre = data.equipo_nombre;
    const jugadores = data.jugadores || [];
    const totalJugadores = jugadores.length;

    const contentEl = document.getElementById("plantilla-content");

    let plantillaHTML = `
        <div class="jugadores-lista-container">
            <div class="header-content">
                <i class="bx bx-group" style="font-size: 2rem; color: #67aaff;"></i>
                <h2 class="plantilla-titulo">${equipoNombre} - Plantilla (${totalJugadores} jugadores)</h2>
            </div>
    `;

    if (totalJugadores > 0) {
        plantillaHTML += `
            <div class="jugadores-tabla">
                <div class="jugadores-tabla-header">
                    <div class="jugador-th">Nombre</div>
                    <div class="jugador-th">Posición</div>
                    <div class="jugador-th">Nacionalidad</div>
                    <div class="jugador-th">Edad</div>
                    <div class="jugador-th">#</div>
                    <div class="jugador-th">Altura</div>
                    <div class="jugador-th">Valor</div>
                </div>
        `;

        jugadores.forEach((jugador) => {
            // ✅ FORMATEAR VALOR DE MERCADO CORRECTAMENTE
            let valorFormateado = "N/A";
            if (jugador.valor_mercado && jugador.valor_mercado > 0) {
                if (jugador.valor_mercado >= 1000000) {
                    valorFormateado = `€${(jugador.valor_mercado / 1000000).toFixed(1)}M`;
                } else if (jugador.valor_mercado >= 1000) {
                    valorFormateado = `€${(jugador.valor_mercado / 1000).toFixed(0)}K`;
                } else {
                    valorFormateado = `€${jugador.valor_mercado}`;
                }
            }

            // ✅ MOSTRAR TODAS LAS POSICIONES SIN TRUNCAR
            let posicionBadge = "";
            const posicionCompleta = jugador.posicion || "POS";
            
            // Determinar el tipo principal de posición para el icono y color
            let tipoPrincipal = "general";
            const primeraPosicion = posicionCompleta.split(",")[0].trim().toUpperCase();
            
            if (primeraPosicion.includes("GK") || primeraPosicion.includes("ARQ") || primeraPosicion === "COA") {
                tipoPrincipal = "arquero";
            } else if (primeraPosicion.includes("CB") || primeraPosicion.includes("RB") || primeraPosicion.includes("LB") || primeraPosicion.includes("DEF")) {
                tipoPrincipal = "defensor";
            } else if (primeraPosicion.includes("DM") || primeraPosicion.includes("CM") || primeraPosicion.includes("LM") || primeraPosicion.includes("RM") || primeraPosicion.includes("AM") || primeraPosicion.includes("MID") || primeraPosicion.includes("MED")) {
                tipoPrincipal = "mediocampista";
            } else if (primeraPosicion.includes("LW") || primeraPosicion.includes("RW") || primeraPosicion.includes("ST") || primeraPosicion.includes("ATT") || primeraPosicion.includes("DEL")) {
                tipoPrincipal = "delantero";
            }

            // Crear badge con todas las posiciones
            const iconos = {
                "arquero": "bx-shield",
                "defensor": "bx-shield-quarter", 
                "mediocampista": "bx-target-lock",
                "delantero": "bx-football",
                "general": "bx-user"
            };

            // ✅ MOSTRAR TODAS LAS POSICIONES EN EL BADGE
            posicionBadge = `<span class="pos-tag ${tipoPrincipal}" title="${posicionCompleta}">
                <i class='bx ${iconos[tipoPrincipal]}'></i> ${posicionCompleta}
            </span>`;

            plantillaHTML += `
                <div class="jugador-row">
                    <div class="jugador-td">
                        <a href="estadistica_jugador.html?jugador=${jugador.id}&stat=Precisión de pases" class="jugador-link">
                            ${jugador.nombre}
                        </a>
                    </div>
                    <div class="jugador-td">${posicionBadge}</div>
                    <div class="jugador-td">${jugador.nacionalidad || "N/A"}</div>
                    <div class="jugador-td">${jugador.edad || "N/A"}</div>
                    <div class="jugador-td">${jugador.dorsal || "N/A"}</div>
                    <div class="jugador-td">${jugador.altura ? jugador.altura + " cm" : "N/A"}</div>
                    <div class="jugador-td">${valorFormateado}</div>
                </div>
            `;
        });

        plantillaHTML += `</div></div>`;
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
    const equipoNombre = data.equipo_nombre || (data.equipo && data.equipo.nombre) || "Equipo";
    const stats = data.stats || data.estadisticas;
    const contentEl = document.getElementById("stats-content");

    if (!stats || Object.keys(stats).length === 0) {
        contentEl.innerHTML = `
            <div class="equipo-stats-empty-simple">
                <div class="empty-icon">
                    <i class="bx bx-bar-chart-alt-2"></i>
                </div>
                <h3>Sin estadísticas</h3>
                <p>No hay estadísticas disponibles para este equipo.</p>
            </div>
        `;
        return;
    }

    // Dividir las estadísticas en grupos de 4 para mostrar 2x2
    const statEntries = Object.entries(stats);
    const grupos = [];
    for (let i = 0; i < statEntries.length; i += 4) {
        grupos.push(statEntries.slice(i, i + 4));
    }

    let estadisticasHTML = `
        <div class="equipo-stats-modern">
            <div class="stats-header">
                <div class="stats-icon">
                    <i class="bx bx-trending-up"></i>
                </div>
                <h2 class="stats-titulo">${equipoNombre} - Estadísticas</h2>
                <div class="stats-decoration"></div>
            </div>
            
            <div class="stats-grid-container">
    `;

    grupos.forEach((grupo, groupIndex) => {
        estadisticasHTML += `
            <div class="stats-group" style="animation-delay: ${groupIndex * 0.1}s">
                <div class="stats-cards-grid">
        `;
        
        grupo.forEach(([label, valor], index) => {
            let valorFormateado = valor;
            if (typeof valor === "number") {
                valorFormateado = valor % 1 !== 0 ? valor.toFixed(2) : valor;
            }
            
            // Iconos dinámicos basados en el tipo de estadística
            let icono = "bx-bar-chart-alt";
            if (label.toLowerCase().includes("gol")) icono = "bx-football";
            else if (label.toLowerCase().includes("pase")) icono = "bx-transfer";
            else if (label.toLowerCase().includes("tiro")) icono = "bx-target-lock";
            else if (label.toLowerCase().includes("rating")) icono = "bx-star";
            else if (label.toLowerCase().includes("posesión")) icono = "bx-time";
            
            // ✅ HACER CLICKEABLE CADA ESTADÍSTICA
            const equipoId = window.equipoDetalleData.equipoId;
            const statUrl = `estadistica_detalle.html?equipo=${equipoId}&stat=${encodeURIComponent(label)}`;
            
            estadisticasHTML += `
                <div class="stat-card-modern stat-clickable" 
                     style="animation-delay: ${(groupIndex * 4 + index) * 0.05}s"
                     onclick="navegarAEstadistica('${equipoId}', '${label.replace(/'/g, "\\'")}')">
                    <div class="stat-card-content">
                        <div class="stat-icon">
                            <i class="bx ${icono}"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value-modern">${valorFormateado}</div>
                            <div class="stat-label-modern">${label}</div>
                        </div>
                    </div>
                    <div class="stat-card-glow"></div>
                    <div class="stat-click-indicator">
                        <i class="bx bx-show"></i>
                    </div>
                </div>
            `;
        });
        
        estadisticasHTML += `
                </div>
            </div>
        `;
    });

    estadisticasHTML += `
            </div>
        </div>
    `;
    
    contentEl.innerHTML = estadisticasHTML;
}

// ✅ FUNCIÓN CORREGIDA PARA NAVEGAR A ESTADÍSTICA DETALLE
function navegarAEstadistica(equipoId, statName) {
    console.log('📊 Navegando a estadística:', { equipoId, statName });
    
    // ✅ NAVEGAR AL HTML DIRECTAMENTE CON PARÁMETROS
    const url = `estadistica_detalle.html?equipo=${equipoId}&stat=${encodeURIComponent(statName)}`;
    
    console.log('🔗 URL generada:', url);
    
    // Navegar a la página
    window.location.href = url;
}

function mostrarError(mensaje) {
    document.getElementById("info-container").innerHTML = `
        <div class="error-message">
            <h3>❌ Error</h3>
            <p>${mensaje}</p>
            <a href="/equipo/" class="retry-btn">Volver a Equipos</a>
        </div>
    `;
}

console.log('✅ equipo_detalle.js cargado correctamente');