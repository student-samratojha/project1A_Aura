const postModel = require("../db/models/post.model");
const commentModel = require("../db/models/comment.model");
const likeModel = require("../db/models/like.model");
const logAction = require("../services/auditLog.service");
async function getCreatePost(req, res) {
  try {
    res.render("createPost", {
      error: req.query.error || null,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the create post page.",
    });
  }
}

async function createPost(req, res) {
  try {
    const { content, media } = req.body;
    if (!content) {
      await logAction(req, "Failed post creation attempt - content missing");
      return res.redirect("/posts/create?error=Content is required");
    }
    const post = new postModel({
      user: req.user._id,
      content,
      media,
    });
    await post.save();
    await logAction(req, "Post created");
    res.redirect("/secure/user?success=Post created successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while creating the post.",
    });
  }
}

async function commentOnPost(req, res) {
  try {
    const { postId, content } = req.body;
    const post = await postModel.findById(postId);
    if (!post) {
      await logAction(req, "Failed comment attempt - post not found");
      return res.redirect(`/secure/manageUser?error=Post not found`);
    }
    if (!content) {
      await logAction(req, "Failed comment attempt - content missing");
      return res.redirect(`/secure/manageUser?error=Content is required`);
    }
    const comment = new commentModel({
      user: req.user._id,
      post: postId,
      content,
    });
    await comment.save();
    await logAction(req, "Comment added to post");
    res.redirect(`/secure/manageUser?success=Comment added successfully`);
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while adding the comment.",
    });
  }
}

async function toggleLikePost(req, res) {
  try {
    const { postId } = req.body;
    const post = await postModel.findById(postId);
    if (!post) {
      await logAction(req, "Failed like attempt - post not found");
      return res.redirect(`/secure/manageUser?error=Post not found`);
    }
    const existingLike = await likeModel.findOne({
      user: req.user._id,
      post: postId,
    });
    if (existingLike) {
      await existingLike.remove();
      await logAction(req, "Like removed from post");
      return res.redirect(
        `/secure/manageUser?success=Like removed successfully`,
      );
    }
    const like = new likeModel({
      user: req.user._id,
      post: postId,
    });
    await like.save();
    await logAction(req, "Like added to post");
    res.redirect(`/secure/manageUser?success=Like added successfully`);
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while adding the like.",
    });
  }
}

module.exports = { getCreatePost, createPost, commentOnPost, toggleLikePost };
