const reelsModel = require("../db/models/reels.model");
const userModel = require("../db/models/user.model");
const LogAction = require("../services/auditLog.service");
async function getCreateReel(req, res) {
  try {
    res.render("createReel", {
      error: req.query.error || null,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while loading the create reel page.",
    });
  }
}

async function createReel(req, res) {
  try {
    const { content, media } = req.body;
    if (!content) {
      await logAction(req, "Failed reel creation attempt - content missing");
      return res.redirect("/reels/create?error=Content is required");
    }
    const reel = new reelsModel({
      user: req.user._id,
      content,
      media,
    });
    await reel.save();
    await logAction(req, "Reel created");
    res.redirect("/secure/user?success=Reel created successfully");
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while creating the reel.",
    });
  }
}

async function commentOnReel(req, res) {
  try {
    const { reelId, content } = req.body;
    const reel = await reelsModel.findById(reelId);
    if (!reel) {
      await logAction(req, "Failed comment attempt - reel not found");
        return res.redirect(`/secure/manageUser?error=Reel not found`); 
    }
    if (!content) {
        await logAction(req, "Failed comment attempt - content missing");
        return res.redirect(`/secure/manageUser?error=Content is required`);
    }
    const comment = new commentModel({
      user: req.user._id,
      reel: reelId,
      content,
    });
    await comment.save();
    await logAction(req, "Comment added to reel");
    res.redirect(`/secure/manageUser?success=Comment added successfully`);
  } catch (error) {
    console.error(error);
    res.render("errorPage", {
      message: "An error occurred while adding the comment.",
    });
  }
}

async function toggleLikeReel(req, res) {
    try {   
        const { reelId } = req.body;
        const reel = await reelsModel.findById(reelId);
        if (!reel) {
            await logAction(req, "Failed like attempt - reel not found");   
            return res.redirect(`/secure/manageUser?error=Reel not found`);
        }
        const existingLike = await likeModel.findOne({
            user: req.user._id,
            reel: reelId,
        });
        if (existingLike) {
            await existingLike.remove();
            await logAction(req, "Like removed from reel");
            return res.redirect(
                `/secure/manageUser?success=Like removed successfully`,
            );
        }
        const like = new likeModel({
            user: req.user._id,
            reel: reelId,
        });
        await like.save();
        await logAction(req, "Like added to reel");
        res.redirect(`/secure/manageUser?success=Like added successfully`);
    } catch (error) {
        console.error(error);
        res.render("errorPage", {
            message: "An error occurred while toggling the like.",
        });
    }
}

module.exports = {
    getCreateReel,
    createReel,
    commentOnReel,
    toggleLikeReel,
};