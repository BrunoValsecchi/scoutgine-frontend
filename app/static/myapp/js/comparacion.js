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

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando comparación...');
    
    try {
        // ✅ CARGAR DATOS INICIALES
        await cargarDatosComparacion();
        
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
});

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

// ✅ FUNCIÓN PARA CONFIGURAR NAVEGACIÓN
function setupNavegacion() {
    // Escuchar eventos de navegación del header
    document.addEventListener('navButtonClick', function(e) {
        const { page, button } = e.detail;
        if (page === 'comparacion') {
            handleComparacionNavigation(button);
        }
    });
}

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
    // ✅ LIMPIAR GRÁFICO DE JUGADORES ANTES DE OCULTAR
    if (window.currentJugadoresChart) {
        try {
            window.currentJugadoresChart.dispose();
            window.currentJugadoresChart = null;
        } catch (e) {
            console.warn('⚠️ Error limpiando gráfico de jugadores:', e);
        }
    }

    document.getElementById('equipos-comparacion-container').style.display = 'block';
    document.getElementById('jugadores-comparacion-container').style.display = 'none';
    window.comparacionData.currentMode = 'equipos';
    console.log('📊 Modo: Comparación de equipos');
}

function showJugadoresComparacion() {
    // ✅ LIMPIAR GRÁFICO DE EQUIPOS ANTES DE OCULTAR
    if (window.currentEquiposChart) {
        try {
            window.currentEquiposChart.dispose();
            window.currentEquiposChart = null;
        } catch (e) {
            console.warn('⚠️ Error limpiando gráfico de equipos:', e);
        }
    }

    document.getElementById('equipos-comparacion-container').style.display = 'none';
    document.getElementById('jugadores-comparacion-container').style.display = 'block';
    window.comparacionData.currentMode = 'jugadores';
    console.log('👥 Modo: Comparación de jugadores');
}

