const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const mongoose = require('mongoose');

// POST /api/ventas/:usuarioId
router.post('/:usuarioId', async (req, res) => {
    const usuarioId = req.params.usuarioId;
    const ventas = req.body;

    if (!Array.isArray(ventas)) {
        return res.status(400).json({error: 'Se espera un array de ventas.'});
    }

    try {
        const ventasConUsuario = ventas.map(({_id, ...ventaSinId}) => ({
            ...ventaSinId,  // copia todos menos _id
            usuarioId
        }));
        console.log("📦 Recibido:", {ventasConUsuario});
        const ventasGuardadas = await Venta.insertMany(ventasConUsuario);
        res.status(201).json(ventasGuardadas);
    } catch (error) {
        console.error("❌ Error al guardar las ventas:", error);
        res.status(500).json({error: 'Error al guardar las ventas', details: error.message});
    }
});

// GET /api/ventas
router.get('/', async (req, res) => {
    try {
        const ventas = await Venta.find();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({error: 'Error al obtener las ventas', details: error.message});
    }
});

router.delete('/', async (req, res) => {
    try {
        const resultado = await Venta.deleteMany({});
        res.json({message: 'Todos los usuarios fueron eliminados', eliminados: resultado.deletedCount});
    } catch (error) {
        res.status(500).json({message: 'Error al eliminar usuarios', error: error.message});
    }
});

// PUT /api/ventas/:id
router.put('/:id', async (req, res) => {
    const {id} = req.params;
    const datosActualizados = req.body;

    try {
        const ventaActualizada = await Venta.findByIdAndUpdate(id, datosActualizados, {
            new: true, // retorna el documento actualizado
            runValidators: true
        });

        if (!ventaActualizada) {
            return res.status(404).json({error: 'Venta no encontrada'});
        }

        res.json(ventaActualizada);
    } catch (error) {
        console.error("❌ Error al actualizar la venta:", error);
        res.status(500).json({error: 'Error al actualizar la venta', details: error.message});
    }
});


module.exports = router;
