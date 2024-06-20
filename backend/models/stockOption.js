// models/stockOption.js
const mongoose = require('mongoose');

const stockOptionSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true }
}, { collection: 'stockoptions' });

const StockOption = mongoose.model('StockOption', stockOptionSchema);

module.exports = { StockOption };