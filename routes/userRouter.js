const express = require("express");
const router = express.Router();
const authController = require("./../controller/authController");
// SIGN UP
router.route("/sign-up").post(authController.signup);
// LOGIN
router.route("/login").post(authController.signin);
// Reset Password Request
router
  .route("/reset-password")
  .post(authController.protect, authController.sendEmail);
// Reset Password Link request from Email
router.route("/password-reset/:userId").post(authController.passwordreset);

module.exports = router;
