const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { verifyToken, accessedRoles } = require("../middleware/auth.middleware");
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout",verifyToken, authController.logout);
module.exports = router;
