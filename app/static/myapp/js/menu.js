// Asegura que el usuario social tenga metadata mínima
async function ensureUserMetadata() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return;
        }
        
        if (user) {
            console.log('✅ Usuario encontrado:', user.email);
            
            // Si no tiene role, agregarlo
            if (!user.user_metadata.role) {
                console.log('🔄 Agregando metadata faltante...');
                
                const { error: updateError } = await supabaseClient.auth.updateUser({
                    data: {
                        role: "user",
                        nombre: user.user_metadata.full_name || user.user_metadata.name || user.email.split('@')[0],
                        subscription: "free"
                    }
                });
                
                if (updateError) {
                    console.error('❌ Error actualizando metadata:', updateError);
                } else {
                    console.log('✅ Metadata actualizada');
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en ensureUserMetadata:', error);
    }
}

// Ejecutar cuando cargue menu.html
document.addEventListener('DOMContentLoaded', ensureUserMetadata);

// También ejecutar después de un delay para asegurar
setTimeout(ensureUserMetadata, 2000);

(function() {
    async function processOAuthHash() {
        if (window.location.hash && window.location.hash.includes('access_token')) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const access_token = hashParams.get('access_token');
            const refresh_token = hashParams.get('refresh_token');
            if (access_token && refresh_token) {
                await window.supabaseClient.auth.setSession({
                    access_token,
                    refresh_token
                });
                window.location.hash = '';
            }
        }
    }

    async function verificarAuth() {
        // 1. Procesar hash si viene de OAuth
        await processOAuthHash();

        // 2. Esperar un poco por si el setSession es async
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Verificar sesión
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();

        if (error || !session) {
            window.location.href = "sesion.html";
            return;
        }

        // Si llegaste aquí, hay sesión válida
        document.body.style.visibility = 'visible';
    }

    // Ocultar contenido inicialmente
    document.body.style.visibility = 'hidden';

    // Esperar a que el cliente global esté listo
    function waitForSupabaseClient(callback) {
        if (window.supabaseClient) {
            callback();
        } else {
            setTimeout(() => waitForSupabaseClient(callback), 100);
        }
    }

    waitForSupabaseClient(() => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', verificarAuth);
        } else {
            verificarAuth();
        }
    });
})();

// Información de estadísticas
const statsJugador = [
  { es: "Atajadas", en: "Saves", desc: "Tiros atajados por el arquero." },
  { es: "Porcentaje de atajadas", en: "Save Percentage", desc: "Porcentaje de tiros atajados respecto a los recibidos." },
  { es: "Goles recibidos", en: "Goals Conceded", desc: "Cantidad de goles encajados." },
  { es: "Goles prevenidos", en: "Goals Prevented", desc: "Goles evitados según xG." },
  { es: "Vallas invictas", en: "Clean Sheets", desc: "Partidos sin recibir goles." },
  { es: "Errores que terminan en gol", en: "Error Led to Goal", desc: "Errores que resultaron en gol rival." },
  { es: "Salidas aéreas exitosas", en: "High Claim", desc: "Intervenciones exitosas en centros aéreos." },
  { es: "Precisión de pase", en: "Pass Accuracy", desc: "Porcentaje de pases completados." },
  { es: "Pases largos precisos", en: "Accurate Long Balls", desc: "Pases largos completados." },
  { es: "Precisión en pases largos", en: "Long Ball Accuracy", desc: "Porcentaje de pases largos completados." },
  { es: "Goles", en: "Goals", desc: "Goles anotados." },
  { es: "Goles esperados (xG)", en: "Expected Goals (xG)", desc: "Goles esperados según calidad de los tiros." },
  { es: "xG al arco", en: "xG on Target (xGOT)", desc: "xG de los tiros que fueron al arco." },
  { es: "xG sin penales", en: "Non-Penalty xG", desc: "xG excluyendo penales." },
  { es: "Tiros", en: "Shots", desc: "Tiros totales realizados." },
  { es: "Tiros al arco", en: "Shots on Target", desc: "Tiros que fueron al arco." },
  { es: "Asistencias", en: "Assists", desc: "Pases que terminaron en gol." },
  { es: "Asistencias esperadas (xA)", en: "Expected Assists (xA)", desc: "Probabilidad de que un pase termine en gol." },
  { es: "Pases exitosos", en: "Successful Passes", desc: "Pases completados correctamente." },
  { es: "Precisión de pase (campo)", en: "Pass Accuracy Outfield", desc: "Precisión de pase para jugadores de campo." },
  { es: "Pases largos precisos (campo)", en: "Accurate Long Balls Outfield", desc: "Pases largos completados (jugadores de campo)." },
  { es: "Precisión en pases largos (campo)", en: "Long Ball Accuracy Outfield", desc: "Porcentaje de pases largos completados (jugadores de campo)." },
  { es: "Ocasiones creadas", en: "Chances Created", desc: "Jugadas que generaron una ocasión de gol." },
  { es: "Centros exitosos", en: "Successful Crosses", desc: "Centros completados a un compañero." },
  { es: "Precisión de centros", en: "Cross Accuracy", desc: "Porcentaje de centros completados." },
  { es: "Regates exitosos", en: "Successful Dribbles", desc: "Regates completados con éxito." },
  { es: "Éxito en regates (%)", en: "Dribble Success", desc: "Porcentaje de regates exitosos." },
  { es: "Toques", en: "Touches", desc: "Cantidad de veces que el jugador tocó el balón." },
  { es: "Toques en el área rival", en: "Touches in Opposition Box", desc: "Toques dentro del área rival." },
  { es: "Pérdidas de balón", en: "Dispossessed", desc: "Veces que el jugador perdió la posesión." },
  { es: "Faltas recibidas", en: "Fouls Won", desc: "Faltas que recibió el jugador." },
  { es: "Penales ganados", en: "Penalties Awarded", desc: "Penales a favor obtenidos." },
  { es: "Entradas ganadas", en: "Tackles Won", desc: "Entradas exitosas para recuperar el balón." },
  { es: "% de entradas ganadas", en: "Tackles Won Percentage", desc: "Porcentaje de entradas exitosas." },
  { es: "Duelos ganados", en: "Duels Won", desc: "Duelos individuales ganados." },
  { es: "% de duelos ganados", en: "Duels Won Percentage", desc: "Porcentaje de duelos ganados." },
  { es: "Duelos aéreos ganados", en: "Aerial Duels Won", desc: "Duelos aéreos ganados." },
  { es: "% de duelos aéreos ganados", en: "Aerial Duels Won Percentage", desc: "Porcentaje de duelos aéreos ganados." },
  { es: "Intercepciones", en: "Interceptions", desc: "Balones interceptados." },
  { es: "Bloqueos", en: "Blocked", desc: "Tiros o centros bloqueados." },
  { es: "Faltas cometidas", en: "Fouls Committed", desc: "Faltas realizadas por el jugador." },
  { es: "Recuperaciones", en: "Recoveries", desc: "Balones recuperados." },
  { es: "Recuperaciones en el último tercio", en: "Possession Won Final 3rd", desc: "Recuperaciones en el tercio final del campo." },
  { es: "Regateado por rivales", en: "Dribbled Past", desc: "Veces que el jugador fue superado en regate." },
  { es: "Tarjetas amarillas", en: "Yellow Cards", desc: "Cantidad de tarjetas amarillas recibidas." },
  { es: "Tarjetas rojas", en: "Red Cards", desc: "Cantidad de tarjetas rojas recibidas." }
];

