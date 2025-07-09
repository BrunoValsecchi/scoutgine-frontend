document.addEventListener('DOMContentLoaded', async function() {
    const usersTable = document.getElementById('admin-users-table');
    if (!window.supabaseClient) {
        usersTable.innerHTML = '<p style="color:red;">Supabase no inicializado.</p>';
        return;
    }

    // Obtener usuario actual
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user || user.user_metadata.role !== 'admin') {
        usersTable.innerHTML = '<p style="color:red;">Acceso solo para administradores.</p>';
        return;
    }

    // Solo puedes listar tu propio usuario desde el frontend
    usersTable.innerHTML = `
        <h2>Editar tu perfil</h2>
        <form id="edit-user-form">
            <label>
                Email:
                <input type="email" value="${user.email}" disabled>
            </label>
            <label>
                Nombre:
                <input type="text" id="nombre-input" value="${user.user_metadata.nombre || ''}">
            </label>
            <label>
                Plan:
                <select id="plan-input">
                    <option value="free" ${user.user_metadata.subscription === 'free' ? 'selected' : ''}>Free</option>
                    <option value="basic" ${user.user_metadata.subscription === 'basic' ? 'selected' : ''}>Basic</option>
                    <option value="premium" ${user.user_metadata.subscription === 'premium' ? 'selected' : ''}>Premium</option>
                </select>
            </label>
            <button type="submit">Guardar cambios</button>
        </form>
        <div id="dashboard-msg"></div>
    `;

    document.getElementById('edit-user-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-input').value;
        const plan = document.getElementById('plan-input').value;
        const msg = document.getElementById('dashboard-msg');
        msg.textContent = 'Actualizando...';

        const { error } = await window.supabaseClient.auth.updateUser({
            data: { nombre, subscription: plan }
        });

        if (error) {
            msg.textContent = 'Error: ' + error.message;
            msg.style.color = 'red';
        } else {
            msg.textContent = '¡Datos actualizados!';
            msg.style.color = 'green';
        }
    });
});