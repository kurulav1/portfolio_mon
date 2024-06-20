const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    ticker: String,
    strikePrice: Number,
    expirationDate: Date,
    contractType: String, // 'call' or 'put'
    exerciseStyle: String, // 'american' or 'european'
    sharesPerContract: Number,
    purchasePrice: Number,
    purchaseTime: Date, // Timestamp for when the option was purchased
    shortPosition: Boolean,
    marketPrice: Number,
    quantity: Number, // Number of contracts/options purchased
});

const optionStrategySchema = new mongoose.Schema({
    name: { type: String, required: true },
    options: [optionSchema]
}, { collection: 'optionstrategies' });

const OptionStrategy = mongoose.model('OptionStrategy', optionStrategySchema);

module.exports = { OptionStrategy };
