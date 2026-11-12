const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { chat, getDocuments, createDocument } = require("../controllers/aiController");

router.post("/chat", protect, chat);
router.get("/documents", protect, getDocuments);
router.post("/documents", protect, createDocument);

module.exports = router;
