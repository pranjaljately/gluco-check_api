const faker = require('faker');
const getPassword = faker.internet.password;
const getName = faker.name.findName;
const getEmail = faker.internet.email;

module.exports = {
  buildRes: overrides => {
    const res = {
      json: jest.fn(() => res).mockName('json'),
      status: jest.fn(() => res).mockName('status'),
      ...overrides,
    };
    return res;
  },

  buildNext: () => jest.fn().mockName('next'),

  loginForm: overrides => {
    return {
      name: getName(),
      password: getPassword(),
      email: getEmail(),
      ...overrides,
    };
  },
};
