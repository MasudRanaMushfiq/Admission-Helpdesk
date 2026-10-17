// Deletes all data, then seeds demo data
const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');
const { embedMany, entryText } = require('../src/services/embedding.service');
const { studentRecords, categories, kbEntries } = require('./seedData');

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminEmail || adminPassword.length < 8) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in .env first');
  }

  console.log('Clearing old data...');
  await prisma.message.deleteMany();
  await prisma.authToken.deleteMany();
  await prisma.kbEntry.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.studentRecord.deleteMany();

  console.log('Creating admin...');
  const admin = await prisma.user.create({
    data: { role: 'admin', email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10) },
  });

  console.log('Creating student records and demo students...');
  for (const { demoPassword, ...record } of studentRecords) {
    const created = await prisma.studentRecord.create({ data: { ...record, isClaimed: Boolean(demoPassword) } });
    if (demoPassword) {
      await prisma.user.create({
        data: { role: 'student', studentRecordId: created.id, passwordHash: await bcrypt.hash(demoPassword, 10) },
      });
    }
  }

  console.log('Creating categories...');
  const categoryIds = {};
  for (const name of categories) {
    const category = await prisma.category.create({ data: { name } });
    categoryIds[name] = category.id;
  }

  console.log(`Creating ${kbEntries.length} KB entries (with embeddings)...`);
  const vectors = embedMany(kbEntries.map((e) => entryText(e.question, e.answer)));
  await prisma.kbEntry.createMany({
    data: kbEntries.map((entry, i) => ({
      categoryId: categoryIds[entry.category],
      createdBy: admin.id,
      question: entry.question,
      answer: entry.answer,
      embedding: vectors[i],
    })),
  });

  console.log(`Done: 1 admin, ${studentRecords.length} student records, ${categories.length} categories, ${kbEntries.length} KB entries`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
