const express = require('express');
const {
    getPosts,
    addPost,
    getPost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    deleteComment,
} = require('../controllers/posts');
const firebaseAuth = require('../middleware/firebaseAuth');

const router = express.Router();

router.get('/', firebaseAuth({ skipOnFailure: true }), getPosts);
router.get('/:postid', firebaseAuth({ skipOnFailure: true }), getPost);
router.post('/', firebaseAuth(), addPost);
router.delete('/:postid', firebaseAuth(), deletePost);
router.post('/:postid/like', firebaseAuth(), likePost);
router.delete('/:postid/like', firebaseAuth(), unlikePost);
router.post('/:postid/comment', firebaseAuth(), addComment);
router.delete('/:postid/comment/:commentid', firebaseAuth(), deleteComment);

module.exports = router;
