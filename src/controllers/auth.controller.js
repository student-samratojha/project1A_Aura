const logAction = require("../services/auditLog.service");
const userModel = require("../db/models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = process.env;
async function getRegister(req, res) {
  try {
    res.render("register", { error: req.query.error || null });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the registration page.",
    });
  }
}

async function postRegister(req, res) {
  try {
    const { username, email, password } = req.body;
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      await logAction(
        req,
        "Failed registration attempt - username or email exists",
      );
      return res.redirect(
        "/auth/register?error=Username or email already exists",
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    await logAction(req, "User registered");
    res.redirect("/auth/login?success=Registration successful, please login");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while registering the user.",
    });
  }
}

async function getLogin(req, res) {
  try {
    res.render("login", {
      error: req.query.error || null,
      success: req.query.success || null,
    });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the login page.",
    });
  }
}

async function postLogin(req, res) {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) {
      await logAction(req, "Failed login attempt - user not found");
      return res.redirect("/auth/login?error=Invalid username or password");
    }
    if (user.isDeleted) {
      await logAction(req, "Failed login attempt - user is deleted");
      return res.redirect("/auth/login?error=User is deleted");
    }
    if (!user.isVerified) {
      await logAction(req, "Failed login attempt - user is not verified");
      return res.redirect("/auth/login?error=User is not verified");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAction(req, "Failed login attempt - incorrect password");
      return res.redirect("/auth/login?error=Invalid username or password");
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    await logAction(req, "User logged in");
    res.cookie("token", token, { httpOnly: true });
    res.redirect(`/secure/${user.role}?Welcome ${user.username}`);
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while logging in the user.",
    });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token");
    await logAction(req, "User logged out");
    res.redirect("/auth/login?success=Logged out successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while logging out the user.",
    });
  }
}

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
};
