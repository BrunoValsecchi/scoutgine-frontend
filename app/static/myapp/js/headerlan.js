document.addEventListener("DOMContentLoaded", function () {
    // Agregar clase para activar transición con CSS si la usás
    document.querySelector(".section-presentacion")?.classList.add("show");

    // Animar el logo
    anime({
      targets: '.a-logo',
      translateY: [-100, 0],
      duration: 1500,
      easing: 'easeInOutQuad'
    });

  });

  async function mostrarUsuarioHeader() {
    // Esperar a que el hash de OAuth se procese y la sesión esté lista
    for (let i = 0; i < 10; i++) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session && session.user) break;
      await new Promise(r => setTimeout(r, 200));
    }

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    const userInfoDiv = document.getElementById('header-user-info');
    if (!userInfoDiv) return;

    if (session && session.user) {
      const email = session.user.email;
      const nombre = session.user.user_metadata?.nombre || '';
      const avatarLetter = (nombre ? nombre[0] : email[0] || '?').toUpperCase();
      const tooltip = nombre ? `${nombre} (${email})` : email;

      userInfoDiv.innerHTML = `
        <div class="header-avatar-container" title="${tooltip}">
          <a href="menu.html" class="avatar-link" aria-label="Ir al menú">
            <span class="avatar-circle-visual">${avatarLetter}</span>
          </a>
          <span class="avatar-name">${nombre ? nombre : email}</span>
          <a href="#" id="logout-btn" class="logout-btn" title="Cerrar sesión">
            <i class='bx bx-log-out'></i>
          </a>
        </div>
      `;

      // Logout handler
      document.getElementById('logout-btn').onclick = async function(e) {
        e.preventDefault();
        await window.supabaseClient.auth.signOut();
        window.location.reload();
      };
    } else {
      userInfoDiv.innerHTML = `
        <a href="sesion.html" class="login-link-visual" title="Iniciar sesión">
          <i class='bx bx-log-in'></i> <span>Iniciar sesión</span>
        </a>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', mostrarUsuarioHeader);
