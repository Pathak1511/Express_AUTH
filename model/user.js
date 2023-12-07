const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// REQUIRED MODULES
//////////////////////////////////////////

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    required: [true, "name is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const user = mongoose.model("User", userSchema);

module.exports = user;
