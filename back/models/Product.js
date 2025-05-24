const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    precio: {
        type: Number,
        required: true,
        min: 0,
    }
}, { strict: false });  // Permite guardar cualquier campo extra

module.exports = mongoose.model('Product', productSchema);
