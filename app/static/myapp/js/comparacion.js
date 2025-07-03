console.log('=== COMPARACION.JS CARGADO ===');

// ✅ VARIABLES GLOBALES
window.comparacionData = {
    equipos: [],
    jugadores: [],
    gruposStatsEquipos: {},
    gruposStatsJugadores: {},
    currentMode: 'equipos'
};

let equiposActuales = {};
let jugadoresActuales = {};
let grupoActual = 'ofensivo';
let grupoActualJugadores = 'ofensivo';

function getCsrfToken() {
    // ✅ MÉTODO 1: Desde el meta tag (más confiable)
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    
    // ✅ MÉTODO 2: Desde las cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    
    // ✅ MÉTODO 3: Desde un input hidden
    const inputTag = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (inputTag) {
        return inputTag.value;
    }
    
    console.log('⚠️ Token CSRF no encontrado');
    return '';
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando comparación...');
    
    // ✅ NO ESPERAR TOPNAV - header.js se encarga
    inicializarComparacion();
});

function inicializarComparacion() {
    console.log('🚀 Inicializando comparación...');
    
    try {
        // ✅ CARGAR DATOS INICIALES
        cargarDatosComparacion();
        
        // ✅ CONFIGURAR NAVEGACIÓN
        setupNavegacion();
        
        // ✅ CONFIGURAR EVENT LISTENERS
        setupEventListeners();
        
        // ✅ MOSTRAR EQUIPOS POR DEFECTO
        showEquiposComparacion();
        
        console.log('✅ Comparación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando comparación:', error);
        mostrarError('Error cargando la página de comparación');
    }
}

// ✅ FUNCIÓN PARA CARGAR DATOS
async function cargarDatosComparacion() {
    const loadingEl = document.getElementById('loading-comparacion');
    const errorEl = document.getElementById('error-comparacion');
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    
    try {
        console.log('📡 Cargando datos desde APIs...');
        
        // ✅ CARGAR EQUIPOS
        const equiposResponse = await fetch(`${API_CONFIG.BASE_URL}/ajax/equipos/`);
        if (!equiposResponse.ok) throw new Error('Error cargando equipos');
        const equiposData = await equiposResponse.json();
        
        // ✅ CARGAR GRUPOS DE ESTADÍSTICAS
        const gruposEquiposResponse = await fetch(`${API_CONFIG.BASE_URL}/ajax/grupos-stats-equipos/`);
        if (!gruposEquiposResponse.ok) throw new Error('Error cargando grupos de equipos');
        const gruposEquiposData = await gruposEquiposResponse.json();
        
        const gruposJugadoresResponse = await fetch(`${API_CONFIG.BASE_URL}/ajax/grupos-stats-jugadores/`);
        if (!gruposJugadoresResponse.ok) throw new Error('Error cargando grupos de jugadores');
        const gruposJugadoresData = await gruposJugadoresResponse.json();
        
        // ✅ ACTUALIZAR DATOS GLOBALES
        window.comparacionData.equipos = equiposData.equipos || [];
        window.comparacionData.gruposStatsEquipos = gruposEquiposData || {};
        window.comparacionData.gruposStatsJugadores = gruposJugadoresData || {};
        
        console.log('✅ Datos cargados:', {
            equipos: window.comparacionData.equipos.length,
            gruposEquipos: Object.keys(window.comparacionData.gruposStatsEquipos).length,
            gruposJugadores: Object.keys(window.comparacionData.gruposStatsJugadores).length
        });
        
        // ✅ LLENAR SELECTORES
        llenarSelectores();
        
        if (loadingEl) loadingEl.style.display = 'none';
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        mostrarError(error.message);
        throw error;
    }
}

// ✅ FUNCIÓN PARA LLENAR SELECTORES
function llenarSelectores() {
    const equipos = window.comparacionData.equipos;
    const gruposEquipos = window.comparacionData.gruposStatsEquipos;
    const gruposJugadores = window.comparacionData.gruposStatsJugadores;
    
    // ✅ SELECTORES DE EQUIPOS
    const selectoresEquipos = [
        'equipo1-select', 'equipo2-select', 
        'equipo-jugador1-select', 'equipo-jugador2-select'
    ];
    
    selectoresEquipos.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        if (select) {
            select.innerHTML = '<option value="">Selecciona equipo</option>';
            equipos.forEach(equipo => {
                const option = document.createElement('option');
                option.value = equipo.id;
                option.textContent = equipo.nombre;
                select.appendChild(option);
            });
        }
    });
    
    // ✅ SELECTOR DE GRUPOS EQUIPOS
    const grupoEquiposSelect = document.getElementById('grupo-select-equipos');
    if (grupoEquiposSelect) {
        grupoEquiposSelect.innerHTML = '';
        Object.entries(gruposEquipos).forEach(([key, grupo]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = grupo.nombre;
            grupoEquiposSelect.appendChild(option);
        });
    }
    
    // ✅ SELECTOR DE GRUPOS JUGADORES
    const grupoJugadoresSelect = document.getElementById('grupo-select-jugadores');
    if (grupoJugadoresSelect) {
        grupoJugadoresSelect.innerHTML = '';
        Object.entries(gruposJugadores).forEach(([key, grupo]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = grupo.nombre;
            grupoJugadoresSelect.appendChild(option);
        });
    }
}

// ✅ FUNCIÓN PARA CONFIGURAR NAVEGACIÓN (SIMPLIFICADA)
function setupNavegacion() {
    console.log('🔧 Configurando navegación de comparación...');
    
    // ✅ SOLO ESCUCHAR EL EVENTO DE HEADER.JS
    document.addEventListener('comparacionNavAction', function(e) {
        console.log('🎯 Evento comparacionNavAction recibido:', e.detail);
        const { action } = e.detail;
        
        if (action === 'btn-equipos') {
            console.log('📊 Cambiando a vista de equipos');
            showEquiposComparacion();
        } else if (action === 'btn-jugadores') {
            console.log('👥 Cambiando a vista de jugadores');
            showJugadoresComparacion();
        }
    });
}

// ✅ RESTO DE TU CÓDIGO IGUAL...

function handleComparacionNavigation(buttonId) {
    switch(buttonId) {
        case 'btn-comparar-equipos':
            showEquiposComparacion();
            break;
        case 'btn-comparar-jugadores':
            showJugadoresComparacion();
            break;
    }
}

function showEquiposComparacion() {
    console.log('📊 EJECUTANDO showEquiposComparacion');
    
    // ✅ LIMPIAR GRÁFICO DE JUGADORES ANTES DE OCULTAR
    if (window.currentJugadoresChart) {
        try {
            window.currentJugadoresChart.dispose();
            window.currentJugadoresChart = null;
        } catch (e) {
            console.warn('⚠️ Error limpiando gráfico de jugadores:', e);
        }
    }

    const equiposContainer = document.getElementById('equipos-comparacion-container');
    const jugadoresContainer = document.getElementById('jugadores-comparacion-container');
    const loadingContainer = document.getElementById('loading-comparacion');
    
    console.log('🔍 Contenedores encontrados:', {
        equipos: !!equiposContainer,
        jugadores: !!jugadoresContainer,
        loading: !!loadingContainer
    });
    
    if (equiposContainer) equiposContainer.style.display = 'block';
    if (jugadoresContainer) jugadoresContainer.style.display = 'none';
    if (loadingContainer) loadingContainer.style.display = 'none';
    
    window.comparacionData.currentMode = 'equipos';
    console.log('✅ Modo cambiado a equipos');
}

function showJugadoresComparacion() {
    console.log('👥 EJECUTANDO showJugadoresComparacion');
    
    // ✅ LIMPIAR GRÁFICO DE EQUIPOS ANTES DE OCULTAR
    if (window.currentEquiposChart) {
        try {
            window.currentEquiposChart.dispose();
            window.currentEquiposChart = null;
        } catch (e) {
            console.warn('⚠️ Error destruyendo gráfico de equipos:', e);
        }
    }

    const equiposContainer = document.getElementById('equipos-comparacion-container');
    const jugadoresContainer = document.getElementById('jugadores-comparacion-container');
    const loadingContainer = document.getElementById('loading-comparacion');
    
    console.log('🔍 Contenedores encontrados:', {
        equipos: !!equiposContainer,
        jugadores: !!jugadoresContainer,
        loading: !!loadingContainer
    });
    
    if (equiposContainer) equiposContainer.style.display = 'none';
    if (jugadoresContainer) jugadoresContainer.style.display = 'block';
    if (loadingContainer) loadingContainer.style.display = 'none';
    
    window.comparacionData.currentMode = 'jugadores';
    console.log('✅ Modo cambiado a jugadores');
}

