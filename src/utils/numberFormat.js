const oneDecimalPlace = value => (Math.round(value * 10) / 10).toFixed(1);

module.exports = oneDecimalPlace;
