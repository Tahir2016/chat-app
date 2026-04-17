const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {searchUsers, updateProfile, getProfile} = require("../controllers/userController");

router.get("/search", auth, searchUsers);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;

