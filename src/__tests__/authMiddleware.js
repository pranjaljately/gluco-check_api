const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectDb, resetDb, disconnectDb } = require('../config/db');
const { buildNext, buildRes } = require('./utils/generate');

beforeAll(() => connectDb());

afterAll(() => disconnectDb());

beforeEach(() => resetDb());

test('responds with 401 when no token present in header', () => {
  const message = 'No token, authorisation denied';
  const req = { header: jest.fn(() => null) };
  const next = buildNext();
  const res = buildRes();

  auth(req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(req.header).toHaveBeenCalledWith('x-auth-token');
  expect(req.header).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith({ success: false, msg: message });
  expect(res.json).toHaveBeenCalledTimes(1);
});

test('responds with 404 when user is not found', async () => {
  const message = 'User not found';
  jest.spyOn(jwt, 'verify');

  jwt.verify.mockImplementation((token, secret) => {
    return { id: 'incorrect_id' };
  });

  const req = {
    header: jest.fn(() => true),
  };
  const next = buildNext();
  const res = buildRes();

  await auth(req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(req.header).toHaveBeenCalledWith('x-auth-token');
  expect(req.header).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith({ success: false, msg: message });
  expect(res.json).toHaveBeenCalledTimes(1);

  jwt.verify.mockRestore();
});

test('calls next when a valid token is included in the header and a user is found using decoded token', async () => {
  const req = {
    header: jest.fn(() => true),
    userId: null,
  };
  const next = jest.fn();
  const res = buildRes();

  const user = new User({
    name: 'John',
    email: 'test@gmail.com',
    password: '123456',
  });

  await user.save();

  const insertedUser = await User.findOne({ name: user.name });

  jest.spyOn(jwt, 'verify');

  jwt.verify.mockImplementation((token, secret) => {
    return { id: insertedUser._id };
  });

  await auth(req, res, next);
  expect(req.header).toHaveBeenCalledWith('x-auth-token');
  expect(req.header).toHaveBeenCalledTimes(1);
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();

  jwt.verify.mockRestore();
});

test('responds with 401 and error message when an invalid token is supplied', async () => {
  const message = 'Invalid token';
  jest.spyOn(jwt, 'verify');

  jwt.verify.mockImplementation((token, secret) => {
    throw Error();
  });

  const req = {
    header: jest.fn(() => true),
  };
  const next = buildNext();
  const res = buildRes();

  await auth(req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(req.header).toHaveBeenCalledWith('x-auth-token');
  expect(req.header).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith({ success: false, msg: message });
  expect(res.json).toHaveBeenCalledTimes(1);

  jwt.verify.mockRestore();
});
