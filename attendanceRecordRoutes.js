const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const {
  markAttendance,
  getAttendanceRecords,
  getVerificationCandidates,
  selectRandomVerification,
  verifyAttendance,
  selfVerifyBiometric,
} = require("../controllers/attendanceRecordController");

router.post("/mark", markAttendance);
router.post("/self-verify", protect, selfVerifyBiometric);

router.get("/", getAttendanceRecords);

router.get("/verification/:sessionId", getVerificationCandidates);

router.post("/verify/:attendanceRecordId", verifyAttendance);

router.post(
  "/random-verification/:sessionId",
  selectRandomVerification
);

module.exports = router;