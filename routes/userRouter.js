const express = require("express");
const router = express.Router();
const authController = require("./../controller/authController");
router.route("/sign-up").post(authController.signup);
router.route("/login").post(authController.signin);
router.route("/reset-password").post(authController.sendEmail);
router.route("/password-reset/:userId").post(authController.passwordreset);

module.exports = router;
