const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { makeUploader } = require("../middleware/upload");

const avatarUpload = makeUploader("avatars");
const coverUpload = makeUploader("covers");

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));

router.get("/me", requireAuth, asyncHandler(authController.getMe));
router.patch("/me", requireAuth, asyncHandler(authController.updateMe));
router.post("/change-password", requireAuth, asyncHandler(authController.changePassword));
router.delete("/delete-account", requireAuth, asyncHandler(authController.deleteAccount));

router.post(
  "/me/avatar",
  requireAuth,
  avatarUpload.single("file"),
  asyncHandler(authController.uploadAvatar)
);
router.post(
  "/me/cover",
  requireAuth,
  coverUpload.single("file"),
  asyncHandler(authController.uploadCover)
);

router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.post("/reset-password", asyncHandler(authController.resetPassword));

module.exports = router;
