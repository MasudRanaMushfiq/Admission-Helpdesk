const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const tokenService = require('./token.service');

const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

async function register({ fullName, rollNo, registrationNo, password }) {
  const record = await prisma.studentRecord.findFirst({ where: { rollNo, registrationNo } });

  // Same error, so rolls can't be guessed
  if (!record || !sameName(record.fullName, fullName)) {
    throw new ApiError(400, 'Details do not match our records');
  }
  if (record.isClaimed) {
    throw new ApiError(409, 'An account already exists for this roll');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Claim record + create user atomically
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.studentRecord.updateMany({
      where: { id: record.id, isClaimed: false },
      data: { isClaimed: true },
    });
    if (claimed.count === 0) {
      throw new ApiError(409, 'An account already exists for this roll');
    }
    await tx.user.create({ data: { role: 'student', passwordHash, studentRecordId: record.id } });
  });
}

async function login({ type, rollNo, email, password }) {
  let user = null;

  if (type === 'admin') {
    user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  } else {
    const record = await prisma.studentRecord.findUnique({ where: { rollNo }, include: { user: true } });
    user = record ? record.user : null;
  }

  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || user.role !== type || !user.isActive || !passwordOk) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = await tokenService.createToken(user.id);
  return { token, user: await getProfile(user.id) };
}

// Without password hash
async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentRecord: true } });
  if (!user) throw new ApiError(404, 'User not found');

  return {
    id: user.id,
    role: user.role,
    name: user.studentRecord ? user.studentRecord.fullName : 'Admin',
    rollNo: user.studentRecord ? user.studentRecord.rollNo : null,
    email: user.email,
  };
}

module.exports = { register, login, getProfile };
