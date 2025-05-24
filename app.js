// server.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware para archivos estáticos (HTML, JS, CSS)
app.use(express.static(__dirname + '/public'));

// Conexión a MongoDB local sin autenticación
mongoose.connect('mongodb://localhost:27017/ecommerce_tpi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión:', err.message));

// Ruta de prueba
app.get('/ping', (req, res) => {
  res.send('Servidor funcionando 🚀');
});


app.get('/reporte/productos-mas-vendidos', async (req, res) => {
  const db = mongoose.connection.db;
  const ordenes = db.collection('ordenes');

  const resultado = await ordenes.aggregate([
    { $unwind: "$productos" },
    { $group: { _id: "$productos.producto_id", cantidad_total: { $sum: "$productos.cantidad" } } },
    { $sort: { cantidad_total: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "productos",
        localField: "_id",
        foreignField: "_id",
        as: "producto"
      }
    },
    { $unwind: "$producto" },
    {
      $project: {
        _id: 0,
        producto: "$producto.nombre",
        cantidad_total: 1
      }
    }
  ]).toArray();

  res.json(resultado);
});

// -----------------------------
// Reporte 2: Clientes que más compraron
app.get('/reporte/clientes-top', async (req, res) => {
  const db = mongoose.connection.db;
  const ordenes = db.collection('ordenes');

  const resultado = await ordenes.aggregate([
    { $group: { _id: "$cliente_id", total_gastado: { $sum: "$total" } } },
    { $sort: { total_gastado: -1 } },
    {
      $lookup: {
        from: "clientes",
        localField: "_id",
        foreignField: "_id",
        as: "cliente"
      }
    },
    { $unwind: "$cliente" },
    {
      $project: {
        _id: 0,
        cliente: "$cliente.nombre",
        total_gastado: 1
      }
    }
  ]).toArray();

  res.json(resultado);
});

// -----------------------------
// Reporte 3: Stock por categoría
app.get('/reporte/stock-por-categoria', async (req, res) => {
  const db = mongoose.connection.db;
  const productos = db.collection('productos');

  const resultado = await productos.aggregate([
    { $group: { _id: "$categoria", stock_total: { $sum: "$stock" } } },
    { $sort: { stock_total: -1 } }
  ]).toArray();

  res.json(resultado);
});

app.get('/productos', async (req, res) => {
  const db = mongoose.connection.db;
  const productos = db.collection('productos');

  const resultado = await productos.find({}).toArray();
  res.json(resultado);
});

const { ObjectId } = require('mongodb');

app.get('/producto/:id', async (req, res) => {
  const db = mongoose.connection.db;
  const productos = db.collection('productos');

  try {
    const producto = await productos.findOne({ _id: req.params.id });
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});


// -----------------------------
// Reporte 4: Calificación promedio por producto
app.get('/reporte/resenas-promedio', async (req, res) => {
  const db = mongoose.connection.db;
  const resenas = db.collection('resenas');

  const resultado = await resenas.aggregate([
    {
      $group: {
        _id: "$producto_id",
        calificacion_promedio: { $avg: "$calificacion" },
        cantidad: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "productos",
        localField: "_id",
        foreignField: "_id",
        as: "producto"
      }
    },
    { $unwind: "$producto" },
    {
      $project: {
        _id: 0,
        producto: "$producto.nombre",
        calificacion_promedio: { $round: ["$calificacion_promedio", 1] },
        cantidad: 1
      }
    },
    { $sort: { calificacion_promedio: -1 } }
  ]).toArray();

  res.json(resultado);
});

// Reporte 6: Promedio de venta diaria
app.get('/reporte/ventas-promedio', async (req, res) => {
  const db = mongoose.connection.db;
  const ordenes = db.collection('ordenes');

  const resultado = await ordenes.aggregate([
    {
      $addFields: {
        fecha_real: { $toDate: "$fecha" }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha_real" } },
        total_por_dia: { $sum: "$total" }
      }
    },
    {
      $group: {
        _id: null,
        promedio_diario: { $avg: "$total_por_dia" },
        dias_con_ventas: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        promedio_diario: { $round: ["$promedio_diario", 2] },
        dias_con_ventas: 1
      }
    }
  ]).toArray();

  res.json(resultado[0]);
});

// Escuchar en el puerto 3000
app.listen(3000, () => {
  console.log('🌐 Servidor escuchando en http://localhost:3000');
});

app.use(express.json());

app.post('/producto', async (req, res) => {
  const db = mongoose.connection.db;
  const productos = db.collection('productos');

  try {
    const nuevo = req.body;

    // Asegurarse de que tenga un nombre y precio
    if (!nuevo.nombre || !nuevo.precio) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
    }

    // Generar un _id automáticamente si no lo trae
    if (!nuevo._id) {
      nuevo._id = "p" + Date.now(); // ejemplo: "p1716475886123"
    }

    await productos.insertOne(nuevo);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put('/producto/:id', async (req, res) => {
  const db = mongoose.connection.db;
  const productos = db.collection('productos');

  try {
    const id = req.params.id;
    const update = req.body;

    await productos.updateOne({ _id: id }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.delete('/producto/:id', async (req, res) => {
  const db = mongoose.connection.db;
  const productos = db.collection('productos');

  try {
    const id = req.params.id;
    const resultado = await productos.deleteOne({ _id: id });

    if (resultado.deletedCount === 1) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
