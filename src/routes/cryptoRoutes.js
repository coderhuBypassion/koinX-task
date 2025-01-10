const express = require('express');
const router = express.Router();
const cryptoService = require('../services/cryptoService');

// Middleware to validate coin parameter
const validateCoin = (req, res, next) => {
  const validCoins = ['bitcoin', 'matic-network', 'ethereum'];
  const coin = req.query.coin;

  if (!coin || !validCoins.includes(coin)) {
    return res.status(400).json({
      error: 'Invalid coin parameter. Must be one of: bitcoin, matic-network, ethereum'
    });
  }
  next();
};

// GET /stats
router.get('/stats', validateCoin, async (req, res) => {
  try {
    const stats = await cryptoService.getLatestStats(req.query.coin);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /deviation
router.get('/deviation', validateCoin, async (req, res) => {
  try {
    const deviation = await cryptoService.getPriceDeviation(req.query.coin);
    res.json(deviation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;