const { calculation } = require('../utils/calculations');
const oneDecimalPlace = require('../utils/numberFormat');

test('calculations', async () => {
  const readingsArray = [
    {
      value: 3.0,
    },
    {
      value: 5.0,
    },
    {
      value: 6.0,
    },
    {
      value: 10.0,
    },
  ];

  const result = calculation(readingsArray);
  const average = 6.0;
  const A1C = (average * 18 + 46.7) / 28.7;
  expect(result.average).toBe(oneDecimalPlace(average));
  expect(result.highEventsCount).toBe(1);
  expect(result.lowEventsCount).toBe(1);
  expect(result.inTargetEventsCount).toBe(2);
  expect(result.A1C).toBe(oneDecimalPlace(A1C));

  let numberOfReadings = readingsArray.length;
  if (readingsArray.length === 0) {
    numberOfReadings = 1;
  }

  expect(result.distribution).toEqual({
    low: Math.round((1 / numberOfReadings) * 100),
    target: Math.round((2 / numberOfReadings) * 100),
    high: Math.round((1 / numberOfReadings) * 100),
  });
});

test('calculations with empty array of readings', async () => {
  const readingsArray = [];

  const result = calculation(readingsArray);
  const average = 0;
  const A1C = (average * 18 + 46.7) / 28.7;
  expect(result.average).toBe(oneDecimalPlace(average));
  expect(result.highEventsCount).toBe(0);
  expect(result.lowEventsCount).toBe(0);
  expect(result.inTargetEventsCount).toBe(0);
  expect(result.A1C).toBe(oneDecimalPlace(A1C));

  let numberOfReadings = readingsArray.length;
  if (readingsArray.length === 0) {
    numberOfReadings = 1;
  }

  expect(result.distribution).toEqual({
    low: Math.round((0 / numberOfReadings) * 100),
    target: Math.round((0 / numberOfReadings) * 100),
    high: Math.round((0 / numberOfReadings) * 100),
  });
});
