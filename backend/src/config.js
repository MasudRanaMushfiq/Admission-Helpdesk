require('dotenv').config({ quiet: true });

const config = {
  port: Number(process.env.PORT) || 5000,
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  tokenTtlHours: Number(process.env.TOKEN_TTL_HOURS) || 24,

  // Min score to auto-answer
  similarityThreshold: Number(process.env.SIMILARITY_THRESHOLD) || 0.4,
};

module.exports = config;