const statsEquipo = [
  { es: "Puntaje FotMob", en: "Fotmob Rating", desc: "Calificación promedio del equipo según FotMob." },
  { es: "Goles por partido", en: "Goals per Match", desc: "Promedio de goles anotados por partido." },
  { es: "Goles recibidos por partido", en: "Goals Conceded per Match", desc: "Promedio de goles recibidos por partido." },
  { es: "Posesión promedio", en: "Average Possession", desc: "Porcentaje promedio de posesión de balón." },
  { es: "Vallas invictas", en: "Clean Sheets", desc: "Partidos sin recibir goles." },
  { es: "Goles esperados (xG)", en: "Expected Goals (xG)", desc: "Goles esperados del equipo." },
  { es: "Tiros al arco por partido", en: "Shots on Target per Match", desc: "Promedio de tiros al arco por partido." },
  { es: "Grandes ocasiones", en: "Big Chances", desc: "Oportunidades claras de gol generadas." },
  { es: "Grandes ocasiones falladas", en: "Big Chances Missed", desc: "Oportunidades claras de gol desperdiciadas." },
  { es: "Pases precisos por partido", en: "Accurate Passes per Match", desc: "Promedio de pases completados por partido." },
  { es: "Pases largos precisos por partido", en: "Accurate Long Balls per Match", desc: "Promedio de pases largos completados por partido." },
  { es: "Centros precisos por partido", en: "Accurate Crosses per Match", desc: "Promedio de centros completados por partido." },
  { es: "Penales a favor", en: "Penalties Awarded", desc: "Penales a favor obtenidos por el equipo." },
  { es: "Toques en el área rival", en: "Touches in Opposition Box", desc: "Toques dentro del área rival." },
  { es: "Tiros de esquina", en: "Corners", desc: "Cantidad de tiros de esquina obtenidos." },
  { es: "xG en contra", en: "xG Conceded", desc: "Goles esperados en contra." },
  { es: "Intercepciones por partido", en: "Interceptions per Match", desc: "Promedio de intercepciones por partido." },
  { es: "Entradas exitosas por partido", en: "Successful Tackles per Match", desc: "Promedio de entradas exitosas por partido." },
  { es: "Despejes por partido", en: "Clearances per Match", desc: "Promedio de despejes por partido." },
  { es: "Recuperaciones en el último tercio por partido", en: "Possession Won Final 3rd per Match", desc: "Recuperaciones en el tercio final del campo por partido." },
  { es: "Atajadas por partido", en: "Saves per Match", desc: "Promedio de atajadas por partido." },
  { es: "Faltas por partido", en: "Fouls per Match", desc: "Promedio de faltas cometidas por partido." },
  { es: "Tarjetas amarillas", en: "Yellow Cards", desc: "Cantidad de tarjetas amarillas recibidas." },
  { es: "Tarjetas rojas", en: "Red Cards", desc: "Cantidad de tarjetas rojas recibidas." }
];

function renderStatsTable(stats, containerId) {
  const container = document.getElementById(containerId);
  let html = `
    <table class="stats-table">
      <thead>
        <tr>
          <th>Español</th>
          <th>Inglés</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
  `;
  stats.forEach(stat => {
    html += `
      <tr>
        <td>${stat.es}</td>
        <td>${stat.en}</td>
        <td>${stat.desc}</td>
      </tr>
    `;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  renderStatsTable(statsJugador, 'stats-table-jugador');
  renderStatsTable(statsEquipo, 'stats-table-equipo');
});