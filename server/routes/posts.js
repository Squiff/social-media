const express = require('express');
const { getPosts, addPost } = require('../controllers/posts');
const firebaseAuth = require('../middleware/firebaseAuth');

const router = express.Router();

router.get('/', getPosts);
router.post('/', firebaseAuth({ getUser: true }), addPost);

module.exports = router;
