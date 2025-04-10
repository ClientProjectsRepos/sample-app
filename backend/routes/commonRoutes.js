const express = require('express');
const router = express.Router();
const galleryCtrl = require('../controllers/galleryController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/gallery/UploadImage', verifyToken, requireAdmin, galleryCtrl.UploadImage);
module.exports = router;
