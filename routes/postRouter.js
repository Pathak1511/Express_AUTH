const express = require("express");
const router = express.Router();
const postController = require("./../controller/postController");
const authController = require("./../controller/authController");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Post Upload
router
  .route("/upload")
  .post(
    upload.single("post_img"),
    authController.protect,
    postController.uploadPost
  );

// update post body
router
  .route("/update_post/:post_id")
  .put(authController.protect, postController.updatePost);
// delete post
router
  .route("/delete_post/:post_id")
  .delete(authController.protect, postController.deletePost);

// get my post with user_id
router
  .route("/me/:user_id")
  .get(authController.protect, postController.getAllPost);
// get post data
router
  .route("/me_post/:post_id")
  .get(authController.protect, postController.getPost);

// Adding comment to post
router
  .route("/add-comment/:post_id")
  .put(authController.protect, postController.addComment);

// Adding like to post
router
  .route("/add-like/:post_id")
  .put(authController.protect, postController.addLike);

module.exports = router;
