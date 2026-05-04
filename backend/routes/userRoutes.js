const router = require("express").Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUser,
  updateUser,
  deleteUser
} = require("../controllers/userController"); // ✅ FIXED

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;