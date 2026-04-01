const jwt = require("jsonwebtoken");
const User = require("../db/models/user.model");
async function verifyToken(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.clearCookie("token");
      return res.redirect("/auth/login?error=Please login to access this page");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.clearCookie("token");
      return res.redirect("/auth/login?error=User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.clearCookie("token");
    return res.redirect("/auth/login?error=Invalid token");
  }
}

function accessedRoles(allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).send("Unauthorized");
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).send("Access denied");
      }
      next();
    } catch (error) {
      console.error(error);
      res.clearCookie("token");
      return res.redirect("/auth/login?error=Invalid token");
    }
  };
}

module.exports = { verifyToken, accessedRoles };
