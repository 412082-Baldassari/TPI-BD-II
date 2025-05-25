document.getElementById("registro-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const contrasena2 = document.getElementById("contrasena2").value;

    if (contrasena !== contrasena2) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    //  POST para crear usuario
    try {
        const respuesta = await fetch("http://localhost:5000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, email, contrasena })
        });

        if (respuesta.ok) {
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
