const prisma = require('../lib/prisma');

// In-memory cache of active KB entries, reloaded when the KB changes
let cache = { version: null, entries: [] };

async function getActiveEntries() {
  const stats = await prisma.kbEntry.aggregate({ _count: { _all: true }, _max: { updatedAt: true, id: true } });
  const version = `${stats._count._all}-${stats._max.id}-${stats._max.updatedAt?.getTime()}`;

  if (version !== cache.version) {
    const entries = await prisma.kbEntry.findMany({
      where: { isActive: true },
      select: { id: true, question: true, answer: true, embedding: true },
    });
    cache = { version, entries };
  }
  return cache.entries;
}

module.exports = { getActiveEntries };
