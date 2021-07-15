const Joi = require('joi');
const { admin } = require('../firebase');
const Post = require('../models/Post');

const db = admin.firestore();

/** get latest Posts */
async function getPosts(req, res) {
    const posts = await Post.getPosts({ limit: 20 });

    await db.collection('posts').orderBy('dateadded', 'desc').get();

    res.json(posts);
}

/** Add a new Post */
async function addPost(req, res) {
    const { error, value } = addPostSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    const post = new Post({
        title: req.body.title,
        body: req.body.body,
        username: req.user.username,
    });

    const postRecord = await post.add();

    console.log(postRecord);

    res.json({ success: true, message: 'new post added', postid: postRecord.id });
}

const addPostSchema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    username: Joi.string().required(),
});

module.exports = { getPosts, addPost };