// ✅ FUNCIÓN PARA CONFIGURAR EVENT LISTENERS (ACTUALIZADA)
function setupEventListeners() {
    // ✅ FILTRO DE POSICIÓN
    const posicionFilter = document.getElementById('posicion-filter');
    if (posicionFilter) {
        posicionFilter.addEventListener('change', function() {
            console.log('🔄 Filtro de posición cambiado a:', this.value);
            
            // ✅ RECARGAR JUGADORES DE AMBOS EQUIPOS CON EL NUEVO FILTRO
            const equipo1Id = document.getElementById('equipo-jugador1-select')?.value;
            const equipo2Id = document.getElementById('equipo-jugador2-select')?.value;
            
            if (equipo1Id) {
                cargarJugadoresEquipo(equipo1Id, 'jugador1-select');
            }
            if (equipo2Id) {
                cargarJugadoresEquipo(equipo2Id, 'jugador2-select');
            }
        });
    }
    
    // ✅ EQUIPOS
    const equipo1Select = document.getElementById('equipo1-select');
    const equipo2Select = document.getElementById('equipo2-select');
    const grupoEquiposSelect = document.getElementById('grupo-select-equipos');
    
    if (equipo1Select) {
        equipo1Select.addEventListener('change', compararEquipos);
    }
    if (equipo2Select) {
        equipo2Select.addEventListener('change', compararEquipos);
    }
    if (grupoEquiposSelect) {
        grupoEquiposSelect.addEventListener('change', compararEquipos);
    }
    
    // ✅ BOTONES DE MODO EQUIPOS
    const btnGraficosEquipos = document.getElementById('btn-graficos-equipos');
    const btnEstadisticasEquipos = document.getElementById('btn-estadisticas-equipos');
    
    if (btnGraficosEquipos) {
        btnGraficosEquipos.addEventListener('click', () => toggleModoEquipos('graficos'));
    }
    if (btnEstadisticasEquipos) {
        btnEstadisticasEquipos.addEventListener('click', () => toggleModoEquipos('estadisticas'));
    }
    
    // ✅ JUGADORES
    const equipoJugador1Select = document.getElementById('equipo-jugador1-select');
    const equipoJugador2Select = document.getElementById('equipo-jugador2-select');
    const jugador1Select = document.getElementById('jugador1-select');
    const jugador2Select = document.getElementById('jugador2-select');
    const grupoJugadoresSelect = document.getElementById('grupo-select-jugadores');
    
    if (equipoJugador1Select) {
        equipoJugador1Select.addEventListener('change', function() {
            cargarJugadoresEquipo(this.value, 'jugador1-select');
        });
    }
    if (equipoJugador2Select) {
        equipoJugador2Select.addEventListener('change', function() {
            cargarJugadoresEquipo(this.value, 'jugador2-select');
        });
    }
    if (jugador1Select) {
        jugador1Select.addEventListener('change', compararJugadores);
    }
    if (jugador2Select) {
        jugador2Select.addEventListener('change', compararJugadores);
    }
    if (grupoJugadoresSelect) {
        grupoJugadoresSelect.addEventListener('change', compararJugadores);
    }
    
    // ✅ BOTONES DE MODO JUGADORES
    const btnGraficosJugadores = document.getElementById('btn-graficos-jugadores');
    const btnEstadisticasJugadores = document.getElementById('btn-estadisticas-jugadores');
    
    if (btnGraficosJugadores) {
        btnGraficosJugadores.addEventListener('click', () => toggleModoJugadores('graficos'));
    }
    if (btnEstadisticasJugadores) {
        btnEstadisticasJugadores.addEventListener('click', () => toggleModoJugadores('estadisticas'));
    }
}

