/**
 * Realiza una petición fetch a la API usando la configuración global de API_CONFIG.
 * @param {string} endpoint - El endpoint relativo, por ejemplo: '/ajax/ligas/'
 * @param {object} options - Opciones fetch (opcional)
 * @returns {Promise<any>} - Respuesta JSON
 */
async function apiRequest(endpoint, options = {}) {
    const baseUrl = API_CONFIG?.BASE_URL || 'https://scoutgine.onrender.com';
    const url = baseUrl + endpoint;
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}