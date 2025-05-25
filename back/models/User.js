const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    contrasena: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    telefono: {
        type: String,
        trim: true,
    },
    pais: {
        type: String,
        trim: true,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: false
    },
    fechaRegistro: {
        type: Date,
        default: Date.now,
    }
}, {strict: false});

module.exports = mongoose.model('User', userSchema);