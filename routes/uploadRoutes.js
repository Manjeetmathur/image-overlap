import express from 'express';
import { uploadImage } from '../api/uploadController.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

router.post('/upload', upload.single('image'), uploadImage);

export default router;
