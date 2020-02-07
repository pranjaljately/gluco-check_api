const { registerForm, pushToken } = require('./utils/generate');
const supertest = require('supertest');
const app = require('../server');
const request = supertest(app);
const {
  connectDb,
  resetDb,
  disconnectDb,
  dropCollection,
} = require('../config/db');

let name;
let email;
let password;
let token;

beforeAll(async () => {
  await connectDb();
  ({ name, password, email } = registerForm());
  const registerRes = await request.post('/api/v1/user/register').send({
    name,
    email,
    password,
  });

  token = registerRes.body.token;
});

afterAll(async () => {
  await resetDb();
  await disconnectDb();
});

test('push token cannot be empty', async () => {
  const res = await request
    .post('/api/v1/notification/token')
    .set('x-auth-token', token)
    .send({
      pushToken: '',
    });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Push token cannot be empty',
  });
});

test('cannot store same push token for the same user', async () => {
  await request
    .post('/api/v1/notification/token')
    .set('x-auth-token', token)
    .send({
      pushToken,
    });

  const duplicateTokenRes = await request
    .post('/api/v1/notification/token')
    .set('x-auth-token', token)
    .send({
      pushToken,
    });

  expect(duplicateTokenRes.status).toBe(400);
  expect(duplicateTokenRes.body).toEqual({
    success: false,
    msg: 'Token already registered',
  });

  dropCollection('notifications');
});

test('token saved successfully', async () => {
  const res = await request
    .post('/api/v1/notification/token')
    .set('x-auth-token', token)
    .send({
      pushToken,
    });

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    success: true,
    notification: {
      _id: expect.any(String),
      user: expect.any(String),
      pushToken: pushToken,
      lowNotification: true,
      highNotification: true,
      __v: expect.any(Number),
    },
  });

  dropCollection('notifications');
});

test('no token saved but trying to delete', async () => {
  const res = await request
    .delete('/api/v1/notification/token')
    .set('x-auth-token', token);

  expect(res.status).toBe(404);
  expect(res.body).toEqual({
    success: false,
    msg: 'Token not found',
  });
});

test('successfully delete notification document', async () => {
  await request
    .post('/api/v1/notification/token')
    .set('x-auth-token', token)
    .send({
      pushToken,
    });

  const res = await request
    .delete('/api/v1/notification/token')
    .set('x-auth-token', token);

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    success: true,
    msg: 'Token deleted',
  });
});

test('no token saved but trying to get notification', async () => {
  const res = await request
    .get('/api/v1/notification/')
    .set('x-auth-token', token);

  expect(res.status).toBe(404);
  expect(res.body).toEqual({
    success: false,
    msg: 'Token not found',
  });
});

test('successfully saved token and retrived notification document', async () => {
  const saveRes = await request
    .post('/api/v1/notification/token')
    .set('x-auth-token', token)
    .send({
      pushToken,
    });

  const res = await request
    .get('/api/v1/notification/')
    .set('x-auth-token', token);

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    success: true,
    notification: saveRes.body.notification,
  });

  dropCollection('notifications');
});

test('low notification requires boolean', async () => {
  const res = await request
    .post('/api/v1/notification/low')
    .set('x-auth-token', token)
    .send({
      lowNotification: '',
    });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Invalid value',
  });
});

test('high notification requires boolean', async () => {
  const res = await request
    .post('/api/v1/notification/high')
    .set('x-auth-token', token)
    .send({
      highNotification: '',
    });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Invalid value',
  });
});
