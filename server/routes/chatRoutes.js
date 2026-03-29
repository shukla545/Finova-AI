import express from "express";
import { chatWithBot } from "../controllers/chatController.js";

const router = express.Router();

// Simple in-memory rate limiter
const rateLimitMap = new Map();

const simpleRateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  const record = rateLimitMap.get(ip);

  if (now - record.startTime > windowMs) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: "Too many requests. Please wait a moment before trying again.",
    });
  }

  record.count += 1;
  next();
};

router.post("/", simpleRateLimit, chatWithBot);

export default router;