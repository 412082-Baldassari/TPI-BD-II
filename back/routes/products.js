const express = require('express');
const router = express.Router();
const Producto = require('../models/Product');

// GET todos los productos
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// GET producto por ID
router.get('/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar producto' });
    }
});

// POST crear nuevo producto
router.post('/', async (req, res) => {
    const { nombre, descripcion, precio, imagenUrl } = req.body;

    if (!nombre || precio == null) {
        return res.status(400).json({ message: 'Nombre y precio son obligatorios' });
    }

    try {
        const nuevoProducto = new Producto({ nombre, descripcion, precio, imagenUrl });
        const productoGuardado = await nuevoProducto.save();
        res.status(201).json(productoGuardado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto' });
    }
});

// PUT actualizar producto
router.put('/:id', async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!productoActualizado) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(productoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
});

// DELETE producto
router.delete('/:id', async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
        if (!productoEliminado) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
});

module.exports = router;
