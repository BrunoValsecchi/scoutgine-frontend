// Evitar redeclaración
if (typeof window.EstadisticaJugadorLoaded === 'undefined') {
    window.EstadisticaJugadorLoaded = true;
    
    console.log('📊 EstadisticaJugador - VERSIÓN LIMPIA Y FUNCIONAL');

    // ✅ FUNCIÓN PARA CARGAR RADAR DE JUGADOR
    function cargarRadarJugador(grupo = 'defensivos', posicion = null) {
        const radarContainer = document.getElementById('radar-jugador-chart-container');
        if (!radarContainer) {
            console.error('❌ Contenedor radar no encontrado');
            return;
        }
        
        const jugadorId = window.jugadorData?.jugadorId;
        if (!jugadorId) {
            console.error('❌ No hay jugadorId');
            radarContainer.innerHTML = '<div style="color:#ff6b6b;text-align:center;">No hay ID de jugador</div>';
            return;
        }
        
        console.log(`🔍 Cargando radar: jugador=${jugadorId}, grupo=${grupo}, posicion=${posicion}`);
        
        radarContainer.style.width = '100%';
        radarContainer.style.height = '500px';

        let url = `${API_CONFIG.BASE_URL}/ajax/radar-jugador/?jugador_id=${jugadorId}&grupo=${grupo}`;
        if (posicion) url += `&posicion=${encodeURIComponent(posicion)}`;

        fetch(url)
            .then(resp => resp.json())
            .then(data => {
                console.log('📊 Datos radar:', data);
                
                if (!data.success) {
                    radarContainer.innerHTML = `<div style="color:#ff6b6b;text-align:center;">${data.error}</div>`;
                    return;
                }

                // Actualizar selector de posición si hay múltiples posiciones
                if (data.posiciones_jugador && data.posiciones_jugador.length > 0) {
                    actualizarSelectorPosicion('posicion-radar-selector', data.posiciones_jugador, data.posicion, () => {
                        const nuevaPosicion = document.getElementById('posicion-radar-selector').value;
                        cargarRadarJugador(grupo, nuevaPosicion);
                    });
                }

                // Destruir gráfico anterior
                if (window.radarJugadorChart) {
                    window.radarJugadorChart.dispose();
                }

                // Crear nuevo gráfico
                window.radarJugadorChart = echarts.init(radarContainer, null, {devicePixelRatio: 2});
                
                const option = {
                    backgroundColor: 'transparent',
                    tooltip: {trigger: 'item'},
                    legend: {
                        data: ['Jugador', 'Promedio'],
                        top: 10,
                        textStyle: {color: '#fff'}
                    },
                    radar: {
                        indicator: data.labels.map(l => ({name: l, max: 100})),
                        splitLine: {lineStyle: {color: '#23243a'}},
                        splitArea: {areaStyle: {color: ['#23243a','#181b23']}},
                        axisName: {
                            color: '#00d4ff',
                            fontSize: 13,
                            formatter: function(value) {
                                // Dividir texto largo en múltiples líneas
                                const palabras = value.split(' ');
                                let linea = '';
                                let resultado = '';
                                for (let palabra of palabras) {
                                    if ((linea + ' ' + palabra).trim().length > 14) {
                                        resultado += linea.trim() + '\n';
                                        linea = palabra + ' ';
                                    } else {
                                        linea += palabra + ' ';
                                    }
                                }
                                resultado += linea.trim();
                                return resultado;
                            }
                        }
                    },
                    series: [{
                        type: 'radar',
                        data: [
                            {value: data.jugador, name: 'Jugador', areaStyle: {color: 'rgba(0,212,255,0.3)'}},
                            {value: data.promedio, name: 'Promedio', areaStyle: {color: 'rgba(255,215,0,0.15)'}}
                        ],
                        symbolSize: 6,
                        lineStyle: {width: 2}
                    }]
                };

                window.radarJugadorChart.setOption(option);
                console.log('✅ Radar renderizado');
            })
            .catch(err => {
                console.error('❌ Error radar:', err);
                radarContainer.innerHTML = '<div style="color:#ff6b6b;text-align:center;">Error al cargar radar</div>';
            });
    }

    // ✅ FUNCIÓN PARA CARGAR BOXPLOT DE JUGADOR
    function cargarBoxplotJugador(estadistica, posicion) {
        const boxplotContainer = document.getElementById('boxplot-jugador-chart-container');
        if (!boxplotContainer) {
            console.error('❌ Contenedor boxplot no encontrado');
            return;
        }

        const jugadorId = window.jugadorData?.jugadorId;
        if (!jugadorId || !estadistica) {
            console.error('❌ Faltan datos para boxplot');
            return;
        }

        console.log(`🔍 Cargando boxplot: jugador=${jugadorId}, estadistica=${estadistica}, posicion=${posicion}`);

        const statKey = obtenerStatDeURL(estadistica);
        boxplotContainer.style.width = '100%';
        boxplotContainer.style.height = '400px';
        boxplotContainer.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">⏳ Cargando boxplot...</div>';

        let url = `${API_CONFIG.BASE_URL}/ajax/boxplot-jugador/?jugador_id=${jugadorId}&estadistica=${encodeURIComponent(statKey)}`;
        if (posicion) url += `&posicion=${encodeURIComponent(posicion)}`;

        fetch(url)
            .then(resp => resp.json())
            .then(data => {
                console.log('📊 Datos boxplot:', data);

                if (!data.success) {
                    boxplotContainer.innerHTML = `<div style="color:#ff6b6b;text-align:center;">${data.error}</div>`;
                    return;
                }

                // Destruir gráfico anterior
                if (window.boxplotJugadorChart) {
                    window.boxplotJugadorChart.dispose();
                }

                // Crear nuevo gráfico
                window.boxplotJugadorChart = echarts.init(boxplotContainer, null, {devicePixelRatio: 2});

                const option = {
                    backgroundColor: 'transparent',
                    title: {
                        text: `${data.stat} (${data.posicion})`,
                        left: 'center',
                        textStyle: { color: '#00d4ff', fontSize: 16 }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function (param) {
                            if (param.seriesType === 'boxplot') {
                                return `
                                    <b>Estadística:</b> ${data.stat}<br>
                                    <b>Mínimo:</b> ${param.data[1]}<br>
                                    <b>Q1:</b> ${param.data[2]}<br>
                                    <b>Mediana:</b> ${param.data[3]}<br>
                                    <b>Q3:</b> ${param.data[4]}<br>
                                    <b>Máximo:</b> ${param.data[5]}<br>
                                    <b>Total jugadores:</b> ${data.total_jugadores}
                                `;
                            } else if (param.seriesType === 'scatter') {
                                return `<b>${data.jugador_nombre}:</b> ${param.data[0]}`;
                            }
                        }
                    },
                    grid: { top: 80, bottom: 60, left: 80, right: 40 },
                    xAxis: {
                        type: 'value',
                        name: data.stat,
                        axisLabel: { color: '#b0b8c9' },
                        axisLine: { lineStyle: { color: '#67aaff' } }
                    },
                    yAxis: {
                        type: 'category',
                        data: [''],
                        axisLabel: { color: '#fff' }
                    },
                    series: [
                        {
                            type: 'boxplot',
                            data: [data.box],
                            itemStyle: { color: '#00d4ff' }
                        },
                        ...(data.valor_jugador !== null && !isNaN(data.valor_jugador) ? [{
                            type: 'scatter',
                            data: [[data.valor_jugador, 0]],
                            symbolSize: 18,
                            itemStyle: { color: '#FFD700', borderColor: '#fff', borderWidth: 2 }
                        }] : [])
                    ]
                };

                window.boxplotJugadorChart.setOption(option);
                console.log('✅ Boxplot renderizado');
            })
            .catch(err => {
                console.error('❌ Error boxplot:', err);
                boxplotContainer.innerHTML = '<div style="color:#ff6b6b;">Error al cargar boxplot</div>';
            });
    }

    // ✅ FUNCIÓN PARA CARGAR GRÁFICO DE DISPERSIÓN - SOLO UNA IMPLEMENTACIÓN
    function cargarGraficoDispersionJugador(statX = 'pass_accuracy_outfield', statY = 'saves', posicion = 'CB') {
        const chartContainer = document.getElementById('chart-dispersion-jugador');
        if (!chartContainer) {
            console.error('❌ Contenedor dispersión no encontrado');
            return;
        }

        const jugadorId = window.jugadorData?.jugadorId;
        if (!jugadorId) {
            console.error('❌ No hay jugadorId');
            return;
        }

        console.log(`🔍 Cargando dispersión: ${statX} vs ${statY} (${posicion})`);

        chartContainer.style.width = '100%';
        chartContainer.style.height = '500px';
        chartContainer.innerHTML = '<div style="text-align:center;padding:50px;color:#666;">⏳ Cargando dispersión...</div>';

        let url = `${API_CONFIG.BASE_URL}/ajax/grafico-dispersion-jugador/?stat_x=${encodeURIComponent(statX)}&posicion=${encodeURIComponent(posicion)}&jugador_id=${jugadorId}`;
        if (statY) url += `&stat_y=${encodeURIComponent(statY)}`;

        fetch(url)
            .then(resp => resp.json())
            .then(data => {
                console.log('📊 Datos dispersión:', data);

                if (!data.success) {
                    chartContainer.innerHTML = `<div style="color:#ff6b6b;text-align:center;">${data.error}</div>`;
                    return;
                }

                // Actualizar selector Y si hay opciones
                if (data.opciones_y) {
                    actualizarSelectorEjeY(data.opciones_y, data.stat_y, posicion, statX);
                }

                // Renderizar gráfico
                renderizarDispersionECharts(data, chartContainer);
            })
            .catch(error => {
                console.error('❌ Error dispersión:', error);
                chartContainer.innerHTML = '<div style="color:#ff6b6b;">Error de conexión</div>';
            });
    }

    // ✅ FUNCIÓN PARA RENDERIZAR DISPERSIÓN CON ECHARTS
    function renderizarDispersionECharts(data, container) {
        // Destruir gráfico anterior
        if (window.dispersionJugadorChart) {
            window.dispersionJugadorChart.dispose();
        }

        // Crear nuevo gráfico
        window.dispersionJugadorChart = echarts.init(container, null, {devicePixelRatio: 2});

        const jugadorActualId = data.jugador_actual?.jugador_id;
        const otrosJugadores = data.data.filter(p => p.jugador_id !== jugadorActualId);
        const jugadorActual = data.data.filter(p => p.jugador_id === jugadorActualId);

        const option = {
            backgroundColor: 'transparent',
            title: {
                text: `${data.stat_x.replace(/_/g, ' ')} vs ${data.stat_y.replace(/_/g, ' ')}`,
                left: 'center',
                textStyle: { color: '#00d4ff', fontSize: 16 }
            },
            tooltip: {
                trigger: 'item',
                formatter: function(param) {
                    return `
                        <b>${param.data.nombre}</b><br>
                        ${data.stat_x}: ${param.data.value[0]}<br>
                        ${data.stat_y}: ${param.data.value[1]}
                    `;
                }
            },
            grid: { top: 80, bottom: 60, left: 80, right: 40 },
            xAxis: {
                type: 'value',
                name: data.stat_x.replace(/_/g, ' '),
                axisLabel: { color: '#b0b8c9' },
                axisLine: { lineStyle: { color: '#67aaff' } }
            },
            yAxis: {
                type: 'value',
                name: data.stat_y.replace(/_/g, ' '),
                axisLabel: { color: '#b0b8c9' },
                axisLine: { lineStyle: { color: '#67aaff' } }
            },
            series: [
                {
                    type: 'scatter',
                    data: otrosJugadores.map(p => ({
                        value: [p.x, p.y],
                        nombre: p.nombre
                    })),
                    symbolSize: 6,
                    itemStyle: { color: 'rgba(54, 162, 235, 0.6)' }
                },
                ...(jugadorActual.length > 0 ? [{
                    type: 'scatter',
                    data: jugadorActual.map(p => ({
                        value: [p.x, p.y],
                        nombre: p.nombre
                    })),
                    symbolSize: 12,
                    itemStyle: { color: '#FFD700', borderColor: '#fff', borderWidth: 2 }
                }] : [])
            ]
        };

        window.dispersionJugadorChart.setOption(option);
        console.log('✅ Dispersión renderizada');
    }

    // ✅ FUNCIÓN PARA ACTUALIZAR SELECTOR DEL EJE Y
    function actualizarSelectorEjeY(opciones, statYActual, posicion, statX) {
        const selector = document.getElementById('stat-y-selector');
        if (!selector) {
            console.log('ℹ️ Selector stat-y-selector no encontrado');
            return;
        }

        selector.innerHTML = '<option value="">Seleccionar estadística...</option>';
        
        opciones.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion.value;
            option.textContent = opcion.label;
            if (opcion.value === statYActual) option.selected = true;
            selector.appendChild(option);
        });

        // Remover listener anterior y agregar nuevo
        selector.onchange = function() {
            if (this.value) {
                console.log('🔄 Cambiando eje Y a:', this.value);
                cargarGraficoDispersionJugador(statX, this.value, posicion);
            }
        };

        console.log('✅ Selector Y actualizado');
    }

    // ✅ FUNCIÓN PARA ACTUALIZAR SELECTOR DE POSICIÓN
    function actualizarSelectorPosicion(selectorId, posiciones, posicionActual, callback) {
        const selector = document.getElementById(selectorId);
        if (!selector) return; // <--- QUITA el chequeo de posiciones.length <= 1

        selector.innerHTML = '';
        posiciones.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            if (pos === posicionActual) option.selected = true;
            selector.appendChild(option);
        });

        selector.onchange = callback;
        selector.style.display = '';
    }

    // ✅ MAPEO DE ESTADÍSTICAS
    function obtenerStatDeURL(nombreEstadistica) {
        const mapeo = {
            'Precisión de pases': 'pass_accuracy_outfield',
            'Goles': 'goals',
            'Asistencias': 'assists',
            'Intercepciones': 'interceptions',
            'Entradas exitosos': 'tackles_won',
            'Atajadas': 'saves',
            'Tiros al arco': 'shots_on_target',
            'Rating': 'average_rating',
            'Partidos jugados': 'appearances',
            'Minutos jugados': 'minutes_played'
        };
        return mapeo[nombreEstadistica] || 'pass_accuracy_outfield';
    }

    // ✅ ACTUALIZAR HERO STATS
    async function actualizarHeroStats(jugadorId, estadistica) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/ajax/jugador/${jugadorId}/estadistica/${encodeURIComponent(estadistica)}/`);
            const data = await response.json();
            
            if (data.estadisticas_hero) {
                const actualEl = document.getElementById('stat-value-actual');
                const promedioEl = document.getElementById('stat-value-promedio');
                const percentilEl = document.getElementById('stat-value-percentil');
                
                if (actualEl) actualEl.textContent = data.estadisticas_hero.valor_actual || 'N/A';
                if (promedioEl) promedioEl.textContent = data.estadisticas_hero.promedio_liga || 'N/A';
                if (percentilEl && data.estadisticas_hero.percentil !== null) {
                    percentilEl.textContent = `${data.estadisticas_hero.percentil}%`;
                }
            }
        } catch (error) {
            console.error('Error actualizando hero stats:', error);
        }
    }

    // ✅ FUNCIÓN PARA ACTUALIZAR TODOS LOS GRÁFICOS
    async function actualizarTodosLosGraficos(statKey, statName) {
        const jugadorId = window.jugadorData.jugadorId;
        
        try {
            console.log(`🔄 Actualizando gráficos: ${statName} (${statKey})`);
            
            // Actualizar hero stats
            await actualizarHeroStats(jugadorId, statName);
            
            // Actualizar boxplot
            const posicionBoxplot = document.getElementById('posicion-boxplot-selector')?.value || 'CB';
            cargarBoxplotJugador(statName, posicionBoxplot);
            
            // Actualizar dispersión
            const posicionDispersion = document.getElementById('posicion-dispersion-selector')?.value || 'CB';
            cargarGraficoDispersionJugador(statKey, null, posicionDispersion);
            
            // Actualizar título
            document.title = `${statName} - ${window.jugadorData.jugadorNombre} | ScoutGine`;
            
            console.log('✅ Gráficos actualizados');
            
        } catch (error) {
            console.error('❌ Error actualizando:', error);
        }
    }

    // ✅ INICIALIZACIÓN - UNA SOLA VEZ
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎯 Inicializando EstadisticaJugador - VERSIÓN LIMPIA');

        // 1. Event listener para selector global de estadísticas
        const globalStatSelect = document.getElementById('global-stat-select');
        if (globalStatSelect) {
            globalStatSelect.addEventListener('change', function() {
                const nuevaStat = this.value;
                const nombreStat = this.options[this.selectedIndex].text;
                
                window.jugadorData.estadistica = nombreStat;
                actualizarTodosLosGraficos(nuevaStat, nombreStat);
            });
        }

        // 2. Event listener para selector de grupo de radar
        const radarGroupSelector = document.getElementById('radar-jugador-group-selector');
        if (radarGroupSelector) {
            radarGroupSelector.addEventListener('change', function() {
                const posicion = document.getElementById('posicion-radar-selector')?.value || null;
                cargarRadarJugador(this.value, posicion);
            });
        }

        // 3. Cargar gráficos iniciales después de un delay
        setTimeout(() => {
            if (window.jugadorData?.jugadorId) {
                const estadisticaInicial = window.jugadorData.estadistica || 'Precisión de pases';
                const statKey = obtenerStatDeURL(estadisticaInicial);
                
                console.log('🚀 Cargando gráficos iniciales...');
                
                // Cargar radar
                cargarRadarJugador('defensivos');
                
                // Cargar boxplot y dispersión
                cargarBoxplotJugador(estadisticaInicial, 'CB');
                cargarGraficoDispersionJugador(statKey, 'saves', 'CB');
                
                // Event listeners para selectores de posición
                const posicionDispersionSelector = document.getElementById('posicion-dispersion-selector');
                if (posicionDispersionSelector) {
                    posicionDispersionSelector.addEventListener('change', function() {
                        const currentStatKey = obtenerStatDeURL(window.jugadorData.estadistica);
                        cargarGraficoDispersionJugador(currentStatKey, null, this.value);
                    });
                }

                const posicionBoxplotSelector = document.getElementById('posicion-boxplot-selector');
                if (posicionBoxplotSelector) {
                    posicionBoxplotSelector.addEventListener('change', function() {
                        cargarBoxplotJugador(window.jugadorData.estadistica, this.value);
                    });
                }
            }
        }, 1000);
    });

    console.log('✅ EstadisticaJugador LIMPIO cargado completamente');
}