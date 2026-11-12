const express = require(
  "express"
);

const router =
  express.Router();

const {
  getRiskProfile,
} = require(
  "../controllers/aiRiskProfileController"
);

router.get(
  "/:studentId",
  getRiskProfile
);

module.exports = router;