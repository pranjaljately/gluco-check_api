const dotenv = require('dotenv');
const startServer = require('./start');
const { connectDb } = require('./config/db');

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: './config/config.env' });
}

connectDb();
startServer();
