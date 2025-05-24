const express = require('express');
const router = express.Router();
const Carrito = require('../models/Cart');
const Producto = require('../models/Product');

// GET todos los carritos
router.get('/', async (req, res) => {
    try {
        const carritos = await Carrito.find()
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio');
        res.json(carritos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener carritos' });
    }
});

// GET carrito por ID
router.get('/:id', async (req, res) => {
    try {
        const carrito = await Carrito.findById(req.params.id)
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio descripcion imagenUrl');
        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar carrito' });
    }
});

// GET carrito por usuario
router.get('/usuario/:usuarioId', async (req, res) => {
    try {
        let carrito = await Carrito.findOne({ usuario: req.params.usuarioId })
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio descripcion imagenUrl');

        // Si no existe carrito, crear uno nuevo
        if (!carrito) {
            carrito = new Carrito({ usuario: req.params.usuarioId, items: [] });
            await carrito.save();
            carrito = await Carrito.findById(carrito._id)
                .populate('usuario', 'nombre email')
                .populate('items.producto', 'nombre precio descripcion imagenUrl');
        }

        res.json(carrito);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar carrito del usuario' });
    }
});

// POST crear nuevo carrito
router.post('/', async (req, res) => {
    const { usuario, items } = req.body;

    if (!usuario) {
        return res.status(400).json({ message: 'Usuario es obligatorio' });
    }

    try {
        const nuevoCarrito = new Carrito({ usuario, items: items || [] });
        const carritoGuardado = await nuevoCarrito.save();
        const carritoPopulado = await Carrito.findById(carritoGuardado._id)
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio');
        res.status(201).json(carritoPopulado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear carrito' });
    }
});

// POST agregar producto al carrito
router.post('/:id/items', async (req, res) => {
    const { producto, cantidad } = req.body;

    if (!producto || !cantidad) {
        return res.status(400).json({ message: 'Producto y cantidad son obligatorios' });
    }

    try {
        // Verificar que el producto existe
        const productoExistente = await Producto.findById(producto);
        if (!productoExistente) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const carrito = await Carrito.findById(req.params.id);
        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

        // Verificar si el producto ya está en el carrito
        const itemExistente = carrito.items.find(item => item.producto.toString() === producto);

        if (itemExistente) {
            // Si existe, actualizar cantidad
            itemExistente.cantidad += parseInt(cantidad);
        } else {
            // Si no existe, agregar nuevo item
            carrito.items.push({
                producto,
                cantidad: parseInt(cantidad),
                precio: productoExistente.precio
            });
        }

        await carrito.save();
        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio descripcion imagenUrl');

        res.json(carritoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
});

// PUT actualizar cantidad de un item del carrito
router.put('/:id/items/:itemId', async (req, res) => {
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
        return res.status(400).json({ message: 'Cantidad debe ser mayor a 0' });
    }

    try {
        const carrito = await Carrito.findById(req.params.id);
        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

        const item = carrito.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item no encontrado en el carrito' });

        item.cantidad = parseInt(cantidad);
        await carrito.save();

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio descripcion imagenUrl');

        res.json(carritoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar item del carrito' });
    }
});

// DELETE eliminar item del carrito
router.delete('/:id/items/:itemId', async (req, res) => {
    try {
        const carrito = await Carrito.findById(req.params.id);
        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

        carrito.items.pull(req.params.itemId);
        await carrito.save();

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio descripcion imagenUrl');

        res.json(carritoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar item del carrito' });
    }
});

// DELETE vaciar carrito
router.delete('/:id/clear', async (req, res) => {
    try {
        const carrito = await Carrito.findById(req.params.id);
        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

        carrito.items = [];
        await carrito.save();

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('usuario', 'nombre email');

        res.json(carritoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al vaciar carrito' });
    }
});

// DELETE carrito completo
router.delete('/:id', async (req, res) => {
    try {
        const carritoEliminado = await Carrito.findByIdAndDelete(req.params.id);
        if (!carritoEliminado) return res.status(404).json({ message: 'Carrito no encontrado' });
        res.json({ message: 'Carrito eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar carrito' });
    }
});

module.exports = router;