// ✅ FUNCIÓN MEJORADA PARA CARGAR JUGADORES CON FILTRO DE POSICIÓN
async function cargarJugadoresEquipo(equipoId, selectId) {
    console.log(`🔄 Cargando jugadores para equipo ${equipoId} en selector ${selectId}`);
    
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`❌ Selector ${selectId} no encontrado`);
        return;
    }
    
    select.innerHTML = '<option value="">Cargando jugadores...</option>';
    select.disabled = true;

    if (!equipoId) {
        select.innerHTML = '<option value="">Primero selecciona equipo</option>';
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/equipo/${equipoId}/jugadores/`);
        const data = await response.json();
        console.log(`✅ Jugadores recibidos para equipo ${equipoId}:`, data);

        select.innerHTML = '<option value="">Selecciona jugador</option>';
        
        if (data.jugadores && data.jugadores.length > 0) {
            // ✅ OBTENER POSICIÓN FILTRADA
            const posicionFilter = document.getElementById('posicion-filter');
            const posicionFiltro = posicionFilter?.value;
            
            console.log(`🎯 Filtro de posición actual: "${posicionFiltro}"`);
            console.log(`📋 Total jugadores antes de filtrar: ${data.jugadores.length}`);
            
            // ✅ FILTRAR POR POSICIÓN SI ESTÁ SELECCIONADA
            let jugadoresFiltrados = data.jugadores;
            if (posicionFiltro) {
                jugadoresFiltrados = data.jugadores.filter(jugador => {
                    const posicionJugador = (jugador.posicion || '').toUpperCase();
                    const coincide = posicionJugador.includes(posicionFiltro.toUpperCase());
                    console.log(`🔍 ${jugador.nombre} - Posición: "${jugador.posicion}" - Coincide: ${coincide}`);
                    return coincide;
                });
            }
            
            console.log(`📋 Jugadores después de filtrar: ${jugadoresFiltrados.length}`);
            
            if (jugadoresFiltrados.length > 0) {
                jugadoresFiltrados.forEach(jugador => {
                    const option = document.createElement('option');
                    option.value = jugador.id;
                    option.textContent = `${jugador.nombre} (${jugador.posicion || 'POS'})`;
                    select.appendChild(option);
                });
            } else {
                const mensajeFiltro = posicionFiltro ? 
                    `No hay jugadores con posición ${posicionFiltro} en este equipo` : 
                    'No hay jugadores disponibles';
                select.innerHTML = `<option value="">${mensajeFiltro}</option>`;
            }
        } else {
            select.innerHTML = '<option value="">No hay jugadores disponibles</option>';
        }
        
        select.disabled = false;
        
    } catch (error) {
        console.error('❌ Error cargando jugadores:', error);
        select.innerHTML = '<option value="">Error cargando jugadores</option>';
        select.disabled = false;
    }
}

// ✅ FUNCIÓN PARA COMPARAR EQUIPOS (MEJORADA)
async function compararEquipos() {
    const equipo1Id = document.getElementById('equipo1-select')?.value;
    const equipo2Id = document.getElementById('equipo2-select')?.value;
    const grupo = document.getElementById('grupo-select-equipos')?.value;

    console.log('🔄 Comparando equipos:', {equipo1Id, equipo2Id, grupo});

    if (!equipo1Id || !equipo2Id || !grupo) {
        const chartContainer = document.getElementById('radar-comparacion-equipos');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-selection">Selecciona dos equipos y un grupo para comparar</div>';
        }
        return;
    }

    // ✅ MOSTRAR LOADING EN EL CONTENEDOR
    const chartContainer = document.getElementById('radar-comparacion-equipos');
    if (chartContainer) {
        chartContainer.innerHTML = '<div class="loading-chart">🔄 Cargando comparación...</div>';
    }

    try {
        const csrfToken = getCsrfToken();
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/comparar-equipos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                equipo1_id: equipo1Id,
                equipo2_id: equipo2Id,
                grupo: grupo
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Datos de comparación equipos:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // ✅ RENDERIZAR GRÁFICO RADAR
        renderRadarEquipos(data);

    } catch (error) {
        console.error('❌ Error comparando equipos:', error);
        if (chartContainer) {
            chartContainer.innerHTML = `<div class="error-chart">Error: ${error.message}</div>`;
        }
    }
}

// ✅ FUNCIÓN PARA COMPARAR JUGADORES (CON DEBUGGING MEJORADO)
async function compararJugadores() {
    const jugador1Id = document.getElementById('jugador1-select')?.value;
    const jugador2Id = document.getElementById('jugador2-select')?.value;
    const grupo = document.getElementById('grupo-select-jugadores')?.value;

    console.log('🔄 Comparando jugadores:', {jugador1Id, jugador2Id, grupo});

    if (!jugador1Id || !jugador2Id || !grupo) {
        const chartContainer = document.getElementById('radar-comparacion-jugadores');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-selection">Selecciona dos jugadores y un grupo para comparar</div>';
        }
        return;
    }

    // ✅ MOSTRAR LOADING EN EL CONTENEDOR
    const chartContainer = document.getElementById('radar-comparacion-jugadores');
    if (chartContainer) {
        chartContainer.innerHTML = '<div class="loading-chart">🔄 Cargando comparación...</div>';
    }

    try {
        const csrfToken = getCsrfToken();
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/comparar-jugadores/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                jugador1_id: jugador1Id,
                jugador2_id: jugador2Id,
                grupo: grupo
            })
        });

        if (!response.ok) {
            // ✅ MANEJAR ERRORES DE ESTADÍSTICAS FALTANTES
            let errorDetails;
            try {
                errorDetails = await response.json();
                console.log('📋 Error details:', errorDetails);
                
                // ✅ DETECTAR ERROR DE MINUTOS INSUFICIENTES
                if (errorDetails.error && 
                    (errorDetails.error.includes('No hay estadísticas disponibles') || 
                     errorDetails.error.includes('no completó los 300 minutos'))) {
                    
                    // ✅ EXTRAER NOMBRES DE JUGADORES DEL ERROR
                    const errorText = typeof errorDetails.error === 'string' ? 
                                    errorDetails.error : 
                                    errorDetails.error.message || JSON.stringify(errorDetails.error);
                    
                    // ✅ OBTENER NOMBRES DE LOS JUGADORES SELECCIONADOS
                    const jugador1Nombre = document.getElementById('jugador1-select')?.selectedOptions[0]?.text || 'Jugador 1';
                    const jugador2Nombre = document.getElementById('jugador2-select')?.selectedOptions[0]?.text || 'Jugador 2';
                    
                    if (chartContainer) {
                        chartContainer.innerHTML = `
                            <div class="insufficient-stats-message">
                                <div class="stats-warning-icon">
                                    <i class="bx bx-time-five"></i>
                                </div>
                                <h4>⏱️ Minutos Insuficientes</h4>
                                <div class="players-without-stats">
                                    <p><strong>${jugador1Nombre}</strong> y/o <strong>${jugador2Nombre}</strong> no completaron los <strong>300 minutos mínimos</strong> requeridos para generar estadísticas detalladas.</p>
                                </div>
                                <div class="stats-explanation">
                                    <p><i class="bx bx-info-circle"></i> Solo jugadores con suficiente tiempo de juego aparecen en las comparaciones gráficas.</p>
                                </div>
                                <div class="alternative-options">
                                    <button onclick="toggleModoJugadores('estadisticas')" class="btn-alternative">
                                        <i class="bx bx-table"></i> Ver Información Básica
                                    </button>
                                    <button onclick="mostrarJugadoresConEstadisticas()" class="btn-alternative">
                                        <i class="bx bx-search"></i> Ver Jugadores Disponibles
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                    return;
                }
            } catch {
                errorDetails = await response.text();
            }
            
            throw new Error(`Error HTTP: ${response.status} - ${JSON.stringify(errorDetails)}`);
        }

        const data = await response.json();
        console.log('✅ Datos de comparación jugadores recibidos:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // ✅ VERIFICAR ESTRUCTURA DE DATOS
        if (!data.estadisticas || !data.valores_jugador1 || !data.valores_jugador2) {
            console.error('❌ Estructura de datos incompleta:', data);
            throw new Error('Datos de respuesta incompletos');
        }

        // ✅ RENDERIZAR GRÁFICO RADAR
        renderRadarJugadores(data);

    } catch (error) {
        console.error('❌ Error completo comparando jugadores:', error);
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="error-chart">
                    <i class="bx bx-error-circle"></i>
                    <h4>Error en la comparación</h4>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

// ✅ FUNCIÓN PARA MOSTRAR JUGADORES CON ESTADÍSTICAS DISPONIBLES
function mostrarJugadoresConEstadisticas() {
    console.log('🔍 Mostrando jugadores con estadísticas disponibles...');
    
    // Cambiar a modo estadísticas donde se ven todos los jugadores
    toggleModoJugadores('estadisticas');
    
    // Opcional: Mostrar un tooltip o mensaje informativo
    const infoDiv = document.createElement('div');
    infoDiv.className = 'temp-info-message';
    infoDiv.innerHTML = `
        <div class="info-message">
            <i class="bx bx-info-circle"></i>
            <span>Aquí puedes ver la información básica de todos los jugadores, incluso los que no tienen estadísticas completas.</span>
            <button onclick="this.parentElement.parentElement.remove()" class="close-info">×</button>
        </div>
    `;
    
    const estadisticasContainer = document.getElementById('estadisticas-comparacion-jugadores');
    if (estadisticasContainer) {
        estadisticasContainer.insertBefore(infoDiv, estadisticasContainer.firstChild);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (infoDiv.parentElement) {
                infoDiv.remove();
            }
        }, 5000);
    }
}

