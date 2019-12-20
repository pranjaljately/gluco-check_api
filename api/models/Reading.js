const mongoose = require('mongoose');

const readingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User cannot be blank'],
  },
  reading: {
    type: Number,
    required: [true, 'Reading cannot be blank '],
    min: 0,
  },
  readingTime: {
    type: Date,
    required: [true, 'Reading Time cannot be blank'],
  },
});

module.exports = mongoose.model('Reading', readingSchema);
