const mongoose = require("mongoose");

const connectDB = async () => {
  // mongoose.connect().then(conn => {})
  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;


/*
Error: options usecreateindex, usefindandmodify are not supported
, {
    // otpions 
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
*/