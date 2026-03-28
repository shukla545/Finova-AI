import express from "express";
import multer from "multer";
import { uploadPortfolio, chatWithFinPilot } from "../controllers/finPilotController.js";

const router = express.Router();

// Store file in memory buffer (no disk write)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted."), false);
    }
  },
});

// POST /api/finpilot/upload
router.post("/upload", upload.single("portfolio"), uploadPortfolio);

// POST /api/finpilot/chat
router.post("/chat", chatWithFinPilot);

export default router;