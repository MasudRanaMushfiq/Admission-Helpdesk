const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');
const { embed, entryText } = require('../src/services/embedding.service');

const api = () => request(app);

async function resetDb() {
  await prisma.message.deleteMany();
  await prisma.authToken.deleteMany();
  await prisma.kbEntry.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.studentRecord.deleteMany();
}

// Low bcrypt cost for speed
const hash = (password) => bcrypt.hash(password, 4);

async function createAdmin(email = 'admin@test.edu', password = 'adminpass123') {
  const user = await prisma.user.create({ data: { role: 'admin', email, passwordHash: await hash(password) } });
  const res = await api().post('/api/auth/login').send({ type: 'admin', email, password });
  return { user, token: res.body.data.token };
}

async function createStudent({ fullName, rollNo, registrationNo, password = 'student123' }) {
  const record = await prisma.studentRecord.create({ data: { fullName, rollNo, registrationNo, isClaimed: true } });
  const user = await prisma.user.create({
    data: { role: 'student', studentRecordId: record.id, passwordHash: await hash(password) },
  });
  const res = await api().post('/api/auth/login').send({ type: 'student', rollNo, password });
  return { user, record, token: res.body.data.token };
}

async function createKbEntry(adminId, categoryId, question, answer, isActive = true) {
  return prisma.kbEntry.create({
    data: {
      categoryId,
      createdBy: adminId,
      question,
      answer,
      isActive,
      embedding: embed(entryText(question, answer)),
    },
  });
}

module.exports = { api, prisma, resetDb, createAdmin, createStudent, createKbEntry };
