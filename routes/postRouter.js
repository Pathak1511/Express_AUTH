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

// Adding comment to post
router.route("/add-comment/:post_id").put(postController.addComment);

// Adding like to post
router.route("/add-like/:post_id").put(postController.addLike);

module.exports = router;
