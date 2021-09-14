const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// const logger = require("./middlewear/logger");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const errorHandler = require("./middlewear/error");

const connectDB = require("./config/db");

// Load environment variables
dotenv.config({ path: "./config/config.env" });

connectDB();

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

const app = express();

// Body parser - earlier had to install separately
app.use(express.json());

// Using a custom logger middlewear
// app.use(logger);

// Morgan logging middlewear
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode and on port ${PORT}`.yellow
      .bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`.red);

  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});
