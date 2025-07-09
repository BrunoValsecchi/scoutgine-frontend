// Configuración global de Supabase
const SUPABASE_URL = 'https://gvgmhdxarjgvfykoyqyw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Z21oZHhhcmpndmZ5a295cXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjUwMjMsImV4cCI6MjA2NDA0MTAyM30.05_u4LQA-z443z6eeFBBtlluobKLeNSOR25fHcEUpag';

// Verificar que Supabase esté disponible
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase SDK no está cargado. Asegúrate de incluir el script CDN.');
} else {
    try {
        // Crear cliente global
        const { createClient } = window.supabase;
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Hacerlo disponible globalmente
        window.supabaseClient = supabaseClient;
        
        console.log('✅ supabaseClient configurado globalmente:', window.supabaseClient);
    } catch (error) {
        console.error('❌ Error creando cliente Supabase:', error);
    }
}