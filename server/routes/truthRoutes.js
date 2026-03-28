import { Router } from 'express';
import multer from 'multer';
import { analyzeQuery, analyzePDF } from '../controllers/truthController.js';

const router = Router();

// Multer: memory storage for PDF uploads (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
});

// POST /api/truth/analyze — text or voice query
router.post('/analyze', analyzeQuery);

// POST /api/truth/analyze-pdf — PDF upload
router.post('/analyze-pdf', upload.single('pdf'), analyzePDF);

export default router;