// ✅ FUNCIÓN PARA RENDERIZAR RADAR DE EQUIPOS (CON DEBUGGING)
function renderRadarEquipos(data) {
    console.log('🎨 Renderizando radar de equipos');
    console.log('📊 Data recibida:', data);
    
    // ✅ VALIDAR ESTRUCTURA DE DATOS
    if (!data) {
        console.error('❌ No hay datos para renderizar');
        return;
    }
    
    if (!data.equipo1 || !data.equipo2) {
        console.error('❌ Información de equipos faltante:', {
            equipo1: data.equipo1,
            equipo2: data.equipo2
        });
        
        const chartContainer = document.getElementById('radar-comparacion-equipos');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="error-chart">
                    <i class="bx bx-error-circle"></i>
                    <h4>Error de datos</h4>
                    <p>Información de equipos incompleta</p>
                </div>
            `;
        }
        return;
    }
    
    if (!data.estadisticas || !data.valores_equipo1 || !data.valores_equipo2) {
        console.error('❌ Estadísticas faltantes:', {
            estadisticas: !!data.estadisticas,
            valores_equipo1: !!data.valores_equipo1,
            valores_equipo2: !!data.valores_equipo2
        });
        
        const chartContainer = document.getElementById('radar-comparacion-equipos');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="error-chart">
                    <i class="bx bx-error-circle"></i>
                    <h4>Datos incompletos</h4>
                    <p>Faltan estadísticas para la comparación</p>
                </div>
            `;
        }
        return;
    }

    const chartContainer = document.getElementById('radar-comparacion-equipos');
    if (!chartContainer) {
        console.error('❌ Contenedor del gráfico de equipos no encontrado');
        return;
    }

    // ✅ DESTRUIR GRÁFICO EXISTENTE SI EXISTE
    if (window.currentEquiposChart) {
        try {
            window.currentEquiposChart.dispose();
            console.log('🔄 Gráfico de equipos anterior destruido');
        } catch (e) {
            console.warn('⚠️ Error destruyendo gráfico anterior:', e);
        }
        window.currentEquiposChart = null;
    }

    // ✅ LIMPIAR COMPLETAMENTE EL CONTENEDOR
    chartContainer.innerHTML = '';
    chartContainer.style.width = '100%';
    chartContainer.style.height = '420px';

    // ✅ PEQUEÑA PAUSA PARA ASEGURAR QUE EL DOM SE ACTUALICE
    setTimeout(() => {
        try {
            // ✅ VERIFICAR QUE EL CONTENEDOR SIGUE EXISTIENDO
            if (!document.getElementById('radar-comparacion-equipos')) {
                console.warn('⚠️ Contenedor removido del DOM durante el timeout');
                return;
            }

            console.log('✅ Creando gráfico con datos validados:', {
                equipo1: data.equipo1.nombre,
                equipo2: data.equipo2.nombre,
                estadisticas: data.estadisticas.length
            });

            // ✅ INICIALIZAR ECHARTS
            const chart = echarts.init(chartContainer, null, {
                devicePixelRatio: 2
            });

            const option = {
                backgroundColor: 'transparent',
                // ✅ TOOLTIP MEJORADO PARA MOSTRAR PERCENTILES Y VALORES REALES
                tooltip: {
                    trigger: 'item',
                    backgroundColor: '#1a1a2e',
                    borderColor: '#00d4ff',
                    textStyle: { color: '#fff' },
                    formatter: function(params) {
                        const statName = data.estadisticas[params.dataIndex].nombre;
                        const percentil = params.value;
                        
                        return `
                            <div style="padding: 5px;">
                                <strong>${params.seriesName}</strong><br/>
                                <span style="color: #00d4ff;">${statName}</span><br/>
                                📊 Percentil: ${percentil}
                                <div style="font-size: 11px; color: #ccc; margin-top: 3px;">
                                    (Mejor que ${percentil}% de ${params.seriesName.includes('Equipo') ? 'equipos' : 'jugadores'})
                                </div>
                            </div>
                        `;
                    }
                },
                legend: {
                    data: [data.equipo1.nombre, data.equipo2.nombre],
                    textStyle: { color: '#ffffff' },
                    top: 20
                },
                radar: {
                    indicator: data.estadisticas.map(stat => ({
                        name: stat.nombre,
                        max: Math.max(stat.max_valor, 10),
                        min: 0
                    })),
                    name: {
                        textStyle: {
                            color: '#00d4ff',
                            fontSize: 11
                        },
                        formatter: function(value) {
                            // Dividir nombres largos en múltiples líneas
                            if (value.length > 15) {
                                const words = value.split(' ');
                                const mid = Math.ceil(words.length / 2);
                                return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ');
                            }
                            return value;
                        }
                    },
                    splitArea: {
                        areaStyle: {
                            color: ['rgba(114, 172, 209, 0.1)', 'rgba(114, 172, 209, 0.2)']
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#23243a'
                        }
                    },
                    center: ['50%', '55%'],
                    radius: '65%'
                },
                series: [{
                    type: 'radar',
                    data: [
                        {
                            value: data.valores_equipo1,
                            name: data.equipo1.nombre,
                            areaStyle: { color: 'rgba(0, 212, 255, 0.3)' },
                            lineStyle: { color: '#00d4ff', width: 2 },
                            itemStyle: { color: '#00d4ff' },
                            symbolSize: 6
                        },
                        {
                            value: data.valores_equipo2,
                            name: data.equipo2.nombre,
                            areaStyle: { color: 'rgba(255, 215, 0, 0.15)' },
                            lineStyle: { color: '#ffd700', width: 2 },
                            itemStyle: { color: '#ffd700' },
                            symbolSize: 6
                        }
                    ]
                }]
            };

            chart.setOption(option, true);
            console.log('✅ Gráfico de equipos renderizado correctamente');

            // ✅ GUARDAR REFERENCIA
            window.currentEquiposChart = chart;

            // ✅ EVENTO RESIZE CON PROTECCIÓN
            const resizeHandler = () => {
                if (window.currentEquiposChart && !window.currentEquiposChart.isDisposed()) {
                    try {
                        window.currentEquiposChart.resize();
                    } catch (e) {
                        console.warn('⚠️ Error en resize de gráfico equipos:', e);
                    }
                }
            };

            // ✅ REMOVER LISTENER ANTERIOR SI EXISTE
            if (window.equiposResizeHandler) {
                window.removeEventListener('resize', window.equiposResizeHandler);
            }
            window.equiposResizeHandler = resizeHandler;
            window.addEventListener('resize', resizeHandler);

        } catch (error) {
            console.error('❌ Error renderizando gráfico de equipos:', error);
            chartContainer.innerHTML = `<div class="error-chart">Error: ${error.message}</div>`;
        }
    }, 150);
}

// ✅ FUNCIÓN PARA RENDERIZAR RADAR DE JUGADORES (CORREGIDA)
function renderRadarJugadores(data) {
    const chartContainer = document.getElementById('radar-comparacion-jugadores');
    if (!chartContainer) {
        console.error('❌ Contenedor del gráfico de jugadores no encontrado');
        return;
    }

    // ✅ DESTRUIR GRÁFICO EXISTENTE SI EXISTE
    if (window.currentJugadoresChart) {
        try {
            window.currentJugadoresChart.dispose();
            console.log('🔄 Gráfico de jugadores anterior destruido');
        } catch (e) {
            console.warn('⚠️ Error destruyendo gráfico anterior:', e);
        }
        window.currentJugadoresChart = null;
    }

    // ✅ LIMPIAR COMPLETAMENTE EL CONTENEDOR
    chartContainer.innerHTML = '';
    chartContainer.style.width = '100%';
    chartContainer.style.height = '420px';

    // ✅ PEQUEÑA PAUSA PARA ASEGURAR QUE EL DOM SE ACTUALICE
    setTimeout(() => {
        try {
            // ✅ VERIFICAR QUE EL CONTENEDOR SIGUE EXISTIENDO
            if (!document.getElementById('radar-comparacion-jugadores')) {
                console.warn('⚠️ Contenedor removido durante el renderizado');
                return;
            }

            // ✅ INICIALIZAR ECHARTS
            const chart = echarts.init(chartContainer, null, {
                devicePixelRatio: 2
            });

            const option = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: '#1a1a2e',
                    borderColor: '#00d4ff',
                    textStyle: { color: '#fff' },
                    formatter: function(params) {
                        const jugadorNombre = params.name;
                        const indicatorIndex = params.dataIndex;
                        return generarTooltipJugadores(data, jugadorNombre, indicatorIndex);
                    }
                },
                legend: {
                    data: [data.jugador1.nombre, data.jugador2.nombre],
                    textStyle: { color: '#ffffff' },
                    top: 20
                },
                radar: {
                    indicator: data.estadisticas.map(stat => ({
                        name: stat.nombre,
                        max: Math.max(stat.max_valor, 10),
                        min: 0
                    })),
                    name: {
                        textStyle: {
                            color: '#00d4ff',
                            fontSize: 11
                        },
                        formatter: function(value) {
                            if (value.length > 12) {
                                return value.substring(0, 12) + '...';
                            }
                            return value;
                        }
                    },
                    splitArea: {
                        areaStyle: {
                            color: ['rgba(114, 172, 209, 0.1)', 'rgba(114, 172, 209, 0.2)']
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#23243a'
                        }
                    },
                    center: ['50%', '55%'],
                    radius: '65%'
                },
                series: [{
                    type: 'radar',
                    data: [
                        {
                            value: data.valores_jugador1,
                            name: data.jugador1.nombre,
                            areaStyle: { color: 'rgba(0, 212, 255, 0.3)' },
                            lineStyle: { color: '#00d4ff', width: 2 },
                            itemStyle: { color: '#00d4ff' },
                            symbolSize: 6
                        },
                        {
                            value: data.valores_jugador2,
                            name: data.jugador2.nombre,
                            areaStyle: { color: 'rgba(255, 215, 0, 0.15)' },
                            lineStyle: { color: '#ffd700', width: 2 },
                            itemStyle: { color: '#ffd700' },
                            symbolSize: 6
                        }
                    ]
                }]
            };

            chart.setOption(option, true);
            console.log('✅ Gráfico de jugadores renderizado');

            // ✅ GUARDAR REFERENCIA
            window.currentJugadoresChart = chart;

            // ✅ EVENTO RESIZE CON PROTECCIÓN
            const resizeHandler = () => {
                if (window.currentJugadoresChart && document.getElementById('radar-comparacion-jugadores')) {
                    try {
                        window.currentJugadoresChart.resize();
                    } catch (e) {
                        console.warn('⚠️ Error en resize del gráfico:', e);
                    }
                }
            };

            // ✅ REMOVER LISTENER ANTERIOR SI EXISTE
            if (window.jugadoresResizeHandler) {
                window.removeEventListener('resize', window.jugadoresResizeHandler);
            }
            window.jugadoresResizeHandler = resizeHandler;
            window.addEventListener('resize', resizeHandler);

        } catch (error) {
            console.error('❌ Error renderizando gráfico de jugadores:', error);
            chartContainer.innerHTML = `<div class="error-chart">Error: ${error.message}</div>`;
        }
    }, 150); // ✅ Aumentar timeout a 150ms
}

