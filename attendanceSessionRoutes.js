const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  startSession,
  getSessions,
  getActiveSession,
  endSession,
  runAIVerification,
  finalizeSession,
  getQrSession,
} = require("../controllers/attendanceSessionController");

router.post("/start", protect, startSession);
router.get("/active", protect, getActiveSession);
router.post("/end/:id", protect, endSession);
router.post("/ai-verify/:id", protect, runAIVerification);
router.post("/finalize/:id", protect, finalizeSession);
router.get("/qr/:id", getQrSession);
router.get("/", protect, getSessions);

module.exports = router;