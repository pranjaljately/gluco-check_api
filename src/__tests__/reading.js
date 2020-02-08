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

test('value is required', async () => {
  const res = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      readingTime: Date.now(),
    });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Value must be a positive numeric number',
  });
});

test('value must be greater than 0', async () => {
  const res = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value: 0,
      readingTime: Date.now(),
    });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Value must be a positive numeric number',
  });
});

test('value must be a number', async () => {
  const res = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value: 'test',
      readingTime: Date.now(),
    });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Value must be a positive numeric number',
  });
});

test('reading time is required', async () => {
  const res = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value: 5,
    });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Invalid reading time, must be a Unix timestamp',
  });
});

test('reading time cannot be a string', async () => {
  const res = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value: 5,
      readingTime: 'test',
    });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Invalid reading time, must be a Unix timestamp',
  });
});

test('successfully save reading', async () => {
  const readingValue = 5.5;
  const res = await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value: readingValue,
      readingTime: Date.now(),
    });

  expect(res.status).toBe(200);
  expect(res.body.reading.value).toBe(readingValue);
  dropCollection('readings');
});

test('get all readings in descending order of time', async () => {
  const readingsArray = [4.1, 5.0, 6.7];

  for (const value of readingsArray) {
    await request
      .post('/api/v1/reading')
      .set('x-auth-token', token)
      .send({
        value,
        readingTime: Date.now(),
      });
  }

  readingsArray.reverse();
  const res = await request.get('/api/v1/reading').set('x-auth-token', token);
  const resValues = res.body.readings.map(reading => reading.value);
  expect(res.status).toBe(200);
  expect(resValues).toEqual(readingsArray);
  dropCollection('readings');
});

test('to value must be a timestamp', async () => {
  const from = Date.now();
  const to = null;
  const res = await request
    .get(`/api/v1/reading/${from}-${to}`)
    .set('x-auth-token', token);

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Invalid date, must be a Unix timestamp',
  });
});

test('from value must be a timestamp', async () => {
  const from = null;
  const to = Date.now();
  const res = await request
    .get(`/api/v1/reading/${from}-${to}`)
    .set('x-auth-token', token);

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    msg: 'Invalid date, must be a Unix timestamp',
  });
});

test('from value must be a timestamp', async () => {
  const readingsArray = [4.5, 5.0, 5.5, 6.0, 6.5];

  for (const value of readingsArray) {
    await request
      .post('/api/v1/reading')
      .set('x-auth-token', token)
      .send({
        value,
        readingTime: Date.now(),
      });
  }

  readingsArray.reverse();
  const startOfDay = new Date().setHours(0, 0, 0, 0).valueOf();
  const to = Date.now();

  const newValue = 7.0;
  await request
    .post('/api/v1/reading')
    .set('x-auth-token', token)
    .send({
      value: newValue,
      readingTime: Date.now(),
    });

  const res = await request
    .get(`/api/v1/reading/${startOfDay}-${to}`)
    .set('x-auth-token', token);

  const resValues = res.body.readings.map(reading => reading.value);
  expect(res.status).toBe(200);
  expect(resValues).toEqual(readingsArray);
  expect(resValues).toEqual(expect.not.arrayContaining([newValue]));
  dropCollection('readings');
});
