document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuarioIngresado = document.getElementById("usuario").value.trim();
    const contrasenaIngresada = document.getElementById("contrasena").value;

    try {
        const respuesta = await fetch("http://localhost:5000/api/users");
        const usuarios = await respuesta.json();

        const usuarioEncontrado = usuarios.find(
            (user) =>
                user.nombre === usuarioIngresado && user.contrasena === contrasenaIngresada
        );

        if (usuarioEncontrado) {
            localStorage.setItem("usuarioAutenticado", "true");
            localStorage.setItem("usuarioNombre", usuarioEncontrado.nombre);
            localStorage.setItem("userId", usuarioEncontrado._id);

            // Obtener el carrito del servidor
            const resCarrito = await fetch(`http://localhost:5000/api/carts/${usuarioEncontrado._id}`);
            if (resCarrito.ok) {
                const carritoData = await resCarrito.json();

                const carritoTransformado = carritoData.items.map(item => ({
                    _id: item.producto._id,
                    nombre: item.producto.nombre,
                    precio: item.producto.precio,
                    cantidad: item.cantidad
                }));

                localStorage.setItem("carrito", JSON.stringify(carritoTransformado));
            } else {
                // Si no hay carrito, se guarda uno vacío
                localStorage.setItem("carrito", JSON.stringify([]));
            }

            window.location.href = "index.html";
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    } catch (error) {
        console.error("Error al verificar usuario:", error);
        alert("Ocurrió un error al conectar con el servidor.");
    }
});
