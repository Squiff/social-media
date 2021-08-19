const { admin } = require('../firebase');

/** Class for interacting with firestore posts collection */
class Comment {
    static collectionName = 'comments';
    static db = admin.firestore();
    static collection = Comment.db.collection(Comment.collectionName);

    constructor({ postid, userid, message }) {
        this.postid = postid;
        this.userid = userid;
        this.message = message;
    }

    /** Add Like to firestore */
    async add() {
        /* validate data */
        if (!this.postid) throw new Error('postid was not provided');
        if (!this.userid) throw new Error('userid was not provided');
        if (!this.message) throw new Error('message was not provided');

        const newRecord = {
            postid: this.postid,
            userid: this.userid,
            message: this.message,
            dateadded: admin.firestore.Timestamp.now(),
        };

        return await Comment.collection.add(newRecord);
    }

    /** Get Comments document by ID */
    static async get(commentid) {
        const result = await Comment.collection.doc(commentid).get();

        if (!result.exists) return null;

        return result;
    }

    /** delete a comment */
    static async delete(commentid) {
        await Comment.collection.doc(commentid).delete();
    }

    /** delete comments for a post */
    static async deletePostComments(postid) {
        const comments = await Comment.collection.where('postid', '==', postid).get();

        const batch = Comment.db.batch();

        comments.forEach((doc) => {
            batch.delete(doc);
        });

        await batch.commit();
    }
}

module.exports = Comment;
