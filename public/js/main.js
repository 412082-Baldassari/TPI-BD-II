// Esperar que cargue el DOM
window.addEventListener('DOMContentLoaded', () => {
  // No hacemos nada al cargar, el usuario elige un reporte
});

// Función que se llama cuando se hace clic en un botón
async function cargarReporte(nombre) {
  const divResultado = document.getElementById("resultado");
  divResultado.innerHTML = `<p>Cargando reporte <strong>${nombre}</strong>...</p>`;

  try {
    const res = await fetch(`/reporte/${nombre}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      // Si es una lista (reporte típico)
      const html = data.map(item => `<pre>${JSON.stringify(item, null, 2)}</pre>`).join('');
      divResultado.innerHTML = html;
    } else {
      // Si es un objeto (ej. promedio de ventas)
      divResultado.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

  } catch (error) {
    divResultado.innerHTML = `<p style="color:red;">Error al cargar el reporte.</p>`;
    console.error(error);
  }
}

async function mostrarProductos() {
    const container = document.getElementById('productos-container');
    container.classList.remove('detalle-activo'); // ✅ activá grid
    container.classList.add('card-grid');
    container.innerHTML = "<p>Cargando productos...</p>";

  try {
    const res = await fetch('/productos');
    const productos = await res.json();

    if (!Array.isArray(productos)) {
      container.innerHTML = "<p>No se pudo cargar la lista de productos.</p>";
      return;
    }

container.innerHTML = productos.map(p => `
  <div class="card" onclick="verDetalles('${p._id}')">
    <img src="${p.imagen || 'https://via.placeholder.com/150'}" alt="${p.nombre}">
    <h3>${p.nombre}</h3>
    <p class="precio">$ ${p.precio.toLocaleString()}</p>
    <p class="reseña">⭐ ${p.reseña_promedio?.toFixed(1) || 'Sin reseñas'}</p>
  </div>
`).join('');

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error al cargar productos.</p>";
  }
}

// Llamala al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  mostrarProductos();
});

async function verDetalles(id) {
    const container = document.getElementById('productos-container');
    container.classList.add('detalle-activo'); // ✅ desactivá grid
    container.classList.remove('card-grid');
    container.innerHTML = "<p>Cargando detalles...</p>";

  try {
    const res = await fetch(`/producto/${id}`);
    const data = await res.json();

    if (data.error) {
      container.innerHTML = `<p>${data.error}</p>`;
      return;
    }

    // Campos importantes destacados
    const destacados = `
      <img src="${data.imagen || 'https://via.placeholder.com/300'}" alt="${data.nombre}">
      <h2>${data.nombre}</h2>
      <p class="precio-detalle">💲 Precio: $${data.precio?.toLocaleString()}</p>
      <p class="reseña-detalle">⭐ Reseña promedio: ${data.reseña_promedio?.toFixed(1) || 'Sin reseñas'}</p>
    `;

    // El resto de los campos (excepto los ya mostrados y el _id)
    const omitidos = ['_id', 'nombre', 'precio', 'imagen', 'reseña_promedio'];
    const dinamicos = Object.keys(data)
      .filter(k => !omitidos.includes(k))
      .map(k => `<li><strong>${k}:</strong> ${formatearValor(data[k])}</li>`)
      .join('');

    const extras = dinamicos
      ? `<h3>📄 Detalles adicionales:</h3><ul class="lista-campos">${dinamicos}</ul>`
      : `<p>No hay detalles adicionales.</p>`;

    container.innerHTML = `
      <div class="detalle-producto">
        <img src="${data.imagen || 'https://via.placeholder.com/300'}" alt="${data.nombre}">
        <div class="detalle-contenido">
          <h2>${data.nombre}</h2>
          <p class="precio-detalle">💲 Precio: $${data.precio?.toLocaleString()}</p>
          <p class="reseña-detalle">⭐ Reseña promedio: ${data.reseña_promedio?.toFixed(1) || 'Sin reseñas'}</p>
          ${extras}
          <button onclick="mostrarProductos()" class="volver-btn">⬅ Volver al catálogo</button>
          <button onclick="editarProducto('${id}')" class="editar-btn">✏️ Editar producto</button>
          <button onclick="eliminarProducto('${id}')" class="eliminar-btn">🗑️ Eliminar producto</button>
        </div>
      </div>
    `;

  } catch (err) {
    container.innerHTML = "<p>Error al cargar detalles.</p>";
    console.error(err);
  }
}

// Función auxiliar para formatear valores (maneja arrays, objetos, strings)
function formatearValor(valor) {
  if (Array.isArray(valor)) {
    return valor.join(', ');
  }
  if (typeof valor === 'object') {
    return Object.entries(valor).map(([k, v]) => `${k}: ${v}`).join(' / ');
  }
  return valor;
}

document.getElementById('form-agregar-producto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const mensaje = document.getElementById('mensaje-formulario');

  const nuevoProducto = {
    nombre: form.nombre.value,
    precio: parseFloat(form.precio.value),
  };

  if (form.imagen.value) nuevoProducto.imagen = form.imagen.value;
  if (form.reseña_promedio.value) nuevoProducto.reseña_promedio = parseFloat(form.reseña_promedio.value);

  // Convertir campos adicionales
  const extras = document.querySelectorAll('.campo-extra');
  extras.forEach(extra => {
    const nombre = extra.children[0].value.trim();
    let valor = extra.children[1].value.trim();

    if (nombre) {
      try {
        valor = JSON.parse(valor); // intentar interpretar como array, número, booleano, etc.
      } catch (_) { /* dejar como string si no se puede */ }
      nuevoProducto[nombre] = valor;
    }
  });

  // Enviar
  try {
    const res = await fetch('/producto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoProducto)
    });

    const data = await res.json();
    if (data.success) {
      mensaje.textContent = "✅ Producto agregado con éxito.";
      mensaje.style.color = "green";
      form.reset();
      document.getElementById('campos-adicionales').innerHTML = '';
      mostrarProductos();
    } else {
      mensaje.textContent = "❌ Error al agregar producto.";
      mensaje.style.color = "red";
    }
  } catch (err) {
    mensaje.textContent = "❌ Error al conectar con el servidor.";
    mensaje.style.color = "red";
    console.error(err);
  }
});


function agregarCampoExtra(nombre = '', valor = '') {
  const contenedor = document.getElementById('campos-adicionales');

  const wrapper = document.createElement('div');
  wrapper.className = 'campo-extra';

  const inputNombre = document.createElement('input');
  inputNombre.type = 'text';
  inputNombre.placeholder = 'Nombre del campo';
  inputNombre.value = nombre;

  const inputValor = document.createElement('input');
  inputValor.type = 'text';
  inputValor.placeholder = 'Valor';
  inputValor.value = valor;

  const btnEliminar = document.createElement('button');
  btnEliminar.type = 'button';
  btnEliminar.textContent = '❌';
  btnEliminar.onclick = () => wrapper.remove();

  wrapper.appendChild(inputNombre);
  wrapper.appendChild(inputValor);
  wrapper.appendChild(btnEliminar);
  contenedor.appendChild(wrapper);
}

async function editarProducto(id) {
  const container = document.getElementById('productos-container');
  container.classList.add('detalle-activo');
  container.classList.remove('card-grid');
  container.innerHTML = "<p>Cargando producto para editar...</p>";

  try {
    const res = await fetch(`/producto/${id}`);
    const data = await res.json();

    if (data.error) {
      container.innerHTML = `<p>${data.error}</p>`;
      return;
    }

    // Formulario de edición dinámico
    const campos = Object.entries(data)
      .filter(([key]) => key !== '_id')
      .map(([key, value]) => {
        const val = typeof value === 'object' ? JSON.stringify(value) : value;
        return `
          <div class="campo-extra">
            <input type="text" class="campo-nombre" value="${key}" placeholder="Nombre del campo">
            <input type="text" class="campo-valor" value="${val}" placeholder="Valor">
            <button type="button" class="eliminar-campo" onclick="this.parentElement.remove()">❌</button>
          </div>
        `;
      }).join('');

    container.innerHTML = `
      <div class="editar-producto">
        <h2>✏️ Editar producto</h2>
        <form id="form-editar-producto">
          ${campos}
          <button type="button" onclick="agregarCampoExtraEdicion()">➕ Agregar campo</button>
          <br/><br/>
          <button type="submit">💾 Guardar cambios</button>
          <button type="button" onclick="verDetalles('${id}')" class="volver-btn">⬅ Cancelar</button>
        </form>
        <p id="mensaje-editar"></p>
      </div>
    `;

    // Agregar evento de envío del formulario
    document.getElementById('form-editar-producto').addEventListener('submit', async (e) => {
      e.preventDefault();
      const campos = container.querySelectorAll('.campo-extra');
      const actualizacion = {};

      campos.forEach(div => {
        const nombre = div.querySelector('.campo-nombre').value.trim();
        let valor = div.querySelector('.campo-valor').value.trim();
        if (!nombre) return;

        try {
          valor = JSON.parse(valor);
        } catch (_) {}

        actualizacion[nombre] = valor;
      });

      const mensaje = document.getElementById('mensaje-editar');
      try {
        const res = await fetch(`/producto/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actualizacion)
        });

        const resultado = await res.json();
        if (resultado.success) {
          mensaje.textContent = "✅ Producto actualizado.";
          mensaje.style.color = "green";
          verDetalles(id);
        } else {
          mensaje.textContent = "❌ Error al actualizar.";
          mensaje.style.color = "red";
        }
      } catch (err) {
        mensaje.textContent = "❌ Error de conexión.";
        mensaje.style.color = "red";
      }
    });

  } catch (err) {
    container.innerHTML = "<p>Error al cargar producto.</p>";
    console.error(err);
  }
}

function agregarCampoExtraEdicion() {
  const form = document.getElementById('form-editar-producto');
  const campo = document.createElement('div');
  campo.className = 'campo-extra';
  campo.innerHTML = `
    <input type="text" class="campo-nombre" placeholder="Nombre del campo">
    <input type="text" class="campo-valor" placeholder="Valor">
    <button type="button" class="eliminar-campo" onclick="this.parentElement.remove()">❌</button>
  `;
  form.insertBefore(campo, form.children[form.children.length - 3]); // antes del botón
}

async function eliminarProducto(id) {
  const confirmar = confirm("¿Estás seguro de que querés eliminar este producto?");
  if (!confirmar) return;

  try {
    const res = await fetch(`/producto/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      alert("✅ Producto eliminado con éxito.");
      mostrarProductos();
    } else {
      alert("❌ No se pudo eliminar el producto.");
    }
  } catch (err) {
    alert("❌ Error de conexión.");
    console.error(err);
  }
}
