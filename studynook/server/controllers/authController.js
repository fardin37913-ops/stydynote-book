const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const getCookieOptions = require("../utils/cookieOptions");

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const sanitizeUser = (user) => {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
};

const validatePassword = (password) => {
  const minLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  return minLength && hasUppercase && hasLowercase;
};

const registerUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    const { name, email, photoURL, password } = req.body;

    if (!name || !email || !photoURL || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, photo URL, and password are required.",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters and include uppercase and lowercase letters.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      photoURL: photoURL.trim(),
      password: hashedPassword,
      provider: "password",
      bookings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please login.",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login.",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    const { name, email, photoURL } = req.body;

    if (!name || !email || !photoURL) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and photo URL are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      const newUser = {
        name: name.trim(),
        email: normalizedEmail,
        photoURL: photoURL.trim(),
        provider: "google",
        bookings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);

      user = {
        _id: result.insertedId,
        ...newUser,
      };
    }

    const token = createToken(user);

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Google authentication successful.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Google auth error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during Google authentication.",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during logout.",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(req.user.id),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Current user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching current user.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  getCurrentUser,
};