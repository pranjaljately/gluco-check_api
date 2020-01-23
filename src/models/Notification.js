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
  },
  lowNotification: {
    type: Boolean,
    default: true,
  },
  highNotification: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
