// Evitar redeclaración global
if (typeof window.EstadisticaFutbolLoaded === 'undefined') {
    window.EstadisticaFutbolLoaded = true;

    // ✅ MOVER FUNCIONES FUERA DE LA CLASE - AL NIVEL GLOBAL
    function cargarRadar(grupo = 'ofensivos') {
        const radarContainer = document.getElementById('radar-chart-container');
        if (!radarContainer || !window.equipoId) {
            console.log('❌ No hay container de radar o equipoId');
            return;
        }
        
        // Ajusta el tamaño del radar
        radarContainer.style.width = '100%';
        radarContainer.style.maxWidth = '520px';
        radarContainer.style.height = '460px';
        radarContainer.style.margin = '0 auto';

        console.log(`🚀 Cargando radar para equipo ${window.equipoId}, grupo: ${grupo}`);
        
        fetch(`${API_CONFIG.BASE_URL}/ajax/radar-equipo/?equipo_id=${window.equipoId}&grupo=${grupo}`)
            .then(resp => {
                console.log('📡 Respuesta radar:', resp);
                return resp.json();
            })
            .then(data => {
                console.log('📊 Datos radar recibidos:', data);
                
                if (data.error) {
                    radarContainer.innerHTML = `<div style="color:#ff6b6b;text-align:center;padding:50px;">${data.error}</div>`;
                    return;
                }
                
                const radarChart = echarts.init(radarContainer, null, {devicePixelRatio: 2});
                radarChart.setOption({
                    backgroundColor: 'transparent',
                    tooltip: {trigger: 'item'},
                    legend: {
                        data: ['Equipo', 'Promedio Liga'],
                        top: 10,
                        textStyle: {color: '#fff', fontSize: 15}
                    },
                    radar: {
                        indicator: data.labels.map(l => ({name: l, max: data.max})),
                        splitLine: {lineStyle: {color: '#23243a'}},
                        splitArea: {areaStyle: {color: ['#23243a','#181b23']}},
                        axisName: {
                            color: '#00d4ff',
                            fontSize: 15,
                            fontWeight: 700,
                            formatter: function(value) {
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
                            {value: data.equipo, name: 'Equipo', areaStyle: {color: 'rgba(0,212,255,0.35)'}},
                            {value: data.promedio, name: 'Promedio Liga', areaStyle: {color: 'rgba(255,215,0,0.18)'}}
                        ],
                        symbolSize: 8,
                        lineStyle: {width: 3}
                    }]
                });
                
                console.log('✅ Radar chart creado exitosamente');
            })
            .catch(err => {
                console.error('❌ Error cargando radar:', err);
                radarContainer.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:50px;">Error cargando radar</div>';
            });
    }

    function cargarBoxplot(statId, equipoId) {
        const boxplotContainer = document.getElementById('boxplot-chart-container');
        if (!boxplotContainer) return;
        
        boxplotContainer.style.width = '550px';
        boxplotContainer.style.maxWidth = '550px';
        boxplotContainer.style.height = '420px';
        boxplotContainer.style.margin = '0 auto 32px auto';

        console.log(`[Boxplot] Fetch: /ajax/boxplot-estadistica/?stat_id=${encodeURIComponent(statId)}&equipo_id=${equipoId}`);
        
        fetch(`${API_CONFIG.BASE_URL}/ajax/boxplot-estadistica/?stat_id=${encodeURIComponent(statId)}&equipo_id=${equipoId}`)
            .then(resp => {
                console.log('[Boxplot] Respuesta fetch:', resp);
                return resp.json();
            })
            .then(data => {
                console.log('[Boxplot] Datos recibidos:', data);
                if (data.error) {
                    boxplotContainer.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:50px;">' + data.error + '</div>';
                    return;
                }
                
                const echartsBox = echarts.init(boxplotContainer, null, {devicePixelRatio: 2});
                console.log('[Boxplot] Inicializando ECharts...');
                
                const series = [
                    {
                        name: 'Distribución',
                        type: 'boxplot',
                        data: [data.box],
                        itemStyle: {color: '#00d4ff', borderColor: '#fff'}
                    }
                ];
                
                if (data.valor_equipo !== null && !isNaN(data.valor_equipo)) {
                    series.push({
                        name: 'Equipo actual',
                        type: 'scatter',
                        data: [[data.valor_equipo, 0]],
                        symbolSize: 18,
                        itemStyle: {color: '#FFD700', borderColor: '#fff', borderWidth: 2},
                        tooltip: {formatter: 'Equipo actual: {c}'}
                    });
                }
                
                echartsBox.setOption({
                    backgroundColor: 'transparent',
                    title: {
                        text: `Distribución de ${data.stat}`,
                        left: 'center',
                        textStyle: {color: '#00d4ff', fontSize: 20, fontWeight: 700}
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
                                    <b>Máximo:</b> ${param.data[5]}
                                `;
                            } else if (param.seriesType === 'scatter') {
                                return `<b>Equipo actual:</b> ${param.data[0]}`;
                            }
                        }
                    },
                    grid: {top: 60, bottom: 50, left: 80, right: 40, containLabel: true},
                    xAxis: {
                        type: 'value',
                        name: data.stat,
                        nameLocation: 'middle',
                        nameGap: 40,
                        nameTextStyle: { color: '#fff', fontSize: 18, fontWeight: 700 },
                        axisLabel: { color: '#b0b8c9', fontSize: 16 },
                        axisLine: { lineStyle: { color: '#67aaff', width: 3 } },
                        splitLine: { lineStyle: { color: '#23243a', type: 'dashed' } }
                    },
                    yAxis: {
                        type: 'category',
                        data: [''],
                        axisLabel: { color: '#fff', fontSize: 18 },
                        axisLine: { lineStyle: { color: '#67aaff', width: 3 } }
                    },
                    series: series
                });
                
                console.log('[Boxplot] Boxplot dibujado');
            })
            .catch(err => {
                console.error('[Boxplot] Error en fetch o ECharts:', err);
                boxplotContainer.innerHTML = '<div style="color:#ff6b6b;text-align:center;">Error al cargar el boxplot</div>';
            });
    }

    function getUrlParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    function mostrarError(mensaje) {
        console.error('❌ Error:', mensaje);
        // Agregar lógica para mostrar error en UI si es necesario
    }

    // ✅ CLASE ESTADISTICAFUTBOL (SIN LAS FUNCIONES QUE YA MOVIMOS)
    class EstadisticaFutbol {
        constructor() {
            this.equipoId = null;
            this.statName = null;
            this.dispersionChart = null;
            this.inicializar();
        }

        inicializar() {
            const urlParams = new URLSearchParams(window.location.search);
            this.equipoId = urlParams.get('equipo');
            this.statName = urlParams.get('stat');
            
            console.log('📊 Datos obtenidos de URL:', { equipoId: this.equipoId, statName: this.statName });

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.configurarEventos());
            } else {
                this.configurarEventos();
            }
        }

        configurarEventos() {
            console.log('🔧 Configurando eventos...');
            
            if (this.equipoId) {
                window.equipoId = parseInt(this.equipoId);
            }
            
            const selector = document.getElementById('stat-comparacion-selector');
            if (selector) {
                console.log('✅ Selector encontrado');
                
                selector.addEventListener('change', (e) => {
                    console.log('📈 Cambiando comparación a:', e.target.value);
                    this.cargarGraficoDispersion(e.target.value);
                });
                
                this.cargarGraficoDispersion();
            } else {
                console.log('❌ Selector no encontrado');
            }

            // ✅ LLAMAR A LAS FUNCIONES GLOBALES
            if (this.statName && this.equipoId) {
                console.log('📊 Cargando boxplot y radar...');
                cargarBoxplot(this.statName, this.equipoId);
                cargarRadar('ofensivos');
            }
        }

        async cargarGraficoDispersion(statComparacion = 'Rating') {
            console.log('🚀 Cargando gráfico dispersión:', statComparacion);
            
            const loadingDiv = document.getElementById('loading-dispersion');
            const chartDiv = document.getElementById('chart-dispersion');
            
            if (!chartDiv) {
                console.warn('❌ No se encontró el contenedor chart-dispersion');
                return;
            }
            
            try {
                const url = `${API_CONFIG.BASE_URL}/ajax/grafico-dispersion/?equipo_id=${window.equipoId}&stat_principal=${encodeURIComponent(this.statName)}&stat_comparacion=${encodeURIComponent(statComparacion)}`;
                
                console.log('📡 URL dispersión:', url);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                console.log('Respuesta fetch:', response);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('📊 Datos dispersión recibidos (RAW):', data);
                console.log('📊 Tipo de data:', typeof data);
                console.log('📊 data.chart_data:', data.chart_data);
                console.log('📊 data.chart_data?.equipos:', data.chart_data?.equipos);
                
                // ✅ VALIDAR QUE LOS DATOS EXISTAN ANTES DE CREAR EL GRÁFICO
                if (data && data.chart_data && data.chart_data.equipos) {
                    this.crearGraficoDispersion(data.chart_data, statComparacion);
                } else {
                    console.error('❌ Datos de dispersión inválidos:', data);
                    chartDiv.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:50px;">Datos no disponibles</div>';
                }
                
            } catch (error) {
                console.error('❌ Error:', error);
                if (chartDiv) {
                    chartDiv.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:50px;">Error cargando dispersión</div>';
                }
            }
        }

        crearGraficoDispersion(data, statComparacion) {
            console.log('📊 Creando gráfico dispersión con datos:', data);
    
            const chartContainer = document.getElementById('chart-dispersion');
    
            // ✅ VALIDAR QUE EL CONTENEDOR Y LOS DATOS EXISTAN
            if (!chartContainer) {
                console.error('❌ No se encontró el contenedor chart-dispersion');
                return;
            }
    
            if (!data || !data.equipos || !Array.isArray(data.equipos)) {
                console.error('❌ Datos de equipos inválidos:', data);
                chartContainer.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:50px;">Datos de equipos no válidos</div>';
                return;
            }
    
            if (!window.echarts) {
                console.error('❌ ECharts no está disponible');
                chartContainer.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:50px;">ECharts no disponible</div>';
                return;
            }
    
            chartContainer.style.width = '100%';
            chartContainer.style.maxWidth = '1100px';
            chartContainer.style.height = '700px';
            chartContainer.style.margin = '0 auto';

            if (this.dispersionChart) {
                this.dispersionChart.dispose();
            }
            chartContainer.innerHTML = '';

            this.dispersionChart = echarts.init(chartContainer, 'dark', {
                devicePixelRatio: 2
            });

            // ✅ VALIDAR QUE HAYA EQUIPOS ANTES DE MAPEAR
            if (data.equipos.length === 0) {
                chartContainer.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:50px;">No hay datos de equipos</div>';
                return;
            }

            const scatterData = data.equipos.map(equipo => [
                equipo.stat_principal,
                equipo.stat_comparacion,
                equipo.nombre
            ]);
            
            const equipoActual = data.equipos.find(eq => eq.es_actual);

            const option = {
                backgroundColor: '#181b23',
                title: {
                    text: `${this.statName} vs ${statComparacion}`,
                    left: 'center',
                    top: 20,
                    textStyle: {
                        color: '#fff',
                        fontSize: 28,
                        fontWeight: 700,
                        fontFamily: 'Inter, Arial, sans-serif'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    backgroundColor: '#23243a',
                    borderColor: '#67aaff',
                    borderWidth: 2,
                    textStyle: { color: '#fff', fontSize: 16 },
                    formatter: params => {
                        const isCurrent = equipoActual && params.data[2] === equipoActual.nombre;
                        return `
                            <div style="font-size:17px;font-weight:bold;color:${isCurrent ? '#FFD700' : '#67aaff'};margin-bottom:6px;">
                                ${isCurrent ? '⭐ ' : ''}${params.data[2]}
                            </div>
                            <div>${this.statName}: <b>${params.data[0]}</b></div>
                            <div>${statComparacion}: <b>${params.data[1]}</b></div>
                        `;
                    }
                },
                grid: {
                    left: 80,
                    right: 40,
                    top: 80,
                    bottom: 60,
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    name: this.statName,
                    nameLocation: 'middle',
                    nameGap: 40,
                    nameTextStyle: { color: '#fff', fontSize: 20, fontWeight: 700 },
                    axisLabel: { color: '#b0b8c9', fontSize: 16 },
                    axisLine: { lineStyle: { color: '#67aaff', width: 3 } },
                    splitLine: { lineStyle: { color: '#23243a', type: 'dashed' } }
                },
                yAxis: {
                    type: 'value',
                    name: statComparacion,
                    nameLocation: 'middle',
                    nameGap: 60,
                    nameTextStyle: { color: '#fff', fontSize: 20, fontWeight: 700 },
                    axisLabel: { color: '#b0b8c9', fontSize: 16 },
                    axisLine: { lineStyle: { color: '#67aaff', width: 3 } },
                    splitLine: { lineStyle: { color: '#23243a', type: 'dashed' } }
                },
                series: [
                    {
                        type: 'scatter',
                        data: scatterData,
                        symbolSize: function(data) {
                            const equipo = data[2];
                            return equipoActual && equipo === equipoActual.nombre ? 32 : 22;
                        },
                        itemStyle: {
                            color: function(params) {
                                const equipo = params.data[2];
                                if (equipoActual && equipo === equipoActual.nombre) {
                                    return '#FFD700';
                                }
                                return '#67aaff';
                            },
                            borderColor: '#fff',
                            borderWidth: 3,
                            opacity: 0.9,
                            shadowBlur: 15,
                            shadowColor: 'rgba(103,170,255,0.4)'
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: '#FFD700',
                                borderWidth: 4,
                                opacity: 1,
                                shadowBlur: 25,
                                shadowColor: '#FFD700'
                            }
                        }
                    }
                ]
            };

            this.dispersionChart.setOption(option);

                    // --- FIX: Usa una referencia única para el handler ---
            if (this._resizeHandler) {
                window.removeEventListener('resize', this._resizeHandler);
            }
            this._resizeHandler = () => {
                if (this.dispersionChart && !this.dispersionChart.isDisposed()) {
                    this.dispersionChart.resize();
                }
            };
            window.addEventListener('resize', this._resizeHandler);
        }

        mostrarError(mensaje) {
            const chartContainer = document.getElementById('chart-dispersion');
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff6b6b; text-align: center; flex-direction: column;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
                        <div style="font-size: 1.2rem; font-weight: bold;">${mensaje}</div>
                    </div>
                `;
            }
        }

        getCsrfToken() {
            let token = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
            
            if (!token) {
                token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            }
            
            if (!token) {
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'csrftoken') {
                        token = value;
                        break;
                    }
                }
            }
            
            return token || '';
        }
    }

    // ✅ INICIALIZAR LA CLASE
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 Inicializando EstadisticaFutbol...');
            window.estadisticaFutbolInstance = new EstadisticaFutbol();
        });
    } else {
        console.log('🚀 Inicializando EstadisticaFutbol...');
        window.estadisticaFutbolInstance = new EstadisticaFutbol();
    }

    // ✅ EVENT LISTENER PARA RADAR SELECTOR
    document.addEventListener('DOMContentLoaded', function() {
        if (window.equipoId) {
            cargarRadar('ofensivos');
            const radarSelector = document.getElementById('radar-group-selector');
            if (radarSelector) {
                radarSelector.addEventListener('change', function() {
                    cargarRadar(this.value);
                });
            }
        }
    });

    // ✅ VERIFICAR PARÁMETROS SOLO PARA PÁGINAS DE JUGADOR
    const jugadorId = getUrlParam('jugador');
    const estadistica = getUrlParam('estadistica') || getUrlParam('stat');
    
    // Solo mostrar error si estamos en una página que requiere estos parámetros
    if (window.location.href.includes('estadistica_jugador') && (!jugadorId || !estadistica)) {
        mostrarError("Parámetros de URL faltantes. Se requiere jugador y estadística.");
    }

}