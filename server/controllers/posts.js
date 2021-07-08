const { admin } = require('../firebase');

const db = admin.firestore();

/** get latest Posts */
async function getPosts(req, res) {
    const postData = await db.collection('posts').orderBy('dateadded', 'desc').get();
    const posts = [];

    postData.forEach((doc) => {
        const { body, user, dateadded } = doc.data();
        const ISODateAdded = dateadded.toDate().toISOString();

        posts.push({ id: doc.id, body, user, dateadded: ISODateAdded });
    });

    res.json(posts);
}

/** Add a new Post */
async function addPost(req, res) {
    if (!req.body) return res.status(400).json({ message: 'no request data found' });

    const newPost = {
        body: req.body.body,
        user: req.body.user,
        dateadded: admin.firestore.Timestamp.now(),
    };

    const result = await db.collection('posts').add(newPost);

    res.json({ message: 'new post added', data: result.id });
}

module.exports = { getPosts, addPost };
