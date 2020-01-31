const { registerForm, bui } = require('./utils/generate');
const supertest = require('supertest');
const app = require('../server');
const request = supertest(app);
const { connectDb, resetDb, disconnectDb } = require('../config/db');

let name;
let email;
let password;

beforeAll(() => connectDb());

afterAll(async () => {
  await resetDb();
  await disconnectDb();
});

beforeEach(() => {
  ({ name, password, email } = registerForm());
});

test('responds with 400 and message when no name provided', async () => {
  const registerRes = await request.post('/api/v1/user/register').send({
    email,
    password,
  });

  expect(registerRes.status).toBe(400);
  expect(registerRes.body).toEqual({
    success: false,
    msg: 'Please enter a name',
  });
});

test('responds with 400 and message when no email provided', async () => {
  const registerRes = await request.post('/api/v1/user/register').send({
    name,
    password,
  });

  expect(registerRes.status).toBe(400);
  expect(registerRes.body).toEqual({
    success: false,
    msg: 'Please enter a valid email',
  });
});

test('responds with 400 and message when invalid email provided', async () => {
  email = 'invalid_email';

  const registerRes = await request.post('/api/v1/user/register').send({
    name,
    email,
    password,
  });

  expect(registerRes.status).toBe(400);
  expect(registerRes.body).toEqual({
    success: false,
    msg: 'Please enter a valid email',
  });
});

test('responds with 400 and message when no password provided', async () => {
  const registerRes = await request.post('/api/v1/user/register').send({
    name,
    email,
  });

  expect(registerRes.status).toBe(400);
  expect(registerRes.body).toEqual({
    success: false,
    msg: 'Please enter a password with 6 or more characters',
  });
});

test('responds with 400 and message when a password with less than 6 characters provided', async () => {
  password = '12345';

  const registerRes = await request.post('/api/v1/user/register').send({
    name,
    email,
    password,
  });

  expect(registerRes.status).toBe(400);
  expect(registerRes.body).toEqual({
    success: false,
    msg: 'Please enter a password with 6 or more characters',
  });
});

test('responds with 200 and token when user is registered', async () => {
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
});
