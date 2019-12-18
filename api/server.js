const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

/* Load environment variables */
dotenv.config({ path: './config/config.env' });

/* Dev logging middleware*/
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* Define routes*/
app.use('/api/v1/users', require('./routes/users'));

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode and listening on port ${PORT}`
  );
});
