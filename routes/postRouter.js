const express = require("express");
const router = express.Router();
const postController = require("./../controller/postController");
// Post Upload
router.route("/upload").post(postController.uploadPost);

module.exports = router;
