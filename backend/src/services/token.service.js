const crypto = require('crypto');
const prisma = require('../lib/prisma');
const config = require('../config');

// Only the hash is stored
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + config.tokenTtlHours * 60 * 60 * 1000);

  // Remove expired tokens
  await prisma.authToken.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } });
  await prisma.authToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });

  return token;
}

// User for a valid token, else null
async function findUserByToken(token) {
  const row = await prisma.authToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!row) return null;

  if (row.expiresAt < new Date()) {
    await prisma.authToken.delete({ where: { id: row.id } });
    return null;
  }
  if (!row.user.isActive) return null;

  return row.user;
}

async function deleteToken(token) {
  await prisma.authToken.deleteMany({ where: { tokenHash: hashToken(token) } });
}

module.exports = { hashToken, createToken, findUserByToken, deleteToken };
