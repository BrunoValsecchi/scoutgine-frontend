// AG Grid integración para tablas de posiciones
// Asegúrate de tener AG Grid importado en tu HTML (CDN o npm)
// Ejemplo CDN: <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
// Y el CSS: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css" />
//           <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css" />


console.log("=== LIGAS.JS CARGADO ===");

document.addEventListener('DOMContentLoaded', function() {
    console.log("=== LIGAS DOM LOADED ===");
    
    // ✅ CARGAR TABLAS INMEDIATAMENTE SIN DELAY
    cargarTablas();
    
    // Escuchar eventos de navegación del topnav
    document.addEventListener('navButtonClick', function(e) {
        const { page, button } = e.detail;
        if (page === 'ligas') {
            handleLigasNavigation(button);
        }
    });
});

// ✅ MANEJAR NAVEGACIÓN DE LIGAS
function handleLigasNavigation(buttonId) {
    console.log(`🖱️ Navegación en ligas: ${buttonId}`);
    
    // Ocultar todas las secciones
    hideAllSections();
    
    switch(buttonId) {
        case 'btn-tablas':
            showSection('tablas-container');
            cargarTablas();
            break;
        case 'btn-stats-equipo':
            showSection('stats-equipos-container');
            cargarStatsEquipos();
            break;
        case 'btn-stats-jugadores':
            showSection('stats-jugadores-container');
            cargarStatsJugadores();
            break;
    }
}

// ✅ MOSTRAR/OCULTAR SECCIONES
function hideAllSections() {
    const sections = ['tablas-container', 'stats-equipos-container', 'stats-jugadores-container'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
}

function showSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) element.style.display = 'block';
}

