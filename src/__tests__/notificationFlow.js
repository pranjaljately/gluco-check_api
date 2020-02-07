const { registerForm, pushToken } = require('./utils/generate');
const supertest = require('supertest');
const app = require('../server');
const request = supertest(app);
const { connectDb, resetDb, disconnectDb } = require('../config/db');
jest.mock('../utils/sendNotification', () =>
  jest.fn((pToken, value) => Promise.resolve())
);
const sendNotification = require('../utils/sendNotification');

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

  await request
    .post('/api/v1/notification/token')
    .set('x-auth-token', token)
    .send({
      pushToken,
    });
});

afterAll(async () => {
  await resetDb();
  await disconnectDb();
  jest.resetAllMocks();
});

test('notification sent when low notification preference is true and reading is below 4.0', async () => {
  const value = 3.9;
  const readingRes = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value,
      readingTime: Date.now(),
    });
  expect(readingRes.status).toBe(200);
  expect(readingRes.body).toEqual({
    success: true,
    reading: {
      _id: expect.any(String),
      user: expect.any(String),
      readingTime: expect.any(String),
      value,
      __v: expect.any(Number),
    },
  });
  expect(sendNotification).toBeCalledTimes(1);
  expect(sendNotification).toBeCalledWith(pushToken, value);
});

test('notification sent when high notification preference is true and reading is above 7.0', async () => {
  const value = 7.1;
  const readingRes = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value,
      readingTime: Date.now(),
    });
  expect(readingRes.status).toBe(200);
  expect(readingRes.body).toEqual({
    success: true,
    reading: {
      _id: expect.any(String),
      user: expect.any(String),
      readingTime: expect.any(String),
      value,
      __v: expect.any(Number),
    },
  });
  expect(sendNotification).toBeCalledTimes(1);
  expect(sendNotification).toBeCalledWith(pushToken, value);
});

test('no notification sent when value is between 4.0 and 7.0', async () => {
  const value = 5.5;
  const readingRes = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value,
      readingTime: Date.now(),
    });
  expect(readingRes.status).toBe(200);
  expect(readingRes.body).toEqual({
    success: true,
    reading: {
      _id: expect.any(String),
      user: expect.any(String),
      readingTime: expect.any(String),
      value,
      __v: expect.any(Number),
    },
  });
  expect(sendNotification).not.toBeCalled();
});

test('no notification sent when low notifications are off and value is low (below 4.0)', async () => {
  const notificationRes = await request
    .post('/api/v1/notification/low')
    .set('x-auth-token', token)
    .send({
      lowNotification: false,
    });

  expect(notificationRes.status).toBe(200);
  expect(notificationRes.body.notification.lowNotification).toBe(false);
  expect(notificationRes.body.notification.pushToken).toBe(pushToken);

  const value = 3.5;
  const readingRes = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value,
      readingTime: Date.now(),
    });
  expect(readingRes.status).toBe(200);
  expect(readingRes.body).toEqual({
    success: true,
    reading: {
      _id: expect.any(String),
      user: expect.any(String),
      readingTime: expect.any(String),
      value,
      __v: expect.any(Number),
    },
  });

  expect(sendNotification).not.toBeCalled();
});

test('no notification sent when high notifications are off and value is high (below 7.0)', async () => {
  const notificationRes = await request
    .post('/api/v1/notification/high')
    .set('x-auth-token', token)
    .send({
      highNotification: false,
    });

  expect(notificationRes.status).toBe(200);
  expect(notificationRes.body.notification.highNotification).toBe(false);
  expect(notificationRes.body.notification.pushToken).toBe(pushToken);

  const value = 7.5;
  const readingRes = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value,
      readingTime: Date.now(),
    });
  expect(readingRes.status).toBe(200);
  expect(readingRes.body).toEqual({
    success: true,
    reading: {
      _id: expect.any(String),
      user: expect.any(String),
      readingTime: expect.any(String),
      value,
      __v: expect.any(Number),
    },
  });

  expect(sendNotification).not.toBeCalled();
});
