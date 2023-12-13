const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// REQUIRED MODULES
//////////////////////////////////////////

const postSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  user_id: {
    type: String,
  },
  post_img: {
    data: Buffer,
    contentType: String,
  },
  comments: {
    type: Array,
  },
  likes: {
    type: Array,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const post = mongoose.model("Post", postSchema);

module.exports = post;