// ✅ FUNCIÓN PARA CONFIGURAR EVENT LISTENERS
function setupEventListeners() {
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

// ✅ FUNCIÓN PARA CARGAR JUGADORES DE UN EQUIPO
async function cargarJugadoresEquipo(equipoId, selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Cargando jugadores...</option>';
    select.disabled = true;

    if (!equipoId) {
        select.innerHTML = '<option value="">Primero selecciona equipo</option>';
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/equipo/${equipoId}/jugadores/`);
        const data = await response.json();

        select.innerHTML = '<option value="">Selecciona jugador</option>';
        
        if (data.jugadores && data.jugadores.length > 0) {
            data.jugadores.forEach(jugador => {
                const option = document.createElement('option');
                option.value = jugador.id;
                option.textContent = `${jugador.nombre} (${jugador.posicion || 'POS'})`;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">No hay jugadores disponibles</option>';
        }
        
        select.disabled = false;
        
    } catch (error) {
        console.error('Error cargando jugadores:', error);
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

// ✅ FUNCIÓN PARA COMPARAR JUGADORES (MEJORADA)
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
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Datos de comparación jugadores:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // ✅ RENDERIZAR GRÁFICO RADAR
        renderRadarJugadores(data);

    } catch (error) {
        console.error('❌ Error comparando jugadores:', error);
        if (chartContainer) {
            chartContainer.innerHTML = `<div class="error-chart">Error: ${error.message}</div>`;
        }
    }
}

// ✅ FUNCIÓN PARA RENDERIZAR RADAR DE EQUIPOS (CORREGIDA)
function renderRadarEquipos(data) {
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
                console.warn('⚠️ Contenedor eliminado durante el renderizado');
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
                        const equipoNombre = params.name;
                        const indicatorIndex = params.dataIndex;
                        return generarTooltipEquipos(data, equipoNombre, indicatorIndex);
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
            console.log('✅ Gráfico de equipos renderizado');

            // ✅ GUARDAR REFERENCIA
            window.currentEquiposChart = chart;

            // ✅ EVENTO RESIZE CON PROTECCIÓN
            const resizeHandler = () => {
                if (window.currentEquiposChart && document.getElementById('radar-comparacion-equipos')) {
                    try {
                        window.currentEquiposChart.resize();
                    } catch (e) {
                        console.warn('⚠️ Error en resize del gráfico:', e);
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
    }, 150); // ✅ Aumentar timeout a 150ms
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
                console.warn('⚠️ Contenedor eliminado durante el renderizado');
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

// ✅ FUNCIÓN PARA ALTERNAR MODO JUGADORES (ACTUALIZADA)
function toggleModoJugadores(modo) {
    console.log('🔄 Cambiando modo jugadores a:', modo);
    
    const btnGraficos = document.getElementById('btn-graficos-jugadores');
    const btnEstadisticas = document.getElementById('btn-estadisticas-jugadores');
    const radarContainer = document.getElementById('radar-comparacion-jugadores');
    const estadisticasContainer = document.getElementById('estadisticas-comparacion-jugadores');
    const grupoSelectContainer = document.querySelector('.controles-superiores-jugadores .grupo-select-container');
    
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
        
        // ✅ RECOMPARAR JUGADORES PARA MOSTRAR GRÁFICO
        compararJugadores();
        
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
        mostrarTodasEstadisticasJugadores();
    }
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
        
        // ✅ UNA SOLA PETICIÓN PARA TODAS LAS ESTADÍSTICAS
        const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/comparar-jugadores-completo/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                jugador1_id: jugador1Id,
                jugador2_id: jugador2Id
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Todas las estadísticas de jugadores:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // ✅ RENDERIZAR TABLA COMPLETA OPTIMIZADA
        renderTablaCompletaJugadoresOptimizada(data, estadisticasContainer);

    } catch (error) {
        console.error('❌ Error cargando todas las estadísticas de jugadores:', error);
        estadisticasContainer.innerHTML = `
            <div class="error-chart">
                <i class="bx bx-error"></i>
                Error: ${error.message}
            </div>
        `;
    }
}

// ✅ FUNCIÓN OPTIMIZADA PARA RENDERIZAR TABLA COMPLETA DE EQUIPOS
function renderTablaCompletaEquiposOptimizada(data, container) {
    const { equipo1, equipo2, grupos } = data;
    
    let html = `
        <div class="tabla-comparacion completa">
            <div class="estadisticas-header">
                <h3>Comparación Completa: ${equipo1.nombre} vs ${equipo2.nombre}</h3>
                <p class="subtitulo">Todas las estadísticas por categorías</p>
            </div>
            
            <!-- ✅ INFORMACIÓN DE EQUIPOS -->
            <div class="info-equipos">
                <div class="equipo-info equipo1-info">
                    <div class="nombre-equipo">${equipo1.nombre}</div>
                    <div class="liga-equipo">${equipo1.liga}</div>
                </div>
                <div class="vs-separator">VS</div>
                <div class="equipo-info equipo2-info">
                    <div class="nombre-equipo">${equipo2.nombre}</div>
                    <div class="liga-equipo">${equipo2.liga}</div>
                </div>
            </div>
    `;

    // ✅ GENERAR TABLA PARA CADA GRUPO (MÁS RÁPIDO)
    Object.entries(grupos).forEach(([grupoKey, grupoData]) => {
        const { nombre, icono, estadisticas, valores_equipo1, valores_equipo2 } = grupoData;
        
        html += `
            <div class="grupo-estadisticas">
                <h4 class="grupo-titulo">
                    <i class="bx ${icono}"></i>
                    ${nombre}
                </h4>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th class="stat-name">Estadística</th>
                            <th class="equipo1-col">${equipo1.nombre}</th>
                            <th class="equipo2-col">${equipo2.nombre}</th>
                            <th class="diferencia-col">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // ✅ AGREGAR FILAS DE ESTADÍSTICAS (OPTIMIZADO)
        estadisticas.forEach((stat, index) => {
            const valor1 = valores_equipo1[index];
            const valor2 = valores_equipo2[index];
            const diferencia = valor1 - valor2;
            
            const equipo1Mejor = valor1 > valor2;
            const equipo2Mejor = valor2 > valor1;
            
            const clase1 = equipo1Mejor ? 'mejor-valor equipo1-col' : 'equipo1-col';
            const clase2 = equipo2Mejor ? 'mejor-valor equipo2-col' : 'equipo2-col';
            
            let claseDiferencia = 'diferencia neutra';
            let simboloDiferencia = '';
            if (diferencia > 0) {
                claseDiferencia = 'diferencia positiva';
                simboloDiferencia = '+';
            } else if (diferencia < 0) {
                claseDiferencia = 'diferencia negativa';
                simboloDiferencia = '';
            }

            html += `
                <tr>
                    <td class="stat-name">${stat.nombre}</td>
                    <td class="${clase1}">
                        <div class="stat-value">
                            <div class="valor-principal">${valor1.toFixed(2)}</div>
                        </div>
                    </td>
                    <td class="${clase2}">
                        <div class="stat-value">
                            <div class="valor-principal">${valor2.toFixed(2)}</div>
                        </div>
                    </td>
                    <td class="${claseDiferencia}">
                        ${simboloDiferencia}${diferencia.toFixed(2)}
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

    html += '</div>';
    container.innerHTML = html;
    console.log('✅ Tabla completa de estadísticas de equipos renderizada (OPTIMIZADA)');
}

// ✅ FUNCIÓN OPTIMIZADA PARA RENDERIZAR TABLA COMPLETA DE JUGADORES
function renderTablaCompletaJugadoresOptimizada(data, container) {
    const { jugador1, jugador2, grupos } = data;
    
    let html = `
        <div class="tabla-comparacion completa">
            <div class="estadisticas-header">
                <h3>Comparación Completa: ${jugador1.nombre} vs ${jugador2.nombre}</h3>
                <p class="subtitulo">Todas las estadísticas por categorías</p>
            </div>
            
            <!-- ✅ INFORMACIÓN DE JUGADORES -->
            <div class="info-jugadores">
                <div class="jugador-info jugador1-info">
                    <div class="nombre-jugador">${jugador1.nombre}</div>
                    <div class="equipo-jugador">${jugador1.equipo}</div>
                    <div class="posicion-jugador">${jugador1.posicion}</div>
                    <div class="edad-pais">${jugador1.edad} años - ${jugador1.pais}</div>
                </div>
                <div class="vs-separator">VS</div>
                <div class="jugador-info jugador2-info">
                    <div class="nombre-jugador">${jugador2.nombre}</div>
                    <div class="equipo-jugador">${jugador2.equipo}</div>
                    <div class="posicion-jugador">${jugador2.posicion}</div>
                    <div class="edad-pais">${jugador2.edad} años - ${jugador2.pais}</div>
                </div>
            </div>
    `;

    // ✅ GENERAR TABLA PARA CADA GRUPO (MÁS RÁPIDO)
    Object.entries(grupos).forEach(([grupoKey, grupoData]) => {
        const { nombre, icono, estadisticas, valores_jugador1, valores_jugador2 } = grupoData;
        
        html += `
            <div class="grupo-estadisticas">
                <h4 class="grupo-titulo">
                    <i class="bx ${icono}"></i>
                    ${nombre}
                </h4>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th class="stat-name">Estadística</th>
                            <th class="jugador1-col">${jugador1.nombre}</th>
                            <th class="jugador2-col">${jugador2.nombre}</th>
                            <th class="diferencia-col">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // ✅ AGREGAR FILAS DE ESTADÍSTICAS (OPTIMIZADO)
        estadisticas.forEach((stat, index) => {
            const valor1 = valores_jugador1[index];
            const valor2 = valores_jugador2[index];
            const diferencia = valor1 - valor2;
            
            const jugador1Mejor = valor1 > valor2;
            const jugador2Mejor = valor2 > valor1;
            
            const clase1 = jugador1Mejor ? 'mejor-valor jugador1-col' : 'jugador1-col';
            const clase2 = jugador2Mejor ? 'mejor-valor jugador2-col' : 'jugador2-col';
            
            let claseDiferencia = 'diferencia neutra';
            let simboloDiferencia = '';
            if (diferencia > 0) {
                claseDiferencia = 'diferencia positiva';
                simboloDiferencia = '+';
            } else if (diferencia < 0) {
                claseDiferencia = 'diferencia negativa';
                simboloDiferencia = '';
            }

            html += `
                <tr>
                    <td class="stat-name">${stat.nombre}</td>
                    <td class="${clase1}">
                        <div class="stat-value">
                            <div class="valor-principal">${valor1.toFixed(2)}</div>
                        </div>
                    </td>
                    <td class="${clase2}">
                        <div class="stat-value">
                            <div class="valor-principal">${valor2.toFixed(2)}</div>
                        </div>
                    </td>
                    <td class="${claseDiferencia}">
                        ${simboloDiferencia}${diferencia.toFixed(2)}
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

    html += '</div>';
    container.innerHTML = html;
    console.log('✅ Tabla completa de estadísticas de jugadores renderizada (OPTIMIZADA)');
}