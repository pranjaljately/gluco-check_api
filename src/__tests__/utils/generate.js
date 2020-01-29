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
};
