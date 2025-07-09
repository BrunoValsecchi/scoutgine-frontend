let allUsers = [];
let currentEditingUserId = null;

document.addEventListener('DOMContentLoaded', async function() {
    await loadUsers();
    setupEventListeners();
});

// ===== CARGAR USUARIOS =====
async function loadUsers() {
    const usersTable = document.getElementById('admin-users-table');
    usersTable.innerHTML = '<p class="loading">Cargando usuarios...</p>';

    try {
        const url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN_USERS;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.status !== 'success') {
            usersTable.innerHTML = `<p class="error">Error: ${data.message}</p>`;
            return;
        }

        allUsers = data.users;
        displayUsers(allUsers);
        updateStats(allUsers);
    } catch (err) {
        usersTable.innerHTML = '<p class="error">Error cargando usuarios.</p>';
    }
}

// ===== MOSTRAR USUARIOS =====
function displayUsers(users) {
    const usersTable = document.getElementById('admin-users-table');
    
    if (users.length === 0) {
        usersTable.innerHTML = '<p class="error">No se encontraron usuarios.</p>';
        return;
    }

    let html = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Plan</th>
                    <th>Creado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        const roleClass = user.role === 'admin' ? 'status-admin' : 'status-user';
        const planClass = user.subscription === 'premium' ? 'status-active' : 'status-inactive';
        
        html += `
            <tr>
                <td>${user.email}</td>
                <td>${user.nombre || 'Sin nombre'}</td>
                <td><span class="status-badge ${roleClass}">${user.role || 'user'}</span></td>
                <td><span class="status-badge ${planClass}">${user.subscription || 'free'}</span></td>
                <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-secondary" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-danger" onclick="deleteUser('${user.id}', '${user.email}')">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    usersTable.innerHTML = html;
}

// ===== ACTUALIZAR ESTADÍSTICAS =====
function updateStats(users) {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const premiumUsers = users.filter(u => u.subscription === 'premium').length;
    const freeUsers = users.filter(u => u.subscription === 'free' || !u.subscription).length;

    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('admin-users').textContent = adminUsers;
    document.getElementById('premium-users').textContent = premiumUsers;
    document.getElementById('free-users').textContent = freeUsers;
}

// ===== CONFIGURAR EVENT LISTENERS =====
function setupEventListeners() {
    // Búsqueda
    document.getElementById('search-input').addEventListener('input', filterUsers);
    document.getElementById('role-filter').addEventListener('change', filterUsers);
    document.getElementById('plan-filter').addEventListener('change', filterUsers);

    // Formulario
    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('user-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// ===== FILTRAR USUARIOS =====
function filterUsers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const planFilter = document.getElementById('plan-filter').value;

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm) || 
                            (user.nombre && user.nombre.toLowerCase().includes(searchTerm));
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesPlan = !planFilter || user.subscription === planFilter;

        return matchesSearch && matchesRole && matchesPlan;
    });

    displayUsers(filteredUsers);
}

// ===== MODAL FUNCTIONS =====
function openCreateModal() {
    currentEditingUserId = null;
    document.getElementById('modal-title').textContent = 'Nuevo Usuario';
    document.getElementById('user-form').reset();
    document.getElementById('user-modal').style.display = 'block';
    document.getElementById('modal-message').innerHTML = '';
    document.getElementById('password-group').style.display = 'block';
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    currentEditingUserId = userId;
    document.getElementById('modal-title').textContent = 'Editar Usuario';
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-nombre').value = user.nombre || '';
    document.getElementById('user-role').value = user.role || 'user';
    document.getElementById('user-plan').value = user.subscription || 'free';
    document.getElementById('user-modal').style.display = 'block';
    document.getElementById('modal-message').innerHTML = '';
    document.getElementById('password-group').style.display = 'none';
}

function closeModal() {
    document.getElementById('user-modal').style.display = 'none';
    currentEditingUserId = null;
}

// ===== SUBMIT FORMULARIO =====
async function handleUserSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('user-email').value;
    const nombre = document.getElementById('user-nombre').value;
    const role = document.getElementById('user-role').value;
    const subscription = document.getElementById('user-plan').value;
    const password = document.getElementById('user-password').value;

    const messageDiv = document.getElementById('modal-message');
    messageDiv.innerHTML = '<p class="loading">Guardando...</p>';

    try {
        const url = currentEditingUserId 
            ? `${API_CONFIG.BASE_URL}/ajax/admin/users/${currentEditingUserId}/update/`
            : `${API_CONFIG.BASE_URL}/ajax/admin/users/create/`;

        const method = currentEditingUserId ? 'PUT' : 'POST';

        // Solo enviar contraseña al crear
        const body = currentEditingUserId
            ? { email, nombre, role, subscription }
            : { email, nombre, role, subscription, password };

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (data.status === 'success') {
            messageDiv.innerHTML = '<p class="success">Usuario guardado correctamente</p>';
            setTimeout(() => {
                closeModal();
                loadUsers();
            }, 1500);
        } else {
            messageDiv.innerHTML = `<p class="error">Error: ${data.message}</p>`;
        }
    } catch (err) {
        messageDiv.innerHTML = '<p class="error">Error guardando usuario</p>';
    }
}

// ===== ELIMINAR USUARIO =====
async function deleteUser(userId, email) {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${email}?`)) {
        return;
    }

    try {
        const url = `${API_CONFIG.BASE_URL}/ajax/admin/users/${userId}/delete/`;
        const response = await fetch(url, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.status === 'success') {
            alert('Usuario eliminado correctamente');
            loadUsers(); // Recargar la lista
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        alert('Error eliminando usuario');
    }
}