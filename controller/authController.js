const { promisify } = require("util");
const AppError = require("../util/AppError");
const jwt = require("jsonwebtoken");
const catchAsync = require("../util/catchAsync");
const bcrypt = require("bcrypt");
const user = require("./../model/user");
const { decode } = require("punycode");
const nodemailer = require("nodemailer");

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
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const query = await user.findOne({ email: req.body.email });

  const resetLink =
    `${process.env.BASE_URL}/password-reset/${query._id.toString()}/?token=` +
    signToken(query._id);

  const message = {
    from: "hritikpathak888@gmail.com",
    to: req.body.email,
    subject: "Password Reset Request",
    html: `<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
    <div style="margin: 10px auto; width: 70%; padding: 6px 0">
      <div style="border-bottom: 1px solid #eee">
        <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">From API INC</a>
      </div>
      <p style="font-size: 1.1em">Hi!!</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the link below:</p>
      <a href="${resetLink}" style="background: #00466a; color: #fff; padding: 10px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Reset Password</a>
      <p style="font-size: 1.1em; margin-top: 20px;">This link will expire in one hour for security reasons.</p>
      <p>If you have any issues, please contact our support team.</p>
      <p style="font-size: 1.1em; margin-bottom: 20px;">Best regards,</p>
      <h3 style="font-size: 1.3em; color: #00466a; margin-top: 0;">The API TEST INC</h3>
      <hr style="border: none; border-top: 1px solid #eee" />
      <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
        <p>API TEST INC</p>
        <p>Boisar West, Maharashtra</p>
        <p>India</p>
      </div>
    </div>
  </div>`,
  };

  if (!query) {
    return next(new AppError("No user Found with this email", 404));
  } else {
    transporter.sendMail(message).then((info) => {
      return res.status(201).json({
        msg: "you should receive an email",
        info: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      });
    });
  }
});

exports.passwordreset = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  const userUpdate = await user.findOneAndUpdate(
    { _id: userId },
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
