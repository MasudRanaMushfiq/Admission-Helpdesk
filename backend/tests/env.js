// Load .env.test first
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.test'), override: true, quiet: true });

if (!process.env.DATABASE_URL.includes('_test')) {
  throw new Error('Tests must run against a *_test database, check .env.test');
}
