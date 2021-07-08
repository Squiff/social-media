const { firebase, admin } = require('../firebase');

const db = admin.firestore();

async function signUp(req, res) {
    const { email, password, username } = req.body;

    // VALIDATION
    const unameQuery = await db.collection('users').where('username', '==', username).get();

    if (!unameQuery.empty)
        return res.status(400).json({ success: false, message: 'username already exists' });

    try {
        // AUTH Record
        const token = await createAuthUser({ email, password });

        // User Record
        const newUserRecord = {
            email,
            username,
            dateadded: admin.firestore.Timestamp.now(),
        };

        const user = await db.collection('users').add(newUserRecord);

        res.json({ message: `user signed up`, id: user.id, token });
    } catch (error) {
        if ((error.code = 'auth/email-already-exists'))
            return res.status(400).json({
                success: false,
                message: 'Email is already in use',
                errorcode: 'auth/email-already-exists',
            });
        console.log(error);
        return res.status(500).json({ success: false, errorcode: error.code });
    }
}

/** Create firebase authentication record for user and return an ID token (JWT) */
async function createAuthUser(user) {
    const userRecord = await admin.auth().createUser(user);
    const token = await admin.auth().createCustomToken(userRecord.uid);
    return token;
}

module.exports = { signUp };
