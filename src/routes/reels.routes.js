const router = require("express").Router();
const {
  createReel,
  getCreateReel,
  toggleLikeReel,
  commentOnReel,
} = require("../controllers/reels.controller");
const { verifyToken, accessedRoles } = require("../middleware/auth.middleware");
router.get("/create", verifyToken, accessedRoles("user"), getCreateReel);
router.post("/create", verifyToken, accessedRoles("user"), createReel);
router.post("/comment", verifyToken, accessedRoles("user"), commentOnReel);
router.post("/like", verifyToken, accessedRoles("user"), toggleLikeReel);
module.exports = router;
