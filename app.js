// Verificar autenticación
const autenticado = localStorage.getItem("usuarioAutenticado");
if (autenticado !== "true") {
    window.location.href = "login.html";
}

// Redirigir secciones en SPA
document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.querySelector(".main-content");

    document.querySelectorAll(".navbar a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const section = e.target.textContent.trim();
            renderSection(section);
        });
    });

    function renderSection(section) {
        switch (section) {
            case "Inicio":
                mainContent.innerHTML = `
          <section class="hero">
            <div class="hero-text">
              <h2>Descubre lo mejor para vos</h2>
              <p>Productos de calidad con estilo y elegancia.</p>
            </div>
          </section>
        `;
                break;

            case "Productos":
                mainContent.innerHTML = `
          <section class="product-grid">
            <h2>Nuestros Productos</h2>
            <p>Próximamente productos increíbles...</p>
          </section>
        `;
                break;

            case "Ofertas":
                mainContent.innerHTML = `
          <section class="offers">
            <h2>Ofertas Especiales</h2>
            <p>Aprovechá nuestras promociones exclusivas.</p>
          </section>
        `;
                break;

            case "Contacto":
                mainContent.innerHTML = `
          <section class="contact">
            <h2>Contacto</h2>
            <p>Escribinos a contacto@tiendasofisticada.com</p>
          </section>
        `;
                break;
        }
    }

    // Mostrar "Inicio" por defecto
    renderSection("Inicio");

    // Botón de cerrar sesión
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("usuarioAutenticado");
            window.location.href = "login.html";
        });
    }

    setTimeout(() => {
        localStorage.removeItem("usuarioAutenticado");
        alert("Sesión expirada. Serás redirigido al login.");
        window.location.href = "login.html";
    }, 300000);
});
