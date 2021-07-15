const { admin } = require('../firebase');

/** Class for interacting with firestore posts collection */
class Post {
    static collectionName = 'posts';
    static db = admin.firestore();
    static collection = Post.db.collection(Post.collectionName);

    constructor({ title, body, username }) {
        this.title = title;
        this.body = body;
        this.username = username;
    }

    /** Add Post to firestore */
    async add() {
        /* validate data */
        if (!this.title) throw new Error('title was not provided');
        if (!this.body) throw new Error('body was not provided');
        if (!this.username) throw new Error('username was not provided');

        const newRecord = {
            title: this.title,
            body: this.body,
            username: this.username,
            dateadded: admin.firestore.Timestamp.now(),
        };

        const post = await Post.collection.add(newRecord);

        return post;
    }

    static async getPosts({ limit = 50 }) {
        const postData = await Post.collection.orderBy('dateadded', 'desc').limit(limit).get();
        const posts = [];

        postData.forEach((doc) => {
            const { body, user, dateadded } = doc.data();
            const ISODateAdded = dateadded.toDate().toISOString();

            posts.push({ id: doc.id, body, user, dateadded: ISODateAdded });
        });

        return posts;
    }
}

module.exports = Post;
