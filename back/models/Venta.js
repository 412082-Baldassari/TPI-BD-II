const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    precio: {type: Number, required: true},
    cantidad: {type: Number, required: true},
    usuarioId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Usuario'}, // Asocia la venta a un usuario
}, {
    timestamps: true
});

module.exports = mongoose.model('Venta', ventaSchema);