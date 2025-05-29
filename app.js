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

                const userPais = localStorage.getItem("userPais");
                console.log(userPais)
                const productosPorPagina = 16;
                let paginaActual = 1;
                let productosFiltrados = [];

                try {
                    const res = await fetch("http://localhost:5000/api/products");
                    const todosLosProductos = await res.json();

                    productosFiltrados = todosLosProductos.filter(p => p.pais === userPais);

                    mostrarPagina(paginaActual);
                } catch (error) {
                    console.error("Error al obtener productos:", error);
                    mainContent.innerHTML = `<p style="text-align:center; color:red;">No se pudieron cargar los productos.</p>`;
                }

            function mostrarPagina(pagina) {
                paginaActual = pagina;
                const inicio = (pagina - 1) * productosPorPagina;
                const fin = inicio + productosPorPagina;
                const productosPagina = productosFiltrados.slice(inicio, fin);

                mainContent.innerHTML = `
                    <section class="product-list"></section>
                    <div class="pagination" style="text-align:center; padding: 1rem;"></div>
                `;

                const productList = document.querySelector(".product-list");

                productosPagina.forEach((producto) => {
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

                generarPaginacion();
            }

            function generarPaginacion() {
                const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
                const paginationDiv = document.querySelector(".pagination");
                paginationDiv.innerHTML = "";

                // Botón anterior
                const btnAnterior = document.createElement("button");
                btnAnterior.textContent = "« Anterior";
                btnAnterior.disabled = paginaActual === 1;
                btnAnterior.style.margin = "0.25rem";
                btnAnterior.addEventListener("click", () => mostrarPagina(paginaActual - 1));
                paginationDiv.appendChild(btnAnterior);

                // Botones numerados
                for (let i = 1; i <= totalPaginas; i++) {
                    const btn = document.createElement("button");
                    btn.textContent = i;
                    btn.style.margin = "0.25rem";
                    if (i === paginaActual) {
                        btn.disabled = true;
                    }
                    btn.addEventListener("click", () => mostrarPagina(i));
                    paginationDiv.appendChild(btn);
                }

                // Botón siguiente
                const btnSiguiente = document.createElement("button");
                btnSiguiente.textContent = "Siguiente »";
                btnSiguiente.disabled = paginaActual === totalPaginas;
                btnSiguiente.style.margin = "0.25rem";
                btnSiguiente.addEventListener("click", () => mostrarPagina(paginaActual + 1));
                paginationDiv.appendChild(btnSiguiente);
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
                                    <label>URL de imagen *</label>
                                    <input type="text" step="0.01" name="url" required />
                                </div>
                                        <div>
                                            <label>País *</label>
                                            <select name="pais" required>
                                                <option value="">Seleccioná tu país</option>
                                                <option value="Argentina">Argentina</option>
                                                <option value="China">China</option>
                                                <option value="Ecuador">Ecuador</option>
                                                <option value="Noruega">Noruega</option>
                                                <option value="EEUU">EEUU</option>
                                                <option value="Alemania">Alemania</option>
                                                <option value="México">México</option>
                                                <option value="Australia">Australia</option>
                                                <option value="Perú">Perú</option>
                                                <option value="Francia">Francia</option>
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
                        imagenUrl: formData.get("url"),
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
            case "Reportes":
                mainContent.innerHTML = `
                    <section class="reportes-section">
                        <div class="reportes-header">
                            <h2>Reportes</h2>
                            <label for="reporte-select">Seleccioná un reporte:</label>
                            <select id="reporte-select">
                                <option value="clientesMasCompraron">Clientes que más compraron</option>
                                <option value="ventasPorMes">Total de ventas por mes</option>
                                <option value="paisesMayorCantidad">Países con mayor cantidad comprada</option>
                                <option value="promedioCompraDiaria">Promedio de compra diaria</option>
                                <option value="productosMasVendidos">Productos más vendidos</option>
                                <option value="ventasPorRegion">Ventas por región</option>
                            </select>
                            <button id="enviar-reporte-btn">Generar reporte</button>
                        </div>
                        <div id="resultado-reporte" class="reporte-resultado"></div>
                    </section>
                    `;

                document.getElementById("enviar-reporte-btn").addEventListener("click", async () => {
                    const select = document.getElementById("reporte-select");
                    const reporte = select.value;
                    const resultadoDiv = document.getElementById("resultado-reporte");

                    resultadoDiv.innerHTML = "<p>Cargando reporte...</p>";

                    try {
                        const url = "http://localhost:5000/api/ventas";
                        const res = await fetch(url);
                        if (!res.ok) throw new Error("Error al obtener el reporte");

                        const data = await res.json();
                        resultadoDiv.innerHTML = '<canvas id="grafico" width="600" height="400"></canvas>';
                        const ctx = document.getElementById("grafico").getContext("2d");

                        let chartData = {};
                        let title = "";

                        switch (reporte) {
                            case "productosMasVendidos":
                                chartData = data.reduce((acc, venta) => {
                                    acc[venta.nombre] = (acc[venta.nombre] || 0) + venta.cantidad;
                                    return acc;
                                }, {});
                                title = "Productos más vendidos";
                                break;

                            case "ventasPorMes":
                                chartData = data.reduce((acc, venta) => {
                                    const mes = new Date(venta.createdAt).toLocaleString('default', {
                                        month: 'short',
                                        year: 'numeric'
                                    });
                                    acc[mes] = (acc[mes] || 0) + venta.precio * venta.cantidad;
                                    return acc;
                                }, {});
                                title = "Total de ventas por mes";
                                break;

                            case "paisesMayorCantidad":
                                chartData = data.reduce((acc, venta) => {
                                    acc[venta.pais] = (acc[venta.pais] || 0) + venta.cantidad;
                                    return acc;
                                }, {});
                                title = "Países con mayor cantidad comprada";
                                break;

                            case "ventasPorRegion":
                                chartData = data.reduce((acc, venta) => {
                                    acc[venta.pais] = (acc[venta.pais] || 0) + venta.precio * venta.cantidad;
                                    return acc;
                                }, {});
                                title = "Ventas por región (país)";
                                break;

                            case "promedioCompraDiaria":
                                chartData = data.reduce((acc, venta) => {
                                    const dia = new Date(venta.createdAt).toISOString().split("T")[0];
                                    acc[dia] = (acc[dia] || 0) + venta.precio * venta.cantidad;
                                    return acc;
                                }, {});
                                title = "Promedio de compra diaria";
                                break;

                            case "clientesMasCompraron": {
                                const acumuladoPorUsuario = data.reduce((acc, venta) => {
                                    acc[venta.usuarioId] = (acc[venta.usuarioId] || 0) + venta.precio * venta.cantidad;
                                    return acc;
                                }, {});

                                const resUsuarios = await fetch("http://localhost:5000/api/users");
                                if (!resUsuarios.ok) throw new Error("Error al obtener los usuarios");

                                const usuarios = await resUsuarios.json();
                                const usuariosPorId = {};
                                usuarios.forEach(u => usuariosPorId[u._id] = u.nombre);

                                // Reemplazar IDs por nombres
                                chartData = {};
                                for (const userId in acumuladoPorUsuario) {
                                    const nombre = usuariosPorId[userId] || `ID: ${userId}`;
                                    chartData[nombre] = acumuladoPorUsuario[userId];
                                }

                                title = "Clientes que más compraron";
                            }
                                break;

                            default:
                                resultadoDiv.innerHTML = "<p>Reporte no reconocido.</p>";
                                return;
                        }

                        // Destruir gráfico anterior si existe
                        if (window.myChart) {
                            window.myChart.destroy();
                        }

                        window.myChart = new Chart(ctx, {
                            type: "bar",
                            data: {
                                labels: Object.keys(chartData),
                                datasets: [{
                                    label: title,
                                    data: Object.values(chartData),
                                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                                    borderColor: "rgba(54, 162, 235, 1)",
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {display: false},
                                    title: {display: true, text: title}
                                },
                                scales: {
                                    y: {beginAtZero: true}
                                }
                            }
                        });

                    } catch (error) {
                        resultadoDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
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
                console.log(carrito)
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


