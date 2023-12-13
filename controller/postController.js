const { promisify } = require("util");
const AppError = require("../util/AppError");
const catchAsync = require("../util/catchAsync");
const post = require("./../model/post");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.uploadPost = catchAsync(async (req, res, next) => {
  const { user_id, comments, likes } = req.body;

  const newPost = new post({
    user_id: user_id,
    post_img: {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    },
    comments: comments || [],
    likes: likes || [],
  });

  const savedPost = await newPost.save();

  res
    .status(201)
    .json({ message: "Post uploaded successfully", postId: savedPost._id });
});
