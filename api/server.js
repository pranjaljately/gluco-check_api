const express = require('express');
const dotenv = require('dotenv');

/* Load environment variables */
dotenv.config({ path: './config/config.env' });

const app = express();

const PORT = process.env.PORT || 5000;

// app.get('/', (req, res) => {
//   res.send('Welcome to the Gluco-check API...');
// });

app.use('/api/v1/users', require('./routes/users'));
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode and listening on port ${PORT}`
  );
});