// ✅ CARGAR TABLAS - SIN LOADING, CARGA INSTANTÁNEA
async function cargarTablas() {
    console.log("🏆 Cargando tablas de posiciones...");
    
    const contentEl = document.getElementById('tablas-content');
    
    // ✅ NO MOSTRAR LOADING - DIRECTO AL CONTENIDO
    if (contentEl) {
        contentEl.innerHTML = `
            <div class="instant-loading" style="text-align: center; color: #3498db; padding: 20px; grid-column: 1 / -1;">
                <i class='bx bx-football' style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p style="font-family: 'Rajdhani', sans-serif; font-size: 1.1rem;">Preparando tablas...</p>
            </div>
        `;
    }
    
    try {
        const data = await apiRequest('/ajax/ligas/');
        
        // ✅ GUARDAR DATOS GLOBALMENTE PARA AG GRID
        window.ligasData = data;
        
        // ✅ RENDERIZAR IMMEDIATAMENTE
        renderTablas(data);
        
    } catch (error) {
        console.error('❌ Error cargando tablas:', error);
        
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="error-container" style="grid-column: 1 / -1;">
                    <i class="bx bx-error-circle"></i>
                    <h3>❌ Error cargando tablas</h3>
                    <p>${error.message}</p>
                    <button onclick="cargarTablas()" class="btn-retry">
                        <i class="bx bx-refresh"></i>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// ✅ RENDERIZAR TABLAS CON AG GRID
function renderTablas(data) {
    const contentEl = document.getElementById('tablas-content');
    if (!contentEl) {
        console.error("❌ No se encontró el contenedor tablas-content");
        return;
    }
    
    console.log("🏗️ Renderizando tablas:", data);
    
    if (!data.torneos || Object.keys(data.torneos).length === 0) {
        contentEl.innerHTML = `
            <div class="no-data-message" style="grid-column: 1 / -1;">
                <i class="bx bx-info-circle"></i>
                <h3>📊 No hay datos de tablas disponibles</h3>
                <p>Los datos se están cargando o no están disponibles en este momento.</p>
            </div>
        `;
        return;
    }

    // ✅ CREAR ESTRUCTURA DE GRID
    let tablasHTML = '<div class="leagues-grid">';
    
    // Renderizar cada torneo
    Object.entries(data.torneos).forEach(([torneoId, torneo]) => {
        tablasHTML += renderTorneoCardWithAGGrid(torneoId, torneo);
    });
    
    tablasHTML += '</div>';
    contentEl.innerHTML = tablasHTML;
    
    // ✅ APLICAR AG GRID INMEDIATAMENTE - SIN TIMEOUT
    aplicarAGGridATodas();
}

// ✅ RENDERIZAR CARD DE TORNEO PARA AG GRID
function renderTorneoCardWithAGGrid(torneoId, torneo) {
    const equiposCount = torneo.posiciones ? torneo.posiciones.length : 0;
    
    // Filtrar equipos con partidos jugados > 0 para mostrar solo tablas activas
    const equiposActivos = torneo.posiciones ? 
        torneo.posiciones.filter(equipo => equipo.pj > 0) : [];
    
    // Si no hay equipos activos, mostrar mensaje
    if (equiposActivos.length === 0) {
        return `
            <section class="tournament-card">
                <h2 class="tournament-title">${torneoId}</h2>
                <div class="zone-section">
                    <h3 class="zone-title">Zona: ${torneo.zona || '-'}</h3>
                    <div class="no-data-message">
                        <p>🏁 Torneo no iniciado</p>
                    </div>
                </div>
            </section>
        `;
    }

    // ✅ GENERAR ID ÚNICO PARA AG GRID
    const gridId = `grid-${torneoId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

    return `
        <section class="tournament-card">
            <h2 class="tournament-title">${torneoId}</h2>
            <div class="zone-section">
                <h3 class="zone-title">Zona: ${torneo.zona || '-'} (${equiposActivos.length} equipos)</h3>
                <div class="table-container">
                    <div id="${gridId}" class="ag-theme-dark-custom" style="width: 100%; height: 100%;">
                        <!-- AG Grid se renderiza aquí -->
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ✅ APLICAR AG GRID A TODAS LAS TABLAS - INSTANTÁNEO
function aplicarAGGridATodas() {
    console.log("🎯 Aplicando AG Grid a todas las tablas...");
    
    // Buscar todos los contenedores de grid
    const gridContainers = document.querySelectorAll('[id^="grid-"]');
    
    gridContainers.forEach((gridContainer) => {
        const gridId = gridContainer.id;
        const torneoData = obtenerDatosTorneoPorGridId(gridId);
        
        if (torneoData && torneoData.posiciones) {
            crearAGGrid(gridContainer, torneoData.posiciones);
        }
    });
}

// ✅ OBTENER DATOS DEL TORNEO POR GRID ID
function obtenerDatosTorneoPorGridId(gridId) {
    if (window.ligasData && window.ligasData.torneos) {
        for (const [torneoId, torneo] of Object.entries(window.ligasData.torneos)) {
            const expectedGridId = `grid-${torneoId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
            if (expectedGridId === gridId) {
                return torneo;
            }
        }
    }
    
    return null;
}

// ✅ CREAR AG GRID INDIVIDUAL
function crearAGGrid(container, posiciones) {
    // Filtrar solo equipos activos
    const equiposActivos = posiciones.filter(equipo => equipo.pj > 0);
    
    if (equiposActivos.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">No hay datos disponibles</p>';
        return;
    }

    // ✅ PREPARAR DATOS PARA AG GRID
    const rowData = equiposActivos.map(equipo => {
        const dif = (equipo.gf || 0) - (equipo.gc || 0);
        const pts = (equipo.pg || 0) * 3 + (equipo.pe || 0);
        
        return {
            Pos: equipo.posicion || 0,
            Equipo: equipo.equipo || 'Sin nombre',
            PJ: equipo.pj || 0,
            PG: equipo.pg || 0,
            PE: equipo.pe || 0,
            PP: equipo.pp || 0,
            GF: equipo.gf || 0,
            GC: equipo.gc || 0,
            DIF: dif,
            PTS: pts
        };
    });

    // ✅ CONFIGURACIÓN DE COLUMNAS CON COLORES
    const columnDefs = [
        { 
            headerName: 'Pos', 
            field: 'Pos', 
            width: 60,
            cellStyle: function(params) {
                const pos = params.value;
                if (pos <= 4) {
                    return { 
                        fontWeight: 'bold', 
                        color: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.15)',
                        borderLeft: '3px solid #27ae60'
                    };
                } else if (pos <= 6) {
                    return { 
                        fontWeight: 'bold', 
                        color: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.15)',
                        borderLeft: '3px solid #f39c12'
                    };
                } else if (pos >= equiposActivos.length - 2) {
                    return { 
                        fontWeight: 'bold', 
                        color: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.15)',
                        borderLeft: '3px solid #e74c3c'
                    };
                }
                return { fontWeight: 'bold', color: '#3498db' };
            }
        },
        { 
            headerName: 'Equipo', 
            field: 'Equipo', 
            flex: 1, 
            minWidth: 120,
            cellStyle: { 
                fontWeight: '600', 
                textAlign: 'left',
                color: '#e1e1e6'
            }
        },
        { headerName: 'PJ', field: 'PJ', width: 50 },
        { headerName: 'PG', field: 'PG', width: 50 },
        { headerName: 'PE', field: 'PE', width: 50 },
        { headerName: 'PP', field: 'PP', width: 50 },
        { headerName: 'GF', field: 'GF', width: 50 },
        { headerName: 'GC', field: 'GC', width: 50 },
        { 
            headerName: 'DIF', 
            field: 'DIF', 
            width: 60,
            cellStyle: function(params) {
                const value = params.value;
                if (value > 0) return { fontWeight: 'bold', color: '#27ae60' };
                else if (value < 0) return { fontWeight: 'bold', color: '#e74c3c' };
                return { fontWeight: 'bold', color: '#e1e1e6' };
            }
        },
        { 
            headerName: 'PTS', 
            field: 'PTS', 
            width: 60,
            cellStyle: { 
                fontWeight: 'bold', 
                color: '#3498db',
                fontSize: '1rem'
            }
        },
    ];

    // ✅ OPCIONES DE GRID
    const gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: false,
            cellStyle: {
                color: '#e1e1e6',
                fontFamily: 'Rajdhani, sans-serif'
            }
        },
        rowHeight: 35,
        headerHeight: 45,
        animateRows: false, // ✅ DESACTIVAR ANIMACIONES PARA MAYOR VELOCIDAD
        pagination: false,
        suppressRowClickSelection: true,
        suppressCellSelection: true,
        onGridReady: function(params) {
            params.api.sizeColumnsToFit();
        },
        onFirstDataRendered: function(params) {
            params.api.sizeColumnsToFit();
        }
    };
    
    // ✅ CREAR EL GRID
    try {
        if (typeof agGrid !== 'undefined') {
            let grid;
            if (typeof agGrid.createGrid === 'function') {
                grid = agGrid.createGrid(container, gridOptions);
            } else if (typeof agGrid.Grid === 'function') {
                grid = new agGrid.Grid(container, gridOptions);
            }
            
            console.log(`✅ AG Grid creado para: ${container.id}`);
            
            // Ajustar columnas cuando se redimensiona la ventana
            window.addEventListener('resize', () => {
                if (grid && grid.api) {
                    setTimeout(() => {
                        grid.api.sizeColumnsToFit();
                    }, 100);
                }
            });
            
        } else {
            console.error("❌ AG Grid no está disponible");
            container.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">AG Grid no disponible</p>';
        }
    } catch (error) {
        console.error("❌ Error al crear AG Grid:", error);
        container.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Error al cargar la tabla</p>';
    }
}

// ✅ CARGAR STATS EQUIPOS
async function cargarStatsEquipos() {
    console.log("📊 Cargando estadísticas de equipos...");
    
    const contentEl = document.getElementById('stats-equipos-content');
    
    if (contentEl) {
        contentEl.innerHTML = `
            <div class="instant-loading" style="text-align: center; color: #3498db; padding: 20px;">
                <i class='bx bx-bar-chart-alt-2' style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p style="font-family: 'Rajdhani', sans-serif; font-size: 1.1rem;">Preparando estadísticas de equipos...</p>
            </div>
        `;
    }
    
    try {
        const data = await apiRequest('/ajax/stats-equipos/');
        renderStatsEquipos(data);
        
    } catch (error) {
        console.error('❌ Error cargando stats de equipos:', error);
        
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="error-container">
                    <i class="bx bx-error-circle"></i>
                    <h3>❌ Error cargando estadísticas de equipos</h3>
                    <p>${error.message}</p>
                    <button onclick="cargarStatsEquipos()" class="btn-retry">
                        <i class="bx bx-refresh"></i>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// ✅ RENDERIZAR STATS DE EQUIPOS CON ESTILO DE JUGADORES
function renderStatsEquipos(data) {
    const contentEl = document.getElementById('stats-equipos-content');
    if (!contentEl) {
        console.error("❌ No se encontró el contenedor stats-equipos-content");
        return;
    }
    
    console.log("📊 Renderizando stats de equipos:", data);
    
    // ✅ USAR ESTRUCTURA SIMILAR A STATSJUGADORES
    let statsHTML = `
        <div class="stats-jugadores-container">
            <h2>📊 Estadísticas de Equipos</h2>
            <div class="stats-jugadores-list">
    `;

    // ✅ FUNCIÓN HELPER PARA RENDERIZAR CADA ESTADÍSTICA COMO STAT-BLOCK
    function renderStatBlock(title, dataArray, formatValue = (val) => val.toFixed(1)) {
        if (!dataArray || dataArray.length === 0) return '';
        
        let html = `
            <div class="stat-block">
                <h3>${title}</h3>
                <ol>
        `;
        
        dataArray.slice(0, 10).forEach((equipo) => {
            html += `
                <li>
                    <div class="jugador-info">
                        <div class="jugador-nombre">${equipo.equipo}</div>
                        <div class="jugador-equipo">Equipo</div>
                        <div class="jugador-posicion">Liga</div>
                    </div>
                    <div class="stat-valor">${formatValue(equipo.valor)}</div>
                </li>
            `;
        });
        
        html += `</ol></div>`;
        return html;
    }
    
    // ✅ RENDERIZAR TODAS LAS 22 ESTADÍSTICAS CON ESTILO DE JUGADORES
    
    // GENERALES (5)
    statsHTML += renderStatBlock("⭐ Mejor Rating FotMob", data.rating);
    statsHTML += renderStatBlock("⚽ Más Goleadores", data.goles_favor, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🛡️ Defensas Menos Batidas", data.goles_contra, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🏀 Mayor Posesión", data.posesion, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("🥅 Más Vallas Invictas", data.vallas_invictas, (val) => Math.round(val));
    
    // ATAQUE (7)
    statsHTML += renderStatBlock("📈 Mejores en xG", data.goles_esperados, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🎯 Más Tiros al Arco", data.tiros_al_arco, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("💫 Grandes Oportunidades", data.grandes_oportunidades, (val) => Math.round(val));
    statsHTML += renderStatBlock("❌ Menos Oportunidades Perdidas", data.grandes_oportunidades_perdidas, (val) => Math.round(val));
    statsHTML += renderStatBlock("⚖️ Más Penales a Favor", data.penales_favor, (val) => Math.round(val));
    statsHTML += renderStatBlock("🏃 Toques en Área Rival", data.toques_area_rival, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🚩 Más Córners", data.corners, (val) => Math.round(val));
    
    // PASES (3)
    statsHTML += renderStatBlock("📋 Pases Precisos", data.pases_precisos, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🎯 Pases Largos Precisos", data.pases_largos_precisos, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("📐 Centros Precisos", data.centros_precisos, (val) => `${val.toFixed(1)}`);
    
    // DEFENSA (6)
    statsHTML += renderStatBlock("📉 Menos xG Concedidos", data.xg_concedidos, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🛑 Más Intercepciones", data.intercepciones, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("⚔️ Tackles Exitosos", data.tackles_exitosos, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🧹 Más Despejes", data.despejes, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🔄 Recuperaciones Campo Rival", data.recuperaciones_campo_rival, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🧤 Más Atajadas", data.atajadas, (val) => `${val.toFixed(1)}`);
    
    // DISCIPLINA (3)
    statsHTML += renderStatBlock("🟡 Menos Faltas", data.faltas, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🟨 Menos Tarjetas Amarillas", data.tarjetas_amarillas, (val) => Math.round(val));
    statsHTML += renderStatBlock("🟥 Menos Tarjetas Rojas", data.tarjetas_rojas, (val) => Math.round(val));

    statsHTML += `</div></div>`;
    contentEl.innerHTML = statsHTML;
    
    console.log("✅ Todas las 22 estadísticas de equipos renderizadas con estilo de jugadores");
}

// ✅ CARGAR STATS JUGADORES
async function cargarStatsJugadores() {
    console.log("👤 Cargando estadísticas de jugadores...");
    
    const contentEl = document.getElementById('stats-jugadores-content');
    
    if (contentEl) {
        contentEl.innerHTML = `
            <div class="instant-loading" style="text-align: center; color: #3498db; padding: 20px;">
                <i class='bx bx-user-check' style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p style="font-family: 'Rajdhani', sans-serif; font-size: 1.1rem;">Preparando estadísticas de jugadores...</p>
            </div>
        `;
    }
    
    try {
        const data = await apiRequest('/ajax/stats-jugadores/');
        renderStatsJugadores(data);
        
    } catch (error) {
        console.error('❌ Error cargando stats de jugadores:', error);
        
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="error-container">
                    <i class="bx bx-error-circle"></i>
                    <h3>❌ Error cargando estadísticas de jugadores</h3>
                    <p>${error.message}</p>
                    <button onclick="cargarStatsJugadores()" class="btn-retry">
                        <i class="bx bx-refresh"></i>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// ✅ RENDERIZAR STATS DE JUGADORES CON TODAS LAS 47 ESTADÍSTICAS REALES
function renderStatsJugadores(data) {
    const contentEl = document.getElementById('stats-jugadores-content');
    if (!contentEl) {
        console.error("❌ No se encontró el contenedor stats-jugadores-content");
        return;
    }
    
    console.log("👤 Renderizando stats de jugadores:", data);
    
    let statsHTML = `
        <div class="stats-jugadores-container">
            <h2>👤 Estadísticas de Jugadores (47 Categorías Completas)</h2>
            <div class="stats-jugadores-list">
    `;

    function renderStatBlock(title, dataArray, formatValue = (val) => val.toFixed(1)) {
        if (!dataArray || dataArray.length === 0) return '';
        
        let html = `
            <div class="stat-block">
                <h3>${title}</h3>
                <ol>
        `;
        
        dataArray.slice(0, 10).forEach((jugador) => {
            html += `
                <li>
                    <div class="jugador-info">
                        <div class="jugador-nombre">${jugador.jugador}</div>
                        <div class="jugador-equipo">${jugador.equipo}</div>
                        <div class="jugador-posicion">${jugador.posicion}</div>
                    </div>
                    <div class="stat-valor">${formatValue(jugador.valor)}</div>
                </li>
            `;
        });
        
        html += `</ol></div>`;
        return html;
    }
    
    // ✅ RENDERIZAR TODAS LAS 47 ESTADÍSTICAS QUE DEVUELVE TU BACKEND
    
    // 🏆 ARQUEROS (10)
    statsHTML += renderStatBlock("🧤 Atajadas", data.saves, (val) => Math.round(val));
    statsHTML += renderStatBlock("📊 % Atajadas", data.save_percentage, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("🥅 Menos Goles Recibidos", data.goals_conceded, (val) => Math.round(val));
    statsHTML += renderStatBlock("🚫 Goles Prevenidos", data.goals_prevented, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🥅 Vallas Invictas", data.clean_sheets, (val) => Math.round(val));
    statsHTML += renderStatBlock("❌ Menos Errores → Gol", data.error_led_to_goal, (val) => Math.round(val));
    statsHTML += renderStatBlock("✋ Salidas Altas", data.high_claim, (val) => Math.round(val));
    statsHTML += renderStatBlock("📋 Precisión Pases (GK)", data.pass_accuracy, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("📏 Pases Largos (GK)", data.accurate_long_balls, (val) => Math.round(val));
    statsHTML += renderStatBlock("🎯 % Pases Largos (GK)", data.long_ball_accuracy, (val) => `${val.toFixed(1)}%`);
    
    // ⚽ ATAQUE (10)
    statsHTML += renderStatBlock("⚽ Goleadores", data.goals, (val) => Math.round(val));
    statsHTML += renderStatBlock("📈 Goles Esperados (xG)", data.expected_goals_xg, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🎯 xG al Arco", data.xg_on_target_xgot, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("⚽ xG sin Penales", data.non_penalty_xg, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🎯 Disparos", data.shots, (val) => Math.round(val));
    statsHTML += renderStatBlock("🎯 Tiros al Arco", data.shots_on_target, (val) => Math.round(val));
    statsHTML += renderStatBlock("🎯 Asistencias", data.assists, (val) => Math.round(val));
    statsHTML += renderStatBlock("📈 Asistencias Esperadas (xA)", data.expected_assists_xa, (val) => `${val.toFixed(1)}`);
    statsHTML += renderStatBlock("🏃 Toques en Área Rival", data.touches_in_opposition_box, (val) => Math.round(val));
    statsHTML += renderStatBlock("⚖️ Penales Ganados", data.penalties_awarded, (val) => Math.round(val));
    
    // 📋 PASES Y CREACIÓN (8)
    statsHTML += renderStatBlock("📋 Pases Exitosos", data.successful_passes, (val) => Math.round(val));
    statsHTML += renderStatBlock("📊 Precisión Pases (Campo)", data.pass_accuracy_outfield, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("📏 Pases Largos (Campo)", data.accurate_long_balls_outfield, (val) => Math.round(val));
    statsHTML += renderStatBlock("🎯 % Pases Largos (Campo)", data.long_ball_accuracy_outfield, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("💡 Chances Creadas", data.chances_created, (val) => Math.round(val));
    statsHTML += renderStatBlock("📐 Centros Exitosos", data.successful_crosses, (val) => Math.round(val));
    statsHTML += renderStatBlock("📐 Precisión Centros", data.cross_accuracy, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("👆 Toques Totales", data.touches, (val) => Math.round(val));
    
    // 🤸 REGATES Y HABILIDAD (4)
    statsHTML += renderStatBlock("🤸 Regates Exitosos", data.successful_dribbles, (val) => Math.round(val));
    statsHTML += renderStatBlock("🤸 Éxito en Regates", data.dribble_success, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("❌ Menos Pérdidas", data.dispossessed, (val) => Math.round(val));
    statsHTML += renderStatBlock("⚖️ Faltas Recibidas", data.fouls_won, (val) => Math.round(val));
    
    // 🛡️ DEFENSA Y DUELOS (10)
    statsHTML += renderStatBlock("⚔️ Entradas Ganadas", data.tackles_won, (val) => Math.round(val));
    statsHTML += renderStatBlock("⚔️ % Entradas Ganadas", data.tackles_won_percentage, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("🥊 Duelos Ganados", data.duels_won, (val) => Math.round(val));
    statsHTML += renderStatBlock("🥊 % Duelos Ganados", data.duels_won_percentage, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("🪂 Duelos Aéreos Ganados", data.aerial_duels_won, (val) => Math.round(val));
    statsHTML += renderStatBlock("🪂 % Duelos Aéreos", data.aerial_duels_won_percentage, (val) => `${val.toFixed(1)}%`);
    statsHTML += renderStatBlock("🛑 Intercepciones", data.interceptions, (val) => Math.round(val));
    statsHTML += renderStatBlock("🛡️ Bloqueos", data.blocked, (val) => Math.round(val));
    statsHTML += renderStatBlock("🔄 Recuperaciones", data.recoveries, (val) => Math.round(val));
    statsHTML += renderStatBlock("🏃 Recuperaciones Área Rival", data.possession_won_final_3rd, (val) => Math.round(val));
    
    // 🟨 DISCIPLINA (3)
    statsHTML += renderStatBlock("🟡 Menos Faltas Cometidas", data.fouls_committed, (val) => Math.round(val));
    statsHTML += renderStatBlock("🟨 Menos Tarjetas Amarillas", data.yellow_cards, (val) => Math.round(val));
    statsHTML += renderStatBlock("🟥 Menos Tarjetas Rojas", data.red_cards, (val) => Math.round(val));
    
    // 🤕 OTROS (2)
    statsHTML += renderStatBlock("😵 Menos Veces Regateado", data.dribbled_past, (val) => Math.round(val));

    statsHTML += `</div></div>`;
    contentEl.innerHTML = statsHTML;
    
    console.log("✅ Todas las 47 estadísticas reales de jugadores renderizadas correctamente");
}

// ✅ HACER FUNCIONES DISPONIBLES GLOBALMENTE
window.cargarTablas = cargarTablas;
window.cargarStatsEquipos = cargarStatsEquipos;
window.cargarStatsJugadores = cargarStatsJugadores;

console.log("✅ LIGAS.JS INICIALIZADO");
