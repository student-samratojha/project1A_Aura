const userModel = require("../db/models/user.model");
const postModel = require("../db/models/post.model");
const commentModel = require("../db/models/comment.model");
const likeModel = require("../db/models/like.model");
const storyModel = require("../db/models/story.model");
const reelsModel = require("../db/models/reels.model");
const auditModel = require("../db/models/audit.model");
const bcrypt = require("bcrypt");
const logAction = require("../services/auditLog.service");
async function verifyUser(req, res) {
  try {
    const { id } = req.body;
    const user = await userModel.findById(id);
    if (!user) {
      await logAction(req, "Failed user verification attempt - user not found");
      return res.redirect("/secure/admin?error=User not found");
    }
    user.isVerified = true;
    await user.save();
    await logAction(req, "User verified");
    res.redirect("/secure/admin?success=User verified successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while verifying the user.",
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.body;
    const user = await userModel.findById(id);
    if (!user) {
      await logAction(req, "Failed user deletion attempt - user not found");
      return res.redirect("/secure/admin?error=User not found");
    }
    user.isDeleted = true;
    await user.save();
    await logAction(req, "User deleted");
    res.redirect("/secure/admin?success=User deleted successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while deleting the user.",
    });
  }
}

async function getAdminDashboard(req, res) {
  try {
    const pendingUsers = await userModel.find({
      isVerified: false,
      role: "user",
    });
    const verifiedUsers = await userModel.find({
      isVerified: true,
      role: "user",
      isDeleted: false,
    });
    const deletedUsers = await userModel.find({ isDeleted: true });
    const auditLogs = await auditModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user");
    res.render("adminDashboard", {
      pendingUsers,
      verifiedUsers,
      auditLogs,
      deletedUsers,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the admin dashboard.",
    });
  }
}

async function manageContentsbyAdmin(req, res) {
  try {
    const posts = await postModel.find().populate("user");
    const storys = await storyModel.find().populate("user");
    const reels = await reelsModel.find().populate("user");
    const comments = await commentModel
      .find()
      .populate("user")
      .populate("post")
      .populate("story")
      .populate("reels");
    const likes = await likeModel
      .find()
      .populate("user")
      .populate("post")
      .populate("story")
      .populate("reels");
    res.render("manageContents", {
      posts,
      admin: req.user,
      storys,
      reels,
      comments,
      likes,
    });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the content management page.",
    });
  }
}

async function deleteContent(req, res) {
  try {
    const { contentType, contentId } = req.body;
    let content;
    switch (contentType) {
      case "post":
        content = await postModel.findById(contentId);
        break;
      case "story":
        content = await storyModel.findById(contentId);
        break;
      case "reels":
        content = await reelsModel.findById(contentId);
        break;
      case "comment":
        content = await commentModel.findById(contentId);
        break;
      case "like":
        content = await likeModel.findById(contentId);
        break;
      default:
        return res.status(400).send("Invalid content type");
    }
    if (!content) {
      await logAction(
        req,
        `Failed content deletion attempt - ${contentType} not found`,
      );
      return res.status(404).send("Content not found");
    }
    content.isDeleted = true;
    await content.save();
    await logAction(
      req,
      `Content deleted - ${contentType} with ID ${contentId}`,
    );
    res.redirect("/secure/manageAdmin?success=Content deleted successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while deleting the content.",
    });
  }
}

async function getUserDashboard(req, res) {
  try {
    const auditLogs = await auditModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.render("userDashboard", {
      user: req.user,
      auditLogs,
    });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the user dashboard.",
    });
  }
}

async function manageContentsbyUser(req, res) {
  try {
    const posts = await postModel.find({ user: req.user._id });
    const storys = await storyModel.find({ user: req.user._id });
    const reels = await reelsModel.find({ user: req.user._id });
    const comments = await commentModel
      .find({ user: req.user._id })
      .populate("post")
      .populate("story")
      .populate("reels");
    const likes = await likeModel
      .find({ user: req.user._id })
      .populate("post")
      .populate("story")
      .populate("reels");
    res.render("manageContentsUser", {
      posts,
      storys,
      reels,
      comments,
      likes,
    });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the content management page.",
    });
  }
}

async function deleteOwnContent(req, res) {
  try {
    const { contentType, contentId } = req.body;
    let content;
    switch (contentType) {
      case "post":
        content = await postModel.findOne({
          _id: contentId,
          user: req.user._id,
        });
        break;
      case "story":
        content = await storyModel.findOne({
          _id: contentId,
          user: req.user._id,
        });
        break;
      case "reels":
        content = await reelsModel.findOne({
          _id: contentId,
          user: req.user._id,
        });
        break;
      case "comment":
        content = await commentModel.findOne({
          _id: contentId,
          user: req.user._id,
        });
        break;
      case "like":
        content = await likeModel.findOne({
          _id: contentId,
          user: req.user._id,
        });
        break;
      default:
        return res.status(400).send("Invalid content type");
    }
    if (!content) {
      await logAction(
        req,
        `Failed content deletion attempt - ${contentType} not found or not owned by user`,
      );
      return res.status(404).send("Content not found or not owned by user");
    }
    content.isDeleted = true;
    await content.save();
    await logAction(
      req,
      `Own content deleted - ${contentType} with ID ${contentId}`,
    );
    res.redirect("/secure/manageUser?success=Own content deleted successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while deleting the content.",
    });
  }
}

async function getEditProfile(req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    res.render("editProfile", { user });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the edit profile page.",
    });
  }
}

async function postEditProfile(req, res) {
  try {
    const { username, email, password, profilePic, bio } = req.body;
    const user = await userModel.findById(req.user._id);
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (profilePic) user.profilePic = profilePic;
    if (bio) user.bio = bio;
    await user.save();
    await logAction(req, "User updated profile");
    res.redirect(`/secure/${user.role}?success=Profile updated successfully`);
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while updating the profile.",
    });
  }
}

async function deleteOwnAccount(req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role === "admin") {
      await logAction(
        req,
        "Failed account deletion attempt - admin cannot delete own account",
      );
      return res.redirect(
        "/secure/admin?error=Admin accounts cannot be deleted",
      );
    }
    user.isDeleted = true;
    await user.save();
    await logAction(req, "User deleted own account");
    res.clearCookie("token");
    res.redirect("/auth/login?success=Account deleted successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while deleting the account.",
    });
  }
}

async function getPublicContents(req, res) {
  try {
    const posts = await postModel.find().populate("user");
    const storys = await storyModel.find().populate("user");
    const reels = await reelsModel.find().populate("user");
    const comments = await commentModel
      .find()
      .populate("user")
      .populate("post")
      .populate("story")
      .populate("reels");
    const likes = await likeModel
      .find()
      .populate("user")
      .populate("post")
      .populate("story")
      .populate("reels");
    res.render("publicContents", { posts, likes, comments, storys, reels });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the public contents.",
    });
  }
}

module.exports = {
  verifyUser,
  deleteUser,
  getAdminDashboard,
  manageContentsbyAdmin,
  deleteContent,
  getUserDashboard,
  manageContentsbyUser,
  deleteOwnContent,
  getPublicContents,
  getEditProfile,
  postEditProfile,
  deleteOwnAccount,
};
