const storyModel = require("../db/models/story.model");
const commentModel = require("../db/models/comment.model");
const likeModel = require("../db/models/like.model");
const logAction = require("../services/auditLog.service");
async function getCreateStory(req, res) {
  try {
    res.render("createStory", {
      error: req.query.error || null,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the create story page.",
    });
  }
}

async function postCreateStory(req, res) {
  try {
    const { content, media } = req.body;
    if (!content) {
      await logAction(req, "Failed story creation attempt - content missing");
      return res.redirect("/stories/create?error=Content is required");
    }
    const story = new storyModel({
      user: req.user._id,
      content,
      media,
    });
    await story.save();
    await logAction(req, "Story created");
    res.redirect("/secure/user?success=Story created successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while creating the story.",
    });
  }
}

async function commentOnStory(req, res) {
  try {
    const { storyId, content } = req.body;
    const story = await storyModel.findById(storyId);
    if (!story) {
      await logAction(req, "Failed comment attempt - story not found");
      return res.redirect(`/secure/public?error=Story not found`);
    }
    if (!content) {
      await logAction(req, "Failed comment attempt - content missing");
      return res.redirect(`/secure/public?error=Content is required`);
    }
    const comment = new commentModel({
      user: req.user._id,
      story: storyId,
      content,
    });
    await comment.save();
    await logAction(req, "Comment added to story");
    res.redirect(`/secure/public?success=Comment added successfully`);
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while adding the comment to the story.",
    });
  }
}

async function toggleLikeStory(req, res) {
  try {
    const { storyId } = req.body;
    const story = await storyModel.findById(storyId);
    if (!story) {
      await logAction(req, "Failed like attempt - story not found");
      return res.redirect(`/secure/public?error=Story not found`);
    }
    const existingLike = await likeModel.findOne({
      user: req.user._id,
      story: storyId,
    });
    if (existingLike) {
      await existingLike.remove();
      await logAction(req, "Like removed from story");
      return res.redirect(`/secure/public?success=Like removed from story`);
    }
    const like = new likeModel({
      user: req.user._id,
      story: storyId,
    });
    await like.save();
    await logAction(req, "Like added to story");
    res.redirect(`/secure/public?success=Like added to story`);
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while toggling the like for the story.",
    });
  }
}

module.exports = {
  getCreateStory,
  postCreateStory,
  commentOnStory,
  toggleLikeStory,
};
