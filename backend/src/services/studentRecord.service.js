const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');

async function list() {
  return prisma.studentRecord.findMany({ orderBy: { id: 'asc' } });
}

async function create({ fullName, rollNo, registrationNo }) {
  return prisma.studentRecord.create({ data: { fullName, rollNo, registrationNo } });
}

async function update(id, { fullName, rollNo, registrationNo }) {
  await findOrFail(id);
  return prisma.studentRecord.update({ where: { id }, data: { fullName, rollNo, registrationNo } });
}

async function remove(id) {
  const record = await findOrFail(id);
  if (record.isClaimed) {
    throw new ApiError(409, 'This record is already registered and cannot be deleted');
  }
  await prisma.studentRecord.delete({ where: { id } });
}

async function findOrFail(id) {
  const record = await prisma.studentRecord.findUnique({ where: { id } });
  if (!record) throw new ApiError(404, 'Student record not found');
  return record;
}

module.exports = { list, create, update, remove };
