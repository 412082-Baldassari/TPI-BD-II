const express = require('express');
const router = express.Router();
const Carrito = require('../models/Cart');


// GET todos los carritos
router.get('/', async (req, res) => {
    try {
        const carritos = await Carrito.find()
            .populate('usuario', 'nombre email pais')
            .populate('items.producto', 'nombre precio');
        res.json(carritos);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener carritos'});
    }
});

// GET carrito por ID
router.get('/:id', async (req, res) => {
    try {
        const carrito = await Carrito.findById(req.params.id)
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio descripcion imagenUrl');
        if (!carrito) return res.status(404).json({message: 'Carrito no encontrado'});
        res.json(carrito);
    } catch (error) {
        res.status(500).json({message: 'Error al buscar carrito'});
    }
});

// POST crear nuevo carrito
router.post('/', async (req, res) => {
    const {usuario, items} = req.body;

    if (!usuario) {
        return res.status(400).json({message: 'Usuario es obligatorio'});
    }

    try {
        const nuevoCarrito = new Carrito({usuario, items: items || []});
        const carritoGuardado = await nuevoCarrito.save();
        const carritoPopulado = await Carrito.findById(carritoGuardado._id)
            .populate('usuario', 'nombre email pais')
            .populate('items.producto', 'nombre precio');
        res.status(201).json(carritoPopulado);
    } catch (error) {
        res.status(500).json({message: 'Error al crear carrito', error: error.message});
    }
});

// PUT actualizar cantidad de un item del carrito
router.put('/:id/items/:itemId', async (req, res) => {
    const {cantidad} = req.body;

    if (!cantidad || cantidad < 1) {
        return res.status(400).json({message: 'Cantidad debe ser mayor a 0'});
    }

    try {
        const carrito = await Carrito.findById(req.params.id);
        if (!carrito) return res.status(404).json({message: 'Carrito no encontrado'});

        const item = carrito.items.id(req.params.itemId);
        if (!item) return res.status(404).json({message: 'Item no encontrado en el carrito'});

        item.cantidad = parseInt(cantidad);
        await carrito.save();

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio descripcion imagenUrl');

        res.json(carritoActualizado);
    } catch (error) {
        res.status(500).json({message: 'Error al actualizar item del carrito'});
    }
});

module.exports = router;
