const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// REQUIRED MODULES
//////////////////////////////////////////

const postSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  post_img: {
    data: Buffer,
    contentType: String,
  },
  description: {
    type: String,
  },
  comments: [
    {
      user_id: {
        type: String,
      },
      comment: {
        type: String,
      },
    },
  ],
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
