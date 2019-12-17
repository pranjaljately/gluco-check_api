const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
// const envPath = path.resolve(__dirname, 'config', 'config.env');

/* Load environment variables */
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode and listening on port ${PORT}`
  );
});
