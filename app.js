// Verificar autenticación
const autenticado = localStorage.getItem("usuarioAutenticado");
if (autenticado !== "true") {
    window.location.href = "login.html";
}

// Redirigir secciones en SPA
document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.querySelector(".main-content");

    // Carrito persistente
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const cartBtn = document.getElementById("toggle-cart-btn");
    const cartSlider = document.getElementById("cart-slider");
    const cartItemsContainer = document.getElementById("cart-items");

    cartBtn.addEventListener("click", () => {
        cartSlider.classList.toggle("open");
    });

    function agregarAlCarrito(producto) {
        const index = carrito.findIndex(p => p._id === producto._id);

        if (index !== -1) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push({...producto, cantidad: 1});
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));
        console.log("Carrito agregado/modificado:", JSON.stringify(carrito, null, 2));
        renderizarCarrito();
    }


    function renderizarCarrito() {
        cartItemsContainer.innerHTML = "";
        if (carrito.length === 0) {
            cartItemsContainer.innerHTML = "<p>El carrito está vacío.</p>";
            return;
        }

        carrito.forEach((prod, index) => {
            const item = document.createElement("div");
            item.classList.add("cart-item");
            item.innerHTML = `
            <h4>${prod.nombre}</h4>
            <p>$${prod.precio}</p>
            <div class="cantidad-container">
                Cantidad: <span class="cantidad">${prod.cantidad}</span>
                <button class="btn-aumentar" data-index="${index}">+</button>
                <button class="btn-disminuir" data-index="${index}">-</button>
            </div>
            <button class="remove-btn" data-index="${index}">Eliminar</button>
        `;
            cartItemsContainer.appendChild(item);
        });

        // Botones para eliminar
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                carrito.splice(index, 1);
                actualizarLocalStorageYRender();
            });
        });

        // Botones para aumentar cantidad
        document.querySelectorAll(".btn-aumentar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                carrito[index].cantidad += 1;
                actualizarLocalStorageYRender();
            });
        });

        // Botones para disminuir cantidad
        document.querySelectorAll(".btn-disminuir").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                if (carrito[index].cantidad > 1) {
                    carrito[index].cantidad -= 1;
                } else {
                    // Si la cantidad llega a 0, eliminamos el producto
                    carrito.splice(index, 1);
                }
                actualizarLocalStorageYRender();
            });
        });
    }

    function actualizarLocalStorageYRender() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
        console.log("Carrito actualizado:", JSON.stringify(carrito, null, 2, localStorage.userId));
        renderizarCarrito();
    }


    renderizarCarrito();

    // Navegación por secciones
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
                    mainContent.innerHTML = `<p style="text-align:center; color:red;">No se pudieron cargar los productos.</p>`;
                }
                break;

            case "Nuevo producto":
                mainContent.innerHTML = `
                    <section class="offers">
                        <div class="form-wrapper">
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
                                        <div>
                                            <label>País *</label>
                                            <select name="pais" required>
                                                <option value="">Seleccioná tu país</option>
                                                <option value="Argentina">Argentina</option>
                                                <option value="Bolivia">Bolivia</option>
                                                <option value="Brasil">Brasil</option>
                                                <option value="Chile">Chile</option>
                                                <option value="Colombia">Colombia</option>
                                                <option value="Ecuador">Ecuador</option>
                                                <option value="México">México</option>
                                                <option value="Paraguay">Paraguay</option>
                                                <option value="Perú">Perú</option>
                                                <option value="Uruguay">Uruguay</option>
                                                <option value="Venezuela">Venezuela</option>
                                            </select>
                                        </div>
                                <div id="extra-fields"></div>
                                <button type="button" id="add-field-btn">+ Agregar campo</button>
                                <br><br>
                                <button type="submit">Crear producto</button>
                            </form>
                            <p id="form-message"></p>
                        </div>
                    </section>
                `;

                const form = document.getElementById("product-form");
                const addFieldBtn = document.getElementById("add-field-btn");
                const extraFieldsContainer = document.getElementById("extra-fields");
                const message = document.getElementById("form-message");

                addFieldBtn.addEventListener("click", () => {
                    const fieldDiv = document.createElement("div");
                    fieldDiv.innerHTML = `
                        <input type="text" placeholder="Campo" class="custom-key" required />
                        <input type="text" placeholder="Valor" class="custom-value" required />
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
                        pais: formData.get("pais")
                    };

                    document.querySelectorAll("#extra-fields > div").forEach(div => {
                        const key = div.querySelector(".custom-key").value;
                        const value = div.querySelector(".custom-value").value;
                        if (key && value) product[key] = value;
                    });

                    console.log(product)
                    try {
                        const response = await fetch("http://localhost:5000/api/products", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
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
        }
    }

    function renderDetalle(producto) {
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
                    <button class="buy-btn" id="add-to-cart-btn">Agregar al carrito</button>
                    <button class="back-btn">Volver</button>
                </div>
            </section>  
        `;

        document.getElementById("add-to-cart-btn").addEventListener("click", () => {
            agregarAlCarrito(producto);
        });

        document.querySelector(".back-btn").addEventListener("click", () => {
            renderSection("Productos");
        });
    }

    // Mostrar "Inicio" por defecto
    renderSection("Inicio");

    // Cierre de sesión por inactividad
    setTimeout(async () => {
        await guardarCarritoEnServidor();
        localStorage.removeItem("usuarioAutenticado");
        localStorage.removeItem("carrito");
        alert("Sesión expirada. Serás redirigido al login.");
        window.location.href = "login.html";
    }, 600000); // 10 minutos


    async function guardarCarritoEnServidor() {
        const userId = localStorage.getItem("userId");
        if (!userId || !carrito) return;

        // Si carrito está vacío, items será []
        const items = carrito.map(prod => ({
            producto: prod._id,
            cantidad: prod.cantidad || 1,
            precio: prod.precio
        }));

        console.log("Carrito a guardar:", items, userId);

        try {
            await fetch(`http://localhost:5000/api/carts/${userId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({items})
            });
        } catch (error) {
            console.error("Error al guardar el carrito:", error);
        }
    }

    // Botón de cerrar sesión
    /* const logoutBtn = document.getElementById("logout-btn");
     if (logoutBtn) {
         logoutBtn.addEventListener("click", () => {
             localStorage.removeItem("usuarioAutenticado");
             localStorage.removeItem("carrito");
             window.location.href = "login.html";
         });
     }*/

    document.getElementById("logout-btn").addEventListener("click", async () => {
        await guardarCarritoEnServidor();
        localStorage.removeItem("usuarioAutenticado");
        window.location.href = "login.html";
    });

    window.addEventListener("beforeunload", async (e) => {
        await guardarCarritoEnServidor();
    });

    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.addEventListener("click", () => {
        renderPasarelaDePago();
    });

    function renderPasarelaDePago() {
        const total = carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
        const resumenHTML = carrito.map(prod => `
        <div class="resumen-item">
            <strong>${prod.nombre}</strong> x${prod.cantidad} - $${(prod.precio * prod.cantidad).toFixed(2)}
        </div>
    `).join("");

        mainContent.innerHTML = `
        <section class="pasarela-pago">
            <h2>Resumen de Compra</h2>
            <div class="resumen-carrito">${resumenHTML || "<p>El carrito está vacío.</p>"}</div>
            <h3>Total: $${total.toFixed(2)}</h3>
            <button id="confirmar-pago-btn" ${carrito.length === 0 ? "disabled" : ""}>Confirmar Pago</button>
            <button id="cancelar-pago-btn">Cancelar</button>
        </section>
    `;

        document.getElementById("confirmar-pago-btn").addEventListener("click", async () => {
            try {
                if (carrito.length === 0) {
                    alert("El carrito está vacío. Agregá productos antes de confirmar el pago.");
                    return;
                }

                const userId = localStorage.getItem("userId");
                if (!userId) {
                    alert("Usuario no identificado");
                    return;
                }

                const response = await fetch(`http://localhost:5000/api/ventas/${userId}`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(carrito)
                });

                if (!response.ok) throw new Error("Error en el pago");

                alert("¡Pago realizado con éxito!");
                carrito = [];
                actualizarLocalStorageYRender();
                renderSection("Inicio");
            } catch (err) {
                alert("Hubo un problema al procesar el pago: " + err.message);
            }
        });

        document.getElementById("cancelar-pago-btn").addEventListener("click", () => {
            renderSection("Inicio");
        });
    }
});


