import { Router } from 'express';
import multer from 'multer';
import { analyzeQuery, analyzePDF } from '../controllers/truthController.js';

const router = Router();

// Multer: memory storage, PDF only, max 15MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted. Please upload a .pdf file.'));
    }
  },
});

// Multer error handler wrapper
function uploadWithErrorHandling(req, res, next) {
  upload.single('pdf')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 15MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

// POST /api/truth/analyze — text or voice query
router.post('/analyze', analyzeQuery);

// POST /api/truth/analyze-pdf — PDF upload
router.post('/analyze-pdf', uploadWithErrorHandling, analyzePDF);

export default router;