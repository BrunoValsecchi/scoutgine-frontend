// Protección global de autenticación para todas las páginas protegidas
(function() {
    // Esperar a que el cliente global esté disponible
    function waitForSupabaseClient(callback) {
        if (window.supabaseClient) {
            callback();
        } else {
            setTimeout(() => waitForSupabaseClient(callback), 100);
        }
    }

    function redirectToLogin() {
        console.warn('Redirigiendo a sesion.html en 3 segundos...');
        setTimeout(() => {
            window.location.href = "sesion.html";
        }, 30000); // 3 segundos de delay
    }

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
        console.log('🔄 Verificando autenticación...');
        try {
            // 1. Procesar hash si viene de OAuth
            console.log('Hash actual:', window.location.hash);
            await processOAuthHash();

            // 2. Esperar un poco por si el setSession es async
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Verificar sesión
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            console.log('Sesión obtenida:', session ? 'OK' : 'NO');
            console.log('Error:', error);

            if (error || !session) {
                console.log('❌ Sin sesión válida, redirigiendo...');
                redirectToLogin();
                return;
            }

            console.log('✅ Usuario autenticado:', session.user.email);

            // 🚩 Asignar rol y plan si faltan (para usuarios sociales)
            const meta = session.user.user_metadata;
            if (!meta.role || !meta.subscription) {
                await window.supabaseClient.auth.updateUser({
                    data: {
                        role: meta.role || "user",
                        subscription: meta.subscription || "free"
                    }
                });
                // Recargar para que los cambios se reflejen en la sesión
                window.location.reload();
                return;
            }

            console.log('👁️ Mostrando contenido');
            document.body.style.visibility = 'visible';
        } catch (error) {
            console.error('❌ Error en verificación:', error);
            redirectToLogin();
        }
    }

    // Ocultar contenido inicialmente
    document.body.style.visibility = 'hidden';

    // Esperar a que el cliente global esté listo
    waitForSupabaseClient(() => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', verificarAuth);
        } else {
            verificarAuth();
        }
        // Timeout de seguridad (10 segundos)
        setTimeout(() => {
            if (document.body.style.visibility === 'hidden') {
                console.warn('⏰ Timeout: el contenido sigue oculto, redirigiendo...');
                redirectToLogin();
            }
        }, 10000);
    });
})();

/**
 * Cambia el plan de suscripción del usuario actual.
 * @param {string} nuevoPlan - Debe ser 'free', 'basic' o 'premium'
 * @returns {Promise<void>}
 */
async function cambiarPlanUsuario(nuevoPlan) {
    if (!window.supabaseClient) {
        alert('Supabase no está disponible');
        return;
    }
    const { error } = await window.supabaseClient.auth.updateUser({
        data: { subscription: nuevoPlan }
    });
    if (error) {
        alert('Error al actualizar el plan: ' + error.message);
    } else {
        alert('¡Plan actualizado a: ' + nuevoPlan + '!');
        // Opcional: recargar para aplicar cambios
        window.location.reload();
    }
}

/**
 * Protege una página según el plan de suscripción del usuario.
 * @param {Array<string>} planesPermitidos - Ejemplo: ['basic', 'premium']
 */
async function protegerPorPlan(planesPermitidos) {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    const user = session?.user;
    const userPlan = user?.user_metadata?.subscription || 'free';

    if (!planesPermitidos.includes(userPlan)) {
        // Redirigir a la página de suscripción
        window.location.href = '/subscripcion.html';
        return false;
    }
    return true;
}