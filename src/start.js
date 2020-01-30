const express = require('express');
const morgan = require('morgan');

const startServer = ({ port = process.env.PORT } = {}) => {
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

  const server = app.listen(port, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode and listening on port ${port}`
    );
  });

  /* Handle unhandled promise rejections */
  process.on('unhandledRejection', error => {
    console.error(error.message);
    server.close(process.exit(1));
  });

  return server;
};

module.exports = startServer;
