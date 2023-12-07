const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRouter");
const GlobalErrorHandler = require("./controller/errorController");
const AppError = require("./util/AppError");

dotenv.config({ path: ".env" });

const PORT = 3000;
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("DB connection successfull"));

app.use("/", userRoutes);

app.all("*", function (req, res, next) {
  const err = new AppError(`Can't find ${req.originalUrl} in this server!`);
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});

app.use(GlobalErrorHandler);

app.listen(PORT || 3000, () => {
  console.log(`App listening on Port ${PORT}`);
});
