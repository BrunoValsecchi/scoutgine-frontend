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