import express from 'express';
import { upload } from '../middleware/multer.js';
import { mergeWithTopBottom } from '../api/imageMergeController.js';

const router = express.Router();

router.post('/merge', upload.single('image'), mergeWithTopBottom);

export default router;
