// Configura tu URL y KEY de Supabase
const SUPABASE_URL = 'https://gvgmhdxarjgvfykoyqyw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Z21oZHhhcmpndmZ5a295cXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjUwMjMsImV4cCI6MjA2NDA0MTAyM30.05_u4LQA-z443z6eeFBBtlluobKLeNSOR25fHcEUpag';

// ✅ CORREGIR ESTA LÍNEA:
const { createClient } = supabase;  // ← AGREGAR ESTA LÍNEA
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);  // ← CAMBIAR NOMBRE

// Sesión - Funcionalidad de Login/Register
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    // ===== CAMBIO DE TABS =====
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Cambiar tabs activos
            tabBtns.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            
            // Cambiar formularios activos
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === targetTab + '-form') {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // ===== TOGGLE DE CONTRASEÑAS =====
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordInput = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'bx bx-hide';
            } else {
                passwordInput.type = 'password';
                icon.className = 'bx bx-show';
            }
        });
    });
    
    // ===== VALIDACIÓN DE FORMULARIOS =====
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // ===== FUNCIONES DE MANEJO =====
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        showLoading(e.target);

        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });  // ← CAMBIAR AQUÍ
        hideLoading(e.target);

        if (error) {
            showError(error.message);
        } else {
            showSuccess('¡Bienvenido!');
            setTimeout(() => window.location.href = 'menu.html', 1200);
        }
    }
    
    async function handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const nombre = document.getElementById('register-name').value;
        const apellido = document.getElementById('register-lastname').value;

        if (password !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            return;
        }
        showLoading(e.target);

        // Registro en Supabase Auth
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre,
                    apellido,
                    role: "user"
                }
            }
        });
        hideLoading(e.target);

        if (error) {
            showError(error.message);
        } else {
            showSuccess('¡Cuenta creada! Revisa tu email para confirmar.');
            setTimeout(() => window.location.href = 'menu.html', 1800);
        }
    }
    
    // ===== CAMBIO DE FORMULARIO DESDE EL FOOTER ===== 
    // ← ESTA PARTE DEBE IR AQUÍ, DENTRO DEL DOMContentLoaded
    document.querySelectorAll('.switch-form-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();  // ← AGREGAR ESTO
            console.log('Switch button clicked'); // ← DEBUG
            
            // Activa el tab de registro
            const registerTab = document.querySelector('.tab-btn[data-tab="register"]');
            if (registerTab) {
                registerTab.click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
    
    // ===== LOGIN SOCIAL =====
    const googleBtn = document.querySelector('.social-btn.google');
    const githubBtn = document.querySelector('.social-btn.github');

    // Login con Google
    googleBtn.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/menu.html'
            }
        });
        if (error) {
            showError('Error al iniciar sesión con Google: ' + error.message);
        }
    });

    // Login con GitHub
    githubBtn.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin + '/menu.html'
            }
        });
        if (error) {
            showError('Error al iniciar sesión con GitHub: ' + error.message);
        }
    });
    
    // ===== UTILIDADES =====
    function showLoading(form) {
        const submitBtn = form.querySelector('.auth-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Procesando...';
    }
    
    function hideLoading(form) {
        const submitBtn = form.querySelector('.auth-btn');
        submitBtn.disabled = false;
        
        if (form.id === 'login-form') {
            submitBtn.innerHTML = '<i class="bx bx-log-in"></i> Iniciar Sesión';
        } else {
            submitBtn.innerHTML = '<i class="bx bx-user-plus"></i> Crear Cuenta';
        }
    }
    
    function showError(message) {
        const toast = createToast(message, 'error');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
    
    function showSuccess(message) {
        const toast = createToast(message, 'success');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
    
    function createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="bx ${type === 'error' ? 'bx-error' : 'bx-check'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        return toast;
    }
});

// ===== CSS ANIMATIONS =====
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
`;
document.head.appendChild(style);