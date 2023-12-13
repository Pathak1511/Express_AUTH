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

// update post body

exports.updatePost = catchAsync(async (req, res, next) => {
  const updatedPost = await post.findByIdAndUpdate(
    req.params.post_id,
    { ...req.body },
    { new: true }
  );
  // const [post_img, ...postwithoutimg] = updatedPost.toObject();

  res.status(201).json({
    status: "success",
    message: "updated successfully",
  });
});

// deletePost
exports.deletePost = catchAsync(async (req, res, next) => {
  const doc = await post.findByIdAndDelete(req.params.post_id);

  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
  });
});

// get post with user_id
exports.getAllPost = catchAsync(async (req, res, next) => {
  const Post = await post
    .find({ user_id: req.params.user_id })
    .select("-post_img");

  res.status(200).json({
    status: "success",
    data: Post,
  });
});

// get post data
exports.getPost = catchAsync(async (req, res, next) => {
  const data = await post
    .findOne({ _id: req.params.post_id })
    .select("-post_img");
  res.status(200).json({
    status: "success",
    data: data,
    message: "getPost",
  });
});
