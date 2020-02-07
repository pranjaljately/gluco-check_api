const mongoose = require('mongoose');

module.exports = {
  connectDb: async () => {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    return conn;
  },

  resetDb: () => mongoose.connection.dropDatabase(),

  disconnectDb: () => mongoose.connection.close(),

  dropCollection: name => mongoose.connection.db.dropCollection(name),
};
