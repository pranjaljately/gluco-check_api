const express = require('express');
const morgan = require('morgan');

const app = express();

/* Body parser */
app.use(express.json());

/* Dev logging middleware*/
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: 'Welcome to the Gluco-check Api' });
});

/* Define routes*/
app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/reading', require('./routes/reading'));
app.use('/api/v1/notification', require('./routes/notification'));

module.exports = app;
