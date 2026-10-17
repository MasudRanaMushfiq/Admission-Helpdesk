const prisma = require('../lib/prisma');

async function getStats() {
  const [pending, registeredStudents, totalQuestions, aiAnswered, adminAnswered, matchesByEntry] =
    await Promise.all([
      prisma.message.count({ where: { senderType: 'student', status: 'pending_admin' } }),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.message.count({ where: { senderType: 'student' } }),
      prisma.message.count({ where: { senderType: 'ai' } }),
      prisma.message.count({ where: { senderType: 'admin' } }),
      prisma.message.groupBy({
        by: ['matchedKbId'],
        where: { senderType: 'ai', matchedKbId: { not: null } },
        _count: { _all: true },
      }),
    ]);

  // Per KB entry -> per category
  const entries = await prisma.kbEntry.findMany({
    where: { id: { in: matchesByEntry.map((m) => m.matchedKbId) } },
    select: { id: true, category: { select: { name: true } } },
  });
  const categoryOf = Object.fromEntries(entries.map((e) => [e.id, e.category.name]));

  const countByCategory = {};
  for (const m of matchesByEntry) {
    const name = categoryOf[m.matchedKbId];
    if (name) countByCategory[name] = (countByCategory[name] || 0) + m._count._all;
  }
  const topCategories = Object.entries(countByCategory)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    pending,
    registeredStudents,
    totalQuestions,
    aiAnswered,
    // Forwarded = pending + admin-answered
    forwarded: pending + adminAnswered,
    topCategories,
  };
}

module.exports = { getStats };
