const { createClient } = supabase;
const supabaseClient = window.supabaseClient;
window.supabaseClient = supabaseClient;

// ✅ NO declarar constantes aquí, usar el cliente global

// ✅ FUNCIÓN PARA LOGIN SOCIAL
async function signInWithProvider(provider) {
    try {
        console.log(`🔄 Iniciando login con ${provider}...`);
        
        // ✅ USAR EL CLIENTE GLOBAL
        if (!window.supabaseClient) {
            console.error('❌ supabaseClient no está disponible');
            showMessage('Error: Cliente de autenticación no disponible', 'error');
            return;
        }
        
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/menu.html`
            }
        });
        
        if (error) {
            console.error(`❌ Error con ${provider}:`, error);
            showMessage(`Error iniciando sesión con ${provider}: ${error.message}`, 'error');
            return;
        }
        
        console.log(`✅ Redirigiendo a ${provider}...`);
        
    } catch (error) {
        console.error(`❌ Error con ${provider}:`, error);
        showMessage(`Error iniciando sesión con ${provider}`, 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Página de sesión cargada');
    
    // Verificar si el cliente está disponible
    if (!window.supabaseClient) {
        console.log('⏳ Esperando a que supabaseClient esté disponible...');
        
        // Esperar hasta que esté disponible
        const checkClient = setInterval(() => {
            if (window.supabaseClient) {
                clearInterval(checkClient);
                console.log('✅ supabaseClient ahora disponible');
                initializePage();
            }
        }, 100);
        
        // Timeout después de 5 segundos
        setTimeout(() => {
            clearInterval(checkClient);
            if (!window.supabaseClient) {
                console.error('❌ supabaseClient no se cargó después de 5 segundos');
                showMessage('Error cargando sistema de autenticación', 'error');
            }
        }, 5000);
    } else {
        initializePage();
    }
});

function initializePage() {
    // Configurar navegación entre tabs
    setupTabNavigation();
    
    // Configurar formularios
    setupForms();
    
    // Configurar botones sociales
    setupSocialButtons();
    
    // Configurar otros elementos
    setupPasswordToggles();
}

function setupSocialButtons() {
    // Botones de Google
    const googleBtns = document.querySelectorAll('.social-btn.google');
    googleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔄 Botón Google clickeado');
            signInWithProvider('google');
        });
    });
    
    // Botones de GitHub
    const githubBtns = document.querySelectorAll('.social-btn.github');
    githubBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔄 Botón GitHub clickeado');
            signInWithProvider('github');
        });
    });
}

function setupForms() {
    // Formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                showMessage('Por favor completa todos los campos', 'error');
                return;
            }
            
            await signInWithEmail(email, password);
        });
    }
    
    // Formulario de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('register-name').value;
            const apellido = document.getElementById('register-lastname').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const acceptTerms = document.getElementById('accept-terms').checked;
            
            // Validaciones
            if (!nombre || !apellido || !email || !password || !confirmPassword) {
                showMessage('Por favor completa todos los campos', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Las contraseñas no coinciden', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            
            if (!acceptTerms) {
                showMessage('Debes aceptar los términos y condiciones', 'error');
                return;
            }
            
            await signUpWithEmail(email, password, nombre, apellido);
        });
    }
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = button.dataset.tab;
            
            console.log('🔄 Cambiando a tab:', targetTab);
            
            // Actualizar botones activos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Mostrar formulario correcto
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
}

function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('bx-show');
                icon.classList.add('bx-hide');
            } else {
                input.type = 'password';
                icon.classList.remove('bx-hide');
                icon.classList.add('bx-show');
            }
        });
    });
}

async function signInWithEmail(email, password) {
    try {
        console.log('🔄 Iniciando sesión con email...');
        
        if (!window.supabaseClient) {
            console.error('❌ supabaseClient no está disponible');
            showMessage('Error: Cliente de autenticación no disponible', 'error');
            return;
        }
        
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('❌ Error login:', error);
            showMessage('Error: ' + error.message, 'error');
            return;
        }
        
        console.log('✅ Login exitoso:', data.user.email);
        showMessage('¡Login exitoso! Redirigiendo...', 'success');
        
        // Verificar y actualizar suscripción
        const { data: sessionData } = await window.supabaseClient.auth.getSession();
        const session = sessionData.session;
        
        if (session) {
            // Si no hay suscripción, asignar "free"
            if (!session.user.user_metadata.subscription) {
                await window.supabaseClient.auth.updateUser({
                    data: { subscription: "free" }
                });
            }
        }
        
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error login:', error);
        showMessage('Error iniciando sesión', 'error');
    }
}

async function signUpWithEmail(email, password, nombre, apellido) {
    try {
        console.log('🔄 Registrando usuario...');
        
        if (!window.supabaseClient) {
            console.error('❌ supabaseClient no está disponible');
            showMessage('Error: Cliente de autenticación no disponible', 'error');
            return;
        }
        
        const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    nombre: nombre,
                    apellido: apellido,
                    role: "user",
                    subscription: "free"
                }
            }
        });
        
        if (error) {
            console.error('❌ Error registro:', error);
            showMessage('Error: ' + error.message, 'error');
            return;
        }
        
        if (data.user && !data.user.email_confirmed_at) {
            showMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.', 'success');
        } else {
            showMessage('¡Registro exitoso! Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        }
        
    } catch (error) {
        console.error('❌ Error registro:', error);
        showMessage('Error registrando usuario', 'error');
    }
}

function showMessage(message, type = 'info') {
    // Remover mensaje anterior
    const existingMessage = document.querySelector('.toast-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const colors = {
        error: '#ef4444',
        success: '#10b981',
        info: '#3b82f6'
    };
    
    const icons = {
        error: 'bx-error',
        success: 'bx-check',
        info: 'bx-info-circle'
    };
    
    // Crear mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `toast-message toast-${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    messageDiv.innerHTML = `
        <i class='bx ${icons[type]}'></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 4000);
}

// CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