// ✅ FUNCIONES PARA ALTERNAR MODOS (AGREGAR AL FINAL DEL ARCHIVO)

// ✅ FUNCIÓN PARA ALTERNAR MODO EQUIPOS
function toggleModoEquipos(modo) {
    console.log('🔄 Cambiando modo equipos a:', modo);
    
    const btnGraficos = document.getElementById('btn-graficos-equipos');
    const btnEstadisticas = document.getElementById('btn-estadisticas-equipos');
    const radarContainer = document.getElementById('radar-comparacion-equipos');
    const estadisticasContainer = document.getElementById('estadisticas-comparacion-equipos');
    const grupoSelectContainer = document.querySelector('.controles-superiores-equipos .grupo-select-container');
    
    if (modo === 'graficos') {
        // ✅ ACTIVAR MODO GRÁFICOS
        btnGraficos.classList.add('modo-activo');
        btnEstadisticas.classList.remove('modo-activo');
        
        // ✅ MOSTRAR SELECTOR DE GRUPO
        if (grupoSelectContainer) {
            grupoSelectContainer.style.display = 'block';
        }
        
        if (radarContainer) radarContainer.style.display = 'block';
        if (estadisticasContainer) estadisticasContainer.style.display = 'none';
        
        // ✅ RECOMPARAR EQUIPOS PARA MOSTRAR GRÁFICO
        compararEquipos();
        
    } else if (modo === 'estadisticas') {
        // ✅ ACTIVAR MODO ESTADÍSTICAS
        btnGraficos.classList.remove('modo-activo');
        btnEstadisticas.classList.add('modo-activo');
        
        // ✅ OCULTAR SELECTOR DE GRUPO
        if (grupoSelectContainer) {
            grupoSelectContainer.style.display = 'none';
        }
        
        if (radarContainer) radarContainer.style.display = 'none';
        if (estadisticasContainer) estadisticasContainer.style.display = 'block';
        
        // ✅ MOSTRAR TODAS LAS ESTADÍSTICAS
        mostrarTodasEstadisticasEquipos();
    }
}

// ✅ FUNCIÓN PARA ALTERNAR ENTRE GRÁFICOS Y ESTADÍSTICAS DE JUGADORES (ACTUALIZADA)
function toggleModoJugadores(modo) {
    console.log(`🔄 Cambiando modo de jugadores a: ${modo}`);
    
    const radarContainer = document.getElementById('radar-comparacion-jugadores');
    const estadisticasContainer = document.getElementById('estadisticas-comparacion-jugadores');
    const btnGraficos = document.getElementById('btn-graficos-jugadores');
    const btnEstadisticas = document.getElementById('btn-estadisticas-jugadores');
    const grupoContainer = document.querySelector('#jugadores-comparacion-container .grupo-select-container');
    
    // ✅ RESETEAR CLASES
    if (btnGraficos) btnGraficos.classList.remove('modo-activo');
    if (btnEstadisticas) btnEstadisticas.classList.remove('modo-activo');
    
    if (modo === 'graficos') {
        // ✅ MOSTRAR GRÁFICOS
        if (radarContainer) radarContainer.style.display = 'block';
        if (estadisticasContainer) estadisticasContainer.style.display = 'none';
        if (btnGraficos) btnGraficos.classList.add('modo-activo');
        if (grupoContainer) grupoContainer.style.display = 'block';
        
        // ✅ ACTUALIZAR GRÁFICO SI HAY JUGADORES SELECCIONADOS
        compararJugadores();
        
    } else if (modo === 'estadisticas') {
        // ✅ MOSTRAR ESTADÍSTICAS COMPLETAS
        if (radarContainer) radarContainer.style.display = 'none';
        if (estadisticasContainer) estadisticasContainer.style.display = 'block';
        if (btnEstadisticas) btnEstadisticas.classList.add('modo-activo');
        if (grupoContainer) grupoContainer.style.display = 'none';
        
        // ✅ CARGAR TODAS LAS ESTADÍSTICAS
        mostrarTodasEstadisticasJugadores();
    }
    
    window.comparacionData.modoJugadores = modo;
    console.log(`✅ Modo de jugadores cambiado a: ${modo}`);
}

// ✅ FUNCIÓN PARA MOSTRAR ESTADÍSTICAS DE EQUIPOS EN TABLA
async function mostrarEstadisticasEquipos() {
    const equipo1Id = document.getElementById('equipo1-select')?.value;
    const equipo2Id = document.getElementById('equipo2-select')?.value;
    const grupo = document.getElementById('grupo-select-equipos')?.value;
    const estadisticasContainer = document.getElementById('estadisticas-comparacion-equipos');

    if (!estadisticasContainer) {
        console.error('❌ Contenedor de estadísticas de equipos no encontrado');
        return;
    }

    if (!equipo1Id || !equipo2Id || !grupo) {
        estadisticasContainer.innerHTML = `
            <div class="no-data">
                <i class="bx bx-info-circle"></i>
                Selecciona dos equipos y un grupo para ver las estadísticas
            </div>
        `;
        return;
    }

    // ✅ MOSTRAR LOADING
    estadisticasContainer.innerHTML = '<div class="loading-chart">🔄 Cargando estadísticas...</div>';

    try {
        const csrfToken = getCsrfToken();
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/comparar-equipos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                equipo1_id: equipo1Id,
                equipo2_id: equipo2Id,
                grupo: grupo
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Datos de estadísticas equipos:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // ✅ RENDERIZAR TABLA DE ESTADÍSTICAS
        renderTablaEstadisticasEquipos(data, estadisticasContainer);

    } catch (error) {
        console.error('❌ Error cargando estadísticas de equipos:', error);
        estadisticasContainer.innerHTML = `
            <div class="error-chart">
                <i class="bx bx-error"></i>
                Error: ${error.message}
            </div>
        `;
    }
}

// ✅ FUNCIÓN PARA MOSTRAR ESTADÍSTICAS DE JUGADORES EN TABLA
async function mostrarEstadisticasJugadores() {
    const jugador1Id = document.getElementById('jugador1-select')?.value;
    const jugador2Id = document.getElementById('jugador2-select')?.value;
    const grupo = document.getElementById('grupo-select-jugadores')?.value;
    const estadisticasContainer = document.getElementById('estadisticas-comparacion-jugadores');

    if (!estadisticasContainer) {
        console.error('❌ Contenedor de estadísticas de jugadores no encontrado');
        return;
    }

    if (!jugador1Id || !jugador2Id || !grupo) {
        estadisticasContainer.innerHTML = `
            <div class="no-data">
                <i class="bx bx-info-circle"></i>
                Selecciona dos jugadores y un grupo para ver las estadísticas
            </div>
        `;
        return;
    }

    // ✅ MOSTRAR LOADING
    estadisticasContainer.innerHTML = '<div class="loading-chart">🔄 Cargando estadísticas...</div>';

    try {
        const csrfToken = getCsrfToken();
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/comparar-jugadores/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                jugador1_id: jugador1Id,
                jugador2_id: jugador2Id,
                grupo: grupo
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Datos de estadísticas jugadores:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // ✅ RENDERIZAR TABLA DE ESTADÍSTICAS
        renderTablaEstadisticasJugadores(data, estadisticasContainer);

    } catch (error) {
        console.error('❌ Error cargando estadísticas de jugadores:', error);
        estadisticasContainer.innerHTML = `
            <div class="error-chart">
                <i class="bx bx-error"></i>
                Error: ${error.message}
            </div>
        `;
    }
}

