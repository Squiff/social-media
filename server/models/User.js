// TODO Add a default image for profiles

const { admin } = require('../firebase');

/** Class for interacting with firestore users collection */
class User {
    static collectionName = 'users';
    static db = admin.firestore();
    static collection = User.db.collection(User.collectionName);

    constructor({ email, uid, username, profileImg }) {
        this.email = email.toLowerCase();
        this.uid = uid;
        this.username = username.toLowerCase();
        this.profileImg = profileImg;
    }

    /** Add User instance to firestore */
    async add() {
        /* validate data */
        if (!this.uid) throw new Error('uid was not provided');
        if (!this.username) throw new Error('username was not provided');
        if (!this.email) throw new Error('email was not provided');

        const newRecord = {
            email: this.email,
            username: this.username,
            profileImg: this.profileImg,
            dateadded: admin.firestore.Timestamp.now(),
        };

        return await User.collection.doc(this.uid).set(newRecord);
    }

    /** Update a user record in firestore */
    static async update(id, data) {
        return await User.collection.doc(id).update(data);
    }

    /** Query users collection and return a single matching record. Returns NULL if no record found */
    static async getOneByField(fieldname, fieldvalue) {
        const result = await User.collection.where(fieldname, '==', fieldvalue).get();

        if (result.empty) return null;

        return result.docs[0];
    }

    /** Get user document by username */
    static async getByUserName(username) {
        return User.getOneByField('username', username);
    }

    /** Get user document by email */
    static async getByEmail(email) {
        return User.getOneByField('email', email);
    }

    /** Get user document by uid */
    static async get(id) {
        const result = await User.collection.doc(id).get();

        if (!result.exists) return null;

        return result;
    }
}

module.exports = User;
