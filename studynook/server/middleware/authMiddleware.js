const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;

    let token = cookieToken;

    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please login first.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    req.user = {
      id: userId,
      email: decoded.email,
      name: decoded.name,
      photoURL: decoded.photoURL,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

module.exports = authMiddleware;