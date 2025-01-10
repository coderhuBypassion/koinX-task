const axios = require('axios');
const CryptoPrice = require('../models/CryptoPrice');

class CryptoService {
  constructor() {
    this.apiUrl = process.env.COINGECKO_API_URL;
    this.coins = ['bitcoin', 'matic-network', 'ethereum'];
  }

  async fetchCoinPrice(coinId) {
    try {
      const response = await axios.get(`${this.apiUrl}/coins/${coinId}`);
      return {
        priceUSD: response.data.market_data.current_price.usd,
        priceChangePercentage24h: response.data.market_data.price_change_percentage_24h || 0
      };
    } catch (error) {
      console.error(`Error fetching price for ${coinId}:`, error.message);
      throw error;
    }
  }

  async fetchCoinMarketCap(coinId) {
    try {
      const response = await axios.get(`${this.apiUrl}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: '1',
          interval: 'daily'
        }
      });
      
      const marketCapData = response.data.market_caps;
      const latestMarketCap = marketCapData[marketCapData.length - 1][1];
      
      return latestMarketCap;
    } catch (error) {
      console.error(`Error fetching market cap for ${coinId}:`, error.message);
      throw error;
    }
  }

  async fetchCryptoPrices() {
    try {
      for (const coinId of this.coins) {
        if (coinId !== this.coins[0]) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const [priceData, marketCap] = await Promise.all([
          this.fetchCoinPrice(coinId),
          this.fetchCoinMarketCap(coinId)
        ]);

        await CryptoPrice.create({
          coinId,
          priceUSD: priceData.priceUSD,
          marketCapUSD: marketCap,
          priceChangePercentage24h: priceData.priceChangePercentage24h
        });

        console.log(`Data updated successfully for ${coinId}`);
      }

      console.log('All cryptocurrency data updated successfully');
    } catch (error) {
      console.error('Error in fetchCryptoPrices:', error.message);
    }
  }

  async getLatestStats(coinId) {
    try {
      const latestData = await CryptoPrice.findOne({ coinId })
        .sort({ timestamp: -1 });

      if (!latestData) {
        throw new Error('No data found for this coin');
      }

      return {
        price: latestData.priceUSD,
        marketCap: latestData.marketCapUSD,
        "24hChange": latestData.priceChangePercentage24h
      };
    } catch (error) {
      console.error(`Error fetching stats for ${coinId}:`, error.message);
      throw error;
    }
  }

  async getPriceDeviation(coinId) {
    try {
      const prices = await CryptoPrice.find({ coinId })
        .sort({ timestamp: -1 })
        .limit(100)
        .select('priceUSD -_id');

      if (!prices.length) {
        throw new Error('No data found for this coin');
      }

      const priceValues = prices.map(p => p.priceUSD);
      const deviation = this.calculateStandardDeviation(priceValues);

      return {
        deviation: parseFloat(deviation.toFixed(2))
      };
    } catch (error) {
      console.error(`Error calculating deviation for ${coinId}:`, error.message);
      throw error;
    }
  }

  calculateStandardDeviation(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b) / n;
    const squareDiffs = values.map(value => {
      const diff = value - mean;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / n;
    return Math.sqrt(avgSquareDiff);
  }
}

module.exports = new CryptoService();