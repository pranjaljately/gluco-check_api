const { connectDb, resetDb, disconnectDb } = require('../config/db');
const { registerForm } = require('./utils/generate');
const supertest = require('supertest');
const app = require('../server');
const request = supertest(app);

beforeAll(() => connectDb());

afterAll(() => disconnectDb());

beforeEach(() => resetDb());

test('successful auth flow', async done => {
  const { name, password, email } = registerForm();
  const registerRes = await request.post('/api/v1/user/register').send({
    name,
    email,
    password,
  });

  expect(registerRes.status).toBe(200);
  expect(registerRes.body).toEqual({
    success: true,
    token: expect.any(String),
  });

  const authRes = await request
    .get('/api/v1/auth/')
    .set('x-auth-token', registerRes.body.token);

  expect(authRes.status).toBe(200);
  expect(authRes.body.user.name).toBe(name);

  const loginRes = await request.post('/api/v1/auth/login').send({
    email: authRes.body.user.email,
    password,
  });

  expect(loginRes.status).toBe(200);
  expect(registerRes.body).toEqual({
    success: true,
    token: expect.any(String),
  });

  done();
});

test('email required to login', async () => {
  ({ password } = registerForm());

  const error = await request
    .post('/api/v1/auth/login')
    .send({
      password,
    })
    .catch(e => e);

  expect(error.status).toBe(400);
  expect(error.body).toEqual({
    success: false,
    msg: 'Please enter a valid email',
  });
});

test('password required to login', async () => {
  ({ email } = registerForm());

  const error = await request
    .post('/api/v1/auth/login')
    .send({
      email,
    })
    .catch(e => e);

  expect(error.status).toBe(400);
  expect(error.body).toEqual({
    success: false,
    msg: 'Password cannot be blank',
  });
});

test('user must exist to login', async () => {
  ({ email, password } = registerForm({
    email: '__user_does_not_exist__@gmail.com',
  }));

  const error = await request
    .post('/api/v1/auth/login')
    .send({
      email,
      password,
    })
    .catch(e => e);

  expect(error.status).toBe(400);
  expect(error.body).toEqual({
    success: false,
    msg: 'Invalid credentials',
  });
});

test('password must match to login', async () => {
  const { name, password, email } = registerForm();

  await request.post('/api/v1/user/register').send({
    name,
    email,
    password,
  });

  const changedPassword = `${password}?`;

  console.log('TCL: changedPassword', changedPassword);
  const error = await request
    .post('/api/v1/auth/login')
    .send({
      email,
      password: changedPassword,
    })
    .catch(e => e);

  expect(error.status).toBe(401);
  expect(error.body).toEqual({
    success: false,
    msg: 'Invalid credentials',
  });
});
