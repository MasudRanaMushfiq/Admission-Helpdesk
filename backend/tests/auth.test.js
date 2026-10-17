const { api, prisma, resetDb, createAdmin, createStudent } = require('./helpers');

const validRegistration = {
  fullName: 'Tanvir Hasan',
  rollNo: '3001',
  registrationNo: '7001',
  password: 'secret123',
  confirmPassword: 'secret123',
};

beforeEach(async () => {
  await resetDb();
  await prisma.studentRecord.create({
    data: { fullName: 'Tanvir Hasan', rollNo: '3001', registrationNo: '7001' },
  });
});

afterAll(() => prisma.$disconnect());

describe('POST /api/auth/register', () => {
  test('registers a student whose details match an unclaimed record', async () => {
    const res = await api().post('/api/auth/register').send(validRegistration);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const record = await prisma.studentRecord.findUnique({ where: { rollNo: '3001' } });
    expect(record.isClaimed).toBe(true);
  });

  test('name is checked case-insensitively and trimmed', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ ...validRegistration, fullName: '  tanvir HASAN ' });
    expect(res.status).toBe(201);
  });

  test('wrong roll/registration pair returns 400', async () => {
    const res = await api().post('/api/auth/register').send({ ...validRegistration, registrationNo: '9999' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: 'Details do not match our records' });
  });

  test('wrong name returns the same 400 message', async () => {
    const res = await api().post('/api/auth/register').send({ ...validRegistration, fullName: 'Someone Else' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Details do not match our records');
  });

  test('already claimed roll returns 409', async () => {
    await api().post('/api/auth/register').send(validRegistration);
    const res = await api().post('/api/auth/register').send(validRegistration);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('An account already exists for this roll');
  });

  test('invalid input returns 400 with field errors', async () => {
    const res = await api().post('/api/auth/register').send({
      fullName: 'Al',
      rollNo: 'abc',
      registrationNo: '',
      password: 'short',
      confirmPassword: 'different',
    });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(
      ['confirmPassword', 'fullName', 'password', 'registrationNo', 'rollNo'].sort(),
    );
  });
});

describe('POST /api/auth/login', () => {
  test('student logs in with roll + password and gets a token', async () => {
    await api().post('/api/auth/register').send(validRegistration);
    const res = await api().post('/api/auth/login').send({ type: 'student', rollNo: '3001', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toMatch(/^[a-f0-9]{64}$/);
    expect(res.body.data.user).toMatchObject({ name: 'Tanvir Hasan', role: 'student', rollNo: '3001' });
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('only a hash of the token is stored in the database', async () => {
    const { token } = await createAdmin();
    const rows = await prisma.authToken.findMany();

    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toBe(token);
  });

  test('admin logs in with email + password', async () => {
    const { token } = await createAdmin('boss@test.edu', 'adminpass123');
    expect(token).toBeTruthy();
  });

  test('wrong password and unknown user both return the generic message', async () => {
    await api().post('/api/auth/register').send(validRegistration);

    const wrongPassword = await api().post('/api/auth/login').send({ type: 'student', rollNo: '3001', password: 'nope12345' });
    const unknownUser = await api().post('/api/auth/login').send({ type: 'student', rollNo: '5555', password: 'nope12345' });
    const unknownAdmin = await api().post('/api/auth/login').send({ type: 'admin', email: 'x@y.com', password: 'nope12345' });

    for (const res of [wrongPassword, unknownUser, unknownAdmin]) {
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    }
  });

  test('inactive account cannot log in', async () => {
    await api().post('/api/auth/register').send(validRegistration);
    await prisma.user.updateMany({ data: { isActive: false } });

    const res = await api().post('/api/auth/login').send({ type: 'student', rollNo: '3001', password: 'secret123' });
    expect(res.status).toBe(401);
  });
});

describe('token checks', () => {
  test('request without token returns 401', async () => {
    const res = await api().get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('request with an unknown token returns 401', async () => {
    const res = await api().get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('valid token returns the profile', async () => {
    const { token } = await createStudent({ fullName: 'Karima Akter', rollNo: '3002', registrationNo: '7002' });
    const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Karima Akter', role: 'student' });
  });

  test('token stops working after logout', async () => {
    const { token } = await createAdmin();
    const auth = { Authorization: `Bearer ${token}` };

    expect((await api().post('/api/auth/logout').set(auth)).status).toBe(200);
    expect((await api().get('/api/auth/me').set(auth)).status).toBe(401);
  });

  test('expired token returns 401', async () => {
    const { token } = await createAdmin();
    await prisma.authToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });

    const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  test('deactivated user is logged out immediately', async () => {
    const { user, token } = await createAdmin();
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });

    const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  test('student calling an admin route gets 403', async () => {
    const { token } = await createStudent({ fullName: 'Karima Akter', rollNo: '3002', registrationNo: '7002' });
    const res = await api().get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin calling the student chat gets 403', async () => {
    const { token } = await createAdmin();
    const res = await api().get('/api/chat').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
