const dotenv = require('dotenv');
const app = require('./server');
const { connectDb } = require('./config/db');

dotenv.config({ path: './config/config.env' });

connectDb();

const port = process.env.PORT || 5000;

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
