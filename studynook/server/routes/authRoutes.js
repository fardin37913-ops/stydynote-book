const express = require("express");
const {
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  getCurrentUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;