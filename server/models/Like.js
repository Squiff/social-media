const { admin } = require('../firebase');

/** Class for interacting with firestore posts collection */
class Like {
    static collectionName = 'likes';
    static db = admin.firestore();
    static collection = Like.db.collection(Like.collectionName);

    constructor({ postid, userid }) {
        this.postid = postid;
        this.userid = userid;
    }

    /** Add Like to firestore */
    async add() {
        /* validate data */
        if (!this.postid) throw new Error('postid was not provided');
        if (!this.userid) throw new Error('userid was not provided');

        const newRecord = {
            postid: this.postid,
            userid: this.userid,
        };

        return await Like.collection.add(newRecord);
    }

    static async get(likeid) {
        const result = await Like.collection.doc(likeid).get();

        if (!result.exists) return null;

        return result;
    }

    /** check whether user likes a post */
    static async getUserLike(postid, userid) {
        const result = await Like.collection
            .where('postid', '==', postid)
            .where('userid', '==', userid)
            .get();

        if (result.empty) return null;

        return result.docs[0];
    }

    /** delete a like by id */
    static async delete(likeid) {
        await Like.collection.doc(likeid).delete();
    }

    /** delete all likes for a post */
    static async deletePostLikes(postid) {
        const likes = await Like.collection.where('postid', '==', postid).get();

        const batch = Like.db.batch();

        likes.forEach((doc) => {
            batch.delete(doc);
        });

        await batch.commit();
    }
}

module.exports = Like;
