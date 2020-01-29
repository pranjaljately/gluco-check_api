const mongoose = require('mongoose');

module.exports = {
  connectDb: () =>
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }),

  resetDb: () => mongoose.connection.dropDatabase(),

  disconnectDb: () => mongoose.connection.close(),
};
