const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const kbService = require('./kb.service');
const chatService = require('./chat.service');

const pendingQuery = {
  where: { senderType: 'student', status: 'pending_admin' },
  orderBy: { createdAt: 'asc' },
  include: {
    student: { include: { studentRecord: true } },
    // Closest KB entry (no embedding)
    matchedKb: { select: { id: true, question: true, answer: true, category: { select: { name: true } } } },
  },
};

// Backfill missing best match once (0 = nothing related)
async function fillMissingBestMatches(questions) {
  let changed = false;
  for (const q of questions) {
    if (q.matchedKb || q.similarity === 0) continue;
    try {
      const { top, bestScore } = await chatService.matchQuestion(q.content);
      const closest = top[0] && top[0].score > 0 ? top[0].entry.id : null;
      await prisma.message.update({ where: { id: q.id }, data: { matchedKbId: closest, similarity: bestScore } });
      changed = true;
    } catch (err) {
      console.error('Could not find a best match for question', q.id, err.message);
    }
  }
  return changed;
}

// Pending questions, oldest first
async function listPending() {
  let questions = await prisma.message.findMany(pendingQuery);
  if (await fillMissingBestMatches(questions)) {
    questions = await prisma.message.findMany(pendingQuery);
  }

  return questions.map((q) => ({
    id: q.id,
    content: q.content,
    similarity: q.similarity,
    createdAt: q.createdAt,
    studentName: q.student.studentRecord ? q.student.studentRecord.fullName : 'Unknown',
    rollNo: q.student.studentRecord ? q.student.studentRecord.rollNo : null,
    bestMatch: q.matchedKb
      ? { id: q.matchedKb.id, question: q.matchedKb.question, answer: q.matchedKb.answer, category: q.matchedKb.category.name }
      : null,
  }));
}

async function reply(questionId, adminId, { content, saveToKb, categoryId, kbQuestion }) {
  const question = await prisma.message.findUnique({ where: { id: questionId } });
  if (!question || question.senderType !== 'student') {
    throw new ApiError(404, 'Question not found');
  }

  // Status check prevents double replies
  const replyMessage = await prisma.$transaction(async (tx) => {
    const updated = await tx.message.updateMany({
      where: { id: questionId, status: 'pending_admin' },
      data: { status: 'answered' },
    });
    if (updated.count === 0) {
      throw new ApiError(409, 'This question has already been answered');
    }
    return tx.message.create({
      data: {
        studentId: question.studentId,
        senderId: adminId,
        senderType: 'admin',
        content,
        replyToId: question.id,
      },
    });
  });

  // Optional save to KB; reply is sent even if it fails
  let kbEntry = null;
  let warning = null;
  if (saveToKb) {
    try {
      const kbText = (kbQuestion || question.content).slice(0, 255);
      kbEntry = await kbService.create({ categoryId, question: kbText, answer: content }, adminId);
    } catch (err) {
      warning = `Reply sent, but saving to the knowledge base failed: ${err.message}`;
    }
  }

  return { reply: replyMessage, kbEntry, warning };
}

module.exports = { listPending, reply };
