const oneDecimalPlace = require('./numberFormat');

const calculations = readings => {
  let highEventsCount = 0;
  let lowEventsCount = 0;
  let inTargetEventsCount = 0;
  let numberOfReadings = 1;
  let average = 0;

  if (readings.length !== 0) {
    numberOfReadings = readings.length;

    average =
      readings.reduce((accumulator, reading) => {
        if (checkIfHigh(reading.value)) {
          highEventsCount++;
        } else {
          if (checkIfLow(reading.value)) lowEventsCount++;
        }

        return accumulator + reading.value;
      }, 0) / numberOfReadings;

    inTargetEventsCount = numberOfReadings - (highEventsCount + lowEventsCount);
  }

  return {
    average: oneDecimalPlace(average),
    highEventsCount,
    lowEventsCount,
    inTargetEventsCount,
    A1C: calculateA1C(average),
    distribution: {
      low: Math.round((lowEventsCount / numberOfReadings) * 100),
      target: Math.round((inTargetEventsCount / numberOfReadings) * 100),
      high: Math.round((highEventsCount / numberOfReadings) * 100),
    },
  };
};

const checkIfHigh = value => value > 7.0;
const checkIfLow = value => value < 4.0;

const calculateA1C = value => {
  let A1C = (value * 18 + 46.7) / 28.7;
  return oneDecimalPlace(A1C);
};

module.exports = calculations;
