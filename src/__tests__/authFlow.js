const { connectDb, resetDb, disconnectDb } = require('../config/db');
const { registerForm } = require('./utils/generate');
const supertest = require('supertest');
const app = require('../server');
const request = supertest(app);

beforeAll(() => connectDb());

afterAll(() => disconnectDb());

beforeEach(() => resetDb());

test('auth flow', async done => {
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
