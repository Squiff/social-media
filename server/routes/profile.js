const express = require('express');
const router = express.Router();
const multer = require('../controllers/profile/multer');
const {
    setImage,
    getCurrentUserProfile,
    updateProfile,
} = require('../controllers/profile/setImage');
const firebaseAuth = require('../middleware/firebaseAuth');

router.get('/', firebaseAuth(), getCurrentUserProfile);
router.post('/', firebaseAuth(), updateProfile);
router.post('/uploadimg', firebaseAuth(), multer.single('image'), setImage);

module.exports = router;
