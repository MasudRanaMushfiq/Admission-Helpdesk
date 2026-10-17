const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');

async function list() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { entries: true } } },
  });
  return categories.map((c) => ({ id: c.id, name: c.name, entryCount: c._count.entries }));
}

async function create({ name }) {
  return prisma.category.create({ data: { name } });
}

async function update(id, { name }) {
  await findOrFail(id);
  return prisma.category.update({ where: { id }, data: { name } });
}

async function remove(id) {
  await findOrFail(id);
  const entryCount = await prisma.kbEntry.count({ where: { categoryId: id } });
  if (entryCount > 0) {
    throw new ApiError(409, 'This category still has KB entries. Move or delete them first');
  }
  await prisma.category.delete({ where: { id } });
}

async function findOrFail(id) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
}

module.exports = { list, create, update, remove };
