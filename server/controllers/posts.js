const Joi = require('joi');
const { admin } = require('../firebase');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require('../models/User');

const db = admin.firestore();

/** get latest Posts */
async function getPosts(req, res) {
    const posts = await Post.getPosts({ limit: 10 });

    // get user info
    const userPromises = posts.map((p) => User.get(p.data().userid));
    const users = await Promise.all(userPromises);

    // if from a logged in user, check if user has liked the posts
    const currentUserId = req.idToken?.uid;
    let likes;

    if (currentUserId) {
        const likePromises = posts.map((p) => Like.getUserLike(p.id, currentUserId));
        likes = await Promise.all(likePromises);
    }

    const output = posts.map((p, i) => {
        return {
            ...p.data(),
            postid: p.id,
            like: likes?.[i]?.id || null,
            username: users[i]?.data().username,
            profileImg: users[i]?.data().profileImg,
        };
    });

    res.json(output);
}

/** Add a new Post */
async function addPost(req, res) {
    const { error } = addPostSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const post = new Post({
        title: req.body.title,
        body: req.body.body,
        userid: req.idToken.uid,
    });

    const postRecord = await post.add();
    res.json({ message: 'new post added', postid: postRecord.id });
}

const addPostSchema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
});

async function getPost(req, res) {
    const { postid } = req.params;
    const currentUserId = req.idToken?.uid;

    const post = await Post.get(postid);

    if (!post) {
        return res.status(404).json({ message: 'post not found' });
    }

    let likePromise;

    if (currentUserId) {
        likePromise = Like.getUserLike(postid, currentUserId);
    }

    const userPromise = User.get(post.data().userid);

    const [like, user] = await Promise.all([likePromise, userPromise]);

    const output = {
        postid: post.id,
        ...post.data(),
        like: like?.id || null,
        username: user?.data()?.username,
        profileImg: user?.data()?.profileImg,
    };

    return res.json(output);
}

async function deletePost(req, res) {
    const { postid } = req.params;
    const post = await Post.get(postid);

    if (!post) {
        return res.status(404).json({ success: false, message: 'post not found' });
    }

    // can only delete your own post
    if (post.data().userid !== req.idToken.uid) {
        return res.status(403).json({ success: false, message: 'unable to delete post' });
    }

    const p1 = Post.delete(postid);
    const p2 = Comment.deletePostComments(postid);
    const p3 = Like.deletePostLikes(postid);

    await Promise.all([p1, p2, p3]);

    return res.json({ success: true, message: 'post deleted' });
}

async function likePost(req, res) {
    const { postid } = req.params;
    const userid = req.idToken.uid;
    const post = await Post.get(postid);

    if (!post) {
        return res.status(404).json({ success: false, message: 'post not found' });
    }

    if (post.data().userid === userid) {
        return res.status(403).json({ success: false, message: 'You cannot like your own post' });
    }

    // check if user already liked post
    const like = await Like.getUserLike(postid, userid);

    if (like) {
        return res
            .status(400)
            .json({ success: false, message: 'user has already liked this post' });
    }

    // add like
    const newLike = new Like({ postid, userid });
    const likeCount = post.data().likeCount || 0;

    const p1 = newLike.add();
    const p2 = Post.update(postid, { likeCount: likeCount + 1 });

    await Promise.all([p1, p2]);

    res.json({ message: 'post liked' });
}

async function unlikePost(req, res) {
    const { postid } = req.params;
    const userid = req.idToken.uid;
    const post = await Post.get(postid);

    if (!post) {
        return res.status(404).json({ success: false, message: 'post not found' });
    }

    // check if user liked post
    const likeDoc = await Like.getUserLike(postid, userid);

    if (!likeDoc) {
        return res.status(404).json({ success: false, message: 'like not found' });
    }

    // remove like
    await Like.delete(likeDoc.id);

    const likeCount = post.data().likeCount;
    await Post.update(postid, { likeCount: likeCount - 1 });

    res.json({ message: 'post unliked' });
}

async function addComment(req, res) {
    const { postid } = req.params;
    const userid = req.idToken.uid;
    const message = req.body.message;

    if (!message) {
        return res.status(400).json({ success: false, message: 'message is required' });
    }

    const comment = new Comment({ postid, userid, message });
    const commentDoc = await comment.add();

    res.json({ commentid: commentDoc.id });
}

async function deleteComment(req, res) {
    const { commentid } = req.params;
    const userid = req.idToken.uid;

    const commentDoc = await Comment.get(commentid);

    if (!commentDoc) {
        return res.status(404).json({ success: false, message: 'comment does not exist' });
    }

    if (commentDoc.data().userid !== userid) {
        return res.status(403).json({ message: 'cannot delete other users comments' });
    }

    await Comment.delete(commentid);

    res.json({ success: true, message: 'comment deleted' });
}

module.exports = {
    getPosts,
    addPost,
    getPost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    deleteComment,
};
