const router = require("express").Router();
const {
  manageContentsbyAdmin,
  manageContentsbyUser,
  deleteContent,
  deleteOwnContent,
  getEditProfile,
  postEditProfile,
  deleteOwnAccount,
  getAdminDashboard,
  getUserDashboard,
  verifyUser,
  deleteUser,
  getPublicContents,
} = require("../controllers/secure.controller");
const { verifyToken, accessedRoles } = require("../middleware/auth.middleware");
router.get("/admin", verifyToken, accessedRoles("admin"), getAdminDashboard);
router.get("/user", verifyToken, accessedRoles("user"), getUserDashboard);
router.post("/verify", verifyToken, accessedRoles("admin"), verifyUser);
router.post("/delete", verifyToken, accessedRoles("admin"), deleteUser);
router.get(
  "/manageAdmin",
  verifyToken,
  accessedRoles("admin"),
  manageContentsbyAdmin,
);
router.get(
  "/manageUser",
  verifyToken,
  accessedRoles("user"),
  manageContentsbyUser,
);
router.post(
  "/deleteContent",
  verifyToken,
  accessedRoles("admin"),
  deleteContent,
);
router.post(
  "/deleteOwnContent",
  verifyToken,
  accessedRoles("user"),
  deleteOwnContent,
);
router.get("/editProfile", verifyToken,  getEditProfile);
router.post(
  "/editProfile",
  verifyToken,
  postEditProfile,
);
router.post(
  "/deleteAccount",
  verifyToken,
  accessedRoles("user"),
  deleteOwnAccount,
);
router.get(
  "/public",
  verifyToken,
  accessedRoles("user", "admin"),
  getPublicContents,
);
module.exports = router;
