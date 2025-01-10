const mongoose = require('mongoose');

const cryptoPriceSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    enum: ['bitcoin', 'matic-network', 'ethereum']
  },
  priceUSD: {
    type: Number,
    required: true,
  },
  marketCapUSD: {
    type: Number,
    required: true,
  },
  priceChange24h: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

// Index for faster queries
cryptoPriceSchema.index({ coinId: 1, timestamp: -1 });

module.exports = mongoose.model('CryptoPrice', cryptoPriceSchema);