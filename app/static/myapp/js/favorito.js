document.addEventListener('DOMContentLoaded', function() {
    let equipos = [];
    let equipoFavorito = null;
    const supabaseClient = window.supabaseClient;

    // Elementos del DOM
    const loadingOverlay = document.getElementById('loading-overlay');
    const equipoSeleccionado = document.getElementById('equipo-seleccionado');
    const btnCambiar = document.getElementById('btn-cambiar');
    const searchSection = document.getElementById('search-section');
    const equiposGrid = document.getElementById('equipos-grid');
    
    // Espera a que window.BASE_URL esté disponible
    function waitForBaseUrl() {
        return new Promise((resolve) => {
            if (window.BASE_URL) resolve();
            else {
                const interval = setInterval(() => {
                    if (window.BASE_URL) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    // Cargar datos al iniciar
    inicializar();

    async function inicializar() {
        try {
            showLoading();
            await waitForBaseUrl(); // Esperar a que BASE_URL esté disponible
            await cargarEquipoFavorito();
            await cargarEquipos();
            hideLoading();
        } catch (error) {
            console.error('Error al inicializar:', error);
            hideLoading();
        }
    }

    async function cargarEquipoFavorito() {
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error || !session) return;

            equipoFavorito = session.user.user_metadata.equipoFavorito || null;
            mostrarEquipoActual();
        } catch (error) {
            console.error('Error al cargar equipo favorito:', error);
        }
    }

    async function cargarEquipos() {
        await waitForBaseUrl();
        try {
            console.log('BASE_URL disponible:', window.BASE_URL); // Debug
            console.log("Intentando fetch a:", window.BASE_URL + "/ajax/equipos/");
            const response = await fetch(window.BASE_URL + "/ajax/equipos/");
            const data = await response.json();
            equipos = data.equipos || [];
            console.log('Equipos cargados:', equipos.length);
            
            // Mostrar equipos inmediatamente después de cargar
            mostrarEquipos();
        } catch (error) {
            console.error('Error al cargar equipos:', error);
            equipos = [];
            mostrarMensajeError();
        }
    }

    function mostrarEquipoActual() {
        if (equipoFavorito) {
            equipoSeleccionado.innerHTML = `
                <div class="equipo-card-mini">
                    <div class="equipo-logo">
                        ${equipoFavorito.nombre ? equipoFavorito.nombre.substring(0, 2).toUpperCase() : 'EQ'}
                    </div>
                    <div class="equipo-info">
                        <h4>${equipoFavorito.nombre}</h4>
                        <p>${equipoFavorito.liga || 'Liga no disponible'}</p>
                    </div>
                </div>
            `;
            btnCambiar.innerHTML = '<i class="bx bx-edit"></i> Cambiar Equipo';
        } else {
            equipoSeleccionado.innerHTML = `
                <div class="sin-equipo">
                    <i class='bx bx-heart-circle'></i>
                    <span>No has seleccionado un equipo favorito</span>
                </div>
            `;
            btnCambiar.innerHTML = '<i class="bx bx-heart"></i> Elegir Equipo';
        }
    }

    function mostrarEquipos() {
        equiposGrid.innerHTML = '';
        
        if (equipos.length === 0) {
            equiposGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class='bx bx-football' style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;"></i>
                    <p style="color: #64748b; font-size: 1.2rem;">No hay equipos disponibles</p>
                </div>
            `;
            return;
        }

        equipos.forEach(equipo => {
            const equipoCard = document.createElement('div');
            equipoCard.className = 'equipo-card';
            
            const isSelected = equipoFavorito && equipoFavorito.id === equipo.id;
            if (isSelected) {
                equipoCard.classList.add('selected');
            }

            equipoCard.innerHTML = `
                ${isSelected ? '<div class="equipo-selected-badge"><i class="bx bx-check"></i></div>' : ''}
                <div class="equipo-header">
                    <div class="equipo-logo">
                        ${equipo.logo
                            ? `<img src="${equipo.logo}" alt="${equipo.nombre}" style="width:40px;height:40px;border-radius:50%;">`
                            : (equipo.nombre ? equipo.nombre.substring(0, 2).toUpperCase() : 'EQ')
                        }
                    </div>
                    <div class="equipo-info">
                        <h3>${equipo.nombre}</h3>
                        <p>${equipo.liga || ''}</p>
                    </div>
                </div>
            `;

            equipoCard.addEventListener('click', () => seleccionarEquipo(equipo));
            equiposGrid.appendChild(equipoCard);
        });
    }

    function mostrarMensajeError() {
        equiposGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class='bx bx-error' style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p style="color: #ef4444; font-size: 1.2rem;">Error al cargar equipos</p>
                <button onclick="window.location.reload()" style="
                    background: #3b82f6; 
                    color: white; 
                    border: none; 
                    padding: 0.5rem 1rem; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    margin-top: 1rem;
                ">Reintentar</button>
            </div>
        `;
    }

    async function seleccionarEquipo(equipo) {
        try {
            showLoading();
            
            const { error } = await supabaseClient.auth.updateUser({
                data: {
                    equipoFavorito: {
                        id: equipo.id,
                        nombre: equipo.nombre,
                        liga: equipo.liga,
                        temporada: equipo.temporada
                    }
                }
            });

            if (error) {
                throw error;
            }

            equipoFavorito = {
                id: equipo.id,
                nombre: equipo.nombre,
                liga: equipo.liga,
                temporada: equipo.temporada
            };

            mostrarEquipoActual();
            mostrarEquipos();
            mostrarMensaje('✅ Equipo favorito actualizado correctamente', 'success');
            hideLoading();
        } catch (error) {
            console.error('Error al seleccionar equipo:', error);
            mostrarMensaje('❌ Error al guardar equipo favorito', 'error');
            hideLoading();
        }
    }

    function mostrarMensaje(mensaje, tipo) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 2rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${tipo === 'success' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;
        
        messageDiv.textContent = mensaje;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    btnCambiar.addEventListener('click', () => {
        equiposGrid.scrollIntoView({ behavior: 'smooth' });
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});