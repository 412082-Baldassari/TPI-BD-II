const express = require('express');
const router = express.Router();
const Usuario = require('../models/User');

// GET todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener usuarios'});
    }
});

// GET usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({message: 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error) {
        res.status(500).json({message: 'Error al buscar usuario'});
    }
});

// GET usuario por email
router.get('/email/:email', async (req, res) => {
    try {
        const usuario = await Usuario.findOne({email: req.params.email});
        if (!usuario) return res.status(404).json({message: 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error) {
        res.status(500).json({message: 'Error al buscar usuario'});
    }
});

// POST crear nuevo usuario
router.post('/', async (req, res) => {
    const {nombre, contrasena, email, telefono, pais} = req.body;

    if (!nombre || !contrasena || !email || !pais) {
        return res.status(400).json({message: 'Nombre, email y pais son obligatorios'});
    }

    try {
        // Verificar si el email ya existe
        const usuarioExistente = await Usuario.findOne({email});
        if (usuarioExistente) {
            return res.status(400).json({message: 'El email ya está registrado'});
        }

        const nuevoUsuario = new Usuario({nombre, contrasena, email, telefono, pais});
        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json(usuarioGuardado);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({message: 'El email ya está registrado'});
        } else {
            res.status(500).json({
                mmessage: 'Error al crear usuario',
                error: error.message
            });
        }
    }
});

// PUT actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true}
        );
        if (!usuarioActualizado) return res.status(404).json({message: 'Usuario no encontrado'});
        res.json(usuarioActualizado);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({message: 'El email ya está registrado'});
        } else {
            res.status(500).json({message: 'Error al actualizar usuario'});
        }
    }
});

// DELETE usuario
router.delete('/:id', async (req, res) => {
    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuarioEliminado) return res.status(404).json({message: 'Usuario no encontrado'});
        res.json({message: 'Usuario eliminado correctamente'});
    } catch (error) {
        res.status(500).json({message: 'Error al eliminar usuario'});
    }
});

module.exports = router;