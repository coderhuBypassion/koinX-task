require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const connectDB = require('./config/database');
const cryptoService = require('./services/cryptoService');
const cryptoRoutes = require('./routes/cryptoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/', cryptoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Schedule the job to run every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log('Running crypto price update job...');
  await cryptoService.fetchCryptoPrices();
});

// Run the job immediately when the application starts
cryptoService.fetchCryptoPrices();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 