console.log("=== CONFIG.JS CARGADO ===");

// ✅ DETECTAR AUTOMÁTICAMENTE EL ENTORNO
const isProduction = window.location.hostname !== '127.0.0.1' && 
                    window.location.hostname !== 'localhost' &&
                    !window.location.hostname.includes('127.0.0.1');

const API_CONFIG = {
    // ✅ CAMBIO AUTOMÁTICO ENTRE DESARROLLO Y PRODUCCIÓN
    BASE_URL: isProduction 
        ? 'https://scoutgine-backend.onrender.com'  // ← TU BACKEND EN RENDER
        : 'http://127.0.0.1:8000'                   // ← DESARROLLO LOCAL
};

// ✅ MOSTRAR CONFIGURACIÓN ACTUAL
console.log('🌍 Entorno:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');
console.log('🌐 BASE_URL:', API_CONFIG.BASE_URL);
console.log('✅ CONFIG.JS INICIALIZADO');

// ✅ ELIMINAR ESTAS LÍNEAS DUPLICADAS:
// ...within de createPaymentPreference...
// const response = await fetch(API_CONFIG.BASE_URL + '/api/crear-preferencia', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//         plan: plan.plan,
//         price: plan.price,
//         title: plan.title,
//         user_id: currentUser.id,
//         user_email: currentUser.email
//     })
// });
window.BASE_URL = API_CONFIG.BASE_URL;