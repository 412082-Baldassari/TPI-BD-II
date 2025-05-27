const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    precio: {
        type: Number,
        required: true,
        min: 0,
    }
}, {strict: false});

const cartSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [cartItemSchema],
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now,
    }
}, {strict: true});

// Middleware para calcular el total antes de guardar
cartSchema.pre('save', function (next) {
    this.total = this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    this.fechaActualizacion = new Date();
    next();
});

module.exports = mongoose.model('Cart', cartSchema);
