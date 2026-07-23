const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { User, Quiz, Score } = require("../models");
const { signToken } = require("../utils/token");

function userResponse(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar_url: user.avatarUrl,
    cover_url: user.coverUrl,
  };
}

async function register(req, res) {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "Email, username and password are required" });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, username, password: hashedPassword });

  const token = signToken(user.id);
  res.json({ access_token: token, token_type: "bearer" });
}

async function login(req, res) {
  // The frontend sends this as x-www-form-urlencoded with "username" (email) and "password"
  const { username, password } = req.body;

  const user = await User.findOne({ where: { email: username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  const token = signToken(user.id);
  res.json({ access_token: token, token_type: "bearer" });
}

async function getMe(req, res) {
  res.json(userResponse(req.user));
}

async function updateMe(req, res) {
  const { username } = req.body;
  if (username !== undefined) {
    if (username.trim().length < 2) {
      return res.status(400).json({ message: "Username must be at least 2 characters" });
    }
    req.user.username = username.trim();
    await req.user.save();
  }
  res.json(userResponse(req.user));
}

async function changePassword(req, res) {
  const { current_password, new_password } = req.body;

  const valid = await bcrypt.compare(current_password, req.user.password);
  if (!valid) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  req.user.password = await bcrypt.hash(new_password, 10);
  await req.user.save();
  res.json({ message: "Password changed successfully" });
}

async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  req.user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await req.user.save();
  res.json(userResponse(req.user));
}

async function uploadCover(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  req.user.coverUrl = `/uploads/covers/${req.file.filename}`;
  await req.user.save();
  res.json(userResponse(req.user));
}

async function deleteAccount(req, res) {
  const userId = req.user.id;
  await Score.destroy({ where: { userId } });
  await Quiz.destroy({ where: { ownerId: userId } });
  await req.user.destroy();
  res.json({ message: "Account deleted successfully" });
}

async function forgotPassword(req, res) {
  const genericMessage = "If the account exists, password reset instructions have been sent.";
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.json({ message: genericMessage });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // A real app would email this link. For this project we just log it,
  // so it can be tested straight from the terminal.
  console.log(`Password reset link for ${email}: /reset-password?token=${token}`);

  res.json({ message: genericMessage });
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  const user = await User.findOne({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired reset token." });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.json({ message: "Password updated successfully." });
}

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  uploadAvatar,
  uploadCover,
  deleteAccount,
  forgotPassword,
  resetPassword,
};
