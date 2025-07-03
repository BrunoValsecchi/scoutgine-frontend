/**
 * Realiza una petición fetch a la API usando la configuración global de API_CONFIG.
 * @param {string} endpoint - El endpoint relativo, por ejemplo: '/ajax/ligas/'
 * @param {object} options - Opciones fetch (opcional)
 * @returns {Promise<any>} - Respuesta JSON
 */
async function apiRequest(endpoint, options = {}) {
    if (typeof API_CONFIG === 'undefined' || !API_CONFIG.BASE_URL) {
        throw new Error('API_CONFIG no está definido');
    }
    const url = API_CONFIG.BASE_URL + endpoint;
    const response = await fetch(url, options);
    if (!response.ok) {
        let msg = `Error HTTP ${response.status}`;
        try {
            const data = await response.json();
            msg += data.error ? `: ${data.error}` : '';
        } catch {}
        throw new Error(msg);
    }
    return response.json();
}