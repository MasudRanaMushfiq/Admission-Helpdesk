const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const embedding = require('./embedding.service');

// Never send the embedding
const publicFields = {
  id: true,
  categoryId: true,
  createdBy: true,
  question: true,
  answer: true,
  isActive: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
};

const makeEmbedding = (question, answer) => embedding.embed(embedding.entryText(question, answer));

async function list() {
  return prisma.kbEntry.findMany({ select: publicFields, orderBy: { id: 'desc' } });
}

async function create({ categoryId, question, answer, isActive = true }, adminId) {
  const vector = makeEmbedding(question, answer);
  return prisma.kbEntry.create({
    data: { categoryId: Number(categoryId), question, answer, isActive, embedding: vector, createdBy: adminId },
    select: publicFields,
  });
}

async function update(id, { categoryId, question, answer, isActive }) {
  const existing = await prisma.kbEntry.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'KB entry not found');

  const data = { categoryId: Number(categoryId), question, answer };
  if (isActive !== undefined) data.isActive = isActive;

  // Re-embed only if text changed
  if (question !== existing.question || answer !== existing.answer) {
    data.embedding = makeEmbedding(question, answer);
  }

  return prisma.kbEntry.update({ where: { id }, data, select: publicFields });
}

async function remove(id) {
  const existing = await prisma.kbEntry.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'KB entry not found');
  await prisma.kbEntry.delete({ where: { id } });
}

module.exports = { list, create, update, remove };
