const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
    analyzeResume
} = require("../controllers/analysisController");

const router = express.Router();

router.post("/analyze-resume", upload.single("resume"), analyzeResume);

module.exports = router;