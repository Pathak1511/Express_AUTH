const express = require("express");
const router = express.Router();
const postController = require("./../controller/postController");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Post Upload
router
  .route("/upload")
  .post(upload.single("post_img"), postController.uploadPost);

// update post body
router.route("/update_post/:post_id").put(postController.updatePost);
// delete post
router.route("/delete_post/:post_id").delete(postController.deletePost);

// get my post with user_id
router.route("/me/:user_id").get(postController.getAllPost);
// get post data
router.route("/me_post/:post_id").get(postController.getPost);

// Adding comment to post
router.route("/add-comment/:post_id").put(postController.addComment);

// Adding like to post
router.route("/add-like/:post_id").put(postController.addLike);

module.exports = router;
