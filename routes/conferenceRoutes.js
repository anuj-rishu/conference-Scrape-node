const express = require("express");
const router = express.Router();
const {
  getConferences,
  getCountries,
  getTopics,
} = require("../controllers/conferenceController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/conferences", verifyToken, getConferences);
router.get("/countries", verifyToken, getCountries);
router.get("/topics", verifyToken, getTopics);

module.exports = router;
