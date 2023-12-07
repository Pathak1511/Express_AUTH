const { promisify } = require("util");
const AppError = require("../util/AppError");
const jwt = require("jsonwebtoken");
const catchAsync = require("../util/catchAsync");
const bcrypt = require("bcrypt");
const user = require("./../model/user");
const { decode } = require("punycode");

const date = new Date();

const correctPassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    noTimestamp: true,
    expiresIn: "1d",
  });
};

exports.sendEmail = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.cookie && req.headers.cookie.startsWith("Bearer")) {
    token = req.headers.cookie.split("=");
  }

  if (!token) {
    return res.status(401).json({ status: false, message: "No token found" });
  }
  try {
    const decode = await promisify(jwt.verify)(
      token[1],
      process.env.JWT_SECRET
    );

    const query = await user.findOne({ _id: decode.id });

    const resetLink =
      `${process.env.BASE_URL}/password-reset/${query._id.toString()}/?token=` +
      signToken(query._id);

    if (!query) {
      return next(
        new AppError("Invalid token 😥. Sign in again to reset Password", 500)
      );
    } else {
      res.status(200).json({
        status: "success",
        resetLink: resetLink,
      });
    }
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
});

exports.passwordreset = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.cookie && req.headers.cookie.startsWith("Bearer")) {
    token = req.headers.cookie.split("=");
  }

  if (!token) {
    return res.status(401).json({ status: false, message: "No token found" });
  }

  const decode = await promisify(jwt.verify)(token[1], process.env.JWT_SECRET);

  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  const userUpdate = await user.findOneAndUpdate(
    { _id: decode.id },
    {
      $set: { password: hashedPassword },
    }
  );

  if (!userUpdate) {
    return res.status(404).json({ status: false, message: "User not found." });
  }

  res.status(200).json({
    status: "success",
    message: "Password update successfully",
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await user.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    created_at: date,
  });
  const { password, _id, ...userWithoutPassword } = newUser.toObject();
  res.cookie("Bearer", signToken(newUser._id.toString()));
  res.status(201).json({
    status: true,
    content: {
      data: userWithoutPassword,
    },
  });
});

exports.signin = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const username = req.body.username;
  const userpassword = req.body.password;
  if ((!email && !username) || !userpassword) {
    return next(new AppError("Incorrect provided Credentials", 400));
  }

  let userAuth;
  if (email) {
    userAuth = await user.findOne({ email }).select("+password");
  } else if (username) {
    userAuth = await user.findOne({ username }).select("+password");
  }

  if (!userAuth || !(await correctPassword(userpassword, userAuth.password))) {
    return next(new AppError("Incorrect provided Credentials", 401));
  }
  const { password, _id, ...userWithoutPassword } = userAuth.toObject();
  res.cookie("Bearer", signToken(userAuth._id.toString()));
  res.status(200).json({
    status: true,
    content: {
      data: userWithoutPassword,
    },
  });
});

// GET Token Info

exports.getToken = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.cookie && req.headers.cookie.startsWith("Bearer")) {
    token = req.headers.cookie.split("=");
  }

  if (!token) {
    return res.status(401).json({ status: false, message: "No token found" });
  }

  try {
    const decode = await promisify(jwt.verify)(
      token[1],
      process.env.JWT_SECRET
    );

    res.status(200).json({
      status: true,
      user_id: decode.id,
      decode,
    });
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
});
