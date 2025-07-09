console.log('🔍 DEBUG - Recomendacion.js iniciando...');
console.log('🔍 DEBUG - API_CONFIG disponible?', typeof API_CONFIG);
console.log('🔍 DEBUG - API_CONFIG:', API_CONFIG);
console.log('🔍 DEBUG - API_CONFIG.ENDPOINTS disponible?', typeof API_CONFIG?.ENDPOINTS);

document.addEventListener('DOMContentLoaded', function() {
    // ✅ VERIFICAR QUE API_CONFIG ESTÉ DISPONIBLE
    if (typeof API_CONFIG === 'undefined') {
        console.error('❌ API_CONFIG no está definido. Verifica que config.js se cargue primero.');
        return;
    }

    // ✅ VERIFICAR QUE ENDPOINTS ESTÉ DISPONIBLE
    if (!API_CONFIG.ENDPOINTS) {
        console.error('❌ API_CONFIG.ENDPOINTS no está definido. Verifica el config.js.');
        return;
    }

    console.log('✅ API_CONFIG y ENDPOINTS disponibles');
    
    const perfilSelect = document.getElementById('perfil-select');
    const equipoExcluir = document.getElementById('equipo-excluir');
    const limiteJugadores = document.getElementById('limite-jugadores');
    const buscarBtn = document.getElementById('buscar-btn');
    
    const perfilInfo = document.getElementById('perfil-info');
    const perfilNombre = document.getElementById('perfil-nombre');
    const perfilDesc = document.getElementById('perfil-desc');
    
    const loading = document.getElementById('loading');
    const resultadosContainer = document.getElementById('resultados-container');
    const jugadoresLista = document.getElementById('jugadores-lista');
    const noResultados = document.getElementById('no-resultados');
    const resultadosTitulo = document.getElementById('resultados-titulo');
    const resultadosContador = document.getElementById('resultados-contador');
    
    // ✅ INICIALIZAR DATOS AL CARGAR LA PÁGINA
    inicializarDatos();

    async function inicializarDatos() {
        console.log('🔄 Inicializando datos de recomendación...');
        
        try {
            // ✅ CARGAR PERFILES
            await cargarPerfiles();
            
            // ✅ CARGAR EQUIPOS
            await cargarEquipos();
            
            console.log('✅ Datos inicializados correctamente');
        } catch (error) {
            console.error('❌ Error inicializando datos:', error);
        }
    }

    async function cargarPerfiles() {
        console.log('📋 Cargando perfiles...');
        
        // ✅ PERFILES HARDCODEADOS (BASADOS EN TU recomendacion.py)
        const perfilesPorCategoria = {
            "🧤 Arqueros": [
                {
                    key: "arquero_tradicional",
                    nombre: "Arquero Tradicional", 
                    descripcion: "Arquero tradicional enfocado en atajar y posicionarse"
                },
                {
                    key: "arquero_moderno",
                    nombre: "Arquero Moderno",
                    descripcion: "Arquero moderno que participa en la salida y sale del área"
                }
            ],
            "🛡️ Defensores": [
                {
                    key: "lateral_defensivo",
                    nombre: "Lateral Defensivo",
                    descripcion: "Lateral defensivo que prioriza marca y orden"
                },
                {
                    key: "lateral_ofensivo", 
                    nombre: "Lateral Ofensivo",
                    descripcion: "Lateral ofensivo que se proyecta al ataque"
                },
                {
                    key: "defensor_central_marcador",
                    nombre: "Defensor Central Marcador",
                    descripcion: "Defensor marcador fuerte en duelos uno contra uno"
                },
                {
                    key: "defensor_central_libero",
                    nombre: "Defensor Central Líbero",
                    descripcion: "Defensor líbero técnico con buena salida"
                }
            ],
            "⚙️ Mediocampistas": [
                {
                    key: "pivote_destructivo",
                    nombre: "Pivote Destructivo",
                    descripcion: "Pivote destructivo especializado en cortar el juego"
                },
                {
                    key: "pivote_organizador",
                    nombre: "Pivote Organizador", 
                    descripcion: "Pivote organizador que controla el juego con pases simples"
                },
                {
                    key: "box_to_box",
                    nombre: "Box to Box",
                    descripcion: "Mediocampista box-to-box versátil de área a área"
                },
                {
                    key: "organizador_central",
                    nombre: "Organizador Central",
                    descripcion: "Organizador que controla el ritmo del juego"
                },
                {
                    key: "enganche_clasico",
                    nombre: "Enganche Clásico",
                    descripcion: "Enganche clásico creador de juego y último pase"
                },
                {
                    key: "mediapunta_llegador",
                    nombre: "Mediapunta Llegador",
                    descripcion: "Mediapunta que llega al área y define"
                }
            ],
            "🎯 Extremos": [
                {
                    key: "extremo_desborde",
                    nombre: "Extremo de Desborde",
                    descripcion: "Extremo de desborde con velocidad y regate"
                },
                {
                    key: "extremo_inverso",
                    nombre: "Extremo Inverso",
                    descripcion: "Extremo inverso que busca el remate a pierna cambiada"
                }
            ],
            "🔥 Delanteros": [
                {
                    key: "delantero_area",
                    nombre: "Delantero de Área",
                    descripcion: "Delantero de área especializado en definir"
                },
                {
                    key: "delantero_movil",
                    nombre: "Delantero Móvil",
                    descripcion: "Delantero móvil que se asocia y genera juego"
                },
                {
                    key: "falso_nueve",
                    nombre: "Falso Nueve",
                    descripcion: "Falso 9 que se retrasa y genera espacios"
                }
            ]
        };

        // ✅ POBLAR SELECT DE PERFILES
        perfilSelect.innerHTML = '<option value="">Selecciona un perfil...</option>';
        
        Object.entries(perfilesPorCategoria).forEach(([categoria, perfiles]) => {
            // Crear optgroup para cada categoría
            const optgroup = document.createElement('optgroup');
            optgroup.label = categoria;
            
            perfiles.forEach(perfil => {
                const option = document.createElement('option');
                option.value = perfil.key;
                option.textContent = perfil.nombre;
                option.setAttribute('data-descripcion', perfil.descripcion);
                optgroup.appendChild(option);
            });
            
            perfilSelect.appendChild(optgroup);
        });

        console.log(`✅ ${Object.values(perfilesPorCategoria).flat().length} perfiles cargados`);
    }

    async function cargarEquipos() {
        console.log('🏟️ Cargando equipos...');
        
        try {
            // ✅ USAR API_CONFIG PARA LA URL
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPOS}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // ✅ POBLAR SELECT DE EQUIPOS
            equipoExcluir.innerHTML = '<option value="">Todos los equipos</option>';
            
            data.equipos.forEach(equipo => {
                const option = document.createElement('option');
                option.value = equipo.id;
                option.textContent = equipo.nombre;
                equipoExcluir.appendChild(option);
            });

            console.log(`✅ ${data.equipos.length} equipos cargados`);
            
        } catch (error) {
            console.error('❌ Error cargando equipos:', error);
            equipoExcluir.innerHTML = '<option value="">Error cargando equipos</option>';
        }
    }

    // ✅ MOSTRAR INFO DEL PERFIL AL SELECCIONAR
    perfilSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        
        if (selectedOption.value) {
            const descripcion = selectedOption.getAttribute('data-descripcion');
            perfilNombre.textContent = selectedOption.text;
            perfilDesc.textContent = descripcion;
            perfilInfo.style.display = 'block';
            buscarBtn.disabled = false;
        } else {
            perfilInfo.style.display = 'none';
            buscarBtn.disabled = true;
        }
    });

    // ✅ BUSCAR JUGADORES
    buscarBtn.addEventListener('click', function() {
        const perfil = perfilSelect.value;
        
        if (!perfil) {
            alert('Por favor selecciona un perfil');
            return;
        }

        buscarJugadores();
    });

    async function buscarJugadores() {
        const perfil = perfilSelect.value;
        const equipo = equipoExcluir.value;
        const limite = limiteJugadores.value;

        console.log('🔍 Buscando jugadores:', { perfil, equipo, limite });

        // Mostrar loading
        loading.style.display = 'block';
        resultadosContainer.style.display = 'none';
        if (noResultados) noResultados.style.display = 'none';

        try {
            // Construir URL
            const params = new URLSearchParams({
                perfil: perfil,
                limite: limite
            });
            
            if (equipo) {
                params.append('equipo_excluir', equipo);
            }

            // ✅ USAR API_CONFIG PARA LA URL
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECOMENDAR_JUGADORES}?${params.toString()}`;
            console.log('📤 URL:', url);

            // Realizar petición AJAX
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            loading.style.display = 'none';
            
            if (data.error) {
                console.error('❌ Error API:', data.error);
                if (noResultados) noResultados.style.display = 'block';
                return;
            }

            if (data.jugadores && data.jugadores.length > 0) {
                console.log(`✅ ${data.jugadores.length} jugadores encontrados`);
                mostrarResultados(data);
            } else {
                console.log('⚠️ No se encontraron jugadores');
                if (noResultados) noResultados.style.display = 'block';
            }
            
        } catch (error) {
            console.error('❌ Error buscando jugadores:', error);
            loading.style.display = 'none';
            if (noResultados) noResultados.style.display = 'block';
        }
    }

    function mostrarResultados(data) {
        const jugadores = data.jugadores;
        const perfilInfoData = data.perfil_info;

        console.log('📊 Mostrando resultados:', jugadores);

        // Actualizar título y contador
        if (resultadosTitulo) {
            resultadosTitulo.textContent = `Mejores ${perfilInfoData.descripcion}`;
        }
        if (resultadosContador) {
            resultadosContador.textContent = `${data.total} jugadores encontrados`;
        }

        // Limpiar lista anterior
        if (jugadoresLista) {
            jugadoresLista.innerHTML = '';

            // Crear cards de jugadores
            jugadores.forEach((jugador, index) => {
                const jugadorCard = crearJugadorCard(jugador, index + 1);
                jugadoresLista.appendChild(jugadorCard);
            });
        }

        // Mostrar resultados
        if (resultadosContainer) {
            resultadosContainer.style.display = 'block';
        }
    }

    function crearJugadorCard(jugador, posicion) {
        const card = document.createElement('div');
        card.className = 'jugador-card';
        card.onclick = () => window.location.href = `jugador.html?id=${jugador.id}`;

        const logoEquipo = jugador.equipo_logo 
            ? `<img src="${jugador.equipo_logo}" alt="${jugador.equipo}" class="equipo-logo">`
            : `<div class="equipo-logo-placeholder"><i class='bx bx-shield'></i></div>`;

        const statsHtml = Object.entries(jugador.stats_destacadas || {})
            .map(([key, stat]) => `
                <div class="stat-item">
                    <span class="stat-nombre">${stat.nombre_friendly}</span>
                    <span class="stat-valor">${stat.valor}</span>
                </div>
            `).join('');

        card.innerHTML = `
            <div class="jugador-header">
                <div class="jugador-info">
                    <h3>#${posicion} ${jugador.nombre}</h3>
                    <div class="posicion">${jugador.posicion || 'N/A'}</div>
                </div>
                <div class="puntuacion-badge">
                    ${jugador.puntuacion}
                </div>
            </div>
            
            <div class="jugador-equipo">
                ${logoEquipo}
                <div class="equipo-info">
                    <div class="equipo-nombre">${jugador.equipo}</div>
                    <div class="jugador-edad">
                        ${jugador.edad ? `${jugador.edad} años` : 'Edad no disponible'} 
                        ${jugador.pais ? `• ${jugador.pais}` : ''}
                    </div>
                </div>
            </div>
            
            ${statsHtml ? `
                <div class="stats-destacadas">
                    <h4><i class='bx bx-bar-chart-alt-2'></i> Estadísticas Destacadas</h4>
                    <div class="stats-lista">
                        ${statsHtml}
                    </div>
                </div>
            ` : ''}
        `;

        return card;
    }

    // ✅ INICIALIZAR CON BUSCAR DESHABILITADO
    buscarBtn.disabled = true;
});
