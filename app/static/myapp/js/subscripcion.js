// Configuración de Supabase
const SUPABASE_URL = 'https://gvgmhdxarjgvfykoyqyw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Z21oZHhhcmpndmZ5a295cXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjUwMjMsImV4cCI6MjA2NDA0MTAyM30.05_u4LQA-z443z6eeFBBtlluobKLeNSOR25fHcEUpag';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuración de Mercado Pago
const mp = new MercadoPago('APP_USR-a810083b-a8bd-407c-8862-835c559a95f8', {
    locale: 'es-AR'
});

// Variables globales
let selectedPlan = null;
let currentUser = null;

// Inicialización cuando carga el DOM
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎯 Página de suscripciones cargada');
    
    // Obtener usuario actual
    await getCurrentUser();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Animaciones de entrada
    addEntryAnimations();
    
    // Verificar plan actual del usuario
    await checkCurrentPlan();
});

// Obtener usuario actual
async function getCurrentUser() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('👤 Usuario actual:', currentUser.email);
        }
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
    }
}

// Configurar event listeners
function setupEventListeners() {
    const planButtons = document.querySelectorAll('.plan-btn:not(:disabled)');
    
    planButtons.forEach(button => {
        button.addEventListener('click', handlePlanSelection);
    });
}

// Manejar selección de plan
async function handlePlanSelection(e) {
    const button = e.target.closest('.plan-btn');
    const plan = button.dataset.plan;
    const price = parseInt(button.dataset.price);
    const title = button.dataset.title;
    
    selectedPlan = { plan, price, title };
    
    // Actualizar UI
    updatePaymentSection(selectedPlan);
    
    // Mostrar sección de pago con animación
    const paymentSection = document.getElementById('payment-section');
    paymentSection.classList.add('show');
    
    // Scroll suave a la sección de pago
    paymentSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
    
    // Crear preferencia de pago
    await createPaymentPreference(selectedPlan);
}

// Actualizar sección de pago
function updatePaymentSection(plan) {
    document.getElementById('selected-plan').textContent = plan.title;
    document.getElementById('total-amount').textContent = `$${plan.price.toLocaleString()} ARS`;
}

// Crear preferencia de pago en Mercado Pago
async function createPaymentPreference(plan) {
    try {
        showLoading(true);

        // Cambia el precio enviado a Mercado Pago a 1
        const data = await apiRequest('/api/crear-preferencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan: plan.plan,
                price: 1, // <--- SIEMPRE ENVÍA 1 PESO
                title: plan.title,
                user_id: currentUser.id,
                user_email: currentUser.email
            })
        });

        const preferenceId = data.preference_id;
        
        // Crear checkout de Mercado Pago
        mp.checkout({
            preference: {
                id: preferenceId
            },
            render: {
                container: '#mercadopago-button',
                label: 'Pagar con Mercado Pago',
                type: 'button'
            },
            theme: {
                elementsColor: '#10b981',
                headerColor: '#10b981'
            }
        });
        
        showLoading(false);
        showMessage('Botón de pago generado correctamente', 'success');
        
    } catch (error) {
        console.error('Error creando preferencia:', error);
        showLoading(false);
        showMessage('Error al crear el pago. Intenta nuevamente.', 'error');
    }
}

// Verificar plan actual del usuario
async function checkCurrentPlan() {
    if (!currentUser) return;
    
    try {
        // Aquí puedes verificar en tu base de datos el plan actual del usuario
        // Por ahora, asumimos que todos empiezan con el plan gratuito
        const currentPlan = 'free'; // Esto debería venir de tu base de datos
        
        // Actualizar UI según el plan actual
        updateCurrentPlanUI(currentPlan);
        
    } catch (error) {
        console.error('Error verificando plan actual:', error);
    }
}

// Actualizar UI del plan actual
function updateCurrentPlanUI(currentPlan) {
    const planCards = document.querySelectorAll('.plan-card');
    
    planCards.forEach(card => {
        const button = card.querySelector('.plan-btn');
        const planType = button.dataset.plan;
        
        if (planType === currentPlan) {
            button.textContent = 'Plan Actual';
            button.disabled = true;
            button.innerHTML = '<i class="bx bx-check-circle"></i> Plan Actual';
            card.style.borderColor = '#10b981';
        }
    });
}

// Mostrar loading
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Mostrar mensajes de éxito/error
function showMessage(message, type) {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.innerHTML = `
        <i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}'></i>
        ${message}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Mostrar con animación
    setTimeout(() => messageDiv.classList.add('show'), 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Animaciones de entrada
function addEntryAnimations() {
    // Animar cards con delay
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach((card, index) => {
        card.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
    
    // Efecto hover mejorado
    planCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Manejar respuesta de pago (cuando el usuario regresa de Mercado Pago)
function handlePaymentResponse() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentId = urlParams.get('payment_id');
    const plan = urlParams.get('plan'); // Agregar el plan en la URL de retorno
    
    if (status === 'approved') {
        showMessage('¡Pago aprobado! Bienvenido a tu nuevo plan.', 'success');
        // Usar el plan de la URL si selectedPlan es null
        const planToUpdate = selectedPlan?.plan || plan || 'basic';
        updateUserPlan(planToUpdate);
        
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 3000);
        
    } else if (status === 'rejected') {
        showMessage('Pago rechazado. Intenta con otro método de pago.', 'error');
    } else if (status === 'pending') {
        showMessage('Pago pendiente. Te notificaremos cuando se confirme.', 'success');
    }
}

// Actualizar plan del usuario
async function updateUserPlan(newPlan) {
    try {
        // Actualizar en user_metadata de Supabase
        const { error } = await supabaseClient.auth.updateUser({
            data: {
                subscription: newPlan,
                subscription_date: new Date().toISOString()
            }
        });
        
        if (error) throw error;
        
        console.log('✅ Plan actualizado correctamente');
        
    } catch (error) {
        console.error('Error actualizando plan:', error);
    }
}

// Verificar si viene de un pago
window.addEventListener('load', function() {
    handlePaymentResponse();
});