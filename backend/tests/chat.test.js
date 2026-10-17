const { api, prisma, resetDb, createAdmin, createStudent, createKbEntry } = require('./helpers');
const embedding = require('../src/services/embedding.service');

let admin;
let student;
let feesCategory;

beforeEach(async () => {
  await resetDb();
  admin = await createAdmin();
  student = await createStudent({ fullName: 'Rahim Uddin', rollNo: '1001', registrationNo: '5001' });
  feesCategory = await prisma.category.create({ data: { name: 'Fees' } });
  const examCategory = await prisma.category.create({ data: { name: 'Exam' } });

  await createKbEntry(admin.user.id, feesCategory.id, 'How much is the application fee?', 'The application fee is 1,200 BDT per unit.');
  await createKbEntry(admin.user.id, examCategory.id, 'What is the format of the admission exam?', '100 multiple choice questions in 90 minutes.');
});

afterEach(() => jest.restoreAllMocks());
afterAll(() => prisma.$disconnect());

const asStudent = (req) => req.set('Authorization', `Bearer ${student.token}`);
const asAdmin = (req) => req.set('Authorization', `Bearer ${admin.token}`);

describe('POST /api/chat', () => {
  test('a question that matches the KB gets the KB answer', async () => {
    const res = await asStudent(api().post('/api/chat')).send({ content: 'What is the cost of the application fee?' });

    expect(res.status).toBe(201);
    expect(res.body.data.forwarded).toBe(false);
    expect(res.body.data.question.status).toBe('answered');
    expect(res.body.data.reply.senderType).toBe('ai');
    expect(res.body.data.reply.content).toContain('1,200 BDT');
    expect(res.body.data.reply.matchedKbId).not.toBeNull();
  });

  test('an unrelated question is forwarded to the admin', async () => {
    const res = await asStudent(api().post('/api/chat')).send({ content: 'Is there a swimming pool on campus?' });

    expect(res.status).toBe(201);
    expect(res.body.data.forwarded).toBe(true);
    expect(res.body.data.reply).toBeNull();
    expect(res.body.data.question.status).toBe('pending_admin');
  });

  test('if matching fails, the question is forwarded instead of failing', async () => {
    jest.spyOn(embedding, 'embed').mockImplementationOnce(() => {
      throw new Error('Embedding failed');
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await asStudent(api().post('/api/chat')).send({ content: 'How much is the application fee?' });

    expect(res.status).toBe(201);
    expect(res.body.data.forwarded).toBe(true);
    expect(res.body.data.question.status).toBe('pending_admin');
  });

  test('inactive KB entries are not used', async () => {
    await prisma.kbEntry.updateMany({ data: { isActive: false } });
    const res = await asStudent(api().post('/api/chat')).send({ content: 'How much is the application fee?' });
    expect(res.body.data.forwarded).toBe(true);
  });

  test('empty, too short or too long questions are rejected', async () => {
    expect((await asStudent(api().post('/api/chat')).send({ content: '   ' })).status).toBe(400);
    expect((await asStudent(api().post('/api/chat')).send({ content: 'a'.repeat(501) })).status).toBe(400);

    const tooShort = await asStudent(api().post('/api/chat')).send({ content: ' hi ' });
    expect(tooShort.status).toBe(400);
    expect(tooShort.body.errors.content).toBe('Question must be 3-500 characters');
    expect(await prisma.message.count({ where: { senderType: 'student' } })).toBe(0); // nothing saved
  });

  test('a 3 character question is accepted', async () => {
    const res = await asStudent(api().post('/api/chat')).send({ content: 'fee' });
    expect(res.status).toBe(201);
  });
});

describe('GET /api/chat', () => {
  test('a student only sees their own messages', async () => {
    const other = await createStudent({ fullName: 'Karima Akter', rollNo: '1002', registrationNo: '5002' });
    await asStudent(api().post('/api/chat')).send({ content: 'How much is the application fee?' });
    await api().post('/api/chat').set('Authorization', `Bearer ${other.token}`).send({ content: 'Secret question' });

    const res = await asStudent(api().get('/api/chat'));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2); // question + answer
    expect(res.body.data.every((m) => m.studentId === student.user.id)).toBe(true);
  });
});

describe('admin inbox', () => {
  test('lists pending questions with student name and roll', async () => {
    await asStudent(api().post('/api/chat')).send({ content: 'Is there a hostel?' });

    const res = await asAdmin(api().get('/api/admin/inbox'));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ content: 'Is there a hostel?', studentName: 'Rahim Uddin', rollNo: '1001' });
  });

  test('shows the closest KB entry so the admin can reuse its answer', async () => {
    await asStudent(api().post('/api/chat')).send({ content: 'Can I get a refund of the exam money?' });

    const res = await asAdmin(api().get('/api/admin/inbox'));
    const { bestMatch, similarity } = res.body.data[0];

    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThan(0.4); // below threshold
    expect(bestMatch).toMatchObject({ question: 'What is the format of the admission exam?', category: 'Exam' });
    expect(bestMatch.answer).toBe('100 multiple choice questions in 90 minutes.');
    expect(bestMatch.embedding).toBeUndefined();
  });

  test('older questions without a saved best match get one when the inbox loads', async () => {
    await asStudent(api().post('/api/chat')).send({ content: 'Can I get a refund of the exam money?' });
    // Old forwarded question without a best match
    await prisma.message.updateMany({ where: { senderType: 'student' }, data: { matchedKbId: null, similarity: 0.2 } });

    const res = await asAdmin(api().get('/api/admin/inbox'));
    expect(res.body.data[0].bestMatch.question).toBe('What is the format of the admission exam?');

    const saved = await prisma.message.findFirst({ where: { senderType: 'student' } });
    expect(saved.matchedKbId).toBe(res.body.data[0].bestMatch.id);
  });

  test('no best match is shown when nothing in the KB is related', async () => {
    await asStudent(api().post('/api/chat')).send({ content: 'Is there a swimming pool?' });
    const res = await asAdmin(api().get('/api/admin/inbox'));
    expect(res.body.data[0].bestMatch).toBeNull();
  });

  test('admin reply appears in the student chat and the question becomes answered', async () => {
    const ask = await asStudent(api().post('/api/chat')).send({ content: 'Is there a hostel?' });
    const questionId = ask.body.data.question.id;

    const reply = await asAdmin(api().post(`/api/admin/inbox/${questionId}/reply`)).send({ content: 'Yes, two hostels.' });
    expect(reply.status).toBe(201);

    const chat = await asStudent(api().get('/api/chat'));
    const adminMessage = chat.body.data.find((m) => m.senderType === 'admin');
    expect(adminMessage).toMatchObject({ content: 'Yes, two hostels.', replyToId: questionId });
    expect(chat.body.data.find((m) => m.id === questionId).status).toBe('answered');

    const inbox = await asAdmin(api().get('/api/admin/inbox'));
    expect(inbox.body.data).toHaveLength(0);
  });

  test('a question cannot be answered twice', async () => {
    const ask = await asStudent(api().post('/api/chat')).send({ content: 'Is there a hostel?' });
    const url = `/api/admin/inbox/${ask.body.data.question.id}/reply`;

    await asAdmin(api().post(url)).send({ content: 'Yes.' });
    const second = await asAdmin(api().post(url)).send({ content: 'Yes again.' });
    expect(second.status).toBe(409);
  });

  test('reply can be promoted to the KB and is then answered automatically', async () => {
    const ask = await asStudent(api().post('/api/chat')).send({ content: 'Is there a hostel for students?' });

    const reply = await asAdmin(api().post(`/api/admin/inbox/${ask.body.data.question.id}/reply`)).send({
      content: 'Yes, the university has two hostels for students.',
      saveToKb: true,
      categoryId: feesCategory.id,
    });
    expect(reply.body.data.kbEntry.question).toBe('Is there a hostel for students?');
    expect(reply.body.data.kbEntry.embedding).toBeUndefined();

    const askAgain = await asStudent(api().post('/api/chat')).send({ content: 'Do students get a hostel?' });
    expect(askAgain.body.data.forwarded).toBe(false);
    expect(askAgain.body.data.reply.content).toContain('two hostels');
  });

  test('replying to an unknown question returns 404', async () => {
    const res = await asAdmin(api().post('/api/admin/inbox/999999/reply')).send({ content: 'Hello' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/admin/stats', () => {
  test('returns dashboard numbers', async () => {
    await asStudent(api().post('/api/chat')).send({ content: 'How much is the application fee?' });
    await asStudent(api().post('/api/chat')).send({ content: 'Is there a hostel?' });

    const res = await asAdmin(api().get('/api/admin/stats'));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      pending: 1,
      registeredStudents: 1,
      totalQuestions: 2,
      aiAnswered: 1,
      forwarded: 1,
      topCategories: [{ name: 'Fees', count: 1 }],
    });
  });
});
