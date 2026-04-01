const router = require("express").Router();
const {
  getCreateStory,
  postCreateStory,
  commentOnStory,
  toggleLikeStory,
} = require("../controllers/story.controller");
const { verifyToken, accessedRoles } = require("../middleware/auth.middleware");
router.get("/create", verifyToken, accessedRoles("user"), getCreateStory);
router.post("/create", verifyToken, accessedRoles("user"), postCreateStory);
router.post("/comment", verifyToken, accessedRoles("user"), commentOnStory);
router.post("/like", verifyToken, accessedRoles("user"), toggleLikeStory);
module.exports = router;
