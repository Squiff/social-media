const express = require('express');
const router = express.Router();
const multer = require('../controllers/profile/multer');
const { setImage, getUserProfile, updateProfile } = require('../controllers/profile/profile');
const firebaseAuth = require('../middleware/firebaseAuth');

router.post('/', firebaseAuth(), updateProfile);
router.get('/:username', firebaseAuth(), getUserProfile);
router.post('/uploadimg', firebaseAuth(), multer.single('image'), setImage);

module.exports = router;
