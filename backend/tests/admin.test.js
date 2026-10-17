const { api, prisma, resetDb, createAdmin, createStudent } = require('./helpers');

let admin;

beforeEach(async () => {
  await resetDb();
  admin = await createAdmin();
});

afterAll(() => prisma.$disconnect());

const asAdmin = (req) => req.set('Authorization', `Bearer ${admin.token}`);

describe('student records', () => {
  const record = { fullName: 'Nusrat Jahan', rollNo: '4001', registrationNo: '8001' };

  test('create, list, update and delete', async () => {
    const created = await asAdmin(api().post('/api/admin/student-records')).send(record);
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    const list = await asAdmin(api().get('/api/admin/student-records'));
    expect(list.body.data).toHaveLength(1);

    const updated = await asAdmin(api().put(`/api/admin/student-records/${id}`)).send({ ...record, fullName: 'Nusrat J.' });
    expect(updated.body.data.fullName).toBe('Nusrat J.');

    const deleted = await asAdmin(api().delete(`/api/admin/student-records/${id}`));
    expect(deleted.status).toBe(200);
  });

  test('duplicate roll number returns 409', async () => {
    await asAdmin(api().post('/api/admin/student-records')).send(record);
    const res = await asAdmin(api().post('/api/admin/student-records')).send({ ...record, registrationNo: '8002' });
    expect(res.status).toBe(409);
  });

  test('a claimed record cannot be deleted', async () => {
    const { record: claimed } = await createStudent({ fullName: 'Arif Hossain', rollNo: '4002', registrationNo: '8002' });
    const res = await asAdmin(api().delete(`/api/admin/student-records/${claimed.id}`));
    expect(res.status).toBe(409);
  });

  test('invalid id returns 400 and unknown id returns 404', async () => {
    expect((await asAdmin(api().delete('/api/admin/student-records/abc'))).status).toBe(400);
    expect((await asAdmin(api().delete('/api/admin/student-records/999999'))).status).toBe(404);
  });
});

describe('categories', () => {
  test('create, update and delete', async () => {
    const created = await asAdmin(api().post('/api/admin/categories')).send({ name: 'Hostel' });
    expect(created.status).toBe(201);

    const updated = await asAdmin(api().put(`/api/admin/categories/${created.body.data.id}`)).send({ name: 'Housing' });
    expect(updated.body.data.name).toBe('Housing');

    const list = await asAdmin(api().get('/api/admin/categories'));
    expect(list.body.data).toEqual([{ id: created.body.data.id, name: 'Housing', entryCount: 0 }]);

    expect((await asAdmin(api().delete(`/api/admin/categories/${created.body.data.id}`))).status).toBe(200);
  });

  test('a category with KB entries cannot be deleted', async () => {
    const category = await prisma.category.create({ data: { name: 'Fees' } });
    await asAdmin(api().post('/api/admin/kb')).send({ categoryId: category.id, question: 'Fee?', answer: '1200 BDT' });

    const res = await asAdmin(api().delete(`/api/admin/categories/${category.id}`));
    expect(res.status).toBe(409);
  });
});

describe('knowledge base', () => {
  let category;

  beforeEach(async () => {
    category = await prisma.category.create({ data: { name: 'Fees' } });
  });

  test('creating an entry stores an embedding but never returns it', async () => {
    const res = await asAdmin(api().post('/api/admin/kb')).send({
      categoryId: category.id,
      question: 'How much is the application fee?',
      answer: '1200 BDT',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.embedding).toBeUndefined();
    expect(res.body.data.category.name).toBe('Fees');

    const stored = await prisma.kbEntry.findUnique({ where: { id: res.body.data.id } });
    expect(Array.isArray(stored.embedding)).toBe(true);

    const list = await asAdmin(api().get('/api/admin/kb'));
    expect(list.body.data[0].embedding).toBeUndefined();
  });

  test('the embedding is regenerated when the text changes', async () => {
    const created = await asAdmin(api().post('/api/admin/kb')).send({ categoryId: category.id, question: 'Application fee?', answer: '1200 BDT' });
    const id = created.body.data.id;
    const before = (await prisma.kbEntry.findUnique({ where: { id } })).embedding;

    await asAdmin(api().put(`/api/admin/kb/${id}`)).send({ categoryId: category.id, question: 'Exam date?', answer: 'In December' });
    const after = (await prisma.kbEntry.findUnique({ where: { id } })).embedding;

    expect(after).not.toEqual(before);
  });

  test('an entry can be deactivated and deleted', async () => {
    const created = await asAdmin(api().post('/api/admin/kb')).send({ categoryId: category.id, question: 'Fee?', answer: '1200 BDT' });
    const id = created.body.data.id;

    const updated = await asAdmin(api().put(`/api/admin/kb/${id}`)).send({ categoryId: category.id, question: 'Fee?', answer: '1200 BDT', isActive: false });
    expect(updated.body.data.isActive).toBe(false);

    expect((await asAdmin(api().delete(`/api/admin/kb/${id}`))).status).toBe(200);
    expect(await prisma.kbEntry.count()).toBe(0);
  });

  test('missing fields return 400', async () => {
    const res = await asAdmin(api().post('/api/admin/kb')).send({ question: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('categoryId');
    expect(res.body.errors).toHaveProperty('answer');
  });
});
