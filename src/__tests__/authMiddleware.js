const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('insert', () => {
  let connection;

  beforeAll(async () => {
    connection = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  beforeEach(async () => {
    // await connection.dropCollection('User');
    await User.deleteMany({});
  });

  test('responds with 401 when no token present in header', () => {
    const message = 'No token, authorisation denied';
    const req = { header: jest.fn(() => null) };
    const next = jest.fn();
    const res = { json: jest.fn(() => res), status: jest.fn(() => res) };
    auth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(req.header).toHaveBeenCalledTimes(1);
    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ success: false, msg: message });
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  test('responds with 404 when user not found using decoded token', async () => {
    jest.spyOn(jwt, 'verify');

    jwt.verify.mockImplementation((token, secret) => {
      return { id: 'incorrect_id' };
    });

    const message = 'User not found';
    const req = {
      header: jest.fn(() => true),
      userId: null,
    };
    const next = jest.fn();
    const res = { json: jest.fn(() => res), status: jest.fn(() => res) };

    const user = new User({
      name: 'John',
      email: 'test@gmail.com',
      password: '123456',
    });

    await user.save();

    await auth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(req.header).toHaveBeenCalledTimes(1);
    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ success: false, msg: message });
    expect(res.json).toHaveBeenCalledTimes(1);

    jwt.verify.mockRestore();
  });

  test('a valid token is included in the header and the next function is called', async () => {
    const req = {
      header: jest.fn(() => true),
      userId: null,
    };
    const next = jest.fn();
    const res = { json: jest.fn(() => res), status: jest.fn(() => res) };

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
    expect(req.header).toHaveBeenCalledTimes(1);
    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();

    jwt.verify.mockRestore();
  });
});
