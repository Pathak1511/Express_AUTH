const { promisify } = require("util");
const AppError = require("../util/AppError");
const catchAsync = require("../util/catchAsync");
const post = require("./../model/post");

exports.uploadPost = catchAsync(async (req, res, next) => {
  const { user_id, comments, likes, description } = req.body;

  const newPost = new post({
    user_id: user_id,
    post_img: {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    },
    description: description,
    comments: comments || [],
    likes: likes || [],
  });

  const savedPost = await newPost.save();

  res.status(201).json({
    message: "Post uploaded successfully",
    postId: savedPost._id,
  });
});

exports.addComment = catchAsync(async (req, res, next) => {
  const commentAdded = await post.updateOne(
    { _id: req.params.post_id },
    {
      $push: {
        comments: { user_id: req.body.user_id, comment: req.body.comment },
      },
    }
  );

  res.status(201).json({
    status: "success",
    message: "comment added",
    data: commentAdded,
  });
});

exports.addLike = catchAsync(async (req, res, next) => {
  const userId = req.body.user_id;

  const isUserLikingThePost = await post.findOne({
    _id: req.params.post_id,
    likes: { $in: [req.body.user_id] },
  });

  console.log(isUserLikingThePost);

  let message = "liked";
  if (isUserLikingThePost) {
    await post.updateOne(
      { _id: req.params.post_id },
      { $pull: { likes: req.body.user_id } }
    );

    message = "like removed";
  } else {
    await post.updateOne(
      { _id: req.params.post_id },
      { $push: { likes: req.body.user_id } }
    );
  }

  res.json({
    status: "success",
    message,
  });
});
