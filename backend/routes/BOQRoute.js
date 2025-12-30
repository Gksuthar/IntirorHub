import express from 'express';
import * as BOQController from '../controllers/BOQController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Add BOQ item
router.post('/add', auth, BOQController.addBOQItem);

// Get BOQ items by site
router.get('/site/:siteId', auth, BOQController.getBOQItemsBySite);

// Serve reference image
router.get('/image/:filename', BOQController.getBOQImage);

export default router;