// ✅ FUNCIÓN OPTIMIZADA PARA MOSTRAR TODAS LAS ESTADÍSTICAS DE EQUIPOS
async function mostrarTodasEstadisticasEquipos() {
    const equipo1Id = document.getElementById('equipo1-select')?.value;
    const equipo2Id = document.getElementById('equipo2-select')?.value;
    const estadisticasContainer = document.getElementById('estadisticas-comparacion-equipos');

    console.log('🔍 Debug - IDs:', { equipo1Id, equipo2Id });

    if (!estadisticasContainer) {
        console.error('❌ Contenedor de estadísticas de equipos no encontrado');
        return;
    }

    if (!equipo1Id || !equipo2Id) {
        estadisticasContainer.innerHTML = `
            <div class="no-data">
                <i class="bx bx-info-circle"></i>
                Selecciona dos equipos para ver todas las estadísticas
            </div>
        `;
        return;
    }

    // ✅ MOSTRAR LOADING
    estadisticasContainer.innerHTML = '<div class="loading-chart">🔄 Cargando todas las estadísticas...</div>';

    try {
        const csrfToken = getCsrfToken();
        const requestData = {
            equipo1_id: equipo1Id,
            equipo2_id: equipo2Id
        };
        
        console.log('📤 Enviando request:', requestData);
        console.log('🔑 CSRF Token:', csrfToken);
        
        // ✅ UNA SOLA PETICIÓN PARA TODAS LAS ESTADÍSTICAS
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/comparar-equipos-completo/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(requestData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response error text:', errorText);
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Response data:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // ✅ RENDERIZAR TABLA COMPLETA OPTIMIZADA
        renderTablaCompletaEquiposOptimizada(data, estadisticasContainer);

    } catch (error) {
        console.error('❌ Error completo:', error);
        estadisticasContainer.innerHTML = `
            <div class="error-chart">
                <i class="bx bx-error"></i>
                Error: ${error.message}
            </div>
        `;
    }
}

// ✅ FUNCIÓN OPTIMIZADA PARA MOSTRAR TODAS LAS ESTADÍSTICAS DE JUGADORES
async function mostrarTodasEstadisticasJugadores() {
    const jugador1Id = document.getElementById('jugador1-select')?.value;
    const jugador2Id = document.getElementById('jugador2-select')?.value;
    const estadisticasContainer = document.getElementById('estadisticas-comparacion-jugadores');

    if (!estadisticasContainer) {
        console.error('❌ Contenedor de estadísticas de jugadores no encontrado');
        return;
    }

    if (!jugador1Id || !jugador2Id) {
        estadisticasContainer.innerHTML = `
            <div class="no-data">
                <i class="bx bx-info-circle"></i>
                Selecciona dos jugadores para ver todas las estadísticas
            </div>
        `;
        return;
    }

    // ✅ MOSTRAR LOADING
    estadisticasContainer.innerHTML = '<div class="loading-chart">🔄 Cargando todas las estadísticas...</div>';

    try {
        const csrfToken = getCsrfToken();
        const requestData = {
            jugador1_id: jugador1Id,
            jugador2_id: jugador2Id
        };
        
        console.log('📤 Enviando request a:', `${API_CONFIG.BASE_URL}/ajax/comparar-jugadores-completo/`);
        console.log('📤 Data:', requestData);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/comparar-jugadores-completo/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(requestData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);

        if (!response.ok) {
        }

        const data = await response.json();
        console.log('✅ Response data:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // ✅ RENDERIZAR TABLA COMPLETA OPTIMIZADA
        renderTablaCompletaJugadoresOptimizada(data, estadisticasContainer);

    } catch (error) {
        console.error('❌ Error completo:', error);
        estadisticasContainer.innerHTML = `
            <div class="error-chart">
                <i class="bx bx-error"></i>
                <strong>Error:</strong> ${error.message}
                <br><br>
                <button onclick="mostrarTodasEstadisticasJugadores()" class="retry-btn">Reintentar</button>
            </div>
        `;
    }
}

// ✅ FUNCIÓN PARA RENDERIZAR TABLA COMPLETA DE EQUIPOS OPTIMIZADA
function renderTablaCompletaEquiposOptimizada(data) {
    console.log('🎨 Renderizando tabla completa de equipos (CON VALIDACIÓN CORREGIDA)');
    console.log('📊 Data recibida:', data);
    
    const container = document.getElementById('estadisticas-comparacion-equipos');
    if (!container) {
        console.error('❌ Contenedor estadisticas-comparacion-equipos no encontrado');
        return;
    }

    // ✅ VALIDAR QUE data.grupos EXISTA
    if (!data || !data.grupos) {
        console.error('❌ No hay datos de grupos disponibles');
        container.innerHTML = `
            <div class="error-chart">
                <i class="bx bx-error-circle"></i>
                <h4>Error de datos</h4>
                <p>No se pudieron cargar los grupos de estadísticas</p>
            </div>
        `;
        return;
    }

    console.log('🔍 Tipo de data.grupos:', typeof data.grupos);
    console.log('🔍 data.grupos es array:', Array.isArray(data.grupos));
    console.log('🔍 Contenido de data.grupos:', data.grupos);

    // ✅ CONVERTIR OBJETO A ARRAY SI ES NECESARIO
    let gruposArray;
    
    if (Array.isArray(data.grupos)) {
        // Ya es un array
        gruposArray = data.grupos;
        console.log('✅ data.grupos ya es un array');
    } else if (typeof data.grupos === 'object' && data.grupos !== null) {
        // Es un objeto, convertir a array
        gruposArray = Object.entries(data.grupos).map(([key, grupo]) => {
            console.log(`🔄 Procesando grupo ${key}:`, grupo);
            return {
                id: key,
                nombre: grupo.nombre || key,
                icono: grupo.icono || 'bx-stats',
                estadisticas: grupo.estadisticas || []
            };
        });
        console.log('✅ Objeto convertido a array:', gruposArray.length, 'grupos');
    } else {
        console.error('❌ data.grupos no es ni objeto ni array:', data.grupos);
        container.innerHTML = `
            <div class="insufficient-stats-message">
                <div class="stats-warning-icon">
                    <i class="bx bx-time-five"></i>
                </div>
                <h4>⏱️ Sin Estadísticas Detalladas</h4>
                <div class="players-without-stats">
                    <p><strong>${data.equipo1?.nombre || 'Equipo 1'}</strong> y/o <strong>${data.equipo2?.nombre || 'Equipo 2'}</strong> no tienen estadísticas suficientes para comparar.</p>
                </div>
                <div class="stats-explanation">
                    <p><i class="bx bx-info-circle"></i> Verifica que ambos equipos tengan datos estadísticos.</p>
                </div>
                <div class="alternative-options">
                    <button onclick="toggleModoEquipos('graficos')" class="btn-alternative">
                        <i class="bx bx-bar-chart"></i> Ver Gráficos
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // ✅ VERIFICAR SI HAY GRUPOS VÁLIDOS
    if (gruposArray.length === 0) {
        console.warn('⚠️ No hay grupos disponibles');
        container.innerHTML = `
            <div class="insufficient-stats-message">
                <div class="stats-warning-icon">
                    <i class="bx bx-time-five"></i>
                </div>
                <h4>⏱️ Sin Estadísticas Detalladas</h4>
                <div class="players-without-stats">
                    <p><strong>${data.equipo1?.nombre || 'Equipo 1'}</strong> y/o <strong>${data.equipo2?.nombre || 'Equipo 2'}</strong> no tienen estadísticas completas disponibles.</p>
                </div>
                <div class="stats-explanation">
                    <p><i class="bx bx-info-circle"></i> No se encontraron grupos de estadísticas para estos equipos.</p>
                </div>
                <div class="alternative-options">
                    <button onclick="toggleModoEquipos('graficos')" class="btn-alternative">
                        <i class="bx bx-bar-chart"></i> Ver Gráficos
                    </button>
                </div>
            </div>
        `;
        return;
    }

    console.log(`✅ ${gruposArray.length} grupos encontrados para procesar`);

    // ✅ GENERAR HTML DE LA TABLA
    let html = `
        <div class="estadisticas-header">
            <h3>Comparación Completa de Equipos</h3>
            <div class="subtitulo">Todas las estadísticas disponibles</div>
        </div>
        
        <div class="info-equipos">
            <div class="equipo-info equipo1-info">
                <div class="nombre-equipo">${data.equipo1?.nombre || 'Equipo 1'}</div>
                <div class="liga-equipo">${data.equipo1?.liga || 'Liga no especificada'}</div>
                <div class="nombre-corto">${data.equipo1?.nombre_corto || (data.equipo1?.nombre || 'E1').substring(0, 10)}</div>
            </div>
            
            <div class="vs-separator">VS</div>
            
            <div class="equipo-info equipo2-info">
                <div class="nombre-equipo">${data.equipo2?.nombre || 'Equipo 2'}</div>
                <div class="liga-equipo">${data.equipo2?.liga || 'Liga no especificada'}</div>
                <div class="nombre-corto">${data.equipo2?.nombre_corto || (data.equipo2?.nombre || 'E2').substring(0, 10)}</div>
            </div>
        </div>
        
        <div class="tabla-comparacion completa">
    `;

    // ✅ PROCESAR CADA GRUPO (AHORA FUNCIONA CON ARRAY)
    gruposArray.forEach((grupo, index) => {
        console.log(`🔄 Procesando grupo ${index + 1}/${gruposArray.length}: ${grupo.nombre}`, grupo);
        
        // ✅ VALIDAR QUE EL GRUPO TENGA ESTADÍSTICAS
        if (!grupo.estadisticas || !Array.isArray(grupo.estadisticas) || grupo.estadisticas.length === 0) {
            console.warn(`⚠️ Grupo ${grupo.nombre} no tiene estadísticas válidas:`, grupo.estadisticas);
            return; // Saltar este grupo
        }

        html += `
            <div class="grupo-estadisticas">
                <div class="grupo-titulo">
                    <i class="bx ${grupo.icono || 'bx-stats'}"></i>
                    ${grupo.nombre}
                </div>
                
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th class="stat-name">Estadística</th>
                            <th class="equipo1-col">${data.equipo1?.nombre || 'Equipo 1'}</th>
                            <th class="equipo2-col">${data.equipo2?.nombre || 'Equipo 2'}</th>
                            <th class="diferencia-col">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // ✅ PROCESAR ESTADÍSTICAS DEL GRUPO
        grupo.estadisticas.forEach((stat, statIndex) => {
            console.log(`  📊 Procesando estadística ${statIndex + 1}: ${stat.nombre}`, stat);
            
            const valor1 = parseFloat(stat.valor_equipo1 || 0);
            const valor2 = parseFloat(stat.valor_equipo2 || 0);
            const diferencia = valor1 - valor2;
            
            // Determinar cuál es mejor
            const equipo1Mejor = valor1 > valor2;
            const equipo2Mejor = valor2 > valor1;
            
            // Clase para diferencia
            let diferenciaClase = 'neutra';
            let signo = '';
            if (diferencia > 0) {
                diferenciaClase = 'positiva';
                signo = '+';
            } else if (diferencia < 0) {
                diferenciaClase = 'negativa';
            }

            html += `
                <tr>
                    <td class="stat-name">${stat.nombre}</td>
                    <td class="equipo1-col ${equipo1Mejor ? 'mejor-valor' : ''}">
                        <div class="valor-principal">${valor1.toFixed(2)}</div>
                    </td>
                    <td class="equipo2-col ${equipo2Mejor ? 'mejor-valor' : ''}">
                        <div class="valor-principal">${valor2.toFixed(2)}</div>
                    </td>
                    <td class="diferencia ${diferenciaClase}">
                        ${signo}${Math.abs(diferencia).toFixed(2)}
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    });

    html += `</div>`;
    
    container.innerHTML = html;
    console.log('✅ Tabla completa de estadísticas de equipos renderizada (CORREGIDA)');
}

// ✅ FUNCIÓN PARA RENDERIZAR TABLA COMPLETA DE JUGADORES OPTIMIZADA
function renderTablaCompletaJugadoresOptimizada(data) {
    console.log('🎨 Renderizando tabla completa de jugadores (CON VALIDACIÓN CORREGIDA)');
    console.log('📊 Data recibida:', data);
    
    const container = document.getElementById('estadisticas-comparacion-jugadores');
    if (!container) {
        console.error('❌ Contenedor estadisticas-comparacion-jugadores no encontrado');
        return;
    }

    // ✅ VALIDAR QUE data.grupos EXISTA
    if (!data || !data.grupos) {
        console.error('❌ No hay datos de grupos disponibles');
        container.innerHTML = `
            <div class="error-chart">
                <i class="bx bx-error-circle"></i>
                <h4>Error de datos</h4>
                <p>No se pudieron cargar los grupos de estadísticas</p>
            </div>
        `;
        return;
    }

    console.log('🔍 Tipo de data.grupos:', typeof data.grupos);
    console.log('🔍 data.grupos es array:', Array.isArray(data.grupos));
    console.log('🔍 Contenido de data.grupos:', data.grupos);

    // ✅ CONVERTIR OBJETO A ARRAY SI ES NECESARIO
    let gruposArray;
    
    if (Array.isArray(data.grupos)) {
        // Ya es un array
        gruposArray = data.grupos;
        console.log('✅ data.grupos ya es un array');
    } else if (typeof data.grupos === 'object' && data.grupos !== null) {
        // Es un objeto, convertir a array
        gruposArray = Object.entries(data.grupos).map(([key, grupo]) => {
            console.log(`🔄 Procesando grupo ${key}:`, grupo);
            return {
                id: key,
                nombre: grupo.nombre || key,
                icono: grupo.icono || 'bx-stats',
                estadisticas: grupo.estadisticas || []
            };
        });
        console.log('✅ Objeto convertido a array:', gruposArray.length, 'grupos');
    } else {
        console.error('❌ data.grupos no es ni objeto ni array:', data.grupos);
        container.innerHTML = `
            <div class="insufficient-stats-message">
                <div class="stats-warning-icon">
                    <i class="bx bx-time-five"></i>
                </div>
                <h4>⏱️ Sin Estadísticas Detalladas</h4>
                <div class="players-without-stats">
                    <p><strong>${data.jugador1?.nombre || 'Jugador 1'}</strong> y/o <strong>${data.jugador2?.nombre || 'Jugador 2'}</strong> no tienen estadísticas suficientes para comparar.</p>
                </div>
                <div class="stats-explanation">
                    <p><i class="bx bx-info-circle"></i> Los jugadores necesitan haber jugado al menos 300 minutos para tener estadísticas completas.</p>
                </div>
                <div class="alternative-options">
                    <button onclick="toggleModoJugadores('graficos')" class="btn-alternative">
                        <i class="bx bx-bar-chart"></i> Ver Gráficos
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // ✅ VERIFICAR SI HAY GRUPOS VÁLIDOS
    if (gruposArray.length === 0) {
        console.warn('⚠️ No hay grupos disponibles');
        container.innerHTML = `
            <div class="insufficient-stats-message">
                <div class="stats-warning-icon">
                    <i class="bx bx-time-five"></i>
                </div>
                <h4>⏱️ Sin Estadísticas Detalladas</h4>
                <div class="players-without-stats">
                    <p><strong>${data.jugador1?.nombre || 'Jugador 1'}</strong> y/o <strong>${data.jugador2?.nombre || 'Jugador 2'}</strong> no tienen estadísticas completas disponibles.</p>
                </div>
                <div class="stats-explanation">
                    <p><i class="bx bx-info-circle"></i> No se encontraron grupos de estadísticas para estos jugadores.</p>
                </div>
                <div class="alternative-options">
                    <button onclick="toggleModoJugadores('graficos')" class="btn-alternative">
                        <i class="bx bx-bar-chart"></i> Ver Gráficos
                    </button>
                </div>
            </div>
        `;
        return;
    }

    console.log(`✅ ${gruposArray.length} grupos encontrados para procesar`);

    // ✅ GENERAR HTML DE LA TABLA
    let html = `
        <div class="estadisticas-header">
            <h3>Comparación Completa de Jugadores</h3>
            <div class="subtitulo">Todas las estadísticas disponibles por percentiles</div>
        </div>
        
        <div class="info-jugadores">
            <div class="jugador-info jugador1-info">
                <div class="nombre-jugador">${data.jugador1?.nombre || 'Jugador 1'}</div>
                <div class="equipo-jugador">${data.jugador1?.equipo || 'Sin equipo'}</div>
                <div class="posicion-jugador">${data.jugador1?.posicion || 'Posición no especificada'}</div>
            </div>
            
            <div class="vs-separator">VS</div>
            
            <div class="jugador-info jugador2-info">
                <div class="nombre-jugador">${data.jugador2?.nombre || 'Jugador 2'}</div>
                <div class="equipo-jugador">${data.jugador2?.equipo || 'Sin equipo'}</div>
                <div class="posicion-jugador">${data.jugador2?.posicion || 'Posición no especificada'}</div>
            </div>
        </div>
        
        <div class="tabla-comparacion completa">
    `;

    // ✅ PROCESAR CADA GRUPO (AHORA FUNCIONA CON ARRAY)
    gruposArray.forEach((grupo, index) => {
        console.log(`🔄 Procesando grupo ${index + 1}/${gruposArray.length}: ${grupo.nombre}`, grupo);
        
        // ✅ VALIDAR QUE EL GRUPO TENGA ESTADÍSTICAS
        if (!grupo.estadisticas || !Array.isArray(grupo.estadisticas) || grupo.estadisticas.length === 0) {
            console.warn(`⚠️ Grupo ${grupo.nombre} no tiene estadísticas válidas:`, grupo.estadisticas);
            return; // Saltar este grupo
        }

        html += `
            <div class="grupo-estadisticas">
                <div class="grupo-titulo">
                    <i class="bx ${grupo.icono || 'bx-stats'}"></i>
                    ${grupo.nombre}
                </div>
                
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th class="stat-name">Estadística</th>
                            <th class="jugador1-col">${data.jugador1?.nombre || 'Jugador 1'}</th>
                            <th class="jugador2-col">${data.jugador2?.nombre || 'Jugador 2'}</th>
                            <th class="diferencia-col">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // ✅ PROCESAR ESTADÍSTICAS DEL GRUPO
        grupo.estadisticas.forEach((stat, statIndex) => {
            console.log(`  📊 Procesando estadística ${statIndex + 1}: ${stat.nombre}`, stat);
            
            const valor1 = parseFloat(stat.valor_jugador1 || 0);
            const valor2 = parseFloat(stat.valor_jugador2 || 0);
            const diferencia = valor1 - valor2;
            
            // Determinar cuál es mejor (para percentiles, más alto siempre es mejor)
            const jugador1Mejor = valor1 > valor2;
            const jugador2Mejor = valor2 > valor1;
            
            // Clase para diferencia
            let diferenciaClase = 'neutra';
            let signo = '';
            if (diferencia > 0) {
                diferenciaClase = 'positiva';
                signo = '+';
            } else if (diferencia < 0) {
                diferenciaClase = 'negativa';
            }

            html += `
                <tr>
                    <td class="stat-name">${stat.nombre}</td>
                    <td class="jugador1-col ${jugador1Mejor ? 'mejor-valor' : ''}">
                        <div class="valor-principal">${Math.round(valor1)}</div>
                        <div class="percentil">Percentil ${Math.round(valor1)}</div>
                    </td>
                    <td class="jugador2-col ${jugador2Mejor ? 'mejor-valor' : ''}">
                        <div class="valor-principal">${Math.round(valor2)}</div>
                        <div class="percentil">Percentil ${Math.round(valor2)}</div>
                    </td>
                    <td class="diferencia ${diferenciaClase}">
                        ${signo}${Math.abs(diferencia).toFixed(1)}
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    });

    html += `</div>`;
    
    container.innerHTML = html;
    console.log('✅ Tabla completa de estadísticas de jugadores renderizada (CORREGIDA)');
}

// ✅ FUNCIÓN AUXILIAR PARA GENERAR TOOLTIP DE JUGADORES
function generarTooltipJugadores(data, jugadorNombre, indicatorIndex) {
    try {
        const statName = data.estadisticas[indicatorIndex]?.nombre || 'Estadística';
        let valor = 0;
        
        // Determinar el valor según el jugador
        if (jugadorNombre === data.jugador1?.nombre) {
            valor = data.valores_jugador1[indicatorIndex] || 0;
        } else if (jugadorNombre === data.jugador2?.nombre) {
            valor = data.valores_jugador2[indicatorIndex] || 0;
        }
        
        return `
            <div style="padding: 8px;">
                <strong style="color: #00d4ff;">${jugadorNombre}</strong><br/>
                <span style="color: #fff;">${statName}</span><br/>
                📊 Percentil: <strong>${Math.round(valor)}</strong>
                <div style="font-size: 11px; color: #ccc; margin-top: 3px;">
                    (Mejor que ${Math.round(valor)}% de jugadores)
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error generando tooltip:', error);
        return `<div style="padding: 5px;"><strong>${jugadorNombre}</strong></div>`;
    }
}

// ✅ FUNCIÓN AUXILIAR PARA GENERAR TOOLTIP DE EQUIPOS
function generarTooltipEquipos(data, equipoNombre, indicatorIndex) {
    try {
        const statName = data.estadisticas[indicatorIndex]?.nombre || 'Estadística';
        let valor = 0;
        
        // Determinar el valor según el equipo
        if (equipoNombre === data.equipo1?.nombre) {
            valor = data.valores_equipo1[indicatorIndex] || 0;
        } else if (equipoNombre === data.equipo2?.nombre) {
            valor = data.valores_equipo2[indicatorIndex] || 0;
        }
        
        return `
            <div style="padding: 8px;">
                <strong style="color: #00d4ff;">${equipoNombre}</strong><br/>
                <span style="color: #fff;">${statName}</span><br/>
                📊 Percentil: <strong>${Math.round(valor)}</strong>
                <div style="font-size: 11px; color: #ccc; margin-top: 3px;">
                    (Mejor que ${Math.round(valor)}% de equipos)
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error generando tooltip:', error);
        return `<div style="padding: 5px;"><strong>${equipoNombre}</strong></div>`;
    }
}

// ✅ FUNCIÓN PARA MOSTRAR MENSAJE DE ESTADÍSTICAS INSUFICIENTES
function mostrarMensajeEstadisticasInsuficientes(container, jugadoresSinStats, tipo = 'jugadores') {
    const esJugadores = tipo === 'jugadores';
    const entidad1 = esJugadores ? 'jugador' : 'equipo';
    const entidad2 = esJugadores ? 'jugadores' : 'equipos';
    const requisito = esJugadores ? 'al menos 300 minutos' : 'estadísticas suficientes';
    
    container.innerHTML = `
        <div class="insufficient-stats-message">
            <div class="stats-warning-icon">
                <i class="bx bx-time-five"></i>
            </div>
            <h4>⏱️ Sin Estadísticas Detalladas</h4>
            <div class="players-without-stats">
                <p>Los siguientes ${entidad2} no tienen estadísticas completas:</p>
                <ul>
                    ${jugadoresSinStats.map(nombre => `<li><strong>${nombre}</strong></li>`).join('')}
                </ul>
            </div>
            <div class="stats-explanation">
                <p><i class="bx bx-info-circle"></i> Los ${entidad2} necesitan ${requisito} para tener estadísticas completas.</p>
                <p>Puedes comparar gráficamente usando solo las estadísticas básicas disponibles.</p>
            </div>
            <div class="alternative-options">
                <button onclick="toggleModo${esJugadores ? 'Jugadores' : 'Equipos'}('graficos')" class="btn-alternative">
                    <i class="bx bx-bar-chart"></i> Ver Gráficos
                </button>
            </div>
        </div>
    `;
}

// ✅ FUNCIÓN PARA VALIDAR DATOS DE COMPARACIÓN
function validarDatosComparacion(data, tipo = 'jugadores') {
    if (!data) {
        console.error('❌ No hay datos para validar');
        return { valido: false, error: 'No hay datos disponibles' };
    }
    
    const esJugadores = tipo === 'jugadores';
    const entidad1Key = esJugadores ? 'jugador1' : 'equipo1';
    const entidad2Key = esJugadores ? 'jugador2' : 'equipo2';
    
    if (!data[entidad1Key] || !data[entidad2Key]) {
        console.error(`❌ Faltan datos de ${tipo}:`, { 
            [entidad1Key]: !!data[entidad1Key], 
            [entidad2Key]: !!data[entidad2Key] 
        });
        return { 
            valido: false, 
            error: `Información de ${tipo} incompleta` 
        };
    }
    
    if (!data.estadisticas || !data[`valores_${entidad1Key.split('1')[0]}1`] || !data[`valores_${entidad1Key.split('1')[0]}2`]) {
        console.error('❌ Estadísticas faltantes:', {
            estadisticas: !!data.estadisticas,
            valores1: !!data[`valores_${entidad1Key.split('1')[0]}1`],
            valores2: !!data[`valores_${entidad1Key.split('1')[0]}2`]
        });
        return { 
            valido: false, 
            error: 'Faltan estadísticas para la comparación' 
        };
    }
    
    return { valido: true };
}

console.log('✅ Funciones de tabla completa para jugadores cargadas correctamente');