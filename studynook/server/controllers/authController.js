const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const removePassword = (user) => {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
};

const registerUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    const { name, email, photoURL, password } = req.body || {};

    if (!name || !email || !photoURL || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, photo URL, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one uppercase letter.",
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one lowercase letter.",
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
      message: "Registration successful. Please login.",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Register error:", error);

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

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await usersCollection.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
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
      user: removePassword(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login.",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    const { name, email, photoURL } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      const newUser = {
        name: name || "Google User",
        email: normalizedEmail,
        photoURL: photoURL || "https://i.ibb.co/4pDNDk1/avatar.png",
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
    } else {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            name: name || user.name || "Google User",
            photoURL: photoURL || user.photoURL || "https://i.ibb.co/4pDNDk1/avatar.png",
            provider: "google",
            updatedAt: new Date(),
          },
        }
      );

      user = await usersCollection.findOne({
        _id: user._id,
      });
    }

    const token = createToken(user);

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      user: removePassword(user),
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during Google login.",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection("users");

    const userId = req.user?.id;

    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please logout and login again.",
      });
    }

    return res.status(200).json({
      success: true,
      user: removePassword(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching current user.",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during logout.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser,
  logoutUser,
};