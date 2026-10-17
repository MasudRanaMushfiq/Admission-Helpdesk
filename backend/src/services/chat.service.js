const prisma = require('../lib/prisma');
const config = require('../config');
const embedding = require('./embedding.service');
const { findMatches } = require('./matcher.service');
const { getActiveEntries } = require('./kbCache');

async function getHistory(studentId) {
  return prisma.message.findMany({
    where: { studentId },
    orderBy: { id: 'asc' },
  });
}

// Also used by the admin inbox
async function matchQuestion(content) {
  const questionVector = embedding.embed(content);
  const entries = await getActiveEntries();
  return findMatches(questionVector, entries, config.similarityThreshold);
}

// Save -> match -> answer or forward
async function askQuestion(studentId, content) {
  // Saved first, so the admin sees it even on a crash
  const question = await prisma.message.create({
    data: { studentId, senderId: studentId, senderType: 'student', content, status: 'pending_admin' },
  });

  try {
    const match = await matchQuestion(content);

    if (match.shouldAnswer) {
      const best = match.top[0];
      const [reply, updatedQuestion] = await prisma.$transaction([
        prisma.message.create({
          data: {
            studentId,
            senderType: 'ai',
            content: best.entry.answer,
            matchedKbId: best.entry.id,
            similarity: best.score,
            replyToId: question.id,
          },
        }),
        prisma.message.update({
          where: { id: question.id },
          data: { status: 'answered', similarity: best.score },
        }),
      ]);
      return { question: updatedQuestion, reply, forwarded: false };
    }

    // Forward to admin, keeping the closest entry for reuse
    const closest = match.top[0] && match.top[0].score > 0 ? match.top[0].entry.id : null;
    const updatedQuestion = await prisma.message.update({
      where: { id: question.id },
      data: { similarity: match.bestScore, matchedKbId: closest },
    });
    return { question: updatedQuestion, reply: null, forwarded: true };
  } catch (err) {
    // Matching failed: forward instead
    console.error('Auto answer failed, question forwarded to admin:', err.message);
    return { question, reply: null, forwarded: true };
  }
}

module.exports = { getHistory, askQuestion, matchQuestion };
