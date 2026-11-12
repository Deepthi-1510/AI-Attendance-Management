const express = require(
  "express"
);

const router =
  express.Router();

const {
  getPenalties,
  revokePenalty,
} = require(
  "../controllers/penaltyController"
);

router.get(
  "/",
  getPenalties
);

router.post(
  "/revoke/:id",
  revokePenalty
);

module.exports = router;