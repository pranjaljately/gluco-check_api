const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

/* Load environment variables */
dotenv.config({ path: './config/config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

/* Body parser */
app.use(express.json());

/* Connect to db */
connectDB();

/* Dev logging middleware*/
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* Define routes*/
app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/reading', require('./routes/reading'));

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode and listening on port ${PORT}`
  );
});

/* Handle unhandled promise rejections */
process.on('unhandledRejection', error => {
  console.error(error.message);
  server.close(process.exit(1));
});
