const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User cannot be blank'],
  },
  pushToken: {
    type: String,
    required: [true, 'Push notification token cannot be blank '],
    min: 0,
  },
  lowNotification: {
    type: Boolean,
    default: false,
  },
  highNotification: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
