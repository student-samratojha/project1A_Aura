const router = require("express").Router();
const {
  createPost,
  getCreatePost,
  commentOnPost,
  toggleLikePost,
} = require("../controllers/post.controller");
const { verifyToken, accessedRoles } = require("../middleware/auth.middleware");
router.get("/create", verifyToken, accessedRoles("user"), getCreatePost);
router.post("/create", verifyToken, accessedRoles("user"), createPost);
router.post("/comment", verifyToken, accessedRoles("user"), commentOnPost);
router.post("/like", verifyToken, accessedRoles("user"), toggleLikePost);
module.exports = router;
