require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { verifySmtpConnection } = require('./src/services/emailService');

const PORT = process.env.PORT || 5000;

// Start Server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    await verifySmtpConnection();
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`[PubSeal API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[PubSeal API] Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Failed to initialize PubSeal server:', err);
    process.exit(1);
  }
};

startServer();

