console.log("=== CONFIG.JS CARGADO ===");

// ✅ CONFIGURACIÓN DE API
const API_CONFIG = {
    // ✅ PARA DESARROLLO LOCAL
    BASE_URL: 'http://127.0.0.1:8000',
    
    // ✅ PARA PRODUCCIÓN (descomenta cuando deploys)
    // BASE_URL: 'https://scoutgine-backend.onrender.com',
    
    // ✅ AGREGAR ENDPOINTS QUE FALTAN
    ENDPOINTS: {
        EQUIPOS: '/ajax/equipos/',
        RECOMENDAR_JUGADORES: '/ajax/recomendar-jugadores/',
        COMPARAR_EQUIPOS: '/ajax/comparar-equipos/',
        COMPARAR_JUGADORES: '/ajax/comparar-jugadores/',
        STATS_EQUIPOS: '/stats-equipos/',
        STATS_JUGADORES: '/stats-jugadores/',
        GRUPOS_STATS_EQUIPOS: '/ajax/grupos-stats-equipos/',
        GRUPOS_STATS_JUGADORES: '/ajax/grupos-stats-jugadores/'
    }
};

// ✅ FUNCIÓN PARA OBTENER CSRF TOKEN
function getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='));
    
    return cookieValue ? cookieValue.split('=')[1] : '';
}

// ✅ FUNCIÓN PARA HACER PETICIONES FETCH CON CSRF
async function fetchWithCSRF(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
            ...options.headers
        }
    };
    
    return fetch(url, { ...defaultOptions, ...options });
}

console.log('✅ CONFIG.JS INICIALIZADO');
console.log('🌐 BASE_URL:', API_CONFIG.BASE_URL);
console.log('🔗 ENDPOINTS:', API_CONFIG.ENDPOINTS);

// ✅ VERIFICAR QUE ENDPOINTS ESTÉ DEFINIDO
if (!API_CONFIG.ENDPOINTS) {
    console.error('❌ ERROR: API_CONFIG.ENDPOINTS no está definido');
} else {
    console.log('✅ API_CONFIG configurado correctamente');
}