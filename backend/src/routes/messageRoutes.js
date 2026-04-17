const express = require("express");
const router = express.Router();
const { getMessage, createMessage, updateMessage, deleteMessage, getConversations, markAsRead } = require("../controllers/messageController");
const auth = require("../middleware/authMiddleware");

router.get("/conversations", auth, getConversations);
router.put("/read/:senderId", auth, markAsRead);

router.get("/:receiverId", auth, getMessage);

router.get("/", auth, getMessage);

router.post("/", auth, createMessage);

router.put("/:id", auth, updateMessage);

router.delete("/:id", auth, deleteMessage);

module.exports = router;
