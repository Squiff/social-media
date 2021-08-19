const { admin } = require('../firebase');

/** Class for interacting with firestore posts collection */
class Post {
    static collectionName = 'posts';
    static db = admin.firestore();
    static collection = Post.db.collection(Post.collectionName);

    constructor({ title, body, userid }) {
        this.title = title;
        this.body = body;
        this.userid = userid;
    }

    /** Add Post to firestore */
    async add() {
        /* validate data */
        if (!this.title) throw new Error('title was not provided');
        if (!this.body) throw new Error('body was not provided');
        if (!this.userid) throw new Error('userid was not provided');

        const newRecord = {
            title: this.title,
            body: this.body,
            userid: this.userid,
            dateadded: admin.firestore.Timestamp.now(),
        };

        const post = await Post.collection.add(newRecord);

        return post;
    }

    /** Get a post by id */
    static async get(postid) {
        const result = await Post.collection.doc(postid).get();
        if (!result.exists) return null;

        return result;
    }

    static async getPosts({ limit }) {
        limit = limit || 10;

        const results = await Post.collection.orderBy('dateadded', 'desc').limit(limit).get();
        return results.docs;
    }

    // when we get a post, we want

    static async getUserPosts(userid, { limit }) {
        limit = limit || 10;

        const results = await Post.collection
            .where('userid', '==', userid)
            .orderBy('dateadded', 'desc')
            .limit(limit)
            .get();

        return results.docs;
    }

    /** Update a post record */
    static async update(postid, data) {
        return await Post.collection.doc(postid).update(data);
    }

    /** delete a single post by id */
    static async delete(postid) {
        await Post.collection.doc(postid).delete();
    }
}

module.exports = Post;
