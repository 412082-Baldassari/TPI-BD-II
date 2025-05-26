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

    async function renderSection(section) {
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
                mainContent.innerHTML = `<h2 style="text-align:center; padding: 2rem;">Cargando productos...</h2>`;
                try {
                    const res = await fetch("http://localhost:5000/api/products");
                    const productos = await res.json();

                    mainContent.innerHTML = `<section class="product-list"></section>`;
                    const productList = document.querySelector(".product-list");

                    productos.forEach((producto) => {
                        const card = document.createElement("div");
                        card.classList.add("product-card-horizontal");
                        card.innerHTML = `
                <img src="${producto.imagenUrl || 'https://via.placeholder.com/150'}" alt="${producto.nombre}">
                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p class="price">$${producto.precio}</p>
                </div>
            `;
                        card.addEventListener("click", () => renderDetalle(producto));
                        productList.appendChild(card);
                    });

                } catch (error) {
                    console.error("Error al obtener productos:", error);
                    mainContent.innerHTML = `<p style="text-align:center; color:rgba(255,0,0,0);">No se pudieron cargar los productos.</p>`;
                }
                break;

            case "Ofertas":
                mainContent.innerHTML = `
             <section class="offers">
                <h2>Crear nuevo producto</h2>
                <form id="product-form">
                  <div>
                    <label>Nombre *</label>
                    <input type="text" name="nombre" required />
                  </div>
                  <div>
                    <label>Precio *</label>
                    <input type="number" step="0.01" name="precio" required />
                  </div>
                  <div id="extra-fields"></div>
                  <button type="button" id="add-field-btn">+ Agregar campo</button>
                  <br><br>
                  <button type="submit">Crear producto</button>
                </form>
                <p id="form-message"></p>
              </section>
    `;

                const form = document.getElementById("product-form");
                const addFieldBtn = document.getElementById("add-field-btn");
                const extraFieldsContainer = document.getElementById("extra-fields");
                const message = document.getElementById("form-message");

                addFieldBtn.addEventListener("click", () => {
                    const fieldDiv = document.createElement("div");
                    fieldDiv.innerHTML = `
            <input type="text" placeholder="Campo" class="custom-key" required/>
            <input type="text" placeholder="Valor" class="custom-value" required/>
            <button type="button" class="remove-field">Eliminar</button>
        `;
                    fieldDiv.querySelector(".remove-field").addEventListener("click", () => {
                        fieldDiv.remove();
                    });
                    extraFieldsContainer.appendChild(fieldDiv);
                });

                form.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const product = {
                        nombre: formData.get("nombre"),
                        precio: parseFloat(formData.get("precio")),
                    };

                    document.querySelectorAll("#extra-fields > div").forEach(div => {
                        const key = div.querySelector(".custom-key").value;
                        const value = div.querySelector(".custom-value").value;
                        if (key && value) product[key] = value;
                    });

                    try {
                        const response = await fetch("http://localhost:5000/api/products", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(product)
                        });

                        if (!response.ok) throw new Error("Error al crear el producto");
                        message.textContent = "Producto creado exitosamente.";
                        form.reset();
                        extraFieldsContainer.innerHTML = "";
                    } catch (err) {
                        message.textContent = "Error: " + err.message;
                    }
                });
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
    }, 600000);

    function renderDetalle(producto) {
        const mainContent = document.querySelector(".main-content");

        const detalles = Object.entries(producto)
            .filter(([clave]) => !["_id", "__v", "imagenUrl", "nombre", "precio"].includes(clave))
            .map(([clave, valor]) => `<p><strong>${clave}:</strong> ${valor}</p>`)
            .join("");

        mainContent.innerHTML = `
        <section class="product-detail">
            <img src="${producto.imagenUrl || 'https://via.placeholder.com/300'}" alt="${producto.nombre}">
            <div class="detail-info">
                <h2>${producto.nombre}</h2>
                <p class="price">$${producto.precio}</p>
                ${detalles || "<p><em>Sin información adicional.</em></p>"}
                <button class="back-btn">Volver</button>
            </div>
        </section>
    `;

        document.querySelector(".back-btn").addEventListener("click", () => renderSection("Productos"));
    }

});
