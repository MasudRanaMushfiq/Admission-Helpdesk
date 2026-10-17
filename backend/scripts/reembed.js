// Rebuilds all KB embeddings: npm run reembed
const prisma = require('../src/lib/prisma');
const { embedMany, entryText } = require('../src/services/embedding.service');

async function main() {
  const entries = await prisma.kbEntry.findMany({ orderBy: { id: 'asc' } });
  console.log(`Creating embeddings for ${entries.length} entries...`);

  const vectors = embedMany(entries.map((e) => entryText(e.question, e.answer)));
  for (let i = 0; i < entries.length; i++) {
    await prisma.kbEntry.update({ where: { id: entries[i].id }, data: { embedding: vectors[i] } });
  }
  console.log(`Done, ${entries.length} entries updated`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
