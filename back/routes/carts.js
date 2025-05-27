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

// GET /api/carts/:userId
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const carrito = await Carrito.findOne({ usuario: userId })
            .populate('usuario', 'nombre email pais')
            .populate('items.producto', 'nombre precio');

        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado para este usuario' });
        }

        res.json(carrito);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el carrito del usuario' });
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

// PUT /api/carts/:id
// Actualiza los items del carrito del usuario con el ID proporcionado
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const nuevosItems = req.body.items;

        if (!Array.isArray(nuevosItems)) {
            return res.status(400).json({message: 'Los items deben ser un arreglo'});
        }

        const carrito = await Carrito.findOne({usuario: userId});

        if (!carrito) {
            return res.status(404).json({message: 'Carrito no encontrado para este usuario'});
        }

        carrito.items = nuevosItems;
        await carrito.save();

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('usuario', 'nombre email')
            .populate('items.producto');

        res.json(carritoActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al actualizar el carrito', error: error.message});
    }
});

module.exports = router;
