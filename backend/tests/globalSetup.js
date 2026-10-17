// Create test DB and apply migrations
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

module.exports = async () => {
  const testEnv = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env.test')));

  execSync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, ...testEnv },
    stdio: 'ignore',
  });
};
