const oneDecimalPlace = require('../utils/numberFormat');

describe('round value to one decimal place', () => {
  test('round float up', () => {
    expect(oneDecimalPlace(3.59)).toBe('3.6');
  });

  test('round float down', () => {
    expect(oneDecimalPlace(3.51)).toBe('3.5');
  });

  test('round string down', () => {
    expect(oneDecimalPlace('4.045')).toBe('4.0');
  });

  test('round string up', () => {
    expect(oneDecimalPlace('4.055')).toBe('4.1');
  });

  test('format int', () => {
    expect(oneDecimalPlace('1')).toBe('1.0');
  });
});
