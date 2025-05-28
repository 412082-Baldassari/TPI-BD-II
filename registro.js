document.getElementById("registro-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const contrasena2 = document.getElementById("contrasena2").value;
    const pais = document.getElementById("pais").value;

    if (contrasena !== contrasena2) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    if (!pais) {
        alert("Por favor seleccioná un país.");
        return;
    }

    // POST para crear usuario
    try {
        const respuesta = await fetch("http://localhost:5000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({nombre, contrasena, email, pais})
        });

        if (respuesta.ok) {
            const usuarioRegistrado = await respuesta.json();
            const userId = usuarioRegistrado._id;
            localStorage.setItem("userId", userId);
            localStorage.setItem("userPais", pais)

            // Crear carrito automáticamente
            try {
                const carritoResp = await fetch("http://localhost:5000/api/carts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({usuario: userId, items: []})
                });

                if (!carritoResp.ok) {
                    const carritoError = await carritoResp.json();
                    console.error("Error al crear carrito:", carritoError);
                }
            } catch (error) {
                console.error("Fallo al conectar con /api/carts:", error);
            }

            alert("Registro exitoso. Ahora podés iniciar sesión.");
            window.location.href = "login.html";
        } else {
            const errorData = await respuesta.json();
            alert("Error en el registro: " + (errorData.message || respuesta.statusText));
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("No se pudo conectar con el servidor.");
    }